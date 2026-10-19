const {
  createSection,
  updateSection,
  listSections,
  getSection,
  deleteSection,
  listReviews,
  createReview,
  deleteReview,
} = require('../services/api/quran-memorization.service');

function positiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be a positive integer`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

async function sections(req, res, next) {
  try {
    const rows = await listSections(req.auth.userId);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function section(req, res, next) {
  try {
    const row = await getSection(req.auth.userId, positiveInt(req.params.sectionId, 'sectionId'));
    res.json({ row });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const row = await createSection(req.auth.userId, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const row = await updateSection(req.auth.userId, positiveInt(req.params.sectionId, 'sectionId'), req.body || {});
    res.json({ row });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const data = await deleteSection(req.auth.userId, positiveInt(req.params.sectionId, 'sectionId'));
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function reviews(req, res, next) {
  try {
    const rows = await listReviews(req.auth.userId, positiveInt(req.params.sectionId, 'sectionId'));
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function createReviewHandler(req, res, next) {
  try {
    const data = await createReview(req.auth.userId, positiveInt(req.params.sectionId, 'sectionId'), req.body || {});
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

async function removeReview(req, res, next) {
  try {
    const data = await deleteReview(
      req.auth.userId,
      positiveInt(req.params.sectionId, 'sectionId'),
      positiveInt(req.params.reviewId, 'reviewId'),
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sections,
  section,
  create,
  update,
  remove,
  reviews,
  createReview: createReviewHandler,
  removeReview,
};
