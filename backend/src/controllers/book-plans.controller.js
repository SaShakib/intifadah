const {
  createPlan,
  updatePlan,
  listPlans,
  getPlan,
  deletePlan,
} = require('../services/api/book-plans.service');

function positiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be a positive integer`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

async function plans(req, res, next) {
  try {
    const rows = await listPlans(req.auth.userId);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function plan(req, res, next) {
  try {
    const row = await getPlan(req.auth.userId, positiveInt(req.params.planId, 'planId'));
    res.json({ row });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const row = await createPlan(req.auth.userId, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const row = await updatePlan(req.auth.userId, positiveInt(req.params.planId, 'planId'), req.body || {});
    res.json({ row });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const data = await deletePlan(req.auth.userId, positiveInt(req.params.planId, 'planId'));
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  plans,
  plan,
  create,
  update,
  remove,
};