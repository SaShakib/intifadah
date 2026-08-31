const express = require('express');
const systemController = require('../controllers/system.controller');
const cronController = require('../controllers/cron.controller');

const router = express.Router();

router.get('/', systemController.root);
router.get('/health', systemController.health);
router.get('/db/health', systemController.dbHealth);
router.get('/internal/cron/quran-daily-reminder', cronController.dailyQuranReminder);
router.get('/internal/cron/quran-weekly-penalty', cronController.weeklyQuranPenalty);

module.exports = {
  systemRouter: router,
};
