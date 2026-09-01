const { repositories } = require('../../repositories');
const { env } = require('../../config/env');

const { notificationsRepository, quranRepository } = repositories;
const QURAN_ADMIN_ROLE_KEYS = ['super_admin', 'admin'];

function parseOptionalPositiveInt(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    const error = new Error(`${fieldName} must be a non-negative integer`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
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

function addCalendarDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function fridayToThursdayRange(baseDate = new Date()) {
  const dateText = typeof baseDate === 'string' ? baseDate : dateTextInTimezone(baseDate);
  const dayOfWeek = new Date(`${dateText}T00:00:00.000Z`).getUTCDay();
  const daysSinceFriday = (dayOfWeek + 2) % 7;
  const fromDate = addCalendarDays(dateText, -daysSinceFriday);
  return { fromDate, toDate: addCalendarDays(fromDate, 6) };
}

function defaultWeekRange(input = {}) {
  if (input.fromDate && input.toDate) {
    return { fromDate: input.fromDate, toDate: input.toDate };
  }

  return fridayToThursdayRange();
}

function lastCompletedWeekRange(baseDate = new Date()) {
  const currentWeek = fridayToThursdayRange(baseDate);
  const fromDate = addCalendarDays(currentWeek.fromDate, -7);
  return { fromDate, toDate: addCalendarDays(fromDate, 6) };
}

async function createMyProgress(userId, input = {}) {
  const created = await quranRepository.createProgress({
    userId,
    progressDate: input.progressDate || input.date || null,
    pagesRead: parseOptionalPositiveInt(input.pagesRead, 'pagesRead'),
    surahName: String(input.surahName || '').trim() || null,
    minutesRead: parseOptionalPositiveInt(input.minutesRead, 'minutesRead'),
    note: String(input.note || '').trim() || null,
  });

  if (!created) {
    const error = new Error('Quran progress already exists for this date');
    error.statusCode = 409;
    throw error;
  }

  return created;
}

async function updateMyProgress(userId, progressId, input = {}) {
  const updated = await quranRepository.updateProgress({
    progressId,
    userId,
    pagesRead: parseOptionalPositiveInt(input.pagesRead, 'pagesRead'),
    surahName: String(input.surahName || '').trim() || null,
    minutesRead: parseOptionalPositiveInt(input.minutesRead, 'minutesRead'),
    note: String(input.note || '').trim() || null,
  });

  if (!updated) {
    const error = new Error('Quran progress record not found');
    error.statusCode = 404;
    throw error;
  }

  return updated;
}

async function listMyProgress(userId, filters = {}) {
  return quranRepository.listProgress({
    userId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });
}

async function getAdminWeeklyReport(filters = {}) {
  const range = defaultWeekRange(filters);
  const rows = await quranRepository.getWeeklyReport(range);
  return {
    ...range,
    rows,
  };
}

async function getInternalWeeklyCompletion() {
  const range = defaultWeekRange();
  const rows = await quranRepository.getWeeklyReport(range);
  return {
    ...range,
    rows: rows.map((row) => ({
      user_id: row.user_id,
      full_name: row.full_name,
      days: Object.fromEntries(
        Object.entries(row.days || {}).map(([date, value]) => [date, { done: Boolean(value?.done) }]),
      ),
    })),
  };
}

async function sendQuranReminderNotifications() {
  const users = await quranRepository.listActiveUsers();
  const result = await notificationsRepository.createForUsers({
    userIds: users.map((user) => user.id),
    notifType: 20,
    payloadJson: {
      event: 'quran_daily_reminder',
      title: 'Quran tracking reminder',
      message: 'আজকের Quran progress Done করুন।',
    },
    includeDeliveryReport: true,
  });

  return {
    notifiedUsers: result.rows.length,
    devicePush: result.delivery.devicePush,
  };
}

async function runWeeklyPenaltyJob(input = {}) {
  const range = input.fromDate && input.toDate
    ? { fromDate: input.fromDate, toDate: input.toDate }
    : lastCompletedWeekRange(input.baseDate || new Date());

  const result = await quranRepository.createWeeklyPenaltyRun({
    ...range,
    penaltyPerMissedDayMinor: Number(input.penaltyPerMissedDayMinor || env.quranPenaltyPerMissedDayMinor),
  });

  if (!result.skipped) {
    await notificationsRepository.createForRoleKeys({
      roleKeys: QURAN_ADMIN_ROLE_KEYS,
      notifType: 21,
      payloadJson: {
        event: 'quran_weekly_penalty_run',
        fromDate: range.fromDate,
        toDate: range.toDate,
        penaltyCount: result.penalties.length,
        totalPenaltyMinor: result.penalties.reduce((sum, item) => sum + Number(item.penalty_minor || 0), 0),
      },
    });

    await notificationsRepository.createForUsers({
      userIds: result.penalties.map((item) => item.user_id),
      notifType: 22,
      payloadJson: {
        event: 'quran_weekly_penalty_assigned',
        fromDate: range.fromDate,
        toDate: range.toDate,
        penaltyPerMissedDayMinor: Number(input.penaltyPerMissedDayMinor || env.quranPenaltyPerMissedDayMinor),
      },
    });
  }

  return {
    ...range,
    ...result,
  };
}

async function getAdminPenaltyReport(filters = {}) {
  const range = filters.fromDate && filters.toDate
    ? { fromDate: filters.fromDate, toDate: filters.toDate }
    : lastCompletedWeekRange();
  const rows = await quranRepository.listPenalties({ ...filters, ...range });
  return {
    ...range,
    rows,
    totalPenaltyMinor: rows.reduce((sum, row) => sum + Number(row.penalty_minor || 0), 0),
    totalMissedDays: rows.reduce((sum, row) => sum + Number(row.missed_days || 0), 0),
  };
}

module.exports = {
  fridayToThursdayRange,
  lastCompletedWeekRange,
  createMyProgress,
  updateMyProgress,
  listMyProgress,
  getAdminWeeklyReport,
  getInternalWeeklyCompletion,
  sendQuranReminderNotifications,
  runWeeklyPenaltyJob,
  getAdminPenaltyReport,
};
