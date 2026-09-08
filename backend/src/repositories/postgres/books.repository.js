const { query, withTransaction } = require('../../db/pool');

const BOOK_COLUMNS = `
  b.id, b.owner_user_id, b.category_id, b.title, b.author_name, b.book_price_minor,
  b.cover_url, b.cover_public_id, b.external_source, b.external_volume_id, b.status,
  b.description, b.created_at, b.updated_at, o.full_name AS owner_name,
  c.category_name`;

async function listCategories() {
  const res = await query('SELECT id, category_name, created_at FROM book_categories ORDER BY category_name ASC');
  return res.rows;
}

async function createCategory({ categoryName, userId }) {
  const res = await query(
    `INSERT INTO book_categories (category_name, created_by_user_id)
     VALUES ($1,$2)
     ON CONFLICT (category_name) DO UPDATE SET category_name = EXCLUDED.category_name
     RETURNING id, category_name, created_at`,
    [categoryName, userId],
  );
  return res.rows[0];
}

async function listBooks({ search, categoryId, ownerUserId, status = 0, limit = 40, offset = 0 } = {}) {
  const values = [];
  const where = [];
  if (status !== null) {
    values.push(Number(status));
    where.push(`b.status = $${values.length}`);
  }
  if (categoryId) {
    values.push(Number(categoryId));
    where.push(`b.category_id = $${values.length}`);
  }
  if (ownerUserId) {
    values.push(Number(ownerUserId));
    where.push(`b.owner_user_id = $${values.length}`);
  }
  if (search) {
    values.push(`%${String(search).trim()}%`);
    where.push(`(b.title ILIKE $${values.length} OR b.author_name ILIKE $${values.length})`);
  }
  values.push(Math.min(Number(limit) || 40, 100), Math.max(Number(offset) || 0, 0));
  const res = await query(
    `SELECT ${BOOK_COLUMNS}
     FROM books b
     JOIN app_users o ON o.id = b.owner_user_id
     LEFT JOIN book_categories c ON c.id = b.category_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY b.created_at DESC, b.id DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return res.rows;
}

async function getBookById(bookId) {
  const res = await query(
    `SELECT ${BOOK_COLUMNS}
     FROM books b
     JOIN app_users o ON o.id = b.owner_user_id
     LEFT JOIN book_categories c ON c.id = b.category_id
     WHERE b.id = $1`,
    [bookId],
  );
  return res.rows[0] || null;
}

async function createBook(input) {
  const res = await query(
    `INSERT INTO books (
      owner_user_id, category_id, title, author_name, book_price_minor, cover_url,
      cover_public_id, external_source, external_volume_id, description
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING id`,
    [input.ownerUserId, input.categoryId || null, input.title, input.authorName || null, input.bookPriceMinor,
      input.coverUrl || null, input.coverPublicId || null, input.externalSource || null, input.externalVolumeId || null, input.description || null],
  );
  return getBookById(res.rows[0].id);
}

async function getActivationProfile(userId) {
  const res = await query('SELECT * FROM book_activation_profiles WHERE user_id = $1', [userId]);
  return res.rows[0] || null;
}

async function upsertActivationProfile(input) {
  const res = await query(
    `INSERT INTO book_activation_profiles (
      user_id, village, ward_no, father_name, occupation_type, institution_name,
      education_level, education_detail, profession_detail
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (user_id) DO UPDATE SET
      village = EXCLUDED.village, ward_no = EXCLUDED.ward_no, father_name = EXCLUDED.father_name,
      occupation_type = EXCLUDED.occupation_type, institution_name = EXCLUDED.institution_name,
      education_level = EXCLUDED.education_level, education_detail = EXCLUDED.education_detail,
      profession_detail = EXCLUDED.profession_detail, updated_at = NOW()
    RETURNING *`,
    [input.userId, input.village, input.wardNo, input.fatherName, input.occupationType,
      input.institutionName || null, input.educationLevel || null, input.educationDetail || null, input.professionDetail || null],
  );
  return res.rows[0];
}

async function createRequest({ bookId, requesterUserId, requestedDays }) {
  return withTransaction(async (client) => {
    const book = await client.query('SELECT id, owner_user_id, status FROM books WHERE id = $1 FOR UPDATE', [bookId]);
    if (!book.rowCount || Number(book.rows[0].status) !== 0) return null;
    if (Number(book.rows[0].owner_user_id) === Number(requesterUserId)) {
      const error = new Error('You cannot request your own book');
      error.statusCode = 400;
      throw error;
    }
    const res = await client.query(
      `INSERT INTO book_requests (book_id, requester_user_id, requested_days)
       VALUES ($1,$2,$3) RETURNING *`,
      [bookId, requesterUserId, requestedDays],
    );
    await client.query('UPDATE books SET status = 1, updated_at = NOW() WHERE id = $1', [bookId]);
    return { request: res.rows[0], ownerUserId: book.rows[0].owner_user_id };
  });
}

async function listRequestsForUser(userId) {
  const res = await query(
    `SELECT br.*, b.title, b.cover_url, b.book_price_minor, b.owner_user_id, ex.extensions,
       owner.full_name AS owner_name, requester.full_name AS requester_name
     FROM book_requests br
     JOIN books b ON b.id = br.book_id
     JOIN app_users owner ON owner.id = b.owner_user_id
     JOIN app_users requester ON requester.id = br.requester_user_id
     LEFT JOIN LATERAL (
       SELECT COALESCE(jsonb_agg(jsonb_build_object('id', bre.id, 'requestedDays', bre.requested_days, 'status', bre.status) ORDER BY bre.requested_at DESC), '[]'::jsonb) AS extensions
       FROM book_request_extensions bre WHERE bre.request_id = br.id
     ) ex ON TRUE
     WHERE b.owner_user_id = $1 OR br.requester_user_id = $1
     ORDER BY br.updated_at DESC`,
    [userId],
  );
  return res.rows;
}

async function updateRequestByOwner({ requestId, ownerUserId, action, ownerNote }) {
  return withTransaction(async (client) => {
    const result = await client.query(
      `SELECT br.*, b.owner_user_id, b.id AS book_id
       FROM book_requests br JOIN books b ON b.id = br.book_id
       WHERE br.id = $1 FOR UPDATE`, [requestId],
    );
    const request = result.rows[0];
    if (!request || Number(request.owner_user_id) !== Number(ownerUserId)) return null;
    const nextStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : action === 'given' ? 3 : action === 'returned' ? 5 : null;
    if (nextStatus === null) return null;
    const dueOnSql = action === 'given' ? `CURRENT_DATE + br.requested_days` : 'br.due_on';
    const updated = await client.query(
      `UPDATE book_requests br SET status = $2, owner_note = COALESCE($3, owner_note),
       accepted_at = CASE WHEN $4 = 'accept' THEN NOW() ELSE accepted_at END,
       given_at = CASE WHEN $4 = 'given' THEN NOW() ELSE given_at END,
       returned_at = CASE WHEN $4 = 'returned' THEN NOW() ELSE returned_at END,
       due_on = ${dueOnSql}, updated_at = NOW()
       WHERE br.id = $1 RETURNING *`,
      [requestId, nextStatus, ownerNote || null, action],
    );
    const bookStatus = action === 'accept' ? 1 : action === 'given' ? 2 : ['reject', 'returned'].includes(action) ? 0 : null;
    if (bookStatus !== null) await client.query('UPDATE books SET status = $2, updated_at = NOW() WHERE id = $1', [request.book_id, bookStatus]);
    return { request: updated.rows[0], requesterUserId: request.requester_user_id };
  });
}

async function confirmReceived({ requestId, requesterUserId, received }) {
  const res = await query(
    `UPDATE book_requests br SET status = $3, received_at = CASE WHEN $3 = 4 THEN NOW() ELSE received_at END, updated_at = NOW()
     FROM books b
     WHERE br.id = $1 AND br.book_id = b.id AND br.requester_user_id = $2 AND br.status = 3
     RETURNING br.*, b.owner_user_id`,
    [requestId, requesterUserId, received ? 4 : 3],
  );
  return res.rows[0] || null;
}

async function createExtension({ requestId, requesterUserId, requestedDays }) {
  const res = await query(
    `INSERT INTO book_request_extensions (request_id, requested_days)
     SELECT br.id, $3 FROM book_requests br
     WHERE br.id = $1 AND br.requester_user_id = $2 AND br.status IN (3, 4)
     RETURNING *`,
    [requestId, requesterUserId, requestedDays],
  );
  if (!res.rows[0]) return null;
  const owner = await query(
    `SELECT b.owner_user_id FROM book_requests br JOIN books b ON b.id = br.book_id WHERE br.id = $1`,
    [requestId],
  );
  return { ...res.rows[0], ownerUserId: owner.rows[0]?.owner_user_id };
}

async function resolveExtension({ extensionId, ownerUserId, accepted, ownerNote }) {
  return withTransaction(async (client) => {
    const extensionResult = await client.query(
      `SELECT bre.*, br.book_id, br.requester_user_id, b.owner_user_id
       FROM book_request_extensions bre
       JOIN book_requests br ON br.id = bre.request_id
       JOIN books b ON b.id = br.book_id
       WHERE bre.id = $1 FOR UPDATE`, [extensionId],
    );
    const extension = extensionResult.rows[0];
    if (!extension || Number(extension.owner_user_id) !== Number(ownerUserId) || Number(extension.status) !== 0) return null;
    await client.query(
      `UPDATE book_request_extensions SET status = $2, owner_note = $3, resolved_at = NOW() WHERE id = $1`,
      [extensionId, accepted ? 1 : 2, ownerNote || null],
    );
    if (accepted) {
      await client.query(
        `UPDATE book_requests SET due_on = COALESCE(due_on, CURRENT_DATE) + $2, updated_at = NOW() WHERE id = $1`,
        [extension.request_id, extension.requested_days],
      );
    }
    return { requesterUserId: extension.requester_user_id, requestId: extension.request_id };
  });
}

module.exports = {
  listCategories, createCategory, listBooks, getBookById, createBook,
  getActivationProfile, upsertActivationProfile, createRequest, listRequestsForUser,
  updateRequestByOwner, confirmReceived,
  createExtension, resolveExtension,
};
