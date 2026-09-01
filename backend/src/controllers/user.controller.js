const {
  sanitizeUser,
} = require('../services/auth.service');
const {
  getDashboardSummary,
  listCategories,
  listTransactions,
  createTransaction,
  listLoans,
  createLoanRequest,
  listLoanRepayments,
  createLoanRepayment,
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
  completeProfile,
  listMyNotifications,
  markMyNotificationRead,
} = require('../services/api/user-api.service');
const { authorizeUserChannel } = require('../services/pusher.service');
const { saveSubscription, removeSubscription, sendTestNotification } = require('../services/web-push.service');

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

async function dashboard(req, res, next) {
  try {
    const data = await getDashboardSummary(req.auth.userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function categories(req, res, next) {
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

async function transactions(req, res, next) {
  try {
    const txType = req.query.txType
      ? String(req.query.txType).split(',').map((x) => Number(x.trim())).filter(Number.isFinite)
      : undefined;

    const rows = await listTransactions(req.auth.userId, {
      txType,
      status: parseNumber(req.query.status),
      categoryId: parseNumber(req.query.categoryId),
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      ...paginationFromQuery(req.query),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function createUserTransaction(req, res, next) {
  try {
    const row = await createTransaction(req.auth, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function loans(req, res, next) {
  try {
    let status;
    if (req.query.status !== undefined) {
      status = String(req.query.status).includes(',')
        ? String(req.query.status).split(',').map((x) => Number(x.trim())).filter(Number.isFinite)
        : parseNumber(req.query.status);
    }

    const rows = await listLoans(req.auth.userId, {
      status,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function createUserLoanRequest(req, res, next) {
  try {
    const row = await createLoanRequest(req.auth.userId, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function loanRepayments(req, res, next) {
  try {
    const loanId = parseRequiredId(req.params.loanId, 'loanId');
    const rows = await listLoanRepayments(req.auth.userId, loanId);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function createUserLoanRepayment(req, res, next) {
  try {
    const loanId = parseRequiredId(req.params.loanId, 'loanId');
    const data = await createLoanRepayment(req.auth.userId, loanId, req.body || {});
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

async function expenses(req, res, next) {
  try {
    const rows = await listExpenses(req.auth.userId, {
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

async function createUserExpense(req, res, next) {
  try {
    const row = await createExpense(req.auth.userId, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function commentThreads(req, res, next) {
  try {
    const rows = await listCommentThreads(req.auth.userId, {
      status: parseNumber(req.query.status),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function createUserCommentThread(req, res, next) {
  try {
    const row = await createCommentThread(req.auth.userId, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function threadMessages(req, res, next) {
  try {
    const threadId = parseRequiredId(req.params.threadId, 'threadId');
    const rows = await listThreadMessages(req.auth.userId, threadId);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function createThreadMessage(req, res, next) {
  try {
    const threadId = parseRequiredId(req.params.threadId, 'threadId');
    const row = await sendThreadMessage(req.auth.userId, threadId, req.body || {});
    res.status(201).json({ row });
  } catch (error) {
    next(error);
  }
}

async function reportCollections(req, res, next) {
  try {
    const rows = await getCollectionReport(req.auth.userId, {
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function reportLoans(req, res, next) {
  try {
    const data = await getLoanSummary(req.auth.userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function profile(req, res, next) {
  try {
    const user = await getProfile(req.auth.userId);
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function updateUserProfile(req, res, next) {
  try {
    const user = await updateProfile(req.auth.userId, req.body || {});
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function completeUserProfile(req, res, next) {
  try {
    const user = await completeProfile(req.auth.userId, req.body || {});
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function notifications(req, res, next) {
  try {
    const rows = await listMyNotifications(req.auth.userId, {
      unread: parseBoolean(req.query.unread),
      ...paginationFromQuery(req.query),
    });

    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const notificationId = parseRequiredId(req.params.notificationId, 'notificationId');
    const row = await markMyNotificationRead(req.auth.userId, notificationId);
    res.json({ row });
  } catch (error) {
    next(error);
  }
}

async function pusherAuth(req, res, next) {
  try {
    const auth = authorizeUserChannel({
      userId: req.auth.userId,
      socketId: req.body?.socket_id,
      channelName: req.body?.channel_name,
    });
    res.json(auth);
  } catch (error) {
    next(error);
  }
}

async function savePushSubscription(req, res, next) {
  try {
    const subscription = await saveSubscription(req.auth.userId, req.body || {});
    res.status(201).json({ subscription });
  } catch (error) {
    next(error);
  }
}

async function removePushSubscription(req, res, next) {
  try {
    await removeSubscription(req.auth.userId, req.body?.endpoint);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function testPushNotification(req, res, next) {
  try {
    const result = await sendTestNotification(req.auth.userId);
    if (!result.enabled) {
      const error = new Error('Device push is not configured on the server');
      error.statusCode = 503;
      throw error;
    }
    if (!result.subscriptions) {
      const error = new Error('Enable device notifications on this device first');
      error.statusCode = 400;
      throw error;
    }
    if (!result.sent) {
      const error = new Error('The push service rejected this device subscription');
      error.statusCode = 502;
      throw error;
    }

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboard,
  categories,
  transactions,
  createUserTransaction,
  loans,
  createUserLoanRequest,
  loanRepayments,
  createUserLoanRepayment,
  expenses,
  createUserExpense,
  commentThreads,
  createUserCommentThread,
  threadMessages,
  createThreadMessage,
  reportCollections,
  reportLoans,
  profile,
  updateUserProfile,
  completeUserProfile,
  notifications,
  markNotificationRead,
  pusherAuth,
  savePushSubscription,
  removePushSubscription,
  testPushNotification,
};
