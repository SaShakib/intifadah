const { repositories } = require('../../repositories');
const { env } = require('../../config/env');
const { sendQuranPenaltyEmail, sendQuranPenaltyRemovalEmail } = require('../mail.service');

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

function parseOptionalPrayerCount(value, fieldName) {
  const parsed = parseOptionalPositiveInt(value, fieldName);
  if (parsed !== null && parsed > 5) {
    const error = new Error(`${fieldName} must be between 0 and 5`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function parsePrayerCounts(input) {
  const prayersOffered = parseOptionalPrayerCount(input.prayersOffered, 'prayersOffered');
  const congregationalPrayers = parseOptionalPrayerCount(input.congregationalPrayers, 'congregationalPrayers');
  if (prayersOffered !== null && congregationalPrayers !== null && congregationalPrayers > prayersOffered) {
    const error = new Error('congregationalPrayers cannot exceed prayersOffered');
    error.statusCode = 400;
    throw error;
  }
  return { prayersOffered, congregationalPrayers };
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

function weeklyTrackingRange(input = {}) {
  if (input.fromDate && input.toDate) {
    return { fromDate: input.fromDate, toDate: input.toDate };
  }

  const weekOffset = input.weekOffset === undefined ? 0 : Number(input.weekOffset);
  if (!Number.isInteger(weekOffset) || weekOffset < 0 || weekOffset > 4) {
    const error = new Error('weekOffset must be between 0 and 4');
    error.statusCode = 400;
    throw error;
  }

  const currentWeek = fridayToThursdayRange();
  const fromDate = addCalendarDays(currentWeek.fromDate, -7 * weekOffset);
  return { fromDate, toDate: addCalendarDays(fromDate, 6) };
}

async function createMyProgress(userId, input = {}) {
  const prayerCounts = parsePrayerCounts(input);
  const created = await quranRepository.createProgress({
    userId,
    progressDate: input.progressDate || input.date || null,
    pagesRead: parseOptionalPositiveInt(input.pagesRead, 'pagesRead'),
    surahName: String(input.surahName || '').trim() || null,
    minutesRead: parseOptionalPositiveInt(input.minutesRead, 'minutesRead'),
    ...prayerCounts,
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
  const prayerCounts = parsePrayerCounts(input);
  const updated = await quranRepository.updateProgress({
    progressId,
    userId,
    pagesRead: parseOptionalPositiveInt(input.pagesRead, 'pagesRead'),
    surahName: String(input.surahName || '').trim() || null,
    minutesRead: parseOptionalPositiveInt(input.minutesRead, 'minutesRead'),
    ...prayerCounts,
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
  const range = weeklyTrackingRange(filters);
  const rows = await quranRepository.getWeeklyReport(range);
  return {
    ...range,
    rows,
  };
}

async function getMyPenaltyReport(userId, filters = {}) {
  const rows = await quranRepository.listPenalties({
    userId,
    limit: filters.limit,
  });
  return {
    rows,
    totalPenaltyMinor: rows.reduce((sum, row) => sum + Number(row.penalty_minor || 0), 0),
    totalMissedDays: rows.reduce((sum, row) => sum + Number(row.missed_days || 0), 0),
  };
}

async function getInternalWeeklyCompletion(filters = {}) {
  const range = weeklyTrackingRange(filters);
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
      title: 'Quran ও Namaj tracking reminder',
      message: 'আজকের Quran ও Namaj অগ্রগতি রেকর্ড করুন।',
    },
    includeDeliveryReport: true,
  });

  return {
    notifiedUsers: result.rows.length,
    devicePush: result.delivery.devicePush,
  };
}

async function sendNamajReminderNotifications() {
  const users = await quranRepository.listActiveUsers();
  const result = await notificationsRepository.createForUsers({
    userIds: users.map((user) => user.id),
    notifType: 20,
    payloadJson: {
      event: 'namaj_daily_reminder',
      title: 'Namaj tracking reminder',
      message: 'আজকের Namaj-এর ওয়াক্ত ও Jamat রেকর্ড করুন।',
    },
    includeDeliveryReport: true,
  });

  return {
    notifiedUsers: result.rows.length,
    devicePush: result.delivery.devicePush,
  };
}

async function runWeeklyPenaltyJob(input = {}) {
  // Penalties are always limited to the immediately completed Friday-Thursday cycle.
  // This prevents manual requests from charging a historical period.
  const range = lastCompletedWeekRange();

  const result = await quranRepository.createWeeklyPenaltyRun({
    ...range,
    penaltyPerMissedDayMinor: Number(input.penaltyPerMissedDayMinor || env.quranPenaltyPerMissedDayMinor),
    reapplyExisting: input.reapply === true,
  });

  if (!result.skipped) {
    const changedUserIds = result.reapplied ? result.changedUserIds : result.penalties.map((item) => item.user_id);
    const changedPenalties = result.penalties.filter((item) => changedUserIds.includes(Number(item.user_id)));
    await notificationsRepository.createForRoleKeys({
      roleKeys: QURAN_ADMIN_ROLE_KEYS,
      notifType: 21,
      payloadJson: {
        event: 'quran_weekly_penalty_run',
        fromDate: range.fromDate,
        toDate: range.toDate,
        penaltyCount: changedPenalties.length,
        totalPenaltyMinor: result.penalties.reduce((sum, item) => sum + Number(item.penalty_minor || 0), 0),
      },
    });

    await notificationsRepository.createForUsers({
      userIds: changedPenalties.map((item) => item.user_id),
      notifType: 22,
      payloadJson: {
        event: result.reapplied ? 'quran_weekly_penalty_reapplied' : 'quran_weekly_penalty_assigned',
        fromDate: range.fromDate,
        toDate: range.toDate,
        penaltyPerMissedDayMinor: Number(input.penaltyPerMissedDayMinor || env.quranPenaltyPerMissedDayMinor),
      },
    });

    const emailResults = await Promise.allSettled(
      changedPenalties
        .filter((item) => item.email)
        .map((item) => sendQuranPenaltyEmail({
          to: item.email,
          fullName: item.full_name,
          fromDate: range.fromDate,
          toDate: range.toDate,
          missedDays: item.missed_days,
          penaltyMinor: item.penalty_minor,
        })),
    );
    result.emailDelivery = {
      attempted: emailResults.length,
      sent: emailResults.filter((item) => item.status === 'fulfilled').length,
      failed: emailResults.filter((item) => item.status === 'rejected').length,
    };

    if (result.removedPenalties.length) {
      await notificationsRepository.createForUsers({
        userIds: result.removedPenalties.map((item) => item.user_id),
        notifType: 22,
        payloadJson: {
          event: 'quran_weekly_penalty_reversed',
          fromDate: range.fromDate,
          toDate: range.toDate,
          title: 'Quran penalty removed',
          message: 'Quran রেকর্ড আপডেট হওয়ায় penalty বাতিল করা হয়েছে।',
          url: '/user/quran',
        },
      });
      const removalEmails = await Promise.allSettled(
        result.removedPenalties
          .filter((item) => item.email)
          .map((item) => sendQuranPenaltyRemovalEmail({
            to: item.email,
            fullName: item.full_name,
            fromDate: range.fromDate,
            toDate: range.toDate,
          })),
      );
      result.emailDelivery.removed = {
        attempted: removalEmails.length,
        sent: removalEmails.filter((item) => item.status === 'fulfilled').length,
        failed: removalEmails.filter((item) => item.status === 'rejected').length,
      };
    }
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
  weeklyTrackingRange,
  createMyProgress,
  updateMyProgress,
  listMyProgress,
  getMyPenaltyReport,
  getAdminWeeklyReport,
  getInternalWeeklyCompletion,
  sendQuranReminderNotifications,
  sendNamajReminderNotifications,
  runWeeklyPenaltyJob,
  getAdminPenaltyReport,
};
