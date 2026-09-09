const { repositories } = require('../repositories');
const { env } = require('../config/env');
const { sendSavingsDueEmail } = require('./mail.service');

const { savingsDuesRepository, notificationsRepository } = repositories;

function currentDateText(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.quranCronTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function deliverSavingsDues(rows) {
  const notificationResults = await Promise.allSettled(rows.map((row) => notificationsRepository.createForUser({
    userId: row.user_id,
    notifType: 23,
    payloadJson: {
      event: 'scheduled_savings_due',
      transactionId: row.transaction_id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      categoryType: Number(row.category_type),
      amountMinor: Number(row.amount_fixed),
      dueOn: row.due_on,
      url: '/user/transactions',
    },
  })));
  const emailResults = await Promise.allSettled(rows
    .filter((row) => row.email)
    .map((row) => sendSavingsDueEmail({
      to: row.email,
      fullName: row.full_name,
      categoryName: row.category_name,
      categoryType: Number(row.category_type),
      amountMinor: row.amount_fixed,
      dueOn: row.due_on,
    })));
  return {
    notified: notificationResults.filter((item) => item.status === 'fulfilled').length,
    email: {
      attempted: emailResults.length,
      sent: emailResults.filter((item) => item.status === 'fulfilled').length,
      failed: emailResults.filter((item) => item.status === 'rejected').length,
    },
  };
}

async function runScheduledSavingsDues({ dueOn = currentDateText() } = {}) {
  const rows = await savingsDuesRepository.createDueTransactions({ dueOn });
  return { dueOn, created: rows.length, ...(await deliverSavingsDues(rows)) };
}

async function listMySavingsSubscriptions(userId) {
  return savingsDuesRepository.listSubscriptions(userId);
}

async function setCategorySubscription(userId, categoryId, isActive) {
  const subscription = await savingsDuesRepository.setSubscription({ userId, categoryId, isActive });
  if (!subscription) {
    const error = new Error('Only active fixed-amount savings or donation categories can be subscribed to');
    error.statusCode = 400;
    throw error;
  }
  const rows = isActive
    ? await savingsDuesRepository.createDueTransactions({ dueOn: currentDateText(), subscriptionIds: [subscription.id] })
    : [];
  const dueResult = { dueOn: currentDateText(), created: rows.length, ...(await deliverSavingsDues(rows)) };
  return { subscription, dueResult };
}

async function listCategorySubscriptions(categoryId) {
  return savingsDuesRepository.listCategorySubscribers(categoryId);
}

async function setCategorySubscriptionsForInternalMembers(categoryId, userIds, isActive) {
  const uniqueUserIds = [...new Set((Array.isArray(userIds) ? userIds : []).map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!uniqueUserIds.length) {
    const error = new Error('Select at least one internal member');
    error.statusCode = 400;
    throw error;
  }
  const eligibleIds = await savingsDuesRepository.listActiveInternalMemberIds(uniqueUserIds);
  if (eligibleIds.length !== uniqueUserIds.length) {
    const error = new Error('Only active internal members can be subscribed by a super admin');
    error.statusCode = 400;
    throw error;
  }
  const results = [];
  for (const userId of eligibleIds) results.push(await setCategorySubscription(userId, categoryId, isActive));
  return { updated: results.length, created: results.reduce((sum, result) => sum + result.dueResult.created, 0), results };
}

module.exports = {
  currentDateText,
  runScheduledSavingsDues,
  listMySavingsSubscriptions,
  setMySavingsSubscription: setCategorySubscription,
  setCategorySubscription,
  listCategorySubscriptions,
  setCategorySubscriptionsForInternalMembers,
};
