const { repositories } = require('../../repositories');
const { TX_TYPE, TX_STATUS } = require('../../config/domain');

const {
  membersRepository,
  categoriesRepository,
  transactionsRepository,
  loansRepository,
  commentsRepository,
  reportsRepository,
} = repositories;

function parseMinorAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('amountMinor must be a positive number');
    error.statusCode = 400;
    throw error;
  }
  return Math.round(amount);
}

function parseRequiredId(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be a positive integer`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

async function getDashboardSummary() {
  return reportsRepository.getDashboardSummary();
}

async function getMemberFinancialSummary() {
  return reportsRepository.getMemberFinancialSummary();
}

async function listMembers(filters) {
  return membersRepository.listMembers(filters);
}

async function getMemberDetails(userId) {
  const member = await membersRepository.getMemberById(userId);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  const ledger = await membersRepository.getMemberLedger(userId);
  return { member, ledger };
}

async function listCategories(filters) {
  return categoriesRepository.listCategories(filters);
}

async function createCategory(input, actorUserId) {
  const payload = {
    categoryName: String(input.categoryName || '').trim(),
    categoryType: Number(input.categoryType),
    recurrenceType: Number(input.recurrenceType || 0),
    dueIntervalDays: input.dueIntervalDays ? Number(input.dueIntervalDays) : null,
    amountFixed: input.amountFixed ? Number(input.amountFixed) : null,
    isAmountVariable: input.isAmountVariable !== false,
    description: input.description,
    createdByUserId: actorUserId,
  };

  if (!payload.categoryName || !payload.categoryType) {
    const error = new Error('categoryName and categoryType are required');
    error.statusCode = 400;
    throw error;
  }

  const created = await categoriesRepository.createCategory(payload);
  return categoriesRepository.getCategoryById(created.id);
}

async function updateCategory(categoryId, input) {
  await categoriesRepository.updateCategory(categoryId, {
    categoryName: input.categoryName,
    categoryType: input.categoryType !== undefined ? Number(input.categoryType) : undefined,
    recurrenceType: input.recurrenceType !== undefined ? Number(input.recurrenceType) : undefined,
    dueIntervalDays: input.dueIntervalDays !== undefined ? Number(input.dueIntervalDays) : undefined,
    amountFixed: input.amountFixed !== undefined ? Number(input.amountFixed) : undefined,
    isAmountVariable: input.isAmountVariable,
    description: input.description,
    isActive: input.isActive,
  });

  const category = await categoriesRepository.getCategoryById(categoryId);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return category;
}

async function listCollections(filters) {
  return transactionsRepository.listTransactions({
    ...filters,
    txType: [TX_TYPE.COLLECTION, TX_TYPE.DONATION, TX_TYPE.SAVINGS, TX_TYPE.ORG_FUND],
  });
}

async function createCollectionEntry(input, actorUserId) {
  const subjectUserId = parseRequiredId(input.subjectUserId, 'subjectUserId');
  const approvedByUserId = input.approvedByUserId
    ? parseRequiredId(input.approvedByUserId, 'approvedByUserId')
    : actorUserId;

  const tx = await transactionsRepository.createTransaction({
    txType: Number(input.txType || TX_TYPE.COLLECTION),
    status: Number(input.status ?? TX_STATUS.APPROVED),
    actorUserId,
    subjectUserId,
    categoryId: input.categoryId ? Number(input.categoryId) : null,
    amountMinor: parseMinorAmount(input.amountMinor),
    occurredOn: input.occurredOn,
    approvedByUserId,
    approvedAt: new Date(),
    note: input.note,
    metaJson: input.metaJson || null,
  });

  return transactionsRepository.getTransactionById(tx.id);
}

async function listLoans(filters) {
  return loansRepository.listLoans(filters);
}

async function createLoanRequest(input, actorUserId) {
  const borrowerUserId = parseRequiredId(input.borrowerUserId, 'borrowerUserId');
  const categoryId = parseRequiredId(input.categoryId, 'categoryId');
  const created = await loansRepository.createLoanRequest({
    borrowerUserId,
    categoryId,
    principalMinor: parseMinorAmount(input.principalMinor),
    purpose: String(input.purpose || '').trim(),
    requestedOn: input.requestedOn,
    dueOn: input.dueOn,
    termDays: input.termDays ? Number(input.termDays) : null,
    status: input.status,
  });

  return loansRepository.getLoanById(created.id);
}

async function approveLoan(loanId, input, actorUserId) {
  return loansRepository.approveLoanAndDisburse({
    loanId,
    actorUserId,
    approvedByUserId: actorUserId,
    issuedOn: input.issuedOn,
    note: input.note,
  });
}

async function listLoanRepayments(loanId) {
  return loansRepository.listLoanRepayments(loanId);
}

async function recordLoanRepayment(loanId, input, actorUserId) {
  return loansRepository.createRepayment({
    loanId,
    actorUserId,
    approvedByUserId: actorUserId,
    amountMinor: parseMinorAmount(input.amountMinor),
    paidOn: input.paidOn,
    note: input.note,
  });
}

async function listExpenses(filters) {
  return transactionsRepository.listTransactions({
    ...filters,
    txType: TX_TYPE.EXPENSE,
  });
}

async function createExpense(input, actorUserId) {
  const tx = await transactionsRepository.createTransaction({
    txType: TX_TYPE.EXPENSE,
    status: Number(input.status ?? TX_STATUS.APPROVED),
    actorUserId,
    subjectUserId: Number(input.subjectUserId || actorUserId),
    categoryId: input.categoryId ? Number(input.categoryId) : null,
    amountMinor: parseMinorAmount(input.amountMinor),
    occurredOn: input.occurredOn,
    approvedByUserId: actorUserId,
    approvedAt: new Date(),
    note: input.note,
    metaJson: input.metaJson || null,
  });

  return transactionsRepository.getTransactionById(tx.id);
}

async function createTransfer(input, actorUserId) {
  const fromUserId = parseRequiredId(input.fromUserId, 'fromUserId');
  const toUserId = parseRequiredId(input.toUserId, 'toUserId');
  const fromCategoryId = parseRequiredId(input.fromCategoryId, 'fromCategoryId');
  const toCategoryId = parseRequiredId(input.toCategoryId, 'toCategoryId');

  return transactionsRepository.transferBetweenCategories({
    outTxType: TX_TYPE.TRANSFER_OUT,
    inTxType: TX_TYPE.TRANSFER_IN,
    status: Number(input.status ?? TX_STATUS.APPROVED),
    actorUserId,
    fromUserId,
    toUserId,
    fromCategoryId,
    toCategoryId,
    amountMinor: parseMinorAmount(input.amountMinor),
    occurredOn: input.occurredOn,
    approvedByUserId: actorUserId,
    approvedAt: new Date(),
    note: input.note,
  });
}

async function listCommentThreads(filters) {
  return commentsRepository.listThreads(filters);
}

async function createCommentThread(input, actorUserId) {
  const subject = String(input.subject || '').trim();
  if (!subject) {
    const error = new Error('subject is required');
    error.statusCode = 400;
    throw error;
  }

  const created = await commentsRepository.createThread({
    subject,
    createdByUserId: Number(input.createdByUserId || actorUserId),
    assignedToUserId: input.assignedToUserId ? Number(input.assignedToUserId) : null,
    status: input.status,
  });

  return commentsRepository.getThreadById(created.id);
}

async function listThreadMessages(threadId) {
  return commentsRepository.listThreadMessages(threadId);
}

async function sendThreadMessage(threadId, input, actorUserId) {
  const messageBody = String(input.messageBody || '').trim();
  if (!messageBody) {
    const error = new Error('messageBody is required');
    error.statusCode = 400;
    throw error;
  }

  return commentsRepository.addComment({
    threadId,
    senderUserId: actorUserId,
    messageBody,
    isInternal: Boolean(input.isInternal),
    nextStatus: input.nextStatus,
  });
}

async function getPeriodCollections(input) {
  const fromDate = input.fromDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10);
  const toDate = input.toDate || new Date().toISOString().slice(0, 10);
  return reportsRepository.getPeriodCollectionSummary({ fromDate, toDate });
}

async function getCategoryDueSummary() {
  return reportsRepository.getCategoryDueSummary();
}

module.exports = {
  getDashboardSummary,
  getMemberFinancialSummary,
  listMembers,
  getMemberDetails,
  listCategories,
  createCategory,
  updateCategory,
  listCollections,
  createCollectionEntry,
  listLoans,
  createLoanRequest,
  approveLoan,
  listLoanRepayments,
  recordLoanRepayment,
  listExpenses,
  createExpense,
  createTransfer,
  listCommentThreads,
  createCommentThread,
  listThreadMessages,
  sendThreadMessage,
  getPeriodCollections,
  getCategoryDueSummary,
};
