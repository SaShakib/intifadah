const express = require('express');
const { requireAuth, requirePermission, requireRoles } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');
const quranController = require('../controllers/quran.controller');

const router = express.Router();

router.use(requireAuth);
router.use(requireRoles('super_admin', 'admin', 'manager', 'member_internal'));

router.get('/dashboard/summary', requirePermission('dashboard', 'read'), adminController.dashboardSummary);

router.get('/members', requirePermission('members', 'read'), adminController.membersList);
router.post('/members', requirePermission('members', 'write'), adminController.membersCreate);
router.get('/members/financial-summary', requirePermission('reports', 'read'), adminController.memberFinancialSummary);
router.get('/members/:userId', requirePermission('members', 'read'), adminController.memberDetails);
router.patch('/members/:userId', requirePermission('members', 'update'), adminController.membersUpdate);
router.delete('/members/:userId', requirePermission('members', 'delete'), adminController.membersDeactivate);

router.get('/categories', requirePermission('categories', 'read'), adminController.categoriesList);
router.post('/categories', requirePermission('categories', 'write'), adminController.categoriesCreate);
router.patch('/categories/:categoryId', requirePermission('categories', 'update'), adminController.categoriesUpdate);
router.delete('/categories/:categoryId', requirePermission('categories', 'delete'), adminController.categoriesDelete);

router.get('/collections', requirePermission('collections', 'read'), adminController.collectionsList);
router.post('/collections', requirePermission('collections', 'write'), adminController.collectionsCreate);

router.get('/loans', requirePermission('loans', 'read'), adminController.loansList);
router.post('/loans', requirePermission('loans', 'write'), adminController.loansCreate);
router.post('/loans/:loanId/approve', requirePermission('loans', 'update'), adminController.loansApprove);

router.get('/loans/:loanId/repayments', requirePermission('repayments', 'read'), adminController.loanRepaymentsList);
router.post('/loans/:loanId/repayments', requirePermission('repayments', 'write'), adminController.loanRepaymentsCreate);

router.get('/expenses', requirePermission('expenses', 'read'), adminController.expensesList);
router.post('/expenses', requirePermission('expenses', 'write'), adminController.expensesCreate);

router.post('/transfers', requirePermission('collections', 'write'), adminController.transfersCreate);

router.get('/comments/threads', requirePermission('comments', 'read'), adminController.commentThreadsList);
router.post('/comments/threads', requirePermission('comments', 'write'), adminController.commentThreadsCreate);
router.get('/comments/threads/:threadId/messages', requirePermission('comments', 'read'), adminController.threadMessagesList);
router.post('/comments/threads/:threadId/messages', requirePermission('comments', 'write'), adminController.threadMessagesCreate);

router.get('/reports/period-collections', requirePermission('reports', 'read'), adminController.reportPeriodCollections);
router.get('/reports/members/financial-summary', requirePermission('reports', 'read'), adminController.memberFinancialSummary);
router.get('/reports/categories/due-summary', requirePermission('reports', 'read'), adminController.reportCategoryDueSummary);
router.get('/quran/weekly-report', requireRoles('super_admin', 'admin'), requirePermission('quran', 'read'), quranController.weeklyReport);
router.get('/quran/penalties', requireRoles('super_admin', 'admin'), requirePermission('quran', 'read'), quranController.penalties);
router.post('/quran/run-penalties', requireRoles('super_admin', 'admin'), requirePermission('quran', 'update'), quranController.runPenalties);

router.get('/roles-permissions', requireRoles('super_admin', 'admin'), adminController.rolesPermissions);

router.get('/access-control/modules', requireRoles('super_admin', 'admin'), adminController.accessModules);
router.get('/access-control/roles', requireRoles('super_admin', 'admin'), adminController.accessRoles);
router.get('/access-control/matrix', requireRoles('super_admin', 'admin'), adminController.accessMatrix);
router.put('/access-control/roles/:roleKey/permissions', requireRoles('super_admin', 'admin'), adminController.updateRolePermissionSet);
router.patch('/access-control/users/:userId/role', requireRoles('super_admin', 'admin'), adminController.updateUserRole);

module.exports = {
  adminRouter: router,
};
