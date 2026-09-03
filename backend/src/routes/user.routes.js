const express = require('express');
const { requireAuth, requireCompletedProfile, requirePermission, requireUserKind } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const quranController = require('../controllers/quran.controller');

const router = express.Router();
router.use(requireAuth);
router.use((req, res, next) => {
  if (req.path === '/profile' || req.path === '/profile/complete') {
    return next();
  }
  return requireCompletedProfile(req, res, next);
});

router.get('/dashboard/summary', requirePermission('dashboard', 'read'), userController.dashboard);

router.get('/categories', requirePermission('categories', 'read'), userController.categories);

router.get('/transactions', requirePermission('collections', 'read'), userController.transactions);
router.post('/transactions', requirePermission('collections', 'write'), userController.createUserTransaction);

router.get('/loans', requirePermission('loans', 'read'), userController.loans);
router.post('/loans', requirePermission('loans', 'write'), userController.createUserLoanRequest);
router.get('/loans/:loanId/repayments', requirePermission('repayments', 'read'), userController.loanRepayments);
router.post('/loans/:loanId/repayments', requirePermission('repayments', 'write'), userController.createUserLoanRepayment);

router.get('/expenses', requirePermission('expenses', 'read'), userController.expenses);
router.post('/expenses', requirePermission('expenses', 'write'), userController.createUserExpense);

router.get('/comments/threads', requirePermission('comments', 'read'), userController.commentThreads);
router.post('/comments/threads', requirePermission('comments', 'write'), userController.createUserCommentThread);
router.get('/comments/threads/:threadId/messages', requirePermission('comments', 'read'), userController.threadMessages);
router.post('/comments/threads/:threadId/messages', requirePermission('comments', 'write'), userController.createThreadMessage);

router.get('/reports/collections', requirePermission('collections', 'read'), userController.reportCollections);
router.get('/reports/loans', requirePermission('loans', 'read'), userController.reportLoans);

router.get('/profile', userController.profile);
router.patch('/profile', userController.updateUserProfile);
router.post('/profile/complete', userController.completeUserProfile);
router.get('/notifications', userController.notifications);
router.patch('/notifications/:notificationId/read', userController.markNotificationRead);
router.post('/pusher/auth', userController.pusherAuth);
router.post('/push-subscriptions', userController.savePushSubscription);
router.delete('/push-subscriptions', userController.removePushSubscription);
router.post('/push-subscriptions/test', userController.testPushNotification);

router.get('/quran/progress', requirePermission('quran', 'read'), quranController.myProgress);
router.post('/quran/progress', requirePermission('quran', 'write'), quranController.createProgress);
router.patch('/quran/progress/:progressId', requirePermission('quran', 'write'), quranController.updateProgress);
router.get('/quran/weekly-completion', requireUserKind(1), requirePermission('quran', 'read'), quranController.internalWeeklyCompletion);
router.get('/quran/penalties', requirePermission('quran', 'read'), quranController.myPenalties);

module.exports = {
  userRouter: router,
};
