const { repositories } = require('../../repositories');
const { TX_TYPE, TX_STATUS } = require('../../config/domain');
const { hashPassword, randomToken } = require('../../lib/hash');
const { sendTemporaryPasswordEmail, sendWelcomeEmail } = require('../mail.service');

const {
  membersRepository,
  categoriesRepository,
  transactionsRepository,
  loansRepository,
  commentsRepository,
  reportsRepository,
  authRepository,
  fundTransfersRepository,
} = repositories;

const ROLE_BY_KIND = {
  1: 'member_internal',
  2: 'general_user',
  3: 'org_user',
};

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

function normalizeEmail(email) {
  return email ? String(email).trim().toLowerCase() : null;
}

function assertValidEmail(email) {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('A valid email address is required');
    error.statusCode = 400;
    throw error;
  }
}

function generateTemporaryPassword() {
  return `Int-${randomToken(9)}1a`;
}

async function resolveRoleId({ userKind, roleKey }) {
  const nextRoleKey = roleKey || ROLE_BY_KIND[Number(userKind)] || 'general_user';
  const role = await authRepository.getRoleByKey(nextRoleKey);
  if (!role) {
    const error = new Error(`Role not found: ${nextRoleKey}`);
    error.statusCode = 400;
    throw error;
  }
  return role.id;
}

async function createMember(input) {
  if (['admin', 'manager'].includes(String(input.roleKey || ''))) {
    const error = new Error('Link Admin or Manager duty to an existing Intifadah member from Roles & Permissions');
    error.statusCode = 400;
    throw error;
  }

  const fullName = String(input.fullName || '').trim();
  const mobile = String(input.mobile || '').trim();
  const providedPassword = String(input.password || '').trim();
  const password = providedPassword || generateTemporaryPassword();
  const userKind = Number(input.userKind || 2);
  const email = normalizeEmail(input.email);

  assertValidEmail(email);

  if (!fullName || !mobile) {
    const error = new Error('fullName and mobile are required');
    error.statusCode = 400;
    throw error;
  }

  if (![1, 2, 3].includes(userKind)) {
    const error = new Error('userKind must be 1, 2 or 3');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('password must be at least 8 characters');
    error.statusCode = 400;
    throw error;
  }

  const existingByEmail = email ? await authRepository.getUserByIdentifier(email) : null;
  const existingByMobile = await authRepository.getUserByIdentifier(mobile);
  if (existingByEmail || existingByMobile) {
    const error = new Error('User already exists with email/mobile');
    error.statusCode = 409;
    throw error;
  }

  const roleId = await resolveRoleId({ userKind, roleKey: input.roleKey });
  const created = await authRepository.createUser({
    userKind,
    roleId,
    organizationId: input.organizationId ? Number(input.organizationId) : null,
    fullName,
    mobile,
    email,
    passwordHash: hashPassword(password),
    gender: input.gender !== undefined ? Number(input.gender) : 0,
    addressLine: input.addressLine,
    wardNo: input.wardNo ? Number(input.wardNo) : null,
    photoUrl: input.photoUrl,
  });

  const member = await membersRepository.getMemberById(created.id);
  let emailSendError;
  if (email) {
    try {
      if (providedPassword) {
        await sendWelcomeEmail({ to: email, fullName });
      } else {
        await sendTemporaryPasswordEmail({
          to: email,
          fullName,
          password,
        });
      }
    } catch (error) {
      emailSendError = error.message;
    }
  }

  return {
    ...member,
    password_generated: !providedPassword,
    temporary_password: providedPassword ? undefined : password,
    email_send_error: emailSendError,
  };
}

async function updateMember(userId, input) {
  if (['admin', 'manager'].includes(String(input.roleKey || ''))) {
    const error = new Error('Link Admin or Manager duty to an existing Intifadah member from Roles & Permissions');
    error.statusCode = 400;
    throw error;
  }

  const roleId = input.roleKey ? await resolveRoleId({ userKind: input.userKind, roleKey: input.roleKey }) : undefined;
  await authRepository.updateUserAdmin(userId, {
    userKind: input.userKind !== undefined ? Number(input.userKind) : undefined,
    roleId,
    organizationId: input.organizationId !== undefined ? Number(input.organizationId) || null : undefined,
    fullName: input.fullName,
    mobile: input.mobile,
    email: input.email !== undefined ? normalizeEmail(input.email) : undefined,
    gender: input.gender !== undefined ? Number(input.gender) : undefined,
    addressLine: input.addressLine,
    wardNo: input.wardNo !== undefined ? Number(input.wardNo) : undefined,
    photoUrl: input.photoUrl,
    isActive: input.isActive,
  });

  const member = await membersRepository.getMemberById(userId);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  return member;
}

async function deactivateMember(userId) {
  return updateMember(userId, { isActive: false });
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

async function receiveSavingsDue(transactionId, actorUserId) {
  const transaction = await transactionsRepository.getTransactionById(transactionId);
  if (!transaction) {
    const error = new Error('Savings due not found');
    error.statusCode = 404;
    throw error;
  }
  if (Number(transaction.tx_type) !== TX_TYPE.SAVINGS || Number(transaction.status) !== TX_STATUS.PENDING) {
    const error = new Error('Only a pending savings due can be received');
    error.statusCode = 400;
    throw error;
  }
  await transactionsRepository.updateTransaction(transactionId, {
    status: TX_STATUS.APPROVED,
    approvedByUserId: actorUserId,
    approvedAt: new Date(),
  });
  return transactionsRepository.getTransactionById(transactionId);
}

const COLLECTION_TX_TYPES = new Set([
  TX_TYPE.COLLECTION,
  TX_TYPE.DONATION,
  TX_TYPE.SAVINGS,
  TX_TYPE.ORG_FUND,
]);

function parseCollectionStatus(value) {
  const status = Number(value);
  if (!Object.values(TX_STATUS).includes(status)) {
    const error = new Error('Invalid transaction status');
    error.statusCode = 400;
    throw error;
  }
  return status;
}

function assertCollectionTransaction(transaction) {
  if (!transaction || !COLLECTION_TX_TYPES.has(Number(transaction.tx_type))) {
    const error = new Error('Collection entry not found');
    error.statusCode = 404;
    throw error;
  }
}

async function updateCollectionEntry(transactionId, input, actorContext) {
  const transaction = await transactionsRepository.getTransactionById(transactionId);
  assertCollectionTransaction(transaction);

  const roleKey = actorContext.roleKey;
  if (!['super_admin', 'admin', 'manager'].includes(roleKey)) {
    const error = new Error('You do not have permission to update this entry');
    error.statusCode = 403;
    throw error;
  }

  const status = parseCollectionStatus(input.status ?? transaction.status);
  if (roleKey !== 'super_admin') {
    await transactionsRepository.updateTransactionStatus(transactionId, status, actorContext.actorUserId);
    return transactionsRepository.getTransactionById(transactionId);
  }

  const txType = Number(input.txType ?? transaction.tx_type);
  if (!COLLECTION_TX_TYPES.has(txType)) {
    const error = new Error('Invalid collection type');
    error.statusCode = 400;
    throw error;
  }

  await transactionsRepository.updateCollectionTransaction(transactionId, {
    txType,
    status,
    subjectUserId: input.subjectUserId === undefined
      ? Number(transaction.subject_user_id)
      : parseRequiredId(input.subjectUserId, 'subjectUserId'),
    categoryId: input.categoryId === undefined ? transaction.category_id : input.categoryId,
    amountMinor: input.amountMinor === undefined
      ? Number(transaction.amount_minor)
      : parseMinorAmount(input.amountMinor),
    occurredOn: input.occurredOn === undefined ? transaction.occurred_on : input.occurredOn,
    approvedByUserId: actorContext.actorUserId,
    approvedAt: new Date(),
    note: input.note === undefined ? transaction.note : input.note,
  });

  return transactionsRepository.getTransactionById(transactionId);
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

async function listFundTransfers(filters) {
  return fundTransfersRepository.listFundTransfers(filters);
}

async function listFundTransferRecipients(actorUserId) {
  return fundTransfersRepository.listFundTransferRecipients(actorUserId);
}

async function createFundTransfer(input, actorUserId) {
  const toUserId = parseRequiredId(input.toUserId, 'toUserId');
  if (Number(toUserId) === Number(actorUserId)) {
    const error = new Error('You cannot transfer funds to yourself');
    error.statusCode = 400;
    throw error;
  }

  return fundTransfersRepository.createFundTransfer({
    fromUserId: actorUserId,
    toUserId,
    actorUserId,
    amountMinor: parseMinorAmount(input.amountMinor),
    transferredOn: input.transferredOn,
    note: String(input.note || '').trim() || null,
  });
}

async function updateFundTransferStatus(transferId, input, actorContext) {
  const status = Number(input.status);
  if (![TX_STATUS.APPROVED, TX_STATUS.REJECTED].includes(status)) {
    const error = new Error('Transfer status must be received or rejected');
    error.statusCode = 400;
    throw error;
  }

  await fundTransfersRepository.updateFundTransferStatus({
    transferId,
    status,
    actorUserId: actorContext.actorUserId,
    receiverNote: String(input.receiverNote || '').trim() || null,
    allowOverride: actorContext.roleKey === 'super_admin',
  });
  const rows = await fundTransfersRepository.listFundTransfers({ transferId, limit: 1 });
  return rows[0] || null;
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
  createMember,
  updateMember,
  deactivateMember,
  getMemberDetails,
  listCategories,
  createCategory,
  updateCategory,
  listCollections,
  createCollectionEntry,
  receiveSavingsDue,
  updateCollectionEntry,
  listLoans,
  createLoanRequest,
  approveLoan,
  listLoanRepayments,
  recordLoanRepayment,
  listExpenses,
  createExpense,
  createTransfer,
  listFundTransfers,
  listFundTransferRecipients,
  createFundTransfer,
  updateFundTransferStatus,
  listCommentThreads,
  createCommentThread,
  listThreadMessages,
  sendThreadMessage,
  getPeriodCollections,
  getCategoryDueSummary,
};
