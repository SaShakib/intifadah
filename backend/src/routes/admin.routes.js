const express = require('express');
const { requireAuth, requirePermission, requireRoles, requireSuperAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(requireAuth);
router.use(requireRoles('super_admin', 'admin', 'manager'));

router.get('/dashboard/summary', requirePermission('dashboard', 'read'), adminController.dashboardSummary);

router.get('/members', requirePermission('members', 'read'), adminController.membersList);
router.get('/members/financial-summary', requirePermission('reports', 'read'), adminController.memberFinancialSummary);
router.get('/members/:userId', requirePermission('members', 'read'), adminController.memberDetails);

router.get('/categories', requirePermission('categories', 'read'), adminController.categoriesList);
router.post('/categories', requirePermission('categories', 'write'), adminController.categoriesCreate);
router.patch('/categories/:categoryId', requirePermission('categories', 'update'), adminController.categoriesUpdate);

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

router.get('/roles-permissions', requireSuperAdmin, adminController.rolesPermissions);

router.get('/access-control/modules', requireSuperAdmin, adminController.accessModules);
router.get('/access-control/roles', requireSuperAdmin, adminController.accessRoles);
router.get('/access-control/matrix', requireSuperAdmin, adminController.accessMatrix);
router.put('/access-control/roles/:roleKey/permissions', requireSuperAdmin, adminController.updateRolePermissionSet);
router.patch('/access-control/users/:userId/role', requireSuperAdmin, adminController.updateUserRole);

module.exports = {
  adminRouter: router,
};
