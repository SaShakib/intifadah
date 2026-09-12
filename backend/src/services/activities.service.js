const crypto = require('node:crypto');
const { env } = require('../config/env');
const { repositories } = require('../repositories');

const { activitiesRepository } = repositories;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function cleanText(value, field, limit) {
  const text = String(value || '').trim();
  if (!text) throw badRequest(`${field} is required`);
  if (text.length > limit) throw badRequest(`${field} must be ${limit} characters or fewer`);
  return text;
}

function cleanOptionalText(value, field, limit) {
  const text = String(value || '').trim();
  if (text.length > limit) throw badRequest(`${field} must be ${limit} characters or fewer`);
  return text || null;
}

function normalizeActivity(input) {
  const imageUrl = cleanOptionalText(input.imageUrl, 'imageUrl', 500);
  if (imageUrl && !/^https:\/\//i.test(imageUrl)) throw badRequest('imageUrl must be an HTTPS URL');
  return {
    title: cleanText(input.title, 'title', 180),
    description: cleanText(input.description, 'description', 5000),
    imageUrl,
    imagePublicId: cleanOptionalText(input.imagePublicId, 'imagePublicId', 255),
    isPublished: input.isPublished !== false,
  };
}

function activityImageSignature() {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    const error = new Error('Cloudinary is not configured');
    error.statusCode = 503;
    throw error;
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { eager: 'c_limit,w_1600,f_webp,q_auto:good', folder: 'intifadah/activities', timestamp };
  const toSign = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('&');
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    apiKey: env.cloudinaryApiKey,
    signature: crypto.createHash('sha1').update(`${toSign}${env.cloudinaryApiSecret}`).digest('hex'),
    ...params,
  };
}

async function listPublicActivities() { return activitiesRepository.listActivities({ publicOnly: true }); }
async function listAdminActivities() { return activitiesRepository.listActivities(); }
async function createActivity(input, userId) { return activitiesRepository.createActivity({ ...normalizeActivity(input), createdByUserId: userId }); }
async function updateActivity(activityId, input) { return activitiesRepository.updateActivity(activityId, normalizeActivity(input)); }

module.exports = { activityImageSignature, listPublicActivities, listAdminActivities, createActivity, updateActivity };
