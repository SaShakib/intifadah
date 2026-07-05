const { query } = require('../../db/pool');
const { TX_STATUS, TX_TYPE } = require('../../config/domain');

async function getDashboardSummary() {
  const [members, totalCollection, totalLoan, currentBalance] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM app_users WHERE is_active = TRUE'),
    query('SELECT COALESCE(SUM(amount_minor),0)::bigint AS amount FROM transactions WHERE tx_type IN (1,2,3,9) AND status = $1', [TX_STATUS.APPROVED]),
    query('SELECT COALESCE(SUM(principal_minor),0)::bigint AS amount FROM loans WHERE status IN (1,2,3)'),
    query(
      `SELECT (
        COALESCE((SELECT SUM(amount_minor) FROM transactions WHERE tx_type IN (1,2,3,9) AND status = $1),0)
        - COALESCE((SELECT SUM(amount_minor) FROM transactions WHERE tx_type IN (4,6,7,8) AND status = $1),0)
      )::bigint AS amount`,
      [TX_STATUS.APPROVED],
    ),
  ]);

  return {
    totalMembers: members.rows[0].count,
    totalCollectionMinor: totalCollection.rows[0].amount,
    totalLoanDistributedMinor: totalLoan.rows[0].amount,
    currentBalanceMinor: currentBalance.rows[0].amount,
  };
}

async function getPeriodCollectionSummary({ fromDate, toDate }) {
  const res = await query(
    `SELECT
      tx_type,
      COALESCE(SUM(amount_minor),0)::bigint AS total_minor,
      COUNT(*)::int AS total_count
     FROM transactions
     WHERE status = $1
       AND occurred_on BETWEEN $2 AND $3
       AND tx_type IN ($4,$5,$6,$7)
     GROUP BY tx_type
     ORDER BY tx_type`,
    [
      TX_STATUS.APPROVED,
      fromDate,
      toDate,
      TX_TYPE.COLLECTION,
      TX_TYPE.DONATION,
      TX_TYPE.SAVINGS,
      TX_TYPE.ORG_FUND,
    ],
  );

  return res.rows;
}

async function getMemberFinancialSummary() {
  const result = await query(
    `SELECT
      user_id,
      full_name,
      total_deposit_minor,
      total_withdraw_minor,
      total_repaid_minor,
      (total_withdraw_minor - total_repaid_minor) AS current_due_minor
    FROM v_member_financial_summary
    ORDER BY full_name ASC`,
  );

  return result.rows;
}

async function getCategoryDueSummary() {
  const result = await query(
    `SELECT
      c.id AS category_id,
      c.category_name,
      COUNT(l.id)::int AS loan_count,
      COALESCE(SUM(l.principal_minor - l.total_repaid_minor),0)::bigint AS due_minor
     FROM categories c
     LEFT JOIN loans l ON l.category_id = c.id
       AND l.status IN (1,3)
     GROUP BY c.id, c.category_name
     ORDER BY c.id DESC`,
  );

  return result.rows;
}

async function getUserCollectionSummary({ userId, fromDate, toDate }) {
  const res = await query(
    `SELECT
      tx_type,
      COALESCE(SUM(amount_minor),0)::bigint AS total_minor,
      COUNT(*)::int AS total_count
     FROM transactions
     WHERE status = $1
       AND subject_user_id = $2
       AND occurred_on BETWEEN $3 AND $4
       AND tx_type IN ($5,$6,$7,$8)
     GROUP BY tx_type
     ORDER BY tx_type`,
    [
      TX_STATUS.APPROVED,
      userId,
      fromDate,
      toDate,
      TX_TYPE.COLLECTION,
      TX_TYPE.DONATION,
      TX_TYPE.SAVINGS,
      TX_TYPE.ORG_FUND,
    ],
  );

  return res.rows;
}

async function getUserLoanSummary(userId) {
  const res = await query(
    `SELECT
      COUNT(*)::int AS total_loans,
      COALESCE(SUM(principal_minor),0)::bigint AS total_principal_minor,
      COALESCE(SUM(total_repaid_minor),0)::bigint AS total_repaid_minor,
      COALESCE(SUM(principal_minor - total_repaid_minor),0)::bigint AS total_due_minor
     FROM loans
     WHERE borrower_user_id = $1
       AND status IN (1,2,3)`,
    [userId],
  );

  return res.rows[0];
}

async function getUserDashboardSummary(userId) {
  const [collections, loans, expenses] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(amount_minor),0)::bigint AS total_minor
       FROM transactions
       WHERE subject_user_id = $1
         AND status = $2
         AND tx_type IN ($3,$4,$5,$6)`,
      [userId, TX_STATUS.APPROVED, TX_TYPE.COLLECTION, TX_TYPE.DONATION, TX_TYPE.SAVINGS, TX_TYPE.ORG_FUND],
    ),
    getUserLoanSummary(userId),
    query(
      `SELECT COALESCE(SUM(amount_minor),0)::bigint AS total_minor
       FROM transactions
       WHERE subject_user_id = $1
         AND status = $2
         AND tx_type = $3`,
      [userId, TX_STATUS.APPROVED, TX_TYPE.EXPENSE],
    ),
  ]);

  return {
    totalCollectionMinor: collections.rows[0].total_minor,
    totalLoans: Number(loans.total_loans || 0),
    totalLoanPrincipalMinor: loans.total_principal_minor,
    totalLoanRepaidMinor: loans.total_repaid_minor,
    totalLoanDueMinor: loans.total_due_minor,
    totalExpenseMinor: expenses.rows[0].total_minor,
  };
}

module.exports = {
  getDashboardSummary,
  getPeriodCollectionSummary,
  getMemberFinancialSummary,
  getCategoryDueSummary,
  getUserCollectionSummary,
  getUserLoanSummary,
  getUserDashboardSummary,
};
