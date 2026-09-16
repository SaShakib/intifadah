const { query } = require('../../db/pool');

const PLAN_COLUMNS = `id, user_id, book_id, book_title, book_author, book_cover_url,
  total_pages, current_page, note, status, completed_on, created_at, updated_at`;

async function listPlans({ userId }) {
  const res = await query(
    `SELECT ${PLAN_COLUMNS}
     FROM book_plans
     WHERE user_id = $1
     ORDER BY status ASC, created_at DESC, id DESC`,
    [userId],
  );
  return res.rows;
}

async function getPlan({ userId, planId }) {
  const res = await query(
    `SELECT ${PLAN_COLUMNS}
     FROM book_plans
     WHERE user_id = $1 AND id = $2`,
    [userId, planId],
  );
  return res.rows[0] || null;
}

async function createPlan(input) {
  const res = await query(
    `INSERT INTO book_plans (user_id, book_id, book_title, book_author, book_cover_url, total_pages, current_page, note, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
     RETURNING ${PLAN_COLUMNS}`,
    [
      input.userId,
      input.bookId,
      input.bookTitle,
      input.bookAuthor || null,
      input.bookCoverUrl || null,
      input.totalPages,
      input.currentPage || 0,
      input.note || null,
    ],
  );
  return res.rows[0] || null;
}

async function updatePlan({ userId, planId, patch }) {
  const columns = Object.keys(patch);
  if (!columns.length) {
    return null;
  }

  const values = [];
  const setClause = columns.map((column) => {
    values.push(patch[column]);
    return `${column} = $${values.length}`;
  }).join(', ');
  values.push(planId, userId);

  const res = await query(
    `UPDATE book_plans SET ${setClause}, updated_at = NOW()
     WHERE id = $${values.length - 1} AND user_id = $${values.length}
     RETURNING ${PLAN_COLUMNS}`,
    values,
  );
  return res.rows[0] || null;
}

async function deletePlan({ userId, planId }) {
  const res = await query('DELETE FROM book_plans WHERE id = $1 AND user_id = $2 RETURNING id', [planId, userId]);
  return (res.rowCount ?? 0) > 0;
}

module.exports = {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
};