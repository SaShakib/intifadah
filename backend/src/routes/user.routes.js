const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/dashboard/summary', requirePermission('dashboard', 'read'), userController.dashboard);

router.get('/categories', requirePermission('categories', 'read'), userController.categories);

router.get('/transactions', requirePermission('collections', 'read'), userController.transactions);
router.post('/transactions', requirePermission('collections', 'write'), userController.createUserTransaction);

router.get('/loans', requirePermission('loans', 'read'), userController.loans);
router.post('/loans', requirePermission('loans', 'write'), userController.createUserLoanRequest);
router.get('/loans/:loanId/repayments', requirePermission('repayments', 'read'), userController.loanRepayments);

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
router.get('/notifications', userController.notifications);
router.patch('/notifications/:notificationId/read', userController.markNotificationRead);

module.exports = {
  userRouter: router,
};
