const express = require('express');
const { requireAuth, requireCompletedProfile } = require('../middleware/auth');
const booksController = require('../controllers/books.controller');

const router = express.Router();

router.get('/categories', booksController.categories);
router.get('/search', booksController.metadata);
router.get('/', booksController.list);
router.get('/:bookId', booksController.detail);

router.use(requireAuth, requireCompletedProfile);
router.get('/me/activation', booksController.activation);
router.post('/me/activation', booksController.activate);
router.get('/me/requests', booksController.myRequests);
router.post('/categories', booksController.createCategory);
router.post('/upload-signature', booksController.uploadSignature);
router.post('/', booksController.create);
router.post('/:bookId/requests', booksController.request);
router.patch('/requests/:requestId/owner', booksController.ownerAction);
router.patch('/requests/:requestId/received', booksController.received);
router.post('/requests/:requestId/extensions', booksController.extension);
router.patch('/extensions/:extensionId', booksController.resolveExtension);

module.exports = { booksRouter: router };
