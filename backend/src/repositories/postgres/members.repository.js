const { query } = require('../../db/pool');

async function listMembers(filters = {}) {
  const values = [];
  const where = [];

  if (filters.search) {
    values.push(`%${filters.search.toLowerCase()}%`);
    where.push(`(lower(u.full_name) LIKE $${values.length} OR u.mobile LIKE $${values.length})`);
  }

  if (filters.userKind) {
    values.push(Number(filters.userKind));
    where.push(`u.user_kind = $${values.length}`);
  }

  if (filters.active !== undefined) {
    values.push(Boolean(filters.active));
    where.push(`u.is_active = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = Math.min(Number(filters.limit || 100), 500);
  const offset = Math.max(Number(filters.offset || 0), 0);

  values.push(limit);
  values.push(offset);

  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.mobile,
      u.email,
      u.user_kind,
      u.is_active,
      u.joined_on,
      u.photo_url,
      r.role_key,
      r.role_name,
      COALESCE(fs.total_deposit_minor, 0) AS total_deposit_minor,
      COALESCE(fs.total_withdraw_minor, 0) AS total_withdraw_minor,
      COALESCE(fs.total_repaid_minor, 0) AS total_repaid_minor
    FROM app_users u
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN v_member_financial_summary fs ON fs.user_id = u.id
    ${whereSql}
    ORDER BY u.created_at DESC, u.id DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
  `;

  const res = await query(sql, values);
  return res.rows;
}

async function getMemberById(userId) {
  const res = await query(
    `SELECT
      u.id,
      u.full_name,
      u.mobile,
      u.email,
      u.user_kind,
      u.organization_id,
      u.gender,
      u.address_line,
      u.ward_no,
      u.photo_url,
      u.is_active,
      u.joined_on,
      u.last_login_at,
      r.role_key,
      r.role_name,
      COALESCE(fs.total_deposit_minor, 0) AS total_deposit_minor,
      COALESCE(fs.total_withdraw_minor, 0) AS total_withdraw_minor,
      COALESCE(fs.total_repaid_minor, 0) AS total_repaid_minor
     FROM app_users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN v_member_financial_summary fs ON fs.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [userId],
  );

  return res.rows[0] || null;
}

async function getMemberLedger(userId, limit = 200) {
  const res = await query(
    `SELECT
      id,
      tx_type,
      status,
      amount_minor,
      occurred_on,
      category_id,
      note,
      created_at
     FROM transactions
     WHERE subject_user_id = $1
     ORDER BY occurred_on DESC, id DESC
     LIMIT $2`,
    [userId, Math.min(Number(limit || 200), 1000)],
  );

  return res.rows;
}

module.exports = {
  listMembers,
  getMemberById,
  getMemberLedger,
};
