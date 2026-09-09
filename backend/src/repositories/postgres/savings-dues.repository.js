const { query, withTransaction } = require('../../db/pool');
const { TX_STATUS, TX_TYPE, CATEGORY_TYPE } = require('../../config/domain');

async function listSubscriptions(userId) {
  const res = await query(
    `SELECT cs.category_id, cs.is_active, cs.subscribed_at, cs.last_due_on
     FROM category_subscriptions cs
     WHERE cs.user_id = $1
     ORDER BY cs.category_id`,
    [userId],
  );
  return res.rows;
}

async function setSubscription({ userId, categoryId, isActive }) {
  const res = await query(
    `INSERT INTO category_subscriptions (user_id, category_id, is_active)
     SELECT $1, c.id, $3
     FROM categories c
     WHERE c.id = $2
       AND c.is_active = TRUE
       AND c.category_type IN ($4, $5)
       AND c.is_amount_variable = FALSE
       AND c.amount_fixed > 0
     ON CONFLICT (category_id, user_id)
       DO UPDATE SET is_active = EXCLUDED.is_active
     RETURNING id, user_id, category_id, is_active, subscribed_at, last_due_on`,
    [userId, categoryId, isActive, CATEGORY_TYPE.SAVINGS, CATEGORY_TYPE.DONATION],
  );
  return res.rows[0] || null;
}

async function listCategorySubscribers(categoryId) {
  const res = await query(
    `SELECT u.id AS user_id, u.full_name, u.mobile, u.email,
       COALESCE(cs.is_active, FALSE) AS is_active, cs.subscribed_at, cs.last_due_on
     FROM app_users u
     LEFT JOIN category_subscriptions cs ON cs.user_id = u.id AND cs.category_id = $1
     WHERE u.user_kind = 1 AND u.is_active = TRUE
     ORDER BY u.full_name ASC, u.id ASC`,
    [categoryId],
  );
  return res.rows;
}

async function listActiveInternalMemberIds(userIds) {
  const res = await query(
    `SELECT id FROM app_users
     WHERE id = ANY($1::int[]) AND user_kind = 1 AND is_active = TRUE`,
    [userIds],
  );
  return res.rows.map((row) => Number(row.id));
}

function isDue(subscription, today) {
  if (!subscription.last_due_on) return true;
  const lastDue = new Date(`${subscription.last_due_on}T00:00:00.000Z`);
  const current = new Date(`${today}T00:00:00.000Z`);
  if (subscription.due_interval_days) return current - lastDue >= Number(subscription.due_interval_days) * 86_400_000;
  if (subscription.recurrence_type === 1) return lastDue < current;
  if (subscription.recurrence_type === 2) return current - lastDue >= 7 * 86_400_000;
  if (subscription.recurrence_type === 3) return current.getUTCFullYear() !== lastDue.getUTCFullYear() || current.getUTCMonth() !== lastDue.getUTCMonth();
  if (subscription.recurrence_type === 4) return current.getUTCFullYear() !== lastDue.getUTCFullYear();
  return false;
}

async function createDueTransactions({ dueOn, subscriptionIds } = {}) {
  return withTransaction(async (client) => {
    const values = [CATEGORY_TYPE.SAVINGS, CATEGORY_TYPE.DONATION];
    const conditions = [
      'cs.is_active = TRUE', 'c.is_active = TRUE', 'c.category_type IN ($1, $2)',
      'c.is_amount_variable = FALSE', 'c.amount_fixed > 0', 'u.is_active = TRUE',
    ];
    if (subscriptionIds?.length) {
      values.push(subscriptionIds);
      conditions.push(`cs.id = ANY($${values.length}::bigint[])`);
    }
    const subscriptions = await client.query(
      `SELECT
        cs.id AS subscription_id,
        cs.user_id,
        cs.last_due_on,
        c.id AS category_id,
        c.category_name,
        c.category_type,
        c.recurrence_type,
        c.due_interval_days,
        c.amount_fixed,
        u.full_name,
        u.email
       FROM category_subscriptions cs
       JOIN categories c ON c.id = cs.category_id
       JOIN app_users u ON u.id = cs.user_id
       WHERE ${conditions.join(' AND ')}`,
      values,
    );

    const created = [];
    for (const subscription of subscriptions.rows) {
      if (!isDue(subscription, dueOn)) continue;
      const tx = await client.query(
        `INSERT INTO transactions (
          tx_type, status, actor_user_id, subject_user_id, category_id,
          amount_minor, occurred_on, note, meta_json
        ) VALUES ($1,$2,$3,$3,$4,$5,$6,$7,$8)
        RETURNING id`,
        [
          Number(subscription.category_type) === CATEGORY_TYPE.DONATION ? TX_TYPE.DONATION : TX_TYPE.SAVINGS,
          TX_STATUS.PENDING,
          subscription.user_id,
          subscription.category_id,
          subscription.amount_fixed,
          dueOn,
          `${subscription.category_name} due for ${dueOn}`,
          JSON.stringify({ event: 'scheduled_category_due', subscriptionId: subscription.subscription_id, dueOn }),
        ],
      );
      const due = await client.query(
        `INSERT INTO savings_due_runs (subscription_id, due_on, transaction_id)
         VALUES ($1,$2,$3)
         ON CONFLICT (subscription_id, due_on) DO NOTHING
         RETURNING id`,
        [subscription.subscription_id, dueOn, tx.rows[0].id],
      );
      if (!due.rowCount) {
        await client.query('DELETE FROM transactions WHERE id = $1', [tx.rows[0].id]);
        continue;
      }
      await client.query('UPDATE category_subscriptions SET last_due_on = $2 WHERE id = $1', [subscription.subscription_id, dueOn]);
      created.push({ ...subscription, transaction_id: tx.rows[0].id, due_on: dueOn });
    }
    return created;
  });
}

module.exports = {
  listSubscriptions,
  setSubscription,
  listCategorySubscribers,
  listActiveInternalMemberIds,
  createDueTransactions,
};
