const { env } = require('../config/env');
const {
  runWeeklyPenaltyJob,
  sendQuranReminderNotifications,
} = require('../services/api/quran-api.service');

function requireCronAuthorization(req) {
  if (!env.cronSecret || req.get('authorization') !== `Bearer ${env.cronSecret}`) {
    const error = new Error('Unauthorized cron request');
    error.statusCode = 401;
    throw error;
  }
}

async function dailyQuranReminder(req, res, next) {
  try {
    requireCronAuthorization(req);
    const result = await sendQuranReminderNotifications();
    res.json({ ok: true, schedule: '21:00 Asia/Dhaka', ...result });
  } catch (error) {
    next(error);
  }
}

async function weeklyQuranPenalty(req, res, next) {
  try {
    requireCronAuthorization(req);
    const result = await runWeeklyPenaltyJob();
    res.json({ ok: true, schedule: 'Friday 00:10 Asia/Dhaka', ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dailyQuranReminder,
  weeklyQuranPenalty,
};
