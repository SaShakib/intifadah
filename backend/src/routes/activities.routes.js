const express = require('express');
const { requireAuth, requireCompletedProfile, requireRoles } = require('../middleware/auth');
const activitiesController = require('../controllers/activities.controller');

const router = express.Router();

router.get('/', activitiesController.publicList);
router.use(requireAuth, requireCompletedProfile, requireRoles('super_admin', 'admin', 'manager'));
router.get('/manage', activitiesController.adminList);
router.post('/upload-signature', activitiesController.uploadSignature);
router.post('/', activitiesController.create);
router.patch('/:activityId', activitiesController.update);

module.exports = { activitiesRouter: router };
