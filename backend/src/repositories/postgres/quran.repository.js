const { query, withTransaction } = require('../../db/pool');
const { TX_STATUS, TX_TYPE, CATEGORY_TYPE } = require('../../config/domain');

async function createProgress(input) {
  const res = await query(
    `INSERT INTO quran_progress (
      user_id,
      progress_date,
      pages_read,
      surah_name,
      minutes_read,
      prayers_offered,
      congregational_prayers,
      note,
      is_done
    ) VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, TRUE)
    ON CONFLICT (user_id, progress_date) DO NOTHING
    RETURNING id, user_id, progress_date, pages_read, surah_name, minutes_read, prayers_offered, congregational_prayers, note, is_done, created_at, updated_at`,
    [
      input.userId,
      input.progressDate || null,
      input.pagesRead ?? null,
      input.surahName || null,
      input.minutesRead ?? null,
      input.prayersOffered ?? null,
      input.congregationalPrayers ?? null,
      input.note || null,
    ],
  );

  return res.rows[0] || null;
}

async function updateProgress(input) {
  const res = await query(
    `UPDATE quran_progress
     SET
      pages_read = $3,
      surah_name = $4,
      minutes_read = $5,
      prayers_offered = $6,
      congregational_prayers = $7,
      note = $8,
      updated_at = NOW()
     WHERE id = $1
       AND user_id = $2
     RETURNING id, user_id, progress_date, pages_read, surah_name, minutes_read, prayers_offered, congregational_prayers, note, is_done, created_at, updated_at`,
    [
      input.progressId,
      input.userId,
      input.pagesRead ?? null,
      input.surahName || null,
      input.minutesRead ?? null,
      input.prayersOffered ?? null,
      input.congregationalPrayers ?? null,
      input.note || null,
    ],
  );

  return res.rows[0] || null;
}

async function listProgress(filters = {}) {
  const values = [filters.userId];
  const where = ['qp.user_id = $1'];

  if (filters.fromDate) {
    values.push(filters.fromDate);
    where.push(`qp.progress_date >= $${values.length}`);
  }

  if (filters.toDate) {
    values.push(filters.toDate);
    where.push(`qp.progress_date <= $${values.length}`);
  }

  const res = await query(
    `SELECT
      qp.id,
      qp.user_id,
      qp.progress_date,
      qp.pages_read,
      qp.surah_name,
      qp.minutes_read,
      qp.prayers_offered,
      qp.congregational_prayers,
      qp.note,
      qp.is_done,
      qp.created_at,
      qp.updated_at
     FROM quran_progress qp
     WHERE ${where.join(' AND ')}
     ORDER BY qp.progress_date DESC, qp.id DESC`,
    values,
  );

  return res.rows;
}

async function getWeeklyReport({ fromDate, toDate }) {
  const res = await query(
    `SELECT
      u.id AS user_id,
      u.full_name,
      u.mobile,
      jsonb_object_agg(
        to_char(qp.progress_date, 'YYYY-MM-DD'),
        jsonb_build_object(
          'done', qp.is_done,
          'pagesRead', qp.pages_read,
          'surahName', qp.surah_name,
          'minutesRead', qp.minutes_read,
          'prayersOffered', qp.prayers_offered,
          'congregationalPrayers', qp.congregational_prayers,
          'note', qp.note
        )
      ) FILTER (WHERE qp.id IS NOT NULL) AS days
     FROM app_users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN quran_progress qp
       ON qp.user_id = u.id
      AND qp.progress_date BETWEEN $1 AND $2
     WHERE u.is_active = TRUE
       AND u.user_kind = 1
       AND r.role_key NOT IN ('super_admin', 'admin', 'manager')
     GROUP BY u.id, u.full_name, u.mobile
     ORDER BY u.full_name ASC`,
    [fromDate, toDate],
  );

  return res.rows;
}

async function listActiveUsers() {
  const res = await query(
    `SELECT id, full_name, mobile, email
     FROM app_users
     WHERE is_active = TRUE
     ORDER BY full_name ASC`,
  );

  return res.rows;
}

async function listPenalties(filters = {}) {
  const values = [];
  const where = [];

  if (filters.fromDate) {
    values.push(filters.fromDate);
    where.push(`qpr.from_date >= $${values.length}`);
  }

  if (filters.toDate) {
    values.push(filters.toDate);
    where.push(`qpr.to_date <= $${values.length}`);
  }

  if (filters.userId) {
    values.push(Number(filters.userId));
    where.push(`qp.user_id = $${values.length}`);
  }

  const limit = Math.min(Number(filters.limit || 200), 500);
  const offset = Math.max(Number(filters.offset || 0), 0);
  values.push(limit, offset);

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const res = await query(
    `SELECT
      qp.id,
      qp.run_id,
      qp.user_id,
      u.full_name,
      u.mobile,
      qpr.from_date,
      qpr.to_date,
      qp.missed_days,
      qp.penalty_minor,
      qp.transaction_id,
      qp.created_at
     FROM quran_penalties qp
     JOIN quran_penalty_runs qpr ON qpr.id = qp.run_id
     JOIN app_users u ON u.id = qp.user_id
     ${whereSql}
     ORDER BY qpr.to_date DESC, qp.penalty_minor DESC, u.full_name ASC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  );

  return res.rows;
}

function hasSamePenaltyRows(previousPenalties, plannedPenalties) {
  if (previousPenalties.length !== plannedPenalties.length) {
    return false;
  }

  const previousByUserId = new Map(previousPenalties.map((penalty) => [Number(penalty.user_id), penalty]));
  return plannedPenalties.every((penalty) => {
    const previous = previousByUserId.get(Number(penalty.user.id));
    return previous
      && Number(previous.missed_days) === penalty.missedDays
      && Number(previous.penalty_minor) === penalty.penaltyMinor;
  });
}

async function createWeeklyPenaltyRun({ fromDate, toDate, penaltyPerMissedDayMinor, reapplyExisting = false }) {
  return withTransaction(async (client) => {
    const category = await client.query(
      `WITH existing AS (
        SELECT id
        FROM categories
        WHERE category_name = 'Quran penalty'
          AND category_type = $1
        LIMIT 1
      ),
      inserted AS (
        INSERT INTO categories (
          category_name,
          category_type,
          recurrence_type,
          amount_fixed,
          is_amount_variable,
          description,
          is_active
        )
        SELECT 'Quran penalty', $1, 0, $2, FALSE, 'Auto-created penalty category for missed Quran tracking days', TRUE
        WHERE NOT EXISTS (SELECT 1 FROM existing)
        RETURNING id
      )
      SELECT id FROM inserted
      UNION ALL
      SELECT id FROM existing
      LIMIT 1`,
      [CATEGORY_TYPE.EXPENSE, penaltyPerMissedDayMinor],
    );
    const categoryId = category.rows[0].id;

    const run = await client.query(
      `INSERT INTO quran_penalty_runs (
        from_date,
        to_date,
        penalty_per_missed_day_minor
      ) VALUES ($1,$2,$3)
      ON CONFLICT (from_date, to_date) DO NOTHING
      RETURNING id, from_date, to_date, penalty_per_missed_day_minor, created_at`,
      [fromDate, toDate, penaltyPerMissedDayMinor],
    );

    let penaltyRun = run.rows[0];
    const reapplied = !penaltyRun;
    if (!penaltyRun) {
      const existingRun = await client.query(
        `SELECT id, from_date, to_date, penalty_per_missed_day_minor, created_at
         FROM quran_penalty_runs
         WHERE from_date = $1 AND to_date = $2
         FOR UPDATE`,
        [fromDate, toDate],
      );

      penaltyRun = existingRun.rows[0] || null;
    }

    if (!penaltyRun || (reapplied && !reapplyExisting)) {
      return {
        skipped: true,
        fromDate,
        toDate,
        penalties: [],
      };
    }

    const users = await client.query(
      `SELECT
        u.id,
        u.full_name,
        u.mobile,
        u.email,
        COALESCE(COUNT(DISTINCT qp.progress_date), 0)::int AS done_days
       FROM app_users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN quran_progress qp
         ON qp.user_id = u.id
        AND qp.is_done = TRUE
        AND qp.progress_date BETWEEN $1 AND $2
       WHERE u.is_active = TRUE
         AND u.user_kind = 1
         AND r.role_key NOT IN ('super_admin', 'admin', 'manager')
       GROUP BY u.id, u.full_name, u.mobile, u.email
       ORDER BY u.full_name ASC`,
      [fromDate, toDate],
    );

    const plannedPenalties = users.rows.map((user) => {
      const missedDays = Math.max(0, 7 - Number(user.done_days || 0));
      const penaltyMinor = missedDays * Number(penaltyPerMissedDayMinor);
      return { user, missedDays, penaltyMinor };
    }).filter((penalty) => penalty.penaltyMinor > 0);

    let previousPenalties = [];
    let removedPenalties = [];
    let changedUserIds = plannedPenalties.map((penalty) => Number(penalty.user.id));
    if (reapplied) {
      const existingPenalties = await client.query(
        `SELECT qp.user_id, qp.missed_days, qp.penalty_minor, qp.transaction_id, u.full_name, u.mobile, u.email, r.role_key
         FROM quran_penalties qp
         JOIN app_users u ON u.id = qp.user_id
         JOIN roles r ON r.id = u.role_id
         WHERE qp.run_id = $1
         ORDER BY qp.user_id`,
        [penaltyRun.id],
      );
      previousPenalties = existingPenalties.rows;

      if (hasSamePenaltyRows(previousPenalties, plannedPenalties)) {
        return {
          skipped: true,
          unchanged: true,
          reapplied: true,
          fromDate,
          toDate,
          penalties: [],
        };
      }

      const plannedByUserId = new Map(plannedPenalties.map((penalty) => [Number(penalty.user.id), penalty]));
      changedUserIds = plannedPenalties
        .filter((penalty) => {
          const previous = previousPenalties.find((item) => Number(item.user_id) === Number(penalty.user.id));
          return !previous
            || Number(previous.missed_days) !== penalty.missedDays
            || Number(previous.penalty_minor) !== penalty.penaltyMinor;
        })
        .map((penalty) => Number(penalty.user.id));
      removedPenalties = previousPenalties.filter((penalty) => (
        !plannedByUserId.has(Number(penalty.user_id))
        && !['super_admin', 'admin', 'manager'].includes(penalty.role_key)
      ));

      const deletedPenalties = await client.query(
        `DELETE FROM quran_penalties WHERE run_id = $1 RETURNING transaction_id`,
        [penaltyRun.id],
      );
      const transactionIds = deletedPenalties.rows.map((penalty) => penalty.transaction_id).filter(Boolean);
      if (transactionIds.length) {
        await client.query(`DELETE FROM transactions WHERE id = ANY($1::bigint[])`, [transactionIds]);
      }
    }

    const penalties = [];
    for (const { user, missedDays, penaltyMinor } of plannedPenalties) {
      const tx = await client.query(
        `INSERT INTO transactions (
          tx_type,
          status,
          actor_user_id,
          subject_user_id,
          category_id,
          amount_minor,
          occurred_on,
          approved_at,
          note,
          meta_json
        ) VALUES ($1,$2,$3,$3,$4,$5,CURRENT_DATE,NOW(),$6,$7)
        RETURNING id`,
        [
          TX_TYPE.EXPENSE,
          TX_STATUS.APPROVED,
          user.id,
          categoryId,
          penaltyMinor,
          `Quran missed ${missedDays} day(s) from ${fromDate} to ${toDate}`,
          JSON.stringify({
            event: 'quran_weekly_penalty',
            fromDate,
            toDate,
            doneDays: Number(user.done_days || 0),
            missedDays,
            penaltyPerMissedDayMinor,
          }),
        ],
      );

      const penalty = await client.query(
        `INSERT INTO quran_penalties (
          run_id,
          user_id,
          missed_days,
          penalty_minor,
          transaction_id
        ) VALUES ($1,$2,$3,$4,$5)
        RETURNING id, run_id, user_id, missed_days, penalty_minor, transaction_id, created_at`,
        [penaltyRun.id, user.id, missedDays, penaltyMinor, tx.rows[0].id],
      );

      penalties.push({
        ...penalty.rows[0],
        full_name: user.full_name,
        mobile: user.mobile,
        email: user.email,
      });
    }

    return {
      skipped: false,
      reapplied,
      changedUserIds,
      removedPenalties,
      ...penaltyRun,
      categoryId,
      penalties,
    };
  });
}

module.exports = {
  createProgress,
  updateProgress,
  listProgress,
  getWeeklyReport,
  listActiveUsers,
  listPenalties,
  createWeeklyPenaltyRun,
};
