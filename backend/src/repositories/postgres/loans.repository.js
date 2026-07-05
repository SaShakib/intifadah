const { query, withTransaction } = require('../../db/pool');
const { LOAN_STATUS, TX_STATUS, TX_TYPE } = require('../../config/domain');

async function listLoans(filters = {}) {
  const values = [];
  const where = [];

  if (filters.borrowerUserId) {
    values.push(Number(filters.borrowerUserId));
    where.push(`l.borrower_user_id = $${values.length}`);
  }

  if (filters.status !== undefined) {
    if (Array.isArray(filters.status)) {
      values.push(filters.status.map(Number));
      where.push(`l.status = ANY($${values.length}::smallint[])`);
    } else {
      values.push(Number(filters.status));
      where.push(`l.status = $${values.length}`);
    }
  }

  if (filters.fromDate) {
    values.push(filters.fromDate);
    where.push(`l.requested_on >= $${values.length}`);
  }

  if (filters.toDate) {
    values.push(filters.toDate);
    where.push(`l.requested_on <= $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const res = await query(
    `SELECT
      l.id,
      l.borrower_user_id,
      u.full_name AS borrower_name,
      l.category_id,
      c.category_name,
      l.principal_minor,
      l.purpose,
      l.requested_on,
      l.issued_on,
      l.due_on,
      l.term_days,
      l.status,
      l.disbursed_tx_id,
      l.approved_by_user_id,
      l.approved_at,
      l.total_repaid_minor,
      l.created_at,
      l.updated_at
     FROM loans l
     JOIN app_users u ON u.id = l.borrower_user_id
     LEFT JOIN categories c ON c.id = l.category_id
     ${whereSql}
     ORDER BY l.requested_on DESC, l.id DESC`,
    values,
  );

  return res.rows;
}

async function getLoanById(id) {
  const res = await query(
    `SELECT
      l.id,
      l.borrower_user_id,
      u.full_name AS borrower_name,
      l.category_id,
      c.category_name,
      l.principal_minor,
      l.purpose,
      l.requested_on,
      l.issued_on,
      l.due_on,
      l.term_days,
      l.status,
      l.disbursed_tx_id,
      l.approved_by_user_id,
      l.approved_at,
      l.total_repaid_minor,
      l.created_at,
      l.updated_at
     FROM loans l
     JOIN app_users u ON u.id = l.borrower_user_id
     LEFT JOIN categories c ON c.id = l.category_id
     WHERE l.id = $1
     LIMIT 1`,
    [id],
  );

  return res.rows[0] || null;
}

async function createLoanRequest(input) {
  const res = await query(
    `INSERT INTO loans (
      borrower_user_id,
      category_id,
      principal_minor,
      purpose,
      requested_on,
      due_on,
      term_days,
      status
    ) VALUES ($1,$2,$3,$4,COALESCE($5,CURRENT_DATE),$6,$7,$8)
    RETURNING id`,
    [
      input.borrowerUserId,
      input.categoryId,
      input.principalMinor,
      input.purpose,
      input.requestedOn || null,
      input.dueOn,
      input.termDays || null,
      input.status ?? LOAN_STATUS.PENDING,
    ],
  );

  return res.rows[0];
}

async function approveLoanAndDisburse(input) {
  return withTransaction(async (client) => {
    const loanRes = await client.query(
      `SELECT id, borrower_user_id, category_id, principal_minor, status
       FROM loans
       WHERE id = $1
       FOR UPDATE`,
      [input.loanId],
    );

    if (!loanRes.rowCount) {
      const error = new Error('Loan not found');
      error.statusCode = 404;
      throw error;
    }

    const loan = loanRes.rows[0];
    if (Number(loan.status) !== LOAN_STATUS.PENDING) {
      const error = new Error('Only pending loan can be approved');
      error.statusCode = 400;
      throw error;
    }

    const txRes = await client.query(
      `INSERT INTO transactions (
        tx_type,
        status,
        actor_user_id,
        subject_user_id,
        category_id,
        amount_minor,
        occurred_on,
        approved_by_user_id,
        approved_at,
        note
      ) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,CURRENT_DATE),$8,NOW(),$9)
      RETURNING id`,
      [
        TX_TYPE.LOAN_DISBURSE,
        TX_STATUS.APPROVED,
        input.actorUserId,
        loan.borrower_user_id,
        loan.category_id,
        loan.principal_minor,
        input.issuedOn || null,
        input.approvedByUserId,
        input.note || null,
      ],
    );

    await client.query(
      `UPDATE loans
       SET status = $2,
           issued_on = COALESCE($3, CURRENT_DATE),
           approved_by_user_id = $4,
           approved_at = NOW(),
           disbursed_tx_id = $5,
           updated_at = NOW()
       WHERE id = $1`,
      [
        loan.id,
        LOAN_STATUS.ACTIVE,
        input.issuedOn || null,
        input.approvedByUserId,
        txRes.rows[0].id,
      ],
    );

    return {
      loanId: loan.id,
      disbursementTxId: txRes.rows[0].id,
    };
  });
}

async function createRepayment(input) {
  return withTransaction(async (client) => {
    const loanRes = await client.query(
      `SELECT id, borrower_user_id, category_id, principal_minor, total_repaid_minor, status
       FROM loans
       WHERE id = $1
       FOR UPDATE`,
      [input.loanId],
    );

    if (!loanRes.rowCount) {
      const error = new Error('Loan not found');
      error.statusCode = 404;
      throw error;
    }

    const loan = loanRes.rows[0];
    if (![LOAN_STATUS.ACTIVE, LOAN_STATUS.OVERDUE].includes(Number(loan.status))) {
      const error = new Error('Repayment allowed only for active/overdue loans');
      error.statusCode = 400;
      throw error;
    }

    const txRes = await client.query(
      `INSERT INTO transactions (
        tx_type,
        status,
        actor_user_id,
        subject_user_id,
        category_id,
        amount_minor,
        occurred_on,
        approved_by_user_id,
        approved_at,
        note
      ) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,CURRENT_DATE),$8,NOW(),$9)
      RETURNING id`,
      [
        TX_TYPE.LOAN_REPAYMENT,
        TX_STATUS.APPROVED,
        input.actorUserId,
        loan.borrower_user_id,
        loan.category_id,
        input.amountMinor,
        input.paidOn || null,
        input.approvedByUserId || input.actorUserId,
        input.note || null,
      ],
    );

    await client.query(
      `INSERT INTO loan_repayments (
        loan_id,
        repayment_tx_id,
        amount_minor,
        paid_on,
        recorded_by_user_id
      ) VALUES ($1,$2,$3,COALESCE($4,CURRENT_DATE),$5)`,
      [loan.id, txRes.rows[0].id, input.amountMinor, input.paidOn || null, input.actorUserId],
    );

    const newTotal = Number(loan.total_repaid_minor) + Number(input.amountMinor);
    const nextStatus = newTotal >= Number(loan.principal_minor) ? LOAN_STATUS.REPAID : LOAN_STATUS.ACTIVE;

    await client.query(
      `UPDATE loans
       SET total_repaid_minor = $2,
           status = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [loan.id, newTotal, nextStatus],
    );

    return {
      loanId: loan.id,
      repaymentTxId: txRes.rows[0].id,
      totalRepaidMinor: newTotal,
      status: nextStatus,
    };
  });
}

async function listLoanRepayments(loanId) {
  const res = await query(
    `SELECT
      lr.id,
      lr.loan_id,
      lr.repayment_tx_id,
      lr.amount_minor,
      lr.paid_on,
      lr.recorded_by_user_id,
      t.note,
      t.created_at
     FROM loan_repayments lr
     JOIN transactions t ON t.id = lr.repayment_tx_id
     WHERE lr.loan_id = $1
     ORDER BY lr.paid_on DESC, lr.id DESC`,
    [loanId],
  );

  return res.rows;
}

module.exports = {
  listLoans,
  getLoanById,
  createLoanRequest,
  approveLoanAndDisburse,
  createRepayment,
  listLoanRepayments,
};
