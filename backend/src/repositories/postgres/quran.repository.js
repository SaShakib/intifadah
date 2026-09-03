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
      note,
      is_done
    ) VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, TRUE)
    ON CONFLICT (user_id, progress_date) DO NOTHING
    RETURNING id, user_id, progress_date, pages_read, surah_name, minutes_read, note, is_done, created_at, updated_at`,
    [
      input.userId,
      input.progressDate || null,
      input.pagesRead ?? null,
      input.surahName || null,
      input.minutesRead ?? null,
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
      note = $6,
      updated_at = NOW()
     WHERE id = $1
       AND user_id = $2
     RETURNING id, user_id, progress_date, pages_read, surah_name, minutes_read, note, is_done, created_at, updated_at`,
    [
      input.progressId,
      input.userId,
      input.pagesRead ?? null,
      input.surahName || null,
      input.minutesRead ?? null,
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

async function createWeeklyPenaltyRun({ fromDate, toDate, penaltyPerMissedDayMinor }) {
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

    if (!run.rows[0]) {
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

    const penalties = [];
    for (const user of users.rows) {
      const missedDays = Math.max(0, 7 - Number(user.done_days || 0));
      const penaltyMinor = missedDays * Number(penaltyPerMissedDayMinor);

      if (penaltyMinor <= 0) {
        continue;
      }

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
        [run.rows[0].id, user.id, missedDays, penaltyMinor, tx.rows[0].id],
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
      ...run.rows[0],
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
