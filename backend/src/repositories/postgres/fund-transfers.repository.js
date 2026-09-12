const { query, withTransaction } = require('../../db/pool');

const STAFF_ROLE_KEYS = ['super_admin', 'admin', 'manager'];

async function listFundTransferRecipients(excludeUserId) {
  const res = await query(
    `SELECT
      u.id,
      u.full_name,
      u.mobile,
      COALESCE(staff_role.role_key, base_role.role_key) AS role_key,
      COALESCE(staff_role.role_name, base_role.role_name) AS role_name
     FROM app_users u
     JOIN roles base_role ON base_role.id = u.role_id
     LEFT JOIN roles staff_role ON staff_role.id = u.staff_role_id
     WHERE u.is_active = TRUE
       AND COALESCE(staff_role.role_key, base_role.role_key) = ANY($1::text[])
       AND u.id <> $2
     ORDER BY COALESCE(staff_role.role_name, base_role.role_name), u.full_name`,
    [STAFF_ROLE_KEYS, excludeUserId],
  );
  return res.rows;
}

async function getEligibleRecipient(client, userId) {
  const res = await client.query(
    `SELECT u.id
     FROM app_users u
     JOIN roles base_role ON base_role.id = u.role_id
     LEFT JOIN roles staff_role ON staff_role.id = u.staff_role_id
     WHERE u.id = $1
       AND u.is_active = TRUE
       AND COALESCE(staff_role.role_key, base_role.role_key) = ANY($2::text[])
     LIMIT 1`,
    [userId, STAFF_ROLE_KEYS],
  );
  return res.rows[0] || null;
}

async function createFundTransfer({ fromUserId, toUserId, actorUserId, amountMinor, transferredOn, note }) {
  return withTransaction(async (client) => {
    const recipient = await getEligibleRecipient(client, toUserId);
    if (!recipient) {
      const error = new Error('Recipient must be an active manager or admin');
      error.statusCode = 400;
      throw error;
    }

    const created = await client.query(
      `INSERT INTO fund_transfers (
        from_user_id, to_user_id, initiated_by_user_id, amount_minor, transferred_on, note
      ) VALUES ($1,$2,$3,$4,COALESCE($5, CURRENT_DATE),$6)
      RETURNING id`,
      [fromUserId, toUserId, actorUserId, amountMinor, transferredOn || null, note || null],
    );

    await client.query(
      `INSERT INTO fund_transfer_events (fund_transfer_id, actor_user_id, event_type, note)
       VALUES ($1,$2,1,$3)`,
      [created.rows[0].id, actorUserId, note || null],
    );
    return created.rows[0];
  });
}

async function updateFundTransferStatus({ transferId, status, actorUserId, receiverNote, allowOverride = false }) {
  return withTransaction(async (client) => {
    const current = await client.query(
      `SELECT id, to_user_id, status
       FROM fund_transfers
       WHERE id = $1
       FOR UPDATE`,
      [transferId],
    );
    const transfer = current.rows[0];
    if (!transfer) {
      const error = new Error('Fund transfer not found');
      error.statusCode = 404;
      throw error;
    }
    if (Number(transfer.status) !== 0) {
      const error = new Error('Only a pending fund transfer can be updated');
      error.statusCode = 400;
      throw error;
    }
    if (!allowOverride && Number(transfer.to_user_id) !== Number(actorUserId)) {
      const error = new Error('Only the receiving manager or admin can update this transfer');
      error.statusCode = 403;
      throw error;
    }

    await client.query(
      `UPDATE fund_transfers
       SET status = $2,
           received_by_user_id = $3,
           received_at = NOW(),
           receiver_note = $4,
           updated_at = NOW()
       WHERE id = $1`,
      [transferId, status, actorUserId, receiverNote || null],
    );
    await client.query(
      `INSERT INTO fund_transfer_events (fund_transfer_id, actor_user_id, event_type, note)
       VALUES ($1,$2,$3,$4)`,
      [transferId, actorUserId, status === 1 ? 2 : 3, receiverNote || null],
    );
  });
}

async function listFundTransfers({ limit = 200, status, transferId } = {}) {
  const values = [];
  const where = [];
  if (transferId !== undefined) {
    values.push(Number(transferId));
    where.push(`ft.id = $${values.length}`);
  }
  if (status !== undefined) {
    values.push(Number(status));
    where.push(`ft.status = $${values.length}`);
  }
  values.push(Math.min(Math.max(Number(limit) || 200, 1), 500));
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const res = await query(
    `SELECT
      ft.id,
      ft.from_user_id,
      ft.to_user_id,
      ft.initiated_by_user_id,
      ft.amount_minor,
      ft.status,
      ft.transferred_on,
      ft.note,
      ft.received_by_user_id,
      ft.received_at,
      ft.receiver_note,
      ft.created_at,
      sender.full_name AS from_user_name,
      receiver.full_name AS to_user_name,
      initiator.full_name AS initiated_by_name,
      received_by.full_name AS received_by_name,
      COALESCE(
        json_agg(json_build_object(
          'eventType', event.event_type,
          'note', event.note,
          'createdAt', event.created_at,
          'actorName', event_actor.full_name
        ) ORDER BY event.created_at ASC) FILTER (WHERE event.id IS NOT NULL),
        '[]'::json
      ) AS activity
     FROM fund_transfers ft
     JOIN app_users sender ON sender.id = ft.from_user_id
     JOIN app_users receiver ON receiver.id = ft.to_user_id
     JOIN app_users initiator ON initiator.id = ft.initiated_by_user_id
     LEFT JOIN app_users received_by ON received_by.id = ft.received_by_user_id
     LEFT JOIN fund_transfer_events event ON event.fund_transfer_id = ft.id
     LEFT JOIN app_users event_actor ON event_actor.id = event.actor_user_id
     ${whereSql}
     GROUP BY ft.id, sender.full_name, receiver.full_name, initiator.full_name, received_by.full_name
     ORDER BY ft.created_at DESC, ft.id DESC
     LIMIT $${values.length}`,
    values,
  );
  return res.rows;
}

module.exports = {
  createFundTransfer,
  listFundTransferRecipients,
  listFundTransfers,
  updateFundTransferStatus,
};
