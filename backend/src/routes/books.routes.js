const express = require('express');
const { requireAuth, requireCompletedProfile, requireRoles } = require('../middleware/auth');
const booksController = require('../controllers/books.controller');
const bookPlansController = require('../controllers/book-plans.controller');

const router = express.Router();

router.get('/categories', booksController.categories);
router.get('/plans', requireAuth, requireCompletedProfile, bookPlansController.plans);
router.post('/plans', requireAuth, requireCompletedProfile, bookPlansController.create);
router.get('/plans/:planId', requireAuth, requireCompletedProfile, bookPlansController.plan);
router.patch('/plans/:planId', requireAuth, requireCompletedProfile, bookPlansController.update);
router.delete('/plans/:planId', requireAuth, requireCompletedProfile, bookPlansController.remove);
router.get('/admin/featured', requireAuth, requireRoles('super_admin'), booksController.adminFeaturedList);
router.put('/admin/featured', requireAuth, requireRoles('super_admin'), booksController.adminFeaturedReplace);
router.patch('/admin/featured/:bookId', requireAuth, requireRoles('super_admin'), booksController.adminFeaturedToggle);
router.get('/admin/requests', requireAuth, requireRoles('super_admin'), booksController.adminRequests);
router.patch('/admin/requests/:requestId', requireAuth, requireRoles('super_admin'), booksController.adminRequestUpdate);
router.get('/me/books', requireAuth, requireCompletedProfile, booksController.myBooks);
router.patch('/:bookId/availability', requireAuth, requireCompletedProfile, booksController.availability);
router.get('/', booksController.list);
router.get('/:bookId', booksController.detail);

router.use(requireAuth, requireCompletedProfile);
router.get('/me/activation', booksController.activation);
router.post('/me/activation', booksController.activate);
router.get('/me/requests', booksController.myRequests);
router.post('/categories', booksController.createCategory);
router.post('/upload-signature', booksController.uploadSignature);
router.post('/', booksController.create);
router.patch('/:bookId', booksController.update);
router.delete('/:bookId', booksController.remove);
router.post('/:bookId/requests', booksController.request);
router.patch('/requests/:requestId/owner', booksController.ownerAction);
router.patch('/requests/:requestId/received', booksController.received);
router.post('/requests/:requestId/extensions', booksController.extension);
router.patch('/extensions/:extensionId', booksController.resolveExtension);

module.exports = { booksRouter: router };
