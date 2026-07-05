const { query } = require('../../db/pool');

async function createForRoleKeys({ roleKeys, notifType, payloadJson, excludeUserId }) {
  const values = [roleKeys, notifType, payloadJson || null];
  let excludeSql = '';

  if (excludeUserId) {
    values.push(excludeUserId);
    excludeSql = `AND u.id <> $${values.length}`;
  }

  await query(
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
      ${excludeSql}`,
    values,
  );
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
  createForRoleKeys,
  listForUser,
  markAsRead,
};
