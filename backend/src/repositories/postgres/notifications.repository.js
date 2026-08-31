const { query } = require('../../db/pool');
const { publishUserNotification, publishUserNotifications } = require('../../services/pusher.service');
const { sendUserNotification, sendUserNotifications } = require('../../services/web-push.service');

async function deliverNotification(row) {
  await Promise.allSettled([
    publishUserNotification(row),
    sendUserNotification(row),
  ]);
}

async function deliverNotifications(rows) {
  await Promise.allSettled([
    publishUserNotifications(rows),
    sendUserNotifications(rows),
  ]);
}

async function createForUser({ userId, notifType, payloadJson }) {
  const res = await query(
    `INSERT INTO notifications (
      recipient_user_id,
      notif_type,
      payload_json,
      is_read
    ) VALUES ($1,$2,$3::jsonb,FALSE)
    RETURNING id, recipient_user_id, notif_type, payload_json, is_read, read_at, created_at`,
    [userId, notifType, payloadJson || null],
  );

  const row = res.rows[0] || null;
  if (row) {
    await deliverNotification(row);
  }

  return row;
}

async function createForUsers({ userIds, notifType, payloadJson }) {
  const uniqueIds = Array.from(new Set((userIds || []).map(Number).filter(Boolean)));
  if (!uniqueIds.length) {
    return [];
  }

  const res = await query(
    `INSERT INTO notifications (
      recipient_user_id,
      notif_type,
      payload_json,
      is_read
    )
    SELECT id, $2, $3::jsonb, FALSE
    FROM app_users
    WHERE is_active = TRUE
      AND id = ANY($1::int[])
    RETURNING id, recipient_user_id, notif_type, payload_json, is_read, read_at, created_at`,
    [uniqueIds, notifType, payloadJson || null],
  );

  await deliverNotifications(res.rows);
  return res.rows;
}

async function createForRoleKeys({ roleKeys, notifType, payloadJson, excludeUserId }) {
  const values = [roleKeys, notifType, payloadJson || null];
  let excludeSql = '';

  if (excludeUserId) {
    values.push(excludeUserId);
    excludeSql = `AND u.id <> $${values.length}`;
  }

  const res = await query(
    `INSERT INTO notifications (
      recipient_user_id,
      notif_type,
      payload_json,
      is_read
    )
    SELECT u.id, $2, $3::jsonb, FALSE
    FROM app_users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.is_active = TRUE
      AND r.role_key = ANY($1::text[])
      ${excludeSql}
    RETURNING id, recipient_user_id, notif_type, payload_json, is_read, read_at, created_at`,
    values,
  );

  await deliverNotifications(res.rows);
  return res.rows;
}

async function listForUser(userId, filters = {}) {
  const values = [userId];
  const where = ['recipient_user_id = $1'];

  if (filters.unread === true) {
    where.push('is_read = FALSE');
  }

  const limit = Math.min(Number(filters.limit || 50), 200);
  const offset = Math.max(Number(filters.offset || 0), 0);
  values.push(limit);
  values.push(offset);

  const res = await query(
    `SELECT
      id,
      recipient_user_id,
      notif_type,
      payload_json,
      is_read,
      read_at,
      created_at
     FROM notifications
     WHERE ${where.join(' AND ')}
     ORDER BY created_at DESC, id DESC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  );

  return res.rows;
}

async function markAsRead(userId, notificationId) {
  const res = await query(
    `UPDATE notifications
     SET is_read = TRUE,
         read_at = NOW()
     WHERE id = $1
       AND recipient_user_id = $2
     RETURNING id, recipient_user_id, notif_type, payload_json, is_read, read_at, created_at`,
    [notificationId, userId],
  );

  return res.rows[0] || null;
}

module.exports = {
  createForUser,
  createForUsers,
  createForRoleKeys,
  listForUser,
  markAsRead,
};
