const { query } = require('../../db/pool');

async function listCategories(filters = {}) {
  const values = [];
  const where = [];

  if (filters.categoryType) {
    values.push(Number(filters.categoryType));
    where.push(`category_type = $${values.length}`);
  }

  if (filters.active !== undefined) {
    values.push(Boolean(filters.active));
    where.push(`is_active = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const res = await query(
    `SELECT
      id,
      category_name,
      category_type,
      recurrence_type,
      due_interval_days,
      amount_fixed,
      is_amount_variable,
      description,
      is_active,
      created_by_user_id,
      created_at,
      updated_at
     FROM categories
     ${whereSql}
     ORDER BY id DESC`,
    values,
  );

  return res.rows;
}

async function getCategoryById(id) {
  const res = await query(
    `SELECT
      id,
      category_name,
      category_type,
      recurrence_type,
      due_interval_days,
      amount_fixed,
      is_amount_variable,
      description,
      is_active,
      created_by_user_id,
      created_at,
      updated_at
     FROM categories
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return res.rows[0] || null;
}

async function createCategory(input) {
  const res = await query(
    `INSERT INTO categories (
      category_name,
      category_type,
      recurrence_type,
      due_interval_days,
      amount_fixed,
      is_amount_variable,
      description,
      is_active,
      created_by_user_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE,$8)
    RETURNING id`,
    [
      input.categoryName,
      input.categoryType,
      input.recurrenceType,
      input.dueIntervalDays || null,
      input.amountFixed || null,
      input.isAmountVariable,
      input.description || null,
      input.createdByUserId,
    ],
  );

  return res.rows[0];
}

async function updateCategory(id, input) {
  await query(
    `UPDATE categories
     SET
      category_name = COALESCE($2, category_name),
      category_type = COALESCE($3, category_type),
      recurrence_type = COALESCE($4, recurrence_type),
      due_interval_days = COALESCE($5, due_interval_days),
      amount_fixed = COALESCE($6, amount_fixed),
      is_amount_variable = COALESCE($7, is_amount_variable),
      description = COALESCE($8, description),
      is_active = COALESCE($9, is_active),
      updated_at = NOW()
     WHERE id = $1`,
    [
      id,
      input.categoryName,
      input.categoryType,
      input.recurrenceType,
      input.dueIntervalDays,
      input.amountFixed,
      input.isAmountVariable,
      input.description,
      input.isActive,
    ],
  );
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
};
