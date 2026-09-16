const { query } = require('../../db/pool');

const PLAN_COLUMNS = `p.id, p.user_id, p.plan_name, p.goal_type, p.from_ref, p.to_ref,
  p.surah_reference, p.total_target, p.note, p.status, p.completed_on,
  p.created_at, p.updated_at,
  COALESCE(progress_agg.total_quantity, 0)::int AS total_quantity`;

async function listPlans({ userId }) {
  const res = await query(
    `SELECT ${PLAN_COLUMNS}
     FROM quran_plans p
     LEFT JOIN LATERAL (
       SELECT COALESCE(SUM(qpp.quantity), 0) AS total_quantity
       FROM quran_plan_progress qpp
       WHERE qpp.plan_id = p.id
     ) progress_agg ON TRUE
     WHERE p.user_id = $1
     ORDER BY p.status ASC, p.created_at DESC, p.id DESC`,
    [userId],
  );
  return res.rows;
}

async function getPlan({ userId, planId }) {
  const res = await query(
    `SELECT ${PLAN_COLUMNS}
     FROM quran_plans p
     LEFT JOIN LATERAL (
       SELECT COALESCE(SUM(qpp.quantity), 0) AS total_quantity
       FROM quran_plan_progress qpp
       WHERE qpp.plan_id = p.id
     ) progress_agg ON TRUE
     WHERE p.user_id = $1 AND p.id = $2`,
    [userId, planId],
  );
  return res.rows[0] || null;
}

async function createPlan(input) {
  const res = await query(
    `INSERT INTO quran_plans (user_id, plan_name, goal_type, from_ref, to_ref, surah_reference, total_target, note, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
     RETURNING id, user_id, plan_name, goal_type, from_ref, to_ref, surah_reference, total_target, note, status, completed_on, created_at, updated_at`,
    [
      input.userId,
      input.planName,
      input.goalType,
      input.fromRef || null,
      input.toRef || null,
      input.surahReference || null,
      input.totalTarget,
      input.note || null,
    ],
  );
  const row = res.rows[0];
  return row ? { ...row, total_quantity: 0 } : null;
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
    `UPDATE quran_plans SET ${setClause}, updated_at = NOW()
     WHERE id = $${values.length - 1} AND user_id = $${values.length}
     RETURNING id, user_id, plan_name, goal_type, from_ref, to_ref, surah_reference, total_target, note, status, completed_on, created_at, updated_at`,
    values,
  );
  return res.rows[0] || null;
}

async function deletePlan({ userId, planId }) {
  const res = await query('DELETE FROM quran_plans WHERE id = $1 AND user_id = $2 RETURNING id', [planId, userId]);
  return (res.rowCount ?? 0) > 0;
}

async function listProgress({ userId, planId }) {
  const res = await query(
    `SELECT qpp.id, qpp.plan_id, qpp.record_date, qpp.quantity, qpp.note, qpp.created_at, qpp.updated_at
     FROM quran_plan_progress qpp
     JOIN quran_plans p ON p.id = qpp.plan_id
     WHERE p.user_id = $1 AND qpp.plan_id = $2
     ORDER BY qpp.record_date DESC, qpp.id DESC`,
    [userId, planId],
  );
  return res.rows;
}

async function upsertProgress({ userId, planId, recordDate, quantity, note }) {
  const res = await query(
    `WITH owner AS (
       SELECT id FROM quran_plans WHERE id = $1 AND user_id = $2
     )
     INSERT INTO quran_plan_progress (plan_id, record_date, quantity, note)
     SELECT id, $3, $4, $5 FROM owner
     ON CONFLICT (plan_id, record_date)
     DO UPDATE SET quantity = EXCLUDED.quantity, note = EXCLUDED.note, updated_at = NOW()
     RETURNING id, plan_id, record_date, quantity, note, created_at, updated_at`,
    [planId, userId, recordDate, quantity, note],
  );
  return res.rows[0] || null;
}

async function deleteProgress({ userId, planId, progressId }) {
  const res = await query(
    `DELETE FROM quran_plan_progress qpp
     USING quran_plans p
     WHERE qpp.id = $3 AND qpp.plan_id = p.id AND p.user_id = $1 AND qpp.plan_id = $2
     RETURNING qpp.id`,
    [userId, planId, progressId],
  );
  return (res.rowCount ?? 0) > 0;
}

module.exports = {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  listProgress,
  upsertProgress,
  deleteProgress,
};