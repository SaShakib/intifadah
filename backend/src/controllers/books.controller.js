const { repositories } = require('../repositories');
const {
  activateBooks,
  createBookCategory,
  addBook,
  updateBook,
  deleteBook,
  requestBook,
  ownerUpdateRequest,
  receiverConfirmRequest,
  requestExtension,
  ownerResolveExtension,
  cloudinarySignature,
} = require('../services/books.service');

const { booksRepository } = repositories;

function id(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${field} must be a positive integer`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

async function categories(_req, res, next) {
  try { res.json({ rows: await booksRepository.listCategories() }); } catch (error) { next(error); }
}

async function list(req, res, next) {
  try {
    const rows = await booksRepository.listBooks({ search: req.query.search, categoryId: req.query.categoryId, limit: req.query.limit, offset: req.query.offset });
    res.json({ rows });
  } catch (error) { next(error); }
}

async function detail(req, res, next) {
  try {
    const row = await booksRepository.getBookById(id(req.params.bookId, 'bookId'));
    if (!row) return res.status(404).json({ message: 'Book not found' });
    return res.json({ row });
  } catch (error) { return next(error); }
}

async function activation(req, res, next) {
  try { res.json({ row: await booksRepository.getActivationProfile(req.auth.userId) }); } catch (error) { next(error); }
}

async function activate(req, res, next) {
  try { res.json({ row: await activateBooks(req.auth.userId, req.body || {}) }); } catch (error) { next(error); }
}

async function createCategory(req, res, next) {
  try { res.status(201).json({ row: await createBookCategory(req.auth.userId, req.body || {}) }); } catch (error) { next(error); }
}

async function create(req, res, next) {
  try { res.status(201).json({ row: await addBook(req.auth.userId, req.body || {}) }); } catch (error) { next(error); }
}

async function update(req, res, next) {
  try { res.json({ row: await updateBook(req.auth.userId, id(req.params.bookId, 'bookId'), req.body || {}) }); } catch (error) { next(error); }
}

async function remove(req, res, next) {
  try { res.json({ data: await deleteBook(req.auth, id(req.params.bookId, 'bookId')) }); } catch (error) { next(error); }
}

async function uploadSignature(_req, res, next) {
  try { res.json({ data: cloudinarySignature() }); } catch (error) { next(error); }
}

async function request(req, res, next) {
  try { res.status(201).json({ row: await requestBook(req.auth.userId, id(req.params.bookId, 'bookId'), req.body || {}) }); } catch (error) { next(error); }
}

async function myRequests(req, res, next) {
  try { res.json({ rows: await booksRepository.listRequestsForUser(req.auth.userId) }); } catch (error) { next(error); }
}

async function ownerAction(req, res, next) {
  try { res.json({ row: await ownerUpdateRequest(req.auth.userId, id(req.params.requestId, 'requestId'), req.body || {}) }); } catch (error) { next(error); }
}

async function received(req, res, next) {
  try { res.json({ row: await receiverConfirmRequest(req.auth.userId, id(req.params.requestId, 'requestId'), req.body || {}) }); } catch (error) { next(error); }
}

async function extension(req, res, next) {
  try { res.status(201).json({ row: await requestExtension(req.auth.userId, id(req.params.requestId, 'requestId'), req.body || {}) }); } catch (error) { next(error); }
}

async function resolveExtension(req, res, next) {
  try { res.json({ data: await ownerResolveExtension(req.auth.userId, id(req.params.extensionId, 'extensionId'), req.body || {}) }); } catch (error) { next(error); }
}

module.exports = { categories, list, detail, activation, activate, createCategory, create, update, remove, uploadSignature, request, myRequests, ownerAction, received, extension, resolveExtension };
