const { listModules } = require('../services/permission.service');
const {
  listRoles,
  listRolePermissionMatrix,
  updateRolePermissions,
  assignRoleToUser,
} = require('../services/access-control.service');
const {
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
} = require('../services/api/admin-api.service');

function parseBoolean(value) {
  if (value === undefined) return undefined;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes'].includes(normalized)) return true;
  if (['0', 'false', 'no'].includes(normalized)) return false;
  return undefined;
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

function paginationFromQuery(query) {
  return {
    limit: parseNumber(query.limit),
    offset: parseNumber(query.offset),
  };
}

async function dashboardSummary(_req, res, next) {
  try {
    const data = await getDashboardSummary();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function memberFinancialSummary(_req, res, next) {
  try {
    const rows = await getMemberFinancialSummary();
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function membersList(req, res, next) {
  try {
    const rows = await listMembers({
      search: req.query.search,
      userKind: parseNumber(req.query.userKind),
      active: parseBoolean(req.query.active),
      ...paginationFromQuery(req.query),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function memberDetails(req, res, next) {
  try {
    const userId = parseRequiredId(req.params.userId, 'userId');
    const data = await getMemberDetails(userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function categoriesList(req, res, next) {
  try {
    const rows = await listCategories({
      categoryType: parseNumber(req.query.categoryType),
      active: parseBoolean(req.query.active),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function categoriesCreate(req, res, next) {
  try {
    const created = await createCategory(req.body, req.auth.userId);
    res.status(201).json({ row: created });
  } catch (error) {
    next(error);
  }
}

async function categoriesUpdate(req, res, next) {
  try {
    const categoryId = parseRequiredId(req.params.categoryId, 'categoryId');
    const updated = await updateCategory(categoryId, req.body || {});
    res.json({ row: updated });
  } catch (error) {
    next(error);
  }
}

async function collectionsList(req, res, next) {
  try {
    const rows = await listCollections({
      subjectUserId: parseNumber(req.query.subjectUserId),
      actorUserId: parseNumber(req.query.actorUserId),
      categoryId: parseNumber(req.query.categoryId),
      status: parseNumber(req.query.status),
      txType: req.query.txType ? String(req.query.txType).split(',').map((x) => Number(x.trim())).filter(Number.isFinite) : undefined,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      ...paginationFromQuery(req.query),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function collectionsCreate(req, res, next) {
  try {
    const created = await createCollectionEntry(req.body, req.auth.userId);
    res.status(201).json({ row: created });
  } catch (error) {
    next(error);
  }
}

async function loansList(req, res, next) {
  try {
    let status;
    if (req.query.status !== undefined) {
      status = String(req.query.status).includes(',')
        ? String(req.query.status).split(',').map((x) => Number(x.trim())).filter(Number.isFinite)
        : parseNumber(req.query.status);
    }

    const rows = await listLoans({
      borrowerUserId: parseNumber(req.query.borrowerUserId),
      status,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function loansCreate(req, res, next) {
  try {
    const created = await createLoanRequest(req.body, req.auth.userId);
    res.status(201).json({ row: created });
  } catch (error) {
    next(error);
  }
}

async function loansApprove(req, res, next) {
  try {
    const loanId = parseRequiredId(req.params.loanId, 'loanId');
    const result = await approveLoan(loanId, req.body || {}, req.auth.userId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function loanRepaymentsList(req, res, next) {
  try {
    const loanId = parseRequiredId(req.params.loanId, 'loanId');
    const rows = await listLoanRepayments(loanId);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function loanRepaymentsCreate(req, res, next) {
  try {
    const loanId = parseRequiredId(req.params.loanId, 'loanId');
    const result = await recordLoanRepayment(loanId, req.body || {}, req.auth.userId);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function expensesList(req, res, next) {
  try {
    const rows = await listExpenses({
      subjectUserId: parseNumber(req.query.subjectUserId),
      actorUserId: parseNumber(req.query.actorUserId),
      categoryId: parseNumber(req.query.categoryId),
      status: parseNumber(req.query.status),
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      ...paginationFromQuery(req.query),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function expensesCreate(req, res, next) {
  try {
    const created = await createExpense(req.body, req.auth.userId);
    res.status(201).json({ row: created });
  } catch (error) {
    next(error);
  }
}

async function transfersCreate(req, res, next) {
  try {
    const result = await createTransfer(req.body, req.auth.userId);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function commentThreadsList(req, res, next) {
  try {
    const rows = await listCommentThreads({
      createdByUserId: parseNumber(req.query.createdByUserId),
      status: parseNumber(req.query.status),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function commentThreadsCreate(req, res, next) {
  try {
    const created = await createCommentThread(req.body, req.auth.userId);
    res.status(201).json({ row: created });
  } catch (error) {
    next(error);
  }
}

async function threadMessagesList(req, res, next) {
  try {
    const threadId = parseRequiredId(req.params.threadId, 'threadId');
    const rows = await listThreadMessages(threadId);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function threadMessagesCreate(req, res, next) {
  try {
    const threadId = parseRequiredId(req.params.threadId, 'threadId');
    const created = await sendThreadMessage(threadId, req.body || {}, req.auth.userId);
    res.status(201).json({ row: created });
  } catch (error) {
    next(error);
  }
}

async function reportPeriodCollections(req, res, next) {
  try {
    const rows = await getPeriodCollections({
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function reportCategoryDueSummary(_req, res, next) {
  try {
    const rows = await getCategoryDueSummary();
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function rolesPermissions(_req, res, next) {
  try {
    const rows = await listRolePermissionMatrix();
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function accessModules(_req, res, next) {
  try {
    const rows = await listModules();
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function accessRoles(_req, res, next) {
  try {
    const rows = await listRoles();
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function accessMatrix(_req, res, next) {
  try {
    const rows = await listRolePermissionMatrix();
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function updateRolePermissionSet(req, res, next) {
  try {
    const roleKey = String(req.params.roleKey || '').trim();
    const permissions = req.body?.permissions;
    const replaceAll = Boolean(req.body?.replaceAll);

    if (!roleKey) {
      const error = new Error('roleKey is required');
      error.statusCode = 400;
      throw error;
    }

    const rows = await updateRolePermissions({
      actorUserId: req.auth.userId,
      roleKey,
      permissions,
      replaceAll,
    });

    res.json({
      message: 'Role permissions updated',
      roleKey,
      replaceAll,
      rows,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const targetUserId = parseRequiredId(req.params.userId, 'userId');
    const targetRoleKey = String(req.body?.roleKey || '').trim();

    if (!targetRoleKey) {
      const error = new Error('roleKey is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await assignRoleToUser({
      actorUserId: req.auth.userId,
      targetUserId,
      targetRoleKey,
    });

    res.json({
      message: result.changed ? 'User role updated' : 'User role unchanged',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboardSummary,
  memberFinancialSummary,
  membersList,
  memberDetails,
  categoriesList,
  categoriesCreate,
  categoriesUpdate,
  collectionsList,
  collectionsCreate,
  loansList,
  loansCreate,
  loansApprove,
  loanRepaymentsList,
  loanRepaymentsCreate,
  expensesList,
  expensesCreate,
  transfersCreate,
  commentThreadsList,
  commentThreadsCreate,
  threadMessagesList,
  threadMessagesCreate,
  reportPeriodCollections,
  reportCategoryDueSummary,
  rolesPermissions,
  accessModules,
  accessRoles,
  accessMatrix,
  updateRolePermissionSet,
  updateUserRole,
};
