const { query } = require('../../db/pool');

const SECTION_COLUMNS = `s.id, s.user_id, s.surah_name, s.from_ayah, s.to_ayah, s.mushaf_page, s.page_half,
  s.from_line, s.to_line, s.memorized_date::text AS memorized_date, s.last_reviewed_date::text AS last_reviewed_date, s.next_review_date::text AS next_review_date,
  s.interval_level, s.current_interval_days, s.recall_quality, s.error_count, s.status, s.note,
  s.created_at, s.updated_at`;

async function listSections({ userId }) {
  const res = await query(
    `SELECT ${SECTION_COLUMNS}
     FROM quran_memorization_sections s
     WHERE s.user_id = $1
     ORDER BY s.status ASC, s.next_review_date ASC, s.created_at DESC, s.id DESC`,
    [userId],
  );
  return res.rows;
}

async function getSection({ userId, sectionId }) {
  const res = await query(
    `SELECT ${SECTION_COLUMNS}
     FROM quran_memorization_sections s
     WHERE s.user_id = $1 AND s.id = $2`,
    [userId, sectionId],
  );
  return res.rows[0] || null;
}

async function createSection(input) {
  const res = await query(
    `INSERT INTO quran_memorization_sections (
      user_id, surah_name, from_ayah, to_ayah, mushaf_page, page_half, from_line, to_line,
      memorized_date, last_reviewed_date, next_review_date, interval_level, current_interval_days,
      recall_quality, error_count, status, note
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id, user_id, surah_name, from_ayah, to_ayah, mushaf_page, page_half, from_line, to_line,
      memorized_date::text AS memorized_date, last_reviewed_date::text AS last_reviewed_date, next_review_date::text AS next_review_date, interval_level, current_interval_days,
      recall_quality, error_count, status, note, created_at, updated_at`,
    [
      input.userId,
      input.surahName,
      input.fromAyah ?? null,
      input.toAyah ?? null,
      input.mushafPage ?? null,
      input.pageHalf ?? null,
      input.fromLine ?? null,
      input.toLine ?? null,
      input.memorizedDate,
      input.lastReviewedDate ?? null,
      input.nextReviewDate,
      input.intervalLevel ?? 0,
      input.currentIntervalDays ?? 1,
      input.recallQuality ?? null,
      input.errorCount ?? 0,
      input.status ?? 0,
      input.note ?? null,
    ],
  );
  return res.rows[0] || null;
}

async function updateSection({ userId, sectionId, patch }) {
  const columns = Object.keys(patch);
  if (!columns.length) {
    return null;
  }

  const values = [];
  const setClause = columns.map((column) => {
    values.push(patch[column]);
    return `${column} = $${values.length}`;
  }).join(', ');
  values.push(sectionId, userId);

  const res = await query(
    `UPDATE quran_memorization_sections SET ${setClause}, updated_at = NOW()
     WHERE id = $${values.length - 1} AND user_id = $${values.length}
     RETURNING id, user_id, surah_name, from_ayah, to_ayah, mushaf_page, page_half, from_line, to_line,
       memorized_date::text AS memorized_date, last_reviewed_date::text AS last_reviewed_date, next_review_date::text AS next_review_date, interval_level, current_interval_days,
       recall_quality, error_count, status, note, created_at, updated_at`,
    values,
  );
  return res.rows[0] || null;
}

async function deleteSection({ userId, sectionId }) {
  const res = await query('DELETE FROM quran_memorization_sections WHERE id = $1 AND user_id = $2 RETURNING id', [sectionId, userId]);
  return (res.rowCount ?? 0) > 0;
}

async function listReviews({ userId, sectionId }) {
  const res = await query(
    `SELECT r.id, r.section_id, r.review_date::text AS review_date, r.result, r.error_count, r.verified, r.note, r.created_at
     FROM quran_memorization_reviews r
     JOIN quran_memorization_sections s ON s.id = r.section_id
     WHERE s.user_id = $1 AND r.section_id = $2
     ORDER BY r.review_date DESC, r.id DESC`,
    [userId, sectionId],
  );
  return res.rows;
}

async function createReview(input) {
  const res = await query(
    `INSERT INTO quran_memorization_reviews (section_id, review_date, result, error_count, verified, note)
     SELECT id, $2, $3, $4, $5, $6
     FROM quran_memorization_sections
     WHERE id = $1 AND user_id = $7
     RETURNING id, section_id, review_date::text AS review_date, result, error_count, verified, note, created_at`,
    [input.sectionId, input.reviewDate, input.result, input.errorCount ?? 0, input.verified === true, input.note ?? null, input.userId],
  );
  return res.rows[0] || null;
}

async function deleteReview({ userId, sectionId, reviewId }) {
  const res = await query(
    `DELETE FROM quran_memorization_reviews r
     USING quran_memorization_sections s
     WHERE r.id = $3 AND r.section_id = s.id AND s.user_id = $1 AND r.section_id = $2
     RETURNING r.id`,
    [userId, sectionId, reviewId],
  );
  return (res.rowCount ?? 0) > 0;
}

module.exports = {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  listReviews,
  createReview,
  deleteReview,
};
