const { query, withTransaction } = require('../../db/pool');
const { TX_STATUS, TX_TYPE, CATEGORY_TYPE } = require('../../config/domain');

const PENALTY_TRACKERS = {
  quran: {
    label: 'Quran',
    categoryName: 'Quran penalty',
    categoryDescription: 'Auto-created pending donation for missed Quran tracking days',
    completionColumn: 'quran_done',
    runTable: 'quran_penalty_runs',
    penaltyTable: 'quran_penalties',
    event: 'quran_weekly_penalty',
  },
  namaj: {
    label: 'Namaj',
    categoryName: 'Namaj penalty',
    categoryDescription: 'Auto-created pending donation for missed Namaj tracking days',
    completionColumn: 'namaj_done',
    runTable: 'namaj_penalty_runs',
    penaltyTable: 'namaj_penalties',
    event: 'namaj_weekly_penalty',
  },
};

function trackerFor(kind) {
  const tracker = PENALTY_TRACKERS[kind];
  if (!tracker) {
    throw new Error(`Unsupported tracker: ${kind}`);
  }
  return tracker;
}

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
      nafl_rakat,
      note,
      quran_done,
      namaj_done,
      is_done
    ) VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
    ON CONFLICT (user_id, progress_date) DO NOTHING
    RETURNING id, user_id, progress_date, pages_read, surah_name, minutes_read, prayers_offered, congregational_prayers, nafl_rakat, note, quran_done, namaj_done, is_done, created_at, updated_at`,
    [
      input.userId,
      input.progressDate || null,
      input.pagesRead ?? null,
      input.surahName || null,
      input.minutesRead ?? null,
      input.prayersOffered ?? null,
      input.congregationalPrayers ?? null,
      input.naflRakat ?? null,
      input.note || null,
      input.quranDone !== false,
      input.namajDone === true,
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
      nafl_rakat = $8,
      note = $9,
      quran_done = COALESCE($10, quran_done),
      namaj_done = COALESCE($11, namaj_done),
      is_done = COALESCE($10, quran_done) OR COALESCE($11, namaj_done),
      updated_at = NOW()
     WHERE id = $1
       AND user_id = $2
     RETURNING id, user_id, progress_date, pages_read, surah_name, minutes_read, prayers_offered, congregational_prayers, nafl_rakat, note, quran_done, namaj_done, is_done, created_at, updated_at`,
    [
      input.progressId,
      input.userId,
      input.pagesRead ?? null,
      input.surahName || null,
      input.minutesRead ?? null,
      input.prayersOffered ?? null,
      input.congregationalPrayers ?? null,
      input.naflRakat ?? null,
      input.note || null,
      typeof input.quranDone === 'boolean' ? input.quranDone : null,
      typeof input.namajDone === 'boolean' ? input.namajDone : null,
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
      qp.nafl_rakat,
      qp.note,
      qp.quran_done,
      qp.namaj_done,
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

async function getWeeklyReport({ fromDate, toDate, includeTrackedNonInternal = false }) {
  const res = await query(
    `SELECT
      u.id AS user_id,
      u.full_name,
      u.mobile,
      jsonb_object_agg(
        to_char(qp.progress_date, 'YYYY-MM-DD'),
        jsonb_build_object(
          'done', qp.quran_done,
          'namajDone', qp.namaj_done,
          'pagesRead', qp.pages_read,
          'surahName', qp.surah_name,
          'minutesRead', qp.minutes_read,
          'prayersOffered', qp.prayers_offered,
          'congregationalPrayers', qp.congregational_prayers,
          'naflRakat', qp.nafl_rakat,
          'note', qp.note
        )
      ) FILTER (WHERE qp.id IS NOT NULL) AS days
     FROM app_users u
     LEFT JOIN quran_progress qp
       ON qp.user_id = u.id
      AND qp.progress_date BETWEEN $1 AND $2
     WHERE u.is_active = TRUE
       AND (
         u.user_kind = 1
         OR ($3 = TRUE AND EXISTS (
           SELECT 1 FROM quran_progress tracked
           WHERE tracked.user_id = u.id
             AND tracked.progress_date BETWEEN $1 AND $2
             AND (tracked.quran_done = TRUE OR tracked.namaj_done = TRUE)
         ))
       )
     GROUP BY u.id, u.full_name, u.mobile
     ORDER BY u.full_name ASC`,
    [fromDate, toDate, includeTrackedNonInternal],
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
  const tracker = trackerFor(filters.tracker || 'quran');
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
     FROM ${tracker.penaltyTable} qp
     JOIN ${tracker.runTable} qpr ON qpr.id = qp.run_id
     JOIN app_users u ON u.id = qp.user_id
     ${whereSql}
     ORDER BY qpr.to_date DESC, qp.penalty_minor DESC, u.full_name ASC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  );

  return res.rows;
}

async function listPenaltyTotals() {
  const res = await query(
    `WITH all_penalties AS (
       SELECT 'quran'::text AS tracker, qp.user_id, qp.penalty_minor, t.status AS transaction_status
       FROM quran_penalties qp LEFT JOIN transactions t ON t.id = qp.transaction_id
       UNION ALL
       SELECT 'namaj'::text AS tracker, np.user_id, np.penalty_minor, t.status AS transaction_status
       FROM namaj_penalties np LEFT JOIN transactions t ON t.id = np.transaction_id
     )
     SELECT
       ap.tracker,
       ap.user_id,
       COALESCE(SUM(ap.penalty_minor), 0) AS total_penalty_minor,
       COALESCE(SUM(ap.penalty_minor) FILTER (WHERE ap.transaction_status = $1::smallint), 0) AS unpaid_penalty_minor
     FROM all_penalties ap
     GROUP BY ap.tracker, ap.user_id`,
    [TX_STATUS.PENDING],
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

async function createWeeklyPenaltyRun({ fromDate, toDate, penaltyPerMissedDayMinor, reapplyExisting = false, tracker: trackerKind = 'quran' }) {
  const tracker = trackerFor(trackerKind);
  return withTransaction(async (client) => {
    const category = await client.query(
      `WITH existing AS (
        SELECT id
        FROM categories
        WHERE category_name = $2
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
        SELECT $2, $1, 0, $3, FALSE, $4, TRUE
        WHERE NOT EXISTS (SELECT 1 FROM existing)
        RETURNING id
      )
      SELECT id FROM inserted
      UNION ALL
      SELECT id FROM existing
      LIMIT 1`,
      [CATEGORY_TYPE.DONATION, tracker.categoryName, penaltyPerMissedDayMinor, tracker.categoryDescription],
    );
    const categoryId = category.rows[0].id;

    const run = await client.query(
      `INSERT INTO ${tracker.runTable} (
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
         FROM ${tracker.runTable}
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
     LEFT JOIN roles sr ON sr.id = u.staff_role_id
       LEFT JOIN quran_progress qp
         ON qp.user_id = u.id
        AND qp.${tracker.completionColumn} = TRUE
        AND qp.progress_date BETWEEN $1 AND $2
       WHERE u.is_active = TRUE
         AND u.user_kind = 1
         AND COALESCE(sr.role_key, r.role_key) NOT IN ('super_admin', 'admin', 'manager')
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
        `SELECT qp.user_id, qp.missed_days, qp.penalty_minor, qp.transaction_id, t.status AS transaction_status, u.full_name, u.mobile, u.email, COALESCE(sr.role_key, r.role_key) AS role_key
         FROM ${tracker.penaltyTable} qp
         JOIN app_users u ON u.id = qp.user_id
         JOIN roles r ON r.id = u.role_id
         LEFT JOIN roles sr ON sr.id = u.staff_role_id
         LEFT JOIN transactions t ON t.id = qp.transaction_id
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

      if (previousPenalties.some((penalty) => Number(penalty.transaction_status) === TX_STATUS.APPROVED)) {
        const error = new Error(`${tracker.label} penalty has already been received and cannot be reapplied`);
        error.statusCode = 400;
        throw error;
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
        `DELETE FROM ${tracker.penaltyTable} WHERE run_id = $1 RETURNING transaction_id`,
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
          TX_TYPE.DONATION,
          TX_STATUS.PENDING,
          user.id,
          categoryId,
          penaltyMinor,
          `${tracker.label} missed ${missedDays} day(s) from ${fromDate} to ${toDate}`,
          JSON.stringify({
            event: tracker.event,
            tracker: trackerKind,
            fromDate,
            toDate,
            doneDays: Number(user.done_days || 0),
            missedDays,
            penaltyPerMissedDayMinor,
          }),
        ],
      );

      const penalty = await client.query(
        `INSERT INTO ${tracker.penaltyTable} (
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
  listPenaltyTotals,
  createWeeklyPenaltyRun,
  PENALTY_TRACKERS,
};
