const { repositories } = require('../../repositories');
const { env } = require('../../config/env');

const { notificationsRepository, quranRepository } = repositories;
const MANAGER_ROLE_KEYS = ['super_admin', 'admin', 'manager'];

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

function defaultWeekRange(input = {}) {
  if (input.fromDate && input.toDate) {
    return { fromDate: input.fromDate, toDate: input.toDate };
  }

  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    fromDate: monday.toISOString().slice(0, 10),
    toDate: sunday.toISOString().slice(0, 10),
  };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateText(date) {
  return date.toISOString().slice(0, 10);
}

function previousSevenDayRange(baseDate = new Date()) {
  const end = addDays(baseDate, -1);
  const start = addDays(end, -6);
  return {
    fromDate: toDateText(start),
    toDate: toDateText(end),
  };
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

async function sendQuranReminderNotifications() {
  const users = await quranRepository.listInternalActiveUsers();
  const rows = await notificationsRepository.createForUsers({
    userIds: users.map((user) => user.id),
    notifType: 20,
    payloadJson: {
      event: 'quran_daily_reminder',
      title: 'Quran tracking reminder',
      message: 'আজকের Quran progress Done করুন।',
    },
  });

  return {
    notifiedUsers: rows.length,
  };
}

async function runWeeklyPenaltyJob(input = {}) {
  const range = input.fromDate && input.toDate
    ? { fromDate: input.fromDate, toDate: input.toDate }
    : previousSevenDayRange(input.baseDate ? new Date(input.baseDate) : new Date());

  const result = await quranRepository.createWeeklyPenaltyRun({
    ...range,
    penaltyPerMissedDayMinor: Number(input.penaltyPerMissedDayMinor || env.quranPenaltyPerMissedDayMinor),
  });

  if (!result.skipped) {
    await notificationsRepository.createForRoleKeys({
      roleKeys: MANAGER_ROLE_KEYS,
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
  const rows = await quranRepository.listPenalties(filters);
  return {
    rows,
    totalPenaltyMinor: rows.reduce((sum, row) => sum + Number(row.penalty_minor || 0), 0),
    totalMissedDays: rows.reduce((sum, row) => sum + Number(row.missed_days || 0), 0),
  };
}

module.exports = {
  createMyProgress,
  updateMyProgress,
  listMyProgress,
  getAdminWeeklyReport,
  sendQuranReminderNotifications,
  runWeeklyPenaltyJob,
  getAdminPenaltyReport,
};
