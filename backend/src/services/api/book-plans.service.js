const { repositories } = require('../../repositories');
const { env } = require('../../config/env');
const { sanitizeHtml } = require('../../utils/sanitizeHtml');

const { bookPlansRepository, booksRepository } = repositories;

const MAX_NOTE_LENGTH = 20000;
const MAX_PAGES = 100000;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFound(message = 'Book plan not found') {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function dateTextInTimezone(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.quranCronTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function parsePositiveInt(value, fieldName, maxValue) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > maxValue) {
    throw badRequest(`${fieldName} must be a positive integer up to ${maxValue}`);
  }
  return parsed;
}

function parseNonNegativeInt(value, fieldName, maxValue) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > maxValue) {
    throw badRequest(`${fieldName} must be a non-negative integer up to ${maxValue}`);
  }
  return parsed;
}

function parseStatus(value) {
  const parsed = Number(value);
  if (parsed !== 0 && parsed !== 1) {
    throw badRequest('status must be 0 (active) or 1 (completed)');
  }
  return parsed;
}

function parseOptionalBookId(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > Number.MAX_SAFE_INTEGER) {
    throw badRequest('bookId must be a positive integer');
  }
  return parsed;
}

function parseCustomBook(value) {
  const title = String(value.bookTitle ?? '').trim();
  if (!title) {
    throw badRequest('bookTitle is required when no store book is selected');
  }
  let authorName = null;
  if (value.bookAuthor !== undefined && value.bookAuthor !== null) {
    authorName = String(value.bookAuthor).trim() || null;
  }
  return {
    bookId: null,
    bookTitle: title.slice(0, 240),
    bookAuthor: authorName ? authorName.slice(0, 180) : null,
    bookCoverUrl: null,
  };
}

function parseOptionalNote(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value);
  const trimmed = text.length > MAX_NOTE_LENGTH ? text.slice(0, MAX_NOTE_LENGTH) : text;
  return sanitizeHtml(trimmed) || null;
}

async function requireBook(bookId) {
  const book = await booksRepository.getBookById(bookId);
  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }
  return book;
}

async function createPlan(userId, input) {
  const bookId = parseOptionalBookId(input.bookId);

  let bookTitle;
  let bookAuthor;
  let bookCoverUrl;
  if (bookId) {
    const book = await requireBook(bookId);
    bookTitle = String(book.title || '').slice(0, 240);
    bookAuthor = book.author_name ? String(book.author_name).slice(0, 180) : null;
    bookCoverUrl = book.cover_url || null;
  } else {
    const custom = parseCustomBook(input);
    bookTitle = custom.bookTitle;
    bookAuthor = custom.bookAuthor;
    bookCoverUrl = custom.bookCoverUrl;
  }

  return bookPlansRepository.createPlan({
    userId,
    bookId,
    bookTitle,
    bookAuthor,
    bookCoverUrl,
    totalPages: parsePositiveInt(input.totalPages, 'totalPages', MAX_PAGES),
    currentPage: parseNonNegativeInt(input.currentPage, 'currentPage', MAX_PAGES) ?? 0,
    note: parseOptionalNote(input.note),
  });
}

async function updatePlan(userId, planId, input) {
  if (typeof input !== 'object' || input === null) {
    input = {};
  }

  const patch = {};
  const bookId = parseOptionalBookId(input.bookId);
  if (bookId) {
    const book = await requireBook(bookId);
    patch.book_id = book.id;
    patch.book_title = String(book.title || '').slice(0, 240);
    patch.book_author = book.author_name ? String(book.author_name).slice(0, 180) : null;
    patch.book_cover_url = book.cover_url || null;
  } else if (input.bookTitle !== undefined) {
    const custom = parseCustomBook(input);
    patch.book_id = custom.bookId;
    patch.book_title = custom.bookTitle;
    patch.book_author = custom.bookAuthor;
    patch.book_cover_url = null;
  }
  if ('totalPages' in input) {
    patch.total_pages = parsePositiveInt(input.totalPages, 'totalPages', MAX_PAGES);
  }
  if ('currentPage' in input) {
    patch.current_page = parseNonNegativeInt(input.currentPage, 'currentPage', MAX_PAGES) ?? 0;
  }
  if ('note' in input) {
    patch.note = parseOptionalNote(input.note);
  }
  if ('status' in input) {
    patch.status = parseStatus(input.status);
    patch.completed_on = patch.status === 1 ? dateTextInTimezone() : null;
  }

  if (!Object.keys(patch).length) {
    return getPlan(userId, planId);
  }

  const row = await bookPlansRepository.updatePlan({ userId, planId, patch });
  if (!row) {
    throw notFound();
  }
  return getPlan(userId, planId);
}

async function listPlans(userId) {
  return bookPlansRepository.listPlans({ userId });
}

async function getPlan(userId, planId) {
  const row = await bookPlansRepository.getPlan({ userId, planId });
  if (!row) {
    throw notFound();
  }
  return row;
}

async function deletePlan(userId, planId) {
  const removed = await bookPlansRepository.deletePlan({ userId, planId });
  if (!removed) {
    throw notFound();
  }
  return { removed: true };
}

module.exports = {
  createPlan,
  updatePlan,
  listPlans,
  getPlan,
  deletePlan,
};