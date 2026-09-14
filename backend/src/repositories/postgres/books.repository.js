const { query, withTransaction } = require('../../db/pool');

const BOOK_COLUMNS = `
  b.id, b.owner_user_id, b.category_id, b.title, b.author_name, b.book_price_minor,
  b.cover_url, b.cover_public_id, b.external_source, b.external_volume_id, b.status,
  b.approval_status, b.description, b.canonical_key, b.title_script, b.created_at, b.updated_at, o.full_name AS owner_name,
  c.category_name`;

const BOOK_AVAILABILITY_COLUMNS = `
  COALESCE(availability.total_copy_count, 0)::int AS total_copy_count,
  COALESCE(availability.available_copy_count, 0)::int AS available_copy_count,
  availability.estimated_available_on`;

const BOOK_AVAILABILITY_JOIN = `
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)::int AS total_copy_count,
      COUNT(*) FILTER (WHERE grouped.status = 0)::int AS available_copy_count,
      MIN(active_request.due_on) FILTER (WHERE grouped.status = 2 AND active_request.status IN (3, 4, 5)) AS estimated_available_on
    FROM books grouped
    LEFT JOIN book_requests active_request
      ON active_request.book_id = grouped.id
      AND active_request.status IN (3, 4, 5)
    WHERE grouped.canonical_key = b.canonical_key
      AND grouped.deleted_at IS NULL
  ) availability ON TRUE`;

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

async function listBooks({ search, categoryId, ownerUserId, status = null, limit = 40, offset = 0, includeTotal = false } = {}) {
  const values = [];
  const where = ['b.deleted_at IS NULL'];
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
    values.push(String(search).trim());
    where.push(`(
      to_tsvector('simple', b.search_text) @@ websearch_to_tsquery('simple', $${values.length})
      OR b.search_text % $${values.length}
      OR b.title ILIKE '%' || $${values.length} || '%'
      OR b.author_name ILIKE '%' || $${values.length} || '%'
    )`);
  }
  values.push(Math.min(Number(limit) || 40, 100), Math.max(Number(offset) || 0, 0));
  const res = await query(
    `SELECT DISTINCT ON (b.canonical_key, b.title_script) ${BOOK_COLUMNS}, ${BOOK_AVAILABILITY_COLUMNS}
     FROM books b
     JOIN app_users o ON o.id = b.owner_user_id
     LEFT JOIN book_categories c ON c.id = b.category_id
     ${BOOK_AVAILABILITY_JOIN}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY b.title_script, b.canonical_key COLLATE "C", CASE WHEN b.status = 0 THEN 0 ELSE 1 END, b.created_at DESC, b.id DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  if (!includeTotal) {
    return res.rows;
  }

  const countRes = await query(
    `SELECT COUNT(DISTINCT b.canonical_key)::int AS total
     FROM books b
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`,
    values.slice(0, -2),
  );
  return { rows: res.rows, total: countRes.rows[0]?.total ?? 0 };
}

async function getBookById(bookId) {
  const res = await query(
    `SELECT ${BOOK_COLUMNS}, ${BOOK_AVAILABILITY_COLUMNS}
     FROM books b
     JOIN app_users o ON o.id = b.owner_user_id
     LEFT JOIN book_categories c ON c.id = b.category_id
     ${BOOK_AVAILABILITY_JOIN}
    WHERE b.id = $1 AND b.deleted_at IS NULL`,
    [bookId],
  );
  return res.rows[0] || null;
}

async function createBook(input) {
  const res = await query(
    `INSERT INTO books (
      owner_user_id, category_id, title, author_name, canonical_key, search_text, book_price_minor, cover_url,
      cover_public_id, external_source, external_volume_id, description, approval_status
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,1)
    RETURNING id`,
    [input.ownerUserId, input.categoryId || null, input.title, input.authorName || null, input.canonicalKey, input.searchText, input.bookPriceMinor,
      input.coverUrl || null, input.coverPublicId || null, input.externalSource || null, input.externalVolumeId || null, input.description || null],
  );
  return getBookById(res.rows[0].id);
}

async function updateBook(input) {
  const res = await query(
    `UPDATE books SET
      category_id = $3, title = $4, author_name = $5, canonical_key = $6, search_text = $7,
      book_price_minor = $8, cover_url = $9, cover_public_id = $10, external_source = $11,
      external_volume_id = $12, description = $13, updated_at = NOW()
     WHERE id = $1 AND owner_user_id = $2 AND deleted_at IS NULL
     RETURNING id`,
    [input.bookId, input.ownerUserId, input.categoryId || null, input.title, input.authorName || null,
      input.canonicalKey, input.searchText, input.bookPriceMinor, input.coverUrl || null,
      input.coverPublicId || null, input.externalSource || null, input.externalVolumeId || null, input.description || null],
  );
  if (!res.rowCount) return null;
  return getBookById(res.rows[0].id);
}

async function archiveBook({ bookId, actorUserId, canDeleteAnyBook }) {
  return withTransaction(async (client) => {
    const found = await client.query(
      `SELECT id, owner_user_id FROM books
       WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [bookId],
    );
    const book = found.rows[0];
    if (!book) return { outcome: 'not_found' };
    if (Number(book.owner_user_id) !== Number(actorUserId) && !canDeleteAnyBook) return { outcome: 'forbidden' };

    const activeRequest = await client.query(
      `SELECT 1 FROM book_requests
       WHERE book_id = $1 AND status IN (0, 1, 3, 4, 5)
       LIMIT 1`,
      [bookId],
    );
    if (activeRequest.rowCount) return { outcome: 'active_request' };

    await client.query(
      `UPDATE books
       SET deleted_at = NOW(), deleted_by_user_id = $2, updated_at = NOW()
       WHERE id = $1`,
      [bookId, actorUserId],
    );
    return { outcome: 'deleted', ownerUserId: Number(book.owner_user_id) };
  });
}

async function setBookAvailability({ bookId, ownerUserId, held }) {
  const res = await query(
    `UPDATE books
     SET status = $3, updated_at = NOW()
     WHERE id = $1
       AND owner_user_id = $2
       AND deleted_at IS NULL
       AND status = $4
     RETURNING id`,
    [bookId, ownerUserId, held ? 3 : 0, held ? 0 : 3],
  );
  return res.rowCount > 0;
}

async function getActivationProfile(userId) {
  const res = await query('SELECT * FROM book_activation_profiles WHERE user_id = $1', [userId]);
  return res.rows[0] || null;
}

async function upsertActivationProfile(input) {
  const res = await query(
    `INSERT INTO book_activation_profiles (
      user_id, village, ward_no, father_name, occupation_type, institution_name,
      education_level, education_detail, profession_detail, approval_status
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1)
    ON CONFLICT (user_id) DO UPDATE SET
      village = EXCLUDED.village, ward_no = EXCLUDED.ward_no, father_name = EXCLUDED.father_name,
      occupation_type = EXCLUDED.occupation_type, institution_name = EXCLUDED.institution_name,
      education_level = EXCLUDED.education_level, education_detail = EXCLUDED.education_detail,
      profession_detail = EXCLUDED.profession_detail, approval_status = 1, updated_at = NOW()
    RETURNING *`,
    [input.userId, input.village, input.wardNo, input.fatherName, input.occupationType,
      input.institutionName || null, input.educationLevel || null, input.educationDetail || null, input.professionDetail || null],
  );
  return res.rows[0];
}

async function createRequest({ bookId, requesterUserId, requestedDays, requestGroupId }) {
  return withTransaction(async (client) => {
    const source = await client.query(
      `SELECT b.id, b.canonical_key, b.title, requester.full_name AS requester_name
       FROM books b
       JOIN app_users requester ON requester.id = $2
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [bookId, requesterUserId],
    );
    if (!source.rowCount) return null;
    const candidates = await client.query(
      `SELECT b.id, b.owner_user_id, owner.full_name AS owner_name, owner.email AS owner_email
       FROM books b
       JOIN app_users owner ON owner.id = b.owner_user_id
       WHERE canonical_key = $1
         AND b.status = 0
         AND b.deleted_at IS NULL
         AND b.owner_user_id <> $2
       FOR UPDATE OF b`,
      [source.rows[0].canonical_key, requesterUserId],
    );
    if (!candidates.rowCount) return null;

    const requests = [];
    for (const candidate of candidates.rows) {
      const created = await client.query(
        `INSERT INTO book_requests (book_id, requester_user_id, requested_days, request_group_id)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [candidate.id, requesterUserId, requestedDays, requestGroupId],
      );
      await client.query(
        `INSERT INTO book_request_events (request_id, action, actor_user_id) VALUES ($1, 'requested', $2)`,
        [created.rows[0].id, requesterUserId],
      );
      requests.push(created.rows[0]);
    }

    return {
      request: requests[0],
      bookTitle: source.rows[0].title,
      requesterName: source.rows[0].requester_name,
      ownerRecipients: [...new Map(candidates.rows.map((candidate) => [Number(candidate.owner_user_id), {
        userId: Number(candidate.owner_user_id), fullName: candidate.owner_name, email: candidate.owner_email,
      }])).values()],
      copyCount: candidates.rowCount,
    };
  });
}

async function listRequestsForUser(userId) {
  const res = await query(
    `SELECT br.*, b.title, b.cover_url, b.book_price_minor, b.owner_user_id, ex.extensions,
       owner.full_name AS owner_name, owner.mobile AS owner_mobile, owner.email AS owner_email,
       requester.full_name AS requester_name, requester.mobile AS requester_mobile, requester.email AS requester_email
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
      `SELECT br.*, b.owner_user_id, b.id AS book_id, b.status AS book_status
       FROM book_requests br JOIN books b ON b.id = br.book_id
       WHERE br.id = $1 FOR UPDATE OF br, b`, [requestId],
    );
    const request = result.rows[0];
    if (!request || Number(request.owner_user_id) !== Number(ownerUserId)) return null;
    const expectedStatus = action === 'accept' || action === 'reject' ? 0 : action === 'given' ? 1 : action === 'return_received' ? 5 : null;
    const nextStatus = action === 'accept' ? 1 : action === 'reject' ? 2 : action === 'given' ? 3 : action === 'return_received' ? 6 : null;
    if (expectedStatus === null || Number(request.status) !== expectedStatus) return null;

    if (action === 'accept') {
      const reserved = await client.query('UPDATE books SET status = 1, updated_at = NOW() WHERE id = $1 AND status = 0 RETURNING id', [request.book_id]);
      if (!reserved.rowCount) return null;
      if (request.request_group_id) {
        await client.query(
          `UPDATE book_requests
           SET status = 2, owner_note = COALESCE(owner_note, 'Another copy was accepted'), updated_at = NOW()
           WHERE request_group_id = $1 AND id <> $2 AND status = 0`,
          [request.request_group_id, requestId],
        );
      }
      await client.query(
        `UPDATE book_requests
         SET status = 2, owner_note = COALESCE(owner_note, 'This copy is no longer available'), updated_at = NOW()
         WHERE book_id = $1 AND id <> $2 AND status = 0`,
        [request.book_id, requestId],
      );
    }

    const dueOnSql = action === 'given' ? 'CURRENT_DATE + br.requested_days' : 'br.due_on';
    const updated = await client.query(
      `UPDATE book_requests br SET status = $2, owner_note = COALESCE($3, owner_note),
       accepted_at = CASE WHEN $4 = 'accept' THEN NOW() ELSE accepted_at END,
       given_at = CASE WHEN $4 = 'given' THEN NOW() ELSE given_at END,
       return_received_at = CASE WHEN $4 = 'return_received' THEN NOW() ELSE return_received_at END,
       return_received_by_user_id = CASE WHEN $4 = 'return_received' THEN $5 ELSE return_received_by_user_id END,
       due_on = ${dueOnSql}, updated_at = NOW()
       WHERE br.id = $1 RETURNING *`,
      [requestId, nextStatus, ownerNote || null, action, ownerUserId],
    );
    const bookStatus = action === 'given' ? 2 : action === 'return_received' ? 0 : null;
    if (bookStatus !== null) await client.query('UPDATE books SET status = $2, updated_at = NOW() WHERE id = $1', [request.book_id, bookStatus]);
    await client.query(
      `INSERT INTO book_request_events (request_id, action, actor_user_id, note) VALUES ($1, $2, $3, $4)`,
      [requestId, action, ownerUserId, ownerNote || null],
    );
    return { request: updated.rows[0], requesterUserId: request.requester_user_id };
  });
}

async function confirmReceived({ requestId, requesterUserId, action }) {
  const received = action === 'received';
  const returned = action === 'returned';
  if (!received && !returned) return null;
  return withTransaction(async (client) => {
    const res = await client.query(
      `UPDATE book_requests br SET
         status = $3,
         received_at = CASE WHEN $3 = 4 THEN NOW() ELSE received_at END,
         return_initiated_at = CASE WHEN $3 = 5 THEN NOW() ELSE return_initiated_at END,
         returned_at = CASE WHEN $3 = 5 THEN NOW() ELSE returned_at END,
         updated_at = NOW()
       FROM books b
       WHERE br.id = $1 AND br.book_id = b.id AND br.requester_user_id = $2 AND br.status = $4
       RETURNING br.*, b.owner_user_id`,
      [requestId, requesterUserId, received ? 4 : 5, received ? 3 : 4],
    );
    const row = res.rows[0];
    if (!row) return null;
    await client.query(
      `INSERT INTO book_request_events (request_id, action, actor_user_id) VALUES ($1, $2, $3)`,
      [requestId, received ? 'received' : 'returned', requesterUserId],
    );
    return row;
  });
}

async function createExtension({ requestId, requesterUserId, requestedDays }) {
  const res = await query(
    `INSERT INTO book_request_extensions (request_id, requested_days)
     SELECT br.id, $3 FROM book_requests br
     WHERE br.id = $1 AND br.requester_user_id = $2 AND br.status = 4
     RETURNING *`,
    [requestId, requesterUserId, requestedDays],
  );
  if (!res.rows[0]) return null;
  const owner = await query(
    `SELECT b.owner_user_id FROM book_requests br JOIN books b ON b.id = br.book_id WHERE br.id = $1`,
    [requestId],
  );
  await query(
    `INSERT INTO book_request_events (request_id, action, actor_user_id) VALUES ($1, 'extension_requested', $2)`,
    [requestId, requesterUserId],
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
    await client.query(
      `INSERT INTO book_request_events (request_id, action, actor_user_id, note) VALUES ($1, $2, $3, $4)`,
      [extension.request_id, accepted ? 'extension_accepted' : 'extension_rejected', ownerUserId, ownerNote || null],
    );
    return { requesterUserId: extension.requester_user_id, requestId: extension.request_id };
  });
}

async function listAllBookRequests({ search, status, limit = 20, offset = 0 } = {}) {
  const conditions = [];
  const params = [];
  if (status !== undefined && status !== null && status !== '') {
    params.push(Number(status));
    conditions.push(`br.status = $${params.length}`);
  }
  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(`(b.title ILIKE $${params.length} OR b.author_name ILIKE $${params.length} OR owner.full_name ILIKE $${params.length} OR owner.mobile ILIKE $${params.length} OR requester.full_name ILIKE $${params.length} OR requester.mobile ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const joinAndSelect = `
    FROM book_requests br
    JOIN books b ON b.id = br.book_id
    JOIN app_users owner ON owner.id = b.owner_user_id
    JOIN app_users requester ON requester.id = br.requester_user_id
    LEFT JOIN book_activation_profiles owner_profile ON owner_profile.user_id = owner.id
    LEFT JOIN book_activation_profiles requester_profile ON requester_profile.user_id = requester.id
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', bre.id, 'requestedDays', bre.requested_days, 'status', bre.status) ORDER BY bre.requested_at DESC), '[]'::jsonb) AS extensions
      FROM book_request_extensions bre WHERE bre.request_id = br.id
    ) ex ON TRUE
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('action', e.action, 'note', e.note, 'actorName', actor.full_name, 'at', e.created_at) ORDER BY e.created_at DESC), '[]'::jsonb) AS events
      FROM book_request_events e LEFT JOIN app_users actor ON actor.id = e.actor_user_id WHERE e.request_id = br.id
    ) ev ON TRUE
    ${where}`;

  const totalRes = await query(`SELECT COUNT(*)::int AS total ${joinAndSelect}`, params);
  params.push(limit, offset);
  const res = await query(
    `SELECT br.*, b.title, b.cover_url, b.book_price_minor, b.canonical_key, b.owner_user_id, ex.extensions, ev.events,
       owner.full_name AS owner_name, owner.mobile AS owner_mobile, owner.email AS owner_email,
       owner_profile.village AS owner_village, owner_profile.ward_no AS owner_ward_no,
       requester.full_name AS requester_name, requester.mobile AS requester_mobile, requester.email AS requester_email,
       requester_profile.village AS requester_village, requester_profile.ward_no AS requester_ward_no,
       requester_profile.father_name AS requester_father_name
     ${joinAndSelect}
     ORDER BY br.updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows: res.rows, total: totalRes.rows[0].total };
}

async function adminUpdateRequest({ requestId, actorUserId, status, note }) {
  return withTransaction(async (client) => {
    const result = await client.query(
      `SELECT br.*, b.owner_user_id, b.id AS book_id, b.status AS book_status
       FROM book_requests br JOIN books b ON b.id = br.book_id
       WHERE br.id = $1 FOR UPDATE OF br, b`, [requestId],
    );
    const request = result.rows[0];
    if (!request) return { conflict: true };

    const current = Number(request.status);
    const target = Number(status);
    const allowedTargets = {
      1: [0],             // accept reserved
      2: [0, 1],          // reject
      3: [0, 1],          // given
      4: [3],             // received
      5: [4],             // returned (initiated)
      6: [4, 5],          // return confirmed
      7: [0, 1, 3, 4, 5], // cancelled
    };
    const transitions = allowedTargets[target];
    if (!transitions || !transitions.includes(current)) return { conflict: true };

    if (target === 1) {
      const reserved = await client.query('UPDATE books SET status = 1, updated_at = NOW() WHERE id = $1 AND status = 0 RETURNING id', [request.book_id]);
      if (!reserved.rowCount) return { conflict: true };
      if (request.request_group_id) {
        await client.query(
          `UPDATE book_requests
           SET status = 2, owner_note = COALESCE(owner_note, 'Another copy was accepted'), updated_at = NOW()
           WHERE request_group_id = $1 AND id <> $2 AND status = 0`,
          [request.request_group_id, requestId],
        );
      }
      await client.query(
        `UPDATE book_requests
         SET status = 2, owner_note = COALESCE(owner_note, 'This copy is no longer available'), updated_at = NOW()
         WHERE book_id = $1 AND id <> $2 AND status = 0`,
        [request.book_id, requestId],
      );
    }

    const timestampColumns = { 1: 'accepted_at', 3: 'given_at', 4: 'received_at', 5: 'returned_at', 6: 'return_received_at' };
    const setStatements = ['status = $2', 'owner_note = COALESCE($3, owner_note)', 'updated_at = NOW()'];
    const values = [requestId, target, note || null, actorUserId];
    if (timestampColumns[target]) setStatements.push(`${timestampColumns[target]} = NOW()`);
    if (target === 6) setStatements.push('return_received_by_user_id = $4');

    await client.query(
      `UPDATE book_requests br SET ${setStatements.join(', ')} WHERE br.id = $1`,
      values,
    );

    if (target === 3) {
      await client.query('UPDATE books SET status = 2, updated_at = NOW() WHERE id = $1', [request.book_id]);
    } else if (target === 6) {
      await client.query('UPDATE books SET status = 0, updated_at = NOW() WHERE id = $1', [request.book_id]);
    } else if (target === 7 && current === 1) {
      await client.query('UPDATE books SET status = 0, updated_at = NOW() WHERE id = $1', [request.book_id]);
    }

    const actionLabel = { 1: 'accepted', 2: 'rejected', 3: 'given', 4: 'received', 5: 'returned', 6: 'return_received', 7: 'cancelled' }[target];
    await client.query(
      `INSERT INTO book_request_events (request_id, action, actor_user_id, note) VALUES ($1, $2, $3, $4)`,
      [requestId, actionLabel, actorUserId, note || null],
    );
    return {
      conflict: false,
      bookTitle: request.title,
      requesterUserId: request.requester_user_id,
      ownerUserId: request.owner_user_id,
      status: target,
    };
  });
}

module.exports = {
  listCategories, createCategory, listBooks, getBookById, createBook, updateBook, archiveBook, setBookAvailability,
  getActivationProfile, upsertActivationProfile, createRequest, listRequestsForUser,
  updateRequestByOwner, confirmReceived,
  createExtension, resolveExtension,
  listAllBookRequests, adminUpdateRequest,
};
