const Pusher = require('pusher');
const { env } = require('../config/env');

let pusher = null;

function getPusher() {
  if (pusher) return pusher;

  if (!env.pusherAppId || !env.pusherKey || !env.pusherSecret || !env.pusherCluster) {
    return null;
  }

  pusher = new Pusher({
    appId: env.pusherAppId,
    key: env.pusherKey,
    secret: env.pusherSecret,
    cluster: env.pusherCluster,
    useTLS: env.pusherUseTls,
  });

  return pusher;
}

function isPusherEnabled() {
  return Boolean(getPusher());
}

async function publishUserNotification(notification) {
  const client = getPusher();
  if (!client || !notification?.recipient_user_id) {
    return false;
  }

  await client.trigger(`private-user-${notification.recipient_user_id}`, 'notification:new', {
    notification,
  });
  return true;
}

async function publishUserNotifications(notifications = []) {
  await Promise.allSettled(notifications.map((notification) => publishUserNotification(notification)));
}

function authorizeUserChannel({ userId, socketId, channelName }) {
  const client = getPusher();
  if (!client) {
    const error = new Error('Pusher is not configured');
    error.statusCode = 503;
    throw error;
  }

  if (channelName !== `private-user-${userId}`) {
    const error = new Error('Forbidden: invalid notification channel');
    error.statusCode = 403;
    throw error;
  }

  return client.authorizeChannel(socketId, channelName);
}

module.exports = {
  isPusherEnabled,
  publishUserNotification,
  publishUserNotifications,
  authorizeUserChannel,
};
