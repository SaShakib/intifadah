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
  const categoryId = input.categoryId ? parsePositive(input.categoryId, 'categoryId') : null;
  const book = await booksRepository.createBook({
    ownerUserId: userId,
    categoryId,
    title: cleanText(input.title, 'title', 240),
    authorName: cleanText(input.authorName, 'authorName', 180, false),
    bookPriceMinor: parsePositive(input.bookPriceMinor, 'bookPriceMinor'),
    coverUrl: optimizedCoverUrl(cleanText(input.coverUrl, 'coverUrl', 600, false)),
    coverPublicId: cleanText(input.coverPublicId, 'coverPublicId', 255, false),
    externalSource: cleanText(input.externalSource, 'externalSource', 32, false),
    externalVolumeId: cleanText(input.externalVolumeId, 'externalVolumeId', 120, false),
    description: cleanText(input.description, 'description', 3000, false),
  });
  await notificationsRepository.createForRoleKeys({
    roleKeys: ['super_admin', 'admin'],
    notifType: 30,
    payloadJson: { event: 'book_added', bookId: book.id, title: book.title, url: `/books/${book.id}` },
    excludeUserId: userId,
  });
  return book;
}

async function requestBook(userId, bookId, input) {
  await requireActivation(userId);
  const requestedDays = parsePositive(input.requestedDays, 'requestedDays');
  if (!REQUEST_DAYS.has(requestedDays)) throw badRequest('requestedDays must be 3, 7, 10, 15, or 30');
  const result = await booksRepository.createRequest({ bookId, requesterUserId: userId, requestedDays });
  if (!result) throw badRequest('This book is not currently available');
  await notificationsRepository.createForUser({
    userId: result.ownerUserId,
    notifType: 30,
    payloadJson: { event: 'book_request_created', requestId: result.request.id, bookId, url: '/books' },
  });
  return result.request;
}

async function ownerUpdateRequest(userId, requestId, input) {
  const action = cleanText(input.action, 'action', 16);
  if (!['accept', 'reject', 'given', 'returned'].includes(action)) throw badRequest('action is invalid');
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
  const result = await booksRepository.confirmReceived({ requestId, requesterUserId: userId, received: input.received === true });
  if (!result) {
    const error = new Error('Book handover confirmation is not available');
    error.statusCode = 404;
    throw error;
  }
  await notificationsRepository.createForUser({
    userId: result.owner_user_id,
    notifType: 31,
    payloadJson: { event: input.received ? 'book_received_confirmed' : 'book_received_disputed', requestId, bookId: result.book_id, url: '/books' },
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

async function searchBookMetadata(queryText) {
  const query = cleanText(queryText, 'q', 180);
  const openLibrary = fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`)
    .then((response) => response.ok ? response.json() : { docs: [] })
    .then((data) => (data.docs || []).map((item) => ({
      source: 'open_library', id: String(item.key || ''), title: item.title, authorName: item.author_name?.[0] || '',
      coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : null,
    })));
  const googleUrl = new URL('https://www.googleapis.com/books/v1/volumes');
  googleUrl.searchParams.set('q', query);
  googleUrl.searchParams.set('maxResults', '8');
  if (env.googleBooksApiKey) googleUrl.searchParams.set('key', env.googleBooksApiKey);
  const googleBooks = fetch(googleUrl)
    .then((response) => response.ok ? response.json() : { items: [] })
    .then((data) => (data.items || []).map((item) => ({
      source: 'google_books', id: item.id, title: item.volumeInfo?.title || '', authorName: item.volumeInfo?.authors?.[0] || '',
      coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    }))).catch(() => []);
  const [openLibraryResults, googleResults] = await Promise.all([openLibrary, googleBooks]);
  return [...googleResults, ...openLibraryResults].filter((item) => item.title);
}

module.exports = {
  requireActivation, activateBooks, createBookCategory, addBook, requestBook,
  ownerUpdateRequest, receiverConfirmRequest, cloudinarySignature, optimizedCoverUrl, searchBookMetadata,
  requestExtension, ownerResolveExtension,
};
