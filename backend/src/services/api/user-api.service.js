const { repositories } = require('../../repositories');
const { TX_TYPE, TX_STATUS } = require('../../config/domain');

const {
  authRepository,
  categoriesRepository,
  transactionsRepository,
  loansRepository,
  commentsRepository,
  reportsRepository,
  notificationsRepository,
} = repositories;

const USER_TX_TYPES = [
  TX_TYPE.COLLECTION,
  TX_TYPE.DONATION,
  TX_TYPE.SAVINGS,
  TX_TYPE.ORG_FUND,
];
const MANAGER_ROLE_KEYS = ['super_admin', 'admin', 'manager'];

function parseMinorAmount(value, field = 'amountMinor') {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error(`${field} must be a positive number`);
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

function ensureAllowedUserTxType(txType) {
  if (!USER_TX_TYPES.includes(txType)) {
    const error = new Error('txType is invalid for user transaction');
    error.statusCode = 400;
    throw error;
  }
}

function ensureThreadAccess(thread, userId) {
  if (!thread) {
    const error = new Error('Thread not found');
    error.statusCode = 404;
    throw error;
  }

  if (thread.created_by_user_id === userId || thread.assigned_to_user_id === userId) {
    return;
  }

  const error = new Error('Forbidden: thread access denied');
  error.statusCode = 403;
  throw error;
}

async function getDashboardSummary(userId) {
  return reportsRepository.getUserDashboardSummary(userId);
}

async function listCategories(filters = {}) {
  return categoriesRepository.listCategories(filters);
}

async function listTransactions(userId, filters = {}) {
  return transactionsRepository.listTransactions({
    ...filters,
    subjectUserId: userId,
  });
}

async function createTransaction(userContext, input) {
  const txType = Number(input.txType || TX_TYPE.COLLECTION);
  ensureAllowedUserTxType(txType);

  const isAutoApprovedSavings = userContext.userKind === 1 && txType === TX_TYPE.SAVINGS;
  const status = isAutoApprovedSavings ? TX_STATUS.APPROVED : TX_STATUS.PENDING;
  const approverUserId = isAutoApprovedSavings ? userContext.userId : null;
  const approvedAt = isAutoApprovedSavings ? new Date() : null;

  const categoryId = input.categoryId ? parseRequiredId(input.categoryId, 'categoryId') : null;

  const created = await transactionsRepository.createTransaction({
    txType,
    status,
    actorUserId: userContext.userId,
    subjectUserId: userContext.userId,
    categoryId,
    amountMinor: parseMinorAmount(input.amountMinor),
    occurredOn: input.occurredOn,
    sourceHolderUserId: isAutoApprovedSavings ? userContext.userId : null,
    approvedByUserId: approverUserId,
    approvedAt,
    note: input.note,
    metaJson: input.metaJson || null,
  });

  if (!isAutoApprovedSavings) {
    await notificationsRepository.createForRoleKeys({
      roleKeys: MANAGER_ROLE_KEYS,
      notifType: 1,
      payloadJson: {
        event: 'user_transaction_created',
        txId: created.id,
        userId: userContext.userId,
        txType,
      },
      excludeUserId: userContext.userId,
    });
  }

  return transactionsRepository.getTransactionById(created.id);
}

async function listLoans(userId, filters = {}) {
  return loansRepository.listLoans({
    ...filters,
    borrowerUserId: userId,
  });
}

async function createLoanRequest(userId, input) {
  const categoryId = parseRequiredId(input.categoryId, 'categoryId');
  const principalMinor = parseMinorAmount(input.principalMinor, 'principalMinor');
  const purpose = String(input.purpose || '').trim();

  if (!purpose) {
    const error = new Error('purpose is required');
    error.statusCode = 400;
    throw error;
  }

  const created = await loansRepository.createLoanRequest({
    borrowerUserId: userId,
    categoryId,
    principalMinor,
    purpose,
    requestedOn: input.requestedOn,
    dueOn: input.dueOn,
    termDays: input.termDays ? Number(input.termDays) : null,
  });

  await notificationsRepository.createForRoleKeys({
    roleKeys: MANAGER_ROLE_KEYS,
    notifType: 2,
    payloadJson: {
      event: 'loan_request_created',
      loanId: created.id,
      borrowerUserId: userId,
    },
    excludeUserId: userId,
  });

  return loansRepository.getLoanById(created.id);
}

async function listLoanRepayments(userId, loanId) {
  const loan = await loansRepository.getLoanById(loanId);
  if (!loan || Number(loan.borrower_user_id) !== Number(userId)) {
    const error = new Error('Loan not found');
    error.statusCode = 404;
    throw error;
  }

  return loansRepository.listLoanRepayments(loanId);
}

async function listExpenses(userId, filters = {}) {
  return transactionsRepository.listTransactions({
    ...filters,
    subjectUserId: userId,
    txType: TX_TYPE.EXPENSE,
  });
}

async function createExpense(userId, input) {
  const categoryId = input.categoryId ? parseRequiredId(input.categoryId, 'categoryId') : null;
  const created = await transactionsRepository.createTransaction({
    txType: TX_TYPE.EXPENSE,
    status: Number(input.status ?? TX_STATUS.PENDING),
    actorUserId: userId,
    subjectUserId: userId,
    categoryId,
    amountMinor: parseMinorAmount(input.amountMinor),
    occurredOn: input.occurredOn,
    note: input.note,
    metaJson: input.metaJson || null,
  });

  await notificationsRepository.createForRoleKeys({
    roleKeys: MANAGER_ROLE_KEYS,
    notifType: 3,
    payloadJson: {
      event: 'user_expense_created',
      txId: created.id,
      userId,
    },
    excludeUserId: userId,
  });

  return transactionsRepository.getTransactionById(created.id);
}

async function listCommentThreads(userId, filters = {}) {
  return commentsRepository.listThreads({
    ...filters,
    createdByUserId: userId,
  });
}

async function createCommentThread(userId, input) {
  const subject = String(input.subject || '').trim();
  if (!subject) {
    const error = new Error('subject is required');
    error.statusCode = 400;
    throw error;
  }

  const created = await commentsRepository.createThread({
    subject,
    createdByUserId: userId,
    assignedToUserId: input.assignedToUserId ? Number(input.assignedToUserId) : null,
    status: 0,
  });

  await notificationsRepository.createForRoleKeys({
    roleKeys: MANAGER_ROLE_KEYS,
    notifType: 4,
    payloadJson: {
      event: 'comment_thread_created',
      threadId: created.id,
      userId,
    },
    excludeUserId: userId,
  });

  return commentsRepository.getThreadById(created.id);
}

async function listThreadMessages(userId, threadId) {
  const thread = await commentsRepository.getThreadById(threadId);
  ensureThreadAccess(thread, userId);
  return commentsRepository.listThreadMessages(threadId);
}

async function sendThreadMessage(userId, threadId, input) {
  const thread = await commentsRepository.getThreadById(threadId);
  ensureThreadAccess(thread, userId);

  const messageBody = String(input.messageBody || '').trim();
  if (!messageBody) {
    const error = new Error('messageBody is required');
    error.statusCode = 400;
    throw error;
  }

  const created = await commentsRepository.addComment({
    threadId,
    senderUserId: userId,
    messageBody,
    isInternal: false,
    nextStatus: input.nextStatus,
  });

  return created;
}

async function getCollectionReport(userId, input = {}) {
  const fromDate = input.fromDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10);
  const toDate = input.toDate || new Date().toISOString().slice(0, 10);

  return reportsRepository.getUserCollectionSummary({
    userId,
    fromDate,
    toDate,
  });
}

async function getLoanSummary(userId) {
  return reportsRepository.getUserLoanSummary(userId);
}

async function getProfile(userId) {
  const user = await authRepository.getUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function updateProfile(userId, input) {
  const email = input.email !== undefined
    ? String(input.email || '').trim().toLowerCase() || null
    : undefined;

  await authRepository.updateUserProfile(userId, {
    fullName: input.fullName,
    email,
    gender: input.gender !== undefined ? Number(input.gender) : undefined,
    addressLine: input.addressLine,
    wardNo: input.wardNo !== undefined ? Number(input.wardNo) : undefined,
    photoUrl: input.photoUrl,
  });

  return getProfile(userId);
}

async function listMyNotifications(userId, filters = {}) {
  return notificationsRepository.listForUser(userId, filters);
}

async function markMyNotificationRead(userId, notificationId) {
  const updated = await notificationsRepository.markAsRead(userId, notificationId);
  if (!updated) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return updated;
}

module.exports = {
  getDashboardSummary,
  listCategories,
  listTransactions,
  createTransaction,
  listLoans,
  createLoanRequest,
  listLoanRepayments,
  listExpenses,
  createExpense,
  listCommentThreads,
  createCommentThread,
  listThreadMessages,
  sendThreadMessage,
  getCollectionReport,
  getLoanSummary,
  getProfile,
  updateProfile,
  listMyNotifications,
  markMyNotificationRead,
};
