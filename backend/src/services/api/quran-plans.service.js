const { repositories } = require('../../repositories');
const { env } = require('../../config/env');
const { sanitizeHtml } = require('../../utils/sanitizeHtml');

const { quranPlansRepository } = repositories;

const MAX_NOTE_LENGTH = 20000;
const MAX_REF_LENGTH = 80;
const MAX_SURAH_LENGTH = 120;
const MAX_TARGET = 1000000;
const MAX_QUANTITY = 1000000;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFound(message = 'Plan not found') {
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

function parseGoalType(value) {
  const parsed = Number(value);
  if (parsed !== 1 && parsed !== 2) {
    throw badRequest('goalType must be 1 (recitation) or 2 (memorization)');
  }
  return parsed;
}

function parsePositiveInt(value, fieldName, maxValue) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > maxValue) {
    throw badRequest(`${fieldName} must be a positive integer up to ${maxValue}`);
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
  const parsed = Number(value);
  if (parsed !== 0 && parsed !== 1) {
    throw badRequest('status must be 0 (active) or 1 (completed)');
  }
  return parsed;
}

function parseDate(value) {
  if (value === undefined || value === null || value === '') {
    return dateTextInTimezone();
  }
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00.000Z`))) {
    throw badRequest('recordDate must be a valid YYYY-MM-DD date');
  }
  return text;
}

function parseOptionalNote(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value);
  const trimmed = text.length > MAX_NOTE_LENGTH ? text.slice(0, MAX_NOTE_LENGTH) : text;
  return sanitizeHtml(trimmed) || null;
}

async function createPlan(userId, input) {
  return quranPlansRepository.createPlan({
    userId,
    planName: parseRequiredText(input.planName, 'planName', 120),
    goalType: parseGoalType(input.goalType),
    totalTarget: parsePositiveInt(input.totalTarget, 'totalTarget', MAX_TARGET),
    fromRef: parseOptionalText(input.fromRef, 'fromRef', MAX_REF_LENGTH),
    toRef: parseOptionalText(input.toRef, 'toRef', MAX_REF_LENGTH),
    surahReference: parseOptionalText(input.surahReference, 'surahReference', MAX_SURAH_LENGTH),
    note: parseOptionalNote(input.note),
  });
}

async function updatePlan(userId, planId, input) {
  if (typeof input !== 'object' || input === null) {
    input = {};
  }

  const patch = {};
  if ('planName' in input) {
    patch.plan_name = parseRequiredText(input.planName, 'planName', 120);
  }
  if ('goalType' in input) {
    patch.goal_type = parseGoalType(input.goalType);
  }
  if ('totalTarget' in input) {
    patch.total_target = parsePositiveInt(input.totalTarget, 'totalTarget', MAX_TARGET);
  }
  if ('fromRef' in input) {
    patch.from_ref = parseOptionalText(input.fromRef, 'fromRef', MAX_REF_LENGTH);
  }
  if ('toRef' in input) {
    patch.to_ref = parseOptionalText(input.toRef, 'toRef', MAX_REF_LENGTH);
  }
  if ('surahReference' in input) {
    patch.surah_reference = parseOptionalText(input.surahReference, 'surahReference', MAX_SURAH_LENGTH);
  }
  if ('note' in input) {
    patch.note = parseOptionalNote(input.note);
  }
  if ('status' in input) {
    patch.status = parseStatus(input.status);
    patch.completed_on = patch.status === 1 ? dateTextInTimezone() : null;
  }

  if (!Object.keys(patch).length) {
    return getPlan(userId, planId);
  }

  const row = await quranPlansRepository.updatePlan({ userId, planId, patch });
  if (!row) {
    throw notFound();
  }
  return getPlan(userId, planId);
}

async function listPlans(userId) {
  return quranPlansRepository.listPlans({ userId });
}

async function getPlan(userId, planId) {
  const row = await quranPlansRepository.getPlan({ userId, planId });
  if (!row) {
    throw notFound();
  }
  return row;
}

async function deletePlan(userId, planId) {
  const removed = await quranPlansRepository.deletePlan({ userId, planId });
  if (!removed) {
    throw notFound();
  }
  return { removed: true };
}

async function listProgress(userId, planId) {
  await getPlan(userId, planId);
  return quranPlansRepository.listProgress({ userId, planId });
}

async function upsertProgress(userId, planId, input) {
  await getPlan(userId, planId);
  const row = await quranPlansRepository.upsertProgress({
    userId,
    planId,
    recordDate: parseDate(input.recordDate),
    quantity: parseOptionalNonNegativeInt(input.quantity, 'quantity', MAX_QUANTITY),
    note: parseOptionalNote(input.note),
  });
  if (!row) {
    throw notFound();
  }
  return { row, plan: await getPlan(userId, planId) };
}

async function deleteProgress(userId, planId, progressId) {
  const removed = await quranPlansRepository.deleteProgress({ userId, planId, progressId });
  if (!removed) {
    throw notFound('Progress entry not found');
  }
  return { removed: true, plan: await getPlan(userId, planId) };
}

module.exports = {
  createPlan,
  updatePlan,
  listPlans,
  getPlan,
  deletePlan,
  listProgress,
  upsertProgress,
  deleteProgress,
};