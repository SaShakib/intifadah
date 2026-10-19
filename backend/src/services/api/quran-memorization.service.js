const { repositories } = require('../../repositories');
const { env } = require('../../config/env');
const { sanitizeHtml } = require('../../utils/sanitizeHtml');

const { quranMemorizationRepository } = repositories;

const INTERVALS = [1, 3, 7, 14, 30, 60, 90, 180];
const RESULT_VALUES = new Set(['strong', 'shaky', 'weak', 'failed']);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFound(message = 'Memorization section not found') {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function dateTextInTimezone(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.quranCronTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseDate(value, fallback = dateTextInTimezone()) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00.000Z`))) {
    throw badRequest('date must be a valid YYYY-MM-DD date');
  }
  return text;
}

function parseRequiredText(value, fieldName, maxLength) {
  const text = String(value ?? '').trim();
  if (!text) {
    throw badRequest(`${fieldName} is required`);
  }
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function parseOptionalText(value, fieldName, maxLength) {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function parseOptionalInt(value, fieldName, min, max) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw badRequest(`${fieldName} must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

function parseOptionalNonNegativeInt(value, fieldName, maxValue) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > maxValue) {
    throw badRequest(`${fieldName} must be a non-negative integer up to ${maxValue}`);
  }
  return parsed;
}

function parseStatus(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (parsed !== 0 && parsed !== 1 && parsed !== 2) {
    throw badRequest('status must be 0 (learning), 1 (stabilizing), or 2 (maintained)');
  }
  return parsed;
}

function parseResult(value) {
  const text = String(value ?? '').trim().toLowerCase();
  if (!RESULT_VALUES.has(text)) {
    throw badRequest('result must be strong, shaky, weak, or failed');
  }
  return text;
}

function parseOptionalNote(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value);
  const trimmed = text.length > 20000 ? text.slice(0, 20000) : text;
  return sanitizeHtml(trimmed) || null;
}

function calculateNextReview(currentLevel, result) {
  let level = Number.isInteger(currentLevel) ? currentLevel : 0;
  level = Math.max(0, Math.min(level, INTERVALS.length - 1));
  let intervalDays = 1;

  if (result === 'failed') {
    intervalDays = 1;
    level = Math.max(0, level - 2);
  } else if (result === 'weak') {
    intervalDays = 1;
    level = Math.max(0, level - 1);
  } else if (result === 'shaky') {
    intervalDays = 1;
  } else {
    level = Math.min(level + 1, INTERVALS.length - 1);
    intervalDays = INTERVALS[level];
  }

  return { intervalDays, level };
}

function statusFromResultAndLevel(result, level) {
  if (result === 'failed' || result === 'weak') {
    return 0;
  }
  if (result === 'shaky') {
    return 1;
  }
  if (level >= 4) {
    return 2;
  }
  if (level >= 2) {
    return 1;
  }
  return 0;
}

async function listSections(userId) {
  return quranMemorizationRepository.listSections({ userId });
}

async function getSection(userId, sectionId) {
  const row = await quranMemorizationRepository.getSection({ userId, sectionId });
  if (!row) {
    throw notFound();
  }
  return row;
}

async function createSection(userId, input) {
  if (typeof input !== 'object' || input === null) {
    input = {};
  }

  const memorizedDate = parseDate(input.memorizedDate, dateTextInTimezone());
  const nextReviewDate = addDays(memorizedDate, 1);
  const row = await quranMemorizationRepository.createSection({
    userId,
    surahName: parseRequiredText(input.surahName, 'surahName', 120),
    fromAyah: parseOptionalInt(input.fromAyah, 'fromAyah', 1, 1000),
    toAyah: parseOptionalInt(input.toAyah, 'toAyah', 1, 1000),
    mushafPage: parseOptionalInt(input.mushafPage, 'mushafPage', 1, 1000),
    pageHalf: parseOptionalInt(input.pageHalf, 'pageHalf', 1, 2),
    fromLine: parseOptionalInt(input.fromLine, 'fromLine', 1, 100),
    toLine: parseOptionalInt(input.toLine, 'toLine', 1, 100),
    memorizedDate,
    lastReviewedDate: null,
    nextReviewDate,
    intervalLevel: 0,
    currentIntervalDays: 1,
    recallQuality: null,
    errorCount: 0,
    status: 0,
    note: parseOptionalNote(input.note),
  });
  return row;
}

async function updateSection(userId, sectionId, input) {
  if (typeof input !== 'object' || input === null) {
    input = {};
  }

  const existing = await getSection(userId, sectionId);
  const patch = {};

  if ('surahName' in input) {
    patch.surah_name = parseRequiredText(input.surahName, 'surahName', 120);
  }
  if ('fromAyah' in input) {
    patch.from_ayah = parseOptionalInt(input.fromAyah, 'fromAyah', 1, 1000);
  }
  if ('toAyah' in input) {
    patch.to_ayah = parseOptionalInt(input.toAyah, 'toAyah', 1, 1000);
  }
  if ('mushafPage' in input) {
    patch.mushaf_page = parseOptionalInt(input.mushafPage, 'mushafPage', 1, 1000);
  }
  if ('pageHalf' in input) {
    patch.page_half = parseOptionalInt(input.pageHalf, 'pageHalf', 1, 2);
  }
  if ('fromLine' in input) {
    patch.from_line = parseOptionalInt(input.fromLine, 'fromLine', 1, 100);
  }
  if ('toLine' in input) {
    patch.to_line = parseOptionalInt(input.toLine, 'toLine', 1, 100);
  }
  if ('memorizedDate' in input) {
    patch.memorized_date = parseDate(input.memorizedDate, existing.memorized_date);
  }
  if ('status' in input) {
    const status = parseStatus(input.status);
    if (status !== null) {
      patch.status = status;
    }
  }
  if ('note' in input) {
    patch.note = parseOptionalNote(input.note);
  }

  if (!Object.keys(patch).length) {
    return existing;
  }

  const row = await quranMemorizationRepository.updateSection({ userId, sectionId, patch });
  if (!row) {
    throw notFound();
  }
  return getSection(userId, sectionId);
}

async function deleteSection(userId, sectionId) {
  const removed = await quranMemorizationRepository.deleteSection({ userId, sectionId });
  if (!removed) {
    throw notFound();
  }
  return { removed: true };
}

async function listReviews(userId, sectionId) {
  await getSection(userId, sectionId);
  return quranMemorizationRepository.listReviews({ userId, sectionId });
}

async function createReview(userId, sectionId, input) {
  if (typeof input !== 'object' || input === null) {
    input = {};
  }

  const existing = await getSection(userId, sectionId);
  const result = parseResult(input.result);
  const reviewDate = parseDate(input.reviewDate, dateTextInTimezone());
  const errorCount = parseOptionalNonNegativeInt(input.errorCount, 'errorCount', 100000) ?? 0;
  const verified = input.verified === true;
  if (!verified) {
    throw badRequest('verify the passage against the Mushaf before saving the review');
  }

  const review = await quranMemorizationRepository.createReview({
    userId,
    sectionId,
    reviewDate,
    result,
    errorCount,
    verified,
    note: parseOptionalNote(input.note),
  });
  if (!review) {
    throw notFound();
  }

  const currentLevel = existing.interval_level ?? 0;
  const { intervalDays, level } = calculateNextReview(currentLevel, result);
  const nextReviewDate = addDays(reviewDate, intervalDays);
  const totalErrors = (existing.error_count ?? 0) + errorCount;
  const status = statusFromResultAndLevel(result, level);

  const updated = await quranMemorizationRepository.updateSection({
    userId,
    sectionId,
    patch: {
      last_reviewed_date: reviewDate,
      next_review_date: nextReviewDate,
      interval_level: level,
      current_interval_days: intervalDays,
      recall_quality: result,
      error_count: totalErrors,
      status,
    },
  });

  return { review, section: updated || (await getSection(userId, sectionId)) };
}

async function deleteReview(userId, sectionId, reviewId) {
  await getSection(userId, sectionId);
  const removed = await quranMemorizationRepository.deleteReview({ userId, sectionId, reviewId });
  if (!removed) {
    throw notFound('Review not found');
  }
  return { removed: true };
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
  INTERVALS,
};
