const cron = require('node-cron');
const { env } = require('../config/env');
const {
  runWeeklyPenaltyJob,
  sendQuranReminderNotifications,
} = require('./api/quran-api.service');

const jobs = [];

function scheduleJob(expression, task, options) {
  const job = cron.schedule(expression, task, {
    timezone: env.quranCronTimezone,
    ...options,
  });
  jobs.push(job);
  return job;
}

function startSchedulers() {
  if (!env.schedulerEnabled) {
    console.log('Schedulers disabled');
    return jobs;
  }

  scheduleJob('30 19 * * *', async () => {
    try {
      const result = await sendQuranReminderNotifications();
      console.log(`Quran reminder notifications sent: ${result.notifiedUsers}`);
    } catch (error) {
      console.error('Quran reminder scheduler failed:', error.message);
    }
  });

  scheduleJob('10 0 * * 5', async () => {
    try {
      const result = await runWeeklyPenaltyJob();
      const status = result.skipped ? 'skipped' : 'created';
      console.log(`Quran weekly penalty ${status}: ${result.fromDate} to ${result.toDate}`);
    } catch (error) {
      console.error('Quran penalty scheduler failed:', error.message);
    }
  });

  return jobs;
}

function stopSchedulers() {
  for (const job of jobs) {
    job.stop();
  }
}

module.exports = {
  startSchedulers,
  stopSchedulers,
};
