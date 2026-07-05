const express = require('express');
const systemController = require('../controllers/system.controller');

const router = express.Router();

router.get('/', systemController.root);
router.get('/health', systemController.health);
router.get('/db/health', systemController.dbHealth);

module.exports = {
  systemRouter: router,
};
