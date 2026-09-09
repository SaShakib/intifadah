const crypto = require('node:crypto');
const { repositories } = require('../repositories');
const { env } = require('../config/env');

const { booksRepository, notificationsRepository } = repositories;
const REQUEST_DAYS = new Set([3, 7, 10, 15, 30]);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function cleanText(value, field, max = 240, required = true) {
  const text = String(value || '').trim();
  if (required && !text) throw badRequest(`${field} is required`);
  if (text.length > max) throw badRequest(`${field} is too long`);
  return text || null;
}

function parsePositive(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw badRequest(`${field} must be a positive number`);
  return number;
}

function normalizeBookKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase('bn-BD')
    .replace(/[\s.,:;!?'"()[\]{}\\/|+*=~`@#$%^&…।-]+/g, '');
}

async function requireActivation(userId) {
  const profile = await booksRepository.getActivationProfile(userId);
  if (!profile) {
    const error = new Error('Activate Books first by completing the profile');
    error.statusCode = 403;
    throw error;
  }
  return profile;
}

async function activateBooks(userId, input) {
  const occupationType = cleanText(input.occupationType, 'occupationType', 16);
  if (!['student', 'working', 'business'].includes(occupationType)) throw badRequest('occupationType is invalid');
  const wardNo = Number(input.wardNo);
  if (!Number.isInteger(wardNo) || wardNo < 0 || wardNo > 999) throw badRequest('wardNo must be a valid number');
  const profile = await booksRepository.upsertActivationProfile({
    userId,
    village: cleanText(input.village, 'village', 120),
    wardNo,
    fatherName: cleanText(input.fatherName, 'fatherName', 120),
    occupationType,
    institutionName: occupationType === 'student' ? cleanText(input.institutionName, 'institutionName', 180) : null,
    educationLevel: occupationType === 'student' ? cleanText(input.educationLevel, 'educationLevel', 40) : null,
    educationDetail: occupationType === 'student' ? cleanText(input.educationDetail, 'educationDetail', 80, false) : null,
    professionDetail: occupationType !== 'student' ? cleanText(input.professionDetail, 'professionDetail', 180) : null,
  });
  return profile;
}

async function createBookCategory(userId, input) {
  await requireActivation(userId);
  return booksRepository.createCategory({ categoryName: cleanText(input.categoryName, 'categoryName', 100), userId });
}

async function addBook(userId, input) {
  await requireActivation(userId);
  const book = await booksRepository.createBook({ ownerUserId: userId, ...bookInput(input) });
  await notificationsRepository.createForRoleKeys({
    roleKeys: ['super_admin', 'admin'],
    notifType: 30,
    payloadJson: { event: 'book_added', bookId: book.id, title: book.title, url: `/books/${book.id}` },
    excludeUserId: userId,
  });
  return book;
}

function bookInput(input) {
  const categoryId = input.categoryId ? parsePositive(input.categoryId, 'categoryId') : null;
  const searchAliases = cleanText(input.searchAliases, 'searchAliases', 600, false);
  return {
    categoryId,
    title: cleanText(input.title, 'title', 240),
    authorName: cleanText(input.authorName, 'authorName', 180, false),
    bookPriceMinor: parsePositive(input.bookPriceMinor, 'bookPriceMinor'),
    coverUrl: optimizedCoverUrl(cleanText(input.coverUrl, 'coverUrl', 600, false)),
    coverPublicId: cleanText(input.coverPublicId, 'coverPublicId', 255, false),
    externalSource: cleanText(input.externalSource, 'externalSource', 32, false),
    externalVolumeId: cleanText(input.externalVolumeId, 'externalVolumeId', 120, false),
    description: cleanText(input.description, 'description', 3000, false),
    canonicalKey: normalizeBookKey(input.title),
    searchText: [input.title, input.authorName, searchAliases].filter(Boolean).join(' ').trim(),
  };
}

async function updateBook(userId, bookId, input) {
  await requireActivation(userId);
  const book = await booksRepository.updateBook({ bookId, ownerUserId: userId, ...bookInput(input) });
  if (!book) {
    const error = new Error('Only the book owner can edit this book');
    error.statusCode = 403;
    throw error;
  }
  return book;
}

async function requestBook(userId, bookId, input) {
  await requireActivation(userId);
  const requestedDays = parsePositive(input.requestedDays, 'requestedDays');
  if (!REQUEST_DAYS.has(requestedDays)) throw badRequest('requestedDays must be 3, 7, 10, 15, or 30');
  const result = await booksRepository.createRequest({
    bookId,
    requesterUserId: userId,
    requestedDays,
    requestGroupId: crypto.randomUUID(),
  });
  if (!result) throw badRequest('No available copy of this book was found');
  await Promise.all(result.ownerUserIds.map((ownerUserId) => notificationsRepository.createForUser({
    userId: ownerUserId,
    notifType: 30,
    payloadJson: { event: 'book_request_created', requestId: result.request.id, bookId, url: '/books' },
  })));
  return { ...result.request, copiesNotified: result.copyCount };
}

async function ownerUpdateRequest(userId, requestId, input) {
  const action = cleanText(input.action, 'action', 16);
  if (!['accept', 'reject', 'given', 'return_received'].includes(action)) throw badRequest('action is invalid');
  const result = await booksRepository.updateRequestByOwner({
    requestId, ownerUserId: userId, action, ownerNote: cleanText(input.ownerNote, 'ownerNote', 500, false),
  });
  if (!result) {
    const error = new Error('Book request not found or unavailable for this action');
    error.statusCode = 404;
    throw error;
  }
  await notificationsRepository.createForUser({
    userId: result.requesterUserId,
    notifType: 31,
    payloadJson: { event: `book_request_${action}`, requestId, bookId: result.request.book_id, url: '/books' },
  });
  return result.request;
}

async function receiverConfirmRequest(userId, requestId, input) {
  const action = cleanText(input.action, 'action', 16);
  if (!['received', 'returned'].includes(action)) throw badRequest('action is invalid');
  const result = await booksRepository.confirmReceived({ requestId, requesterUserId: userId, action });
  if (!result) {
    const error = new Error('Book handover confirmation is not available');
    error.statusCode = 404;
    throw error;
  }
  await notificationsRepository.createForUser({
    userId: result.owner_user_id,
    notifType: 31,
    payloadJson: { event: action === 'received' ? 'book_received_confirmed' : 'book_returned_by_borrower', requestId, bookId: result.book_id, url: '/books' },
  });
  return result;
}

async function requestExtension(userId, requestId, input) {
  await requireActivation(userId);
  const requestedDays = parsePositive(input.requestedDays, 'requestedDays');
  if (!REQUEST_DAYS.has(requestedDays)) throw badRequest('requestedDays must be 3, 7, 10, 15, or 30');
  const extension = await booksRepository.createExtension({ requestId, requesterUserId: userId, requestedDays });
  if (!extension) {
    const error = new Error('An extension can only be requested after handover');
    error.statusCode = 400;
    throw error;
  }
  if (extension.ownerUserId) {
    await notificationsRepository.createForUser({ userId: extension.ownerUserId, notifType: 30, payloadJson: { event: 'book_extension_requested', requestId, extensionId: extension.id, url: '/books' } });
  }
  return extension;
}

async function ownerResolveExtension(userId, extensionId, input) {
  const result = await booksRepository.resolveExtension({ extensionId, ownerUserId: userId, accepted: input.accepted === true, ownerNote: cleanText(input.ownerNote, 'ownerNote', 500, false) });
  if (!result) {
    const error = new Error('Extension request not found or already resolved');
    error.statusCode = 404;
    throw error;
  }
  await notificationsRepository.createForUser({ userId: result.requesterUserId, notifType: 31, payloadJson: { event: input.accepted === true ? 'book_extension_accepted' : 'book_extension_rejected', requestId: result.requestId, url: '/books' } });
  return result;
}

function cloudinarySignature() {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    const error = new Error('Cloudinary is not configured');
    error.statusCode = 503;
    throw error;
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    eager: 'c_limit,w_1600,f_webp,q_auto:good',
    folder: 'intifadah/books/covers',
    timestamp,
  };
  const toSign = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('&');
  const signature = crypto.createHash('sha1').update(`${toSign}${env.cloudinaryApiSecret}`).digest('hex');
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    apiKey: env.cloudinaryApiKey,
    signature,
    ...params,
  };
}

function optimizedCoverUrl(url, width = 640) {
  if (!url || !url.includes('/upload/')) return url || null;
  return url.replace('/upload/', `/upload/f_auto,q_auto:good,c_limit,w_${width}/`);
}

module.exports = {
  requireActivation, activateBooks, createBookCategory, addBook, updateBook, requestBook,
  ownerUpdateRequest, receiverConfirmRequest, cloudinarySignature, optimizedCoverUrl,
  requestExtension, ownerResolveExtension,
};
