const { activityImageSignature, listPublicActivities, listAdminActivities, createActivity, updateActivity } = require('../services/activities.service');

function id(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error('activityId must be a positive integer');
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

async function publicList(_req, res, next) {
  try { res.json({ rows: await listPublicActivities() }); } catch (error) { next(error); }
}
async function adminList(_req, res, next) {
  try { res.json({ rows: await listAdminActivities() }); } catch (error) { next(error); }
}
async function create(req, res, next) {
  try { res.status(201).json({ row: await createActivity(req.body || {}, req.auth.userId) }); } catch (error) { next(error); }
}
async function update(req, res, next) {
  try { res.json({ row: await updateActivity(id(req.params.activityId), req.body || {}) }); } catch (error) { next(error); }
}
async function uploadSignature(_req, res, next) {
  try { res.json({ data: activityImageSignature() }); } catch (error) { next(error); }
}

module.exports = { publicList, adminList, create, update, uploadSignature };
