const { query } = require('../../db/pool');

async function listThreads(filters = {}) {
  const values = [];
  const where = [];

  if (filters.createdByUserId) {
    values.push(Number(filters.createdByUserId));
    where.push(`ct.created_by_user_id = $${values.length}`);
  }

  if (filters.status !== undefined) {
    values.push(Number(filters.status));
    where.push(`ct.status = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const res = await query(
    `SELECT
      ct.id,
      ct.subject,
      ct.created_by_user_id,
      cu.full_name AS created_by_name,
      ct.assigned_to_user_id,
      au.full_name AS assigned_to_name,
      ct.status,
      ct.created_at,
      ct.updated_at,
      (
        SELECT COUNT(*)::int
        FROM comments c
        WHERE c.thread_id = ct.id
      ) AS message_count,
      (
        SELECT c2.created_at
        FROM comments c2
        WHERE c2.thread_id = ct.id
        ORDER BY c2.created_at DESC
        LIMIT 1
      ) AS last_message_at
     FROM comment_threads ct
     JOIN app_users cu ON cu.id = ct.created_by_user_id
     LEFT JOIN app_users au ON au.id = ct.assigned_to_user_id
     ${whereSql}
     ORDER BY ct.updated_at DESC, ct.id DESC`,
    values,
  );

  return res.rows;
}

async function getThreadById(threadId) {
  const res = await query(
    `SELECT
      ct.id,
      ct.subject,
      ct.created_by_user_id,
      ct.assigned_to_user_id,
      ct.status,
      ct.created_at,
      ct.updated_at
     FROM comment_threads ct
     WHERE ct.id = $1
     LIMIT 1`,
    [threadId],
  );

  return res.rows[0] || null;
}

async function createThread(input) {
  const res = await query(
    `INSERT INTO comment_threads (
      subject,
      created_by_user_id,
      assigned_to_user_id,
      status
    ) VALUES ($1,$2,$3,$4)
    RETURNING id`,
    [
      input.subject,
      input.createdByUserId,
      input.assignedToUserId || null,
      input.status ?? 0,
    ],
  );

  return res.rows[0];
}

async function addComment(input) {
  const res = await query(
    `INSERT INTO comments (
      thread_id,
      sender_user_id,
      message_body,
      is_internal
    ) VALUES ($1,$2,$3,$4)
    RETURNING id`,
    [
      input.threadId,
      input.senderUserId,
      input.messageBody,
      Boolean(input.isInternal),
    ],
  );

  await query(
    `UPDATE comment_threads
     SET updated_at = NOW(),
         status = COALESCE($2, status)
     WHERE id = $1`,
    [input.threadId, input.nextStatus ?? null],
  );

  return res.rows[0];
}

async function listThreadMessages(threadId) {
  const res = await query(
    `SELECT
      c.id,
      c.thread_id,
      c.sender_user_id,
      u.full_name AS sender_name,
      c.message_body,
      c.is_internal,
      c.created_at
     FROM comments c
     JOIN app_users u ON u.id = c.sender_user_id
     WHERE c.thread_id = $1
     ORDER BY c.created_at ASC, c.id ASC`,
    [threadId],
  );

  return res.rows;
}

module.exports = {
  listThreads,
  getThreadById,
  createThread,
  addComment,
  listThreadMessages,
};
