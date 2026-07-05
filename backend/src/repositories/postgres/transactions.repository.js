const { withTransaction, query } = require('../../db/pool');
const { TX_STATUS } = require('../../config/domain');

async function listTransactions(filters = {}) {
  const values = [];
  const where = [];

  if (filters.subjectUserId) {
    values.push(Number(filters.subjectUserId));
    where.push(`t.subject_user_id = $${values.length}`);
  }

  if (filters.actorUserId) {
    values.push(Number(filters.actorUserId));
    where.push(`t.actor_user_id = $${values.length}`);
  }

  if (filters.categoryId) {
    values.push(Number(filters.categoryId));
    where.push(`t.category_id = $${values.length}`);
  }

  if (filters.txType) {
    if (Array.isArray(filters.txType)) {
      values.push(filters.txType.map(Number));
      where.push(`t.tx_type = ANY($${values.length}::smallint[])`);
    } else {
      values.push(Number(filters.txType));
      where.push(`t.tx_type = $${values.length}`);
    }
  }

  if (filters.status !== undefined) {
    values.push(Number(filters.status));
    where.push(`t.status = $${values.length}`);
  }

  if (filters.fromDate) {
    values.push(filters.fromDate);
    where.push(`t.occurred_on >= $${values.length}`);
  }

  if (filters.toDate) {
    values.push(filters.toDate);
    where.push(`t.occurred_on <= $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = Math.min(Number(filters.limit || 100), 500);
  const offset = Math.max(Number(filters.offset || 0), 0);

  values.push(limit);
  values.push(offset);

  const res = await query(
    `SELECT
      t.id,
      t.tx_type,
      t.status,
      t.actor_user_id,
      t.subject_user_id,
      t.category_id,
      t.amount_minor,
      t.occurred_on,
      t.approved_by_user_id,
      t.approved_at,
      t.note,
      t.created_at,
      a.full_name AS actor_name,
      s.full_name AS subject_name,
      c.category_name
     FROM transactions t
     JOIN app_users a ON a.id = t.actor_user_id
     JOIN app_users s ON s.id = t.subject_user_id
     LEFT JOIN categories c ON c.id = t.category_id
     ${whereSql}
     ORDER BY t.occurred_on DESC, t.id DESC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  );

  return res.rows;
}

async function getTransactionById(id) {
  const res = await query(
    `SELECT
      t.id,
      t.tx_type,
      t.status,
      t.actor_user_id,
      t.subject_user_id,
      t.category_id,
      t.amount_minor,
      t.occurred_on,
      t.approved_by_user_id,
      t.approved_at,
      t.note,
      t.created_at,
      t.updated_at,
      a.full_name AS actor_name,
      s.full_name AS subject_name,
      c.category_name
     FROM transactions t
     JOIN app_users a ON a.id = t.actor_user_id
     JOIN app_users s ON s.id = t.subject_user_id
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1
     LIMIT 1`,
    [id],
  );

  return res.rows[0] || null;
}

async function createTransaction(input) {
  const status = input.status !== undefined ? Number(input.status) : TX_STATUS.PENDING;

  const res = await query(
    `INSERT INTO transactions (
      tx_type,
      status,
      actor_user_id,
      subject_user_id,
      category_id,
      amount_minor,
      occurred_on,
      source_holder_user_id,
      target_holder_user_id,
      approved_by_user_id,
      approved_at,
      note,
      meta_json
    ) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, CURRENT_DATE),$8,$9,$10,$11,$12,$13)
    RETURNING id`,
    [
      input.txType,
      status,
      input.actorUserId,
      input.subjectUserId,
      input.categoryId || null,
      input.amountMinor,
      input.occurredOn || null,
      input.sourceHolderUserId || null,
      input.targetHolderUserId || null,
      input.approvedByUserId || null,
      input.approvedAt || null,
      input.note || null,
      input.metaJson || null,
    ],
  );

  return res.rows[0];
}

async function updateTransaction(id, input) {
  await query(
    `UPDATE transactions
     SET
      status = COALESCE($2, status),
      category_id = COALESCE($3, category_id),
      amount_minor = COALESCE($4, amount_minor),
      occurred_on = COALESCE($5, occurred_on),
      approved_by_user_id = COALESCE($6, approved_by_user_id),
      approved_at = COALESCE($7, approved_at),
      note = COALESCE($8, note),
      updated_at = NOW()
     WHERE id = $1`,
    [
      id,
      input.status,
      input.categoryId,
      input.amountMinor,
      input.occurredOn,
      input.approvedByUserId,
      input.approvedAt,
      input.note,
    ],
  );
}

async function transferBetweenCategories(input) {
  return withTransaction(async (client) => {
    const outTx = await client.query(
      `INSERT INTO transactions (
        tx_type,
        status,
        actor_user_id,
        subject_user_id,
        category_id,
        amount_minor,
        occurred_on,
        note,
        approved_by_user_id,
        approved_at
      ) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,CURRENT_DATE),$8,$9,$10)
      RETURNING id`,
      [
        input.outTxType,
        input.status,
        input.actorUserId,
        input.fromUserId,
        input.fromCategoryId,
        input.amountMinor,
        input.occurredOn || null,
        input.note || null,
        input.approvedByUserId || null,
        input.approvedAt || null,
      ],
    );

    const inTx = await client.query(
      `INSERT INTO transactions (
        tx_type,
        status,
        actor_user_id,
        subject_user_id,
        category_id,
        amount_minor,
        occurred_on,
        note,
        approved_by_user_id,
        approved_at
      ) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,CURRENT_DATE),$8,$9,$10)
      RETURNING id`,
      [
        input.inTxType,
        input.status,
        input.actorUserId,
        input.toUserId,
        input.toCategoryId,
        input.amountMinor,
        input.occurredOn || null,
        input.note || null,
        input.approvedByUserId || null,
        input.approvedAt || null,
      ],
    );

    await client.query(
      `INSERT INTO transfer_links (
        transfer_tx_id,
        from_category_id,
        to_category_id,
        from_user_id,
        to_user_id,
        approved_by_user_id
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        outTx.rows[0].id,
        input.fromCategoryId,
        input.toCategoryId,
        input.fromUserId,
        input.toUserId,
        input.approvedByUserId || null,
      ],
    );

    return { outTxId: outTx.rows[0].id, inTxId: inTx.rows[0].id };
  });
}

module.exports = {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  transferBetweenCategories,
};
