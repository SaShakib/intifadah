const webpush = require('web-push');
const { query } = require('../db/pool');
const { env } = require('../config/env');

let configured = false;

function isWebPushEnabled() {
  return Boolean(env.vapidPublicKey && env.vapidPrivateKey);
}

function configureWebPush() {
  if (!isWebPushEnabled()) return false;
  if (configured) return true;

  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
  configured = true;
  return true;
}

function notificationContent(notification) {
  const payload = notification?.payload_json && typeof notification.payload_json === 'object'
    ? notification.payload_json
    : {};
  const event = payload.event;
  let title = typeof payload.title === 'string' ? payload.title : 'ইনতিফাদাহ';
  let body = typeof payload.message === 'string' ? payload.message : 'আপনার জন্য নতুন একটি বিজ্ঞপ্তি আছে।';
  let url = '/user/dashboard';

  if (event === 'quran_daily_reminder') {
    title = 'আজকের Quran tracking';
    body = 'আজকের Quran অগ্রগতি এখনই Done করুন।';
    url = '/user/quran';
  } else if (event === 'quran_weekly_penalty_assigned') {
    title = 'Quran tracking penalty';
    body = `${payload.fromDate || ''} থেকে ${payload.toDate || ''} সময়ের penalty তৈরি হয়েছে।`;
    url = '/user/quran';
  } else if (event === 'quran_weekly_penalty_run') {
    title = 'সাপ্তাহিক Quran রিপোর্ট';
    body = `${payload.penaltyCount || 0} জনের penalty তৈরি হয়েছে।`;
    url = '/admin/quran';
  } else if (event === 'loan_request_created') {
    title = 'নতুন ঋণ আবেদন';
    body = 'একটি নতুন ঋণ আবেদন পর্যালোচনার জন্য এসেছে।';
    url = '/admin/loans';
  } else if (event === 'user_transaction_created') {
    title = 'নতুন লেনদেন';
    body = 'একটি লেনদেন অনুমোদনের অপেক্ষায় আছে।';
    url = '/admin/fund-collection';
  }

  return {
    title,
    body,
    url,
    notificationId: notification?.id || null,
    tag: notification?.id ? `intifadah-notification-${notification.id}` : undefined,
  };
}

function validateSubscription(subscription = {}) {
  const endpoint = typeof subscription.endpoint === 'string' ? subscription.endpoint.trim() : '';
  const p256dhKey = typeof subscription.keys?.p256dh === 'string' ? subscription.keys.p256dh.trim() : '';
  const authKey = typeof subscription.keys?.auth === 'string' ? subscription.keys.auth.trim() : '';

  if (!endpoint || !p256dhKey || !authKey) {
    const error = new Error('Invalid push subscription');
    error.statusCode = 400;
    throw error;
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:') throw new Error('Push endpoint must use HTTPS');
  } catch {
    const error = new Error('Invalid push endpoint');
    error.statusCode = 400;
    throw error;
  }

  return {
    endpoint,
    p256dhKey,
    authKey,
    expirationTime: subscription.expirationTime ? new Date(subscription.expirationTime) : null,
  };
}

async function saveSubscription(userId, subscription) {
  const normalized = validateSubscription(subscription);
  const res = await query(
    `INSERT INTO web_push_subscriptions (
      user_id, endpoint, p256dh_key, auth_key, expiration_time, updated_at
    ) VALUES ($1,$2,$3,$4,$5,NOW())
    ON CONFLICT (endpoint) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          p256dh_key = EXCLUDED.p256dh_key,
          auth_key = EXCLUDED.auth_key,
          expiration_time = EXCLUDED.expiration_time,
          updated_at = NOW()
    RETURNING id, user_id, endpoint, expiration_time, created_at, updated_at`,
    [userId, normalized.endpoint, normalized.p256dhKey, normalized.authKey, normalized.expirationTime],
  );
  return res.rows[0];
}

async function removeSubscription(userId, endpoint) {
  if (!endpoint || typeof endpoint !== 'string') {
    const error = new Error('Push endpoint is required');
    error.statusCode = 400;
    throw error;
  }
  await query('DELETE FROM web_push_subscriptions WHERE user_id = $1 AND endpoint = $2', [userId, endpoint]);
}

async function sendUserNotification(notification) {
  if (!configureWebPush() || !notification?.recipient_user_id) {
    return { enabled: false, subscriptions: 0, sent: 0, failed: 0 };
  }

  const subscriptions = await query(
    `SELECT id, endpoint, p256dh_key, auth_key
     FROM web_push_subscriptions
     WHERE user_id = $1`,
    [notification.recipient_user_id],
  );
  const payload = JSON.stringify(notificationContent(notification));
  const results = await Promise.allSettled(subscriptions.rows.map(async (subscription) => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh_key, auth: subscription.auth_key },
      }, payload, { TTL: 86400, urgency: 'normal' });
      return true;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await query('DELETE FROM web_push_subscriptions WHERE id = $1', [subscription.id]);
      }
      throw error;
    }
  }));

  return {
    enabled: true,
    subscriptions: subscriptions.rows.length,
    sent: results.filter((item) => item.status === 'fulfilled').length,
    failed: results.filter((item) => item.status === 'rejected').length,
  };
}

async function sendTestNotification(userId) {
  return sendUserNotification({
    recipient_user_id: userId,
    payload_json: {
      event: 'push_test',
      title: 'ইনতিফাদাহ বিজ্ঞপ্তি পরীক্ষা',
      message: 'ডিভাইস পুশ বিজ্ঞপ্তি ঠিকভাবে কাজ করছে।',
    },
  });
}

async function sendUserNotifications(notifications = []) {
  const results = await Promise.allSettled(notifications.map((notification) => sendUserNotification(notification)));
  const fulfilled = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  return {
    enabled: fulfilled.some((result) => result.enabled),
    subscriptions: fulfilled.reduce((sum, result) => sum + result.subscriptions, 0),
    sent: fulfilled.reduce((sum, result) => sum + result.sent, 0),
    failed: fulfilled.reduce((sum, result) => sum + result.failed, 0) + results.filter((result) => result.status === 'rejected').length,
  };
}

module.exports = {
  isWebPushEnabled,
  saveSubscription,
  removeSubscription,
  sendTestNotification,
  sendUserNotification,
  sendUserNotifications,
};
