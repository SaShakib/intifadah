const {
  createMyProgress,
  updateMyProgress,
  listMyProgress,
  getAdminWeeklyReport,
  getInternalWeeklyCompletion,
  getMyPenaltyReport,
  sendQuranReminderNotifications,
  getAdminPenaltyReport,
  runWeeklyPenaltyJob,
} = require('../services/api/quran-api.service');

async function myProgress(req, res, next) {
  try {
    const rows = await listMyProgress(req.auth.userId, {
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function createProgress(req, res, next) {
  try {
    const row = await createMyProgress(req.auth.userId, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function updateProgress(req, res, next) {
  try {
    const progressId = Number(req.params.progressId);
    if (!Number.isInteger(progressId) || progressId <= 0) {
      const error = new Error('progressId must be a positive integer');
      error.statusCode = 400;
      throw error;
    }
    const row = await updateMyProgress(req.auth.userId, progressId, req.body || {});
    res.json({ row });
  } catch (error) {
    next(error);
  }
}

async function weeklyReport(req, res, next) {
  try {
    const data = await getAdminWeeklyReport({
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function internalWeeklyCompletion(_req, res, next) {
  try {
    const data = await getInternalWeeklyCompletion();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function myPenalties(req, res, next) {
  try {
    const data = await getMyPenaltyReport(req.auth.userId, {
      limit: req.query.limit,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function sendReminder(_req, res, next) {
  try {
    const result = await sendQuranReminderNotifications();
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function penalties(req, res, next) {
  try {
    const data = await getAdminPenaltyReport({
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      userId: req.query.userId,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function runPenalties(req, res, next) {
  try {
    const data = await runWeeklyPenaltyJob(req.body || {});
    res.status(data.skipped ? 200 : 201).json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  myProgress,
  createProgress,
  updateProgress,
  weeklyReport,
  internalWeeklyCompletion,
  myPenalties,
  sendReminder,
  penalties,
  runPenalties,
};
