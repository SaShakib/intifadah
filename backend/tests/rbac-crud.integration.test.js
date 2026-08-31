const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');

const runId = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const SUPER_ADMIN_EMAIL = `super.${runId}@example.test`;
const ADMIN_EMAIL = `admin.${runId}@example.test`;
const PASSWORD = 'TestPass123!';

process.env.NODE_ENV = 'test';
process.env.SUPERADMIN_EMAILS = SUPER_ADMIN_EMAIL;
process.env.ADMIN_EMAILS = ADMIN_EMAIL;

const request = require('supertest');
const { createApp } = require('../src/app');
const { env } = require('../src/config/env');
const { runMigrations } = require('../src/db/migrations');
const { pool } = require('../src/db/pool');

const app = createApp();

let mobileCounter = 0;
const mobileSeed = `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10_000)
  .toString()
  .padStart(4, '0')}`;
const actors = {};

function nextMobile() {
  mobileCounter += 1;
  return `017${mobileSeed}${String(mobileCounter).padStart(3, '0')}`;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

function assertStatus(response, expectedStatus, context) {
  assert.equal(
    response.status,
    expectedStatus,
    `${context}\nExpected ${expectedStatus}, got ${response.status}\nBody: ${JSON.stringify(response.body)}`,
  );
}

function api(method, path, { token, query, body } = {}) {
  let req = request(app)[method](path);

  if (token) {
    req = req.set(bearer(token));
  }

  if (query) {
    req = req.query(query);
  }

  if (body !== undefined) {
    req = req.send(body);
  }

  return req;
}

async function registerUser({
  fullName,
  email,
  userKind = 2,
  password = PASSWORD,
}) {
  const response = await api('post', '/auth/register', {
    body: {
      fullName,
      mobile: nextMobile(),
      email,
      password,
      userKind,
    },
  });

  assertStatus(response, 201, `register ${fullName}`);
  return response.body;
}

async function loginUser(identifier, password = PASSWORD) {
  const response = await api('post', '/auth/login', {
    body: {
      identifier,
      password,
    },
  });

  assertStatus(response, 200, `login ${identifier}`);
  return response.body;
}

async function setUserRole(userId, roleKey, userKind) {
  const roleResponse = await pool.query(
    'SELECT id, role_key, role_name FROM roles WHERE role_key = $1 LIMIT 1',
    [roleKey],
  );
  const role = roleResponse.rows[0];
  assert.ok(role, `${roleKey} role should exist`);

  await pool.query(
    `UPDATE app_users
     SET role_id = $2,
         user_kind = COALESCE($3, user_kind),
         updated_at = NOW()
     WHERE id = $1`,
    [userId, role.id, userKind ?? null],
  );

  return role;
}

function applyActorRole(actor, role, userKind) {
  actor.user.roleId = role.id;
  actor.user.roleKey = role.role_key;
  actor.user.roleName = role.role_name;
  if (userKind !== undefined && userKind !== null) {
    actor.user.userKind = userKind;
  }
}

function collectRoleEvents(notifications, targetUserId) {
  return new Set(
    notifications
      .map((row) => row.payload_json || {})
      .filter((payload) => payload.userId === targetUserId || payload.borrowerUserId === targetUserId)
      .map((payload) => payload.event)
      .filter(Boolean),
  );
}

before(async () => {
  await runMigrations();

  actors.superAdmin = await registerUser({
    fullName: `Super ${runId}`,
    email: SUPER_ADMIN_EMAIL,
    userKind: 2,
  });

  actors.admin = await registerUser({
    fullName: `Admin ${runId}`,
    email: ADMIN_EMAIL,
    userKind: 2,
  });

  actors.managerCandidate = await registerUser({
    fullName: `Manager ${runId}`,
    email: `manager.${runId}@example.test`,
    userKind: 2,
  });

  actors.memberInternal = await registerUser({
    fullName: `Internal ${runId}`,
    email: `internal.${runId}@example.test`,
    userKind: 1,
  });

  actors.generalUser = await registerUser({
    fullName: `General ${runId}`,
    email: `general.${runId}@example.test`,
    userKind: 2,
  });

  actors.orgUser = await registerUser({
    fullName: `Org ${runId}`,
    email: `org.${runId}@example.test`,
    userKind: 3,
  });

  actors.publicDefaults = {
    superAdminRoleKey: actors.superAdmin.user.roleKey,
    adminRoleKey: actors.admin.user.roleKey,
    memberInternalRoleKey: actors.memberInternal.user.roleKey,
    orgUserRoleKey: actors.orgUser.user.roleKey,
    memberInternalUserKind: actors.memberInternal.user.userKind,
    orgUserUserKind: actors.orgUser.user.userKind,
  };

  applyActorRole(actors.superAdmin, await setUserRole(actors.superAdmin.user.id, 'super_admin', 1), 1);
  applyActorRole(actors.admin, await setUserRole(actors.admin.user.id, 'admin', 1), 1);
  applyActorRole(actors.memberInternal, await setUserRole(actors.memberInternal.user.id, 'member_internal', 1), 1);
  applyActorRole(actors.orgUser, await setUserRole(actors.orgUser.user.id, 'org_user', 3), 3);

  const promoteManager = await api(
    'patch',
    `/admin/access-control/users/${actors.managerCandidate.user.id}/role`,
    {
      token: actors.superAdmin.tokens.accessToken,
      body: { roleKey: 'manager' },
    },
  );

  assertStatus(promoteManager, 200, 'promote manager candidate');
  actors.manager = await loginUser(actors.managerCandidate.user.email);
});

after(async () => {
  await pool.end();
});

test('PRD role and CRUD integration coverage', async (t) => {
  await t.test('public registration defaults to normal user before admin promotion', async () => {
    assert.equal(actors.publicDefaults.superAdminRoleKey, 'general_user');
    assert.equal(actors.publicDefaults.adminRoleKey, 'general_user');
    assert.equal(actors.publicDefaults.memberInternalRoleKey, 'general_user');
    assert.equal(actors.publicDefaults.orgUserRoleKey, 'general_user');
    assert.equal(actors.publicDefaults.memberInternalUserKind, 2);
    assert.equal(actors.publicDefaults.orgUserUserKind, 2);

    assert.equal(actors.memberInternal.user.roleKey, 'member_internal');
    assert.equal(actors.generalUser.user.roleKey, 'general_user');
    assert.equal(actors.orgUser.user.roleKey, 'org_user');

    assert.ok(env.superAdminEmails.includes(SUPER_ADMIN_EMAIL));
    assert.ok(env.adminEmails.includes(ADMIN_EMAIL));
    assert.equal(actors.superAdmin.user.roleKey, 'super_admin');
    assert.equal(actors.admin.user.roleKey, 'admin');
  });

  await t.test('enforces role boundary checks for admin and super admin areas', async () => {
    const superModules = await api('get', '/admin/access-control/modules', {
      token: actors.superAdmin.tokens.accessToken,
    });
    assertStatus(superModules, 200, 'super admin should access access-control/modules');

    const adminModules = await api('get', '/admin/access-control/modules', {
      token: actors.admin.tokens.accessToken,
    });
    assertStatus(adminModules, 200, 'admin should access permission management endpoint');

    const generalAdminDashboard = await api('get', '/admin/dashboard/summary', {
      token: actors.generalUser.tokens.accessToken,
    });
    assertStatus(generalAdminDashboard, 403, 'general user should be forbidden from /admin');

    const managerAdminDashboard = await api('get', '/admin/dashboard/summary', {
      token: actors.manager.tokens.accessToken,
    });
    assertStatus(managerAdminDashboard, 200, 'manager should access /admin/dashboard/summary');
  });

  await t.test('applies dynamic permission changes immediately and supports restore', async () => {
    const matrixResponse = await api('get', '/admin/access-control/matrix', {
      token: actors.superAdmin.tokens.accessToken,
    });
    assertStatus(matrixResponse, 200, 'fetch access-control matrix');

    const generalRole = matrixResponse.body.rows.find((row) => row.roleKey === 'general_user');
    assert.ok(generalRole, 'general_user role should exist');

    const collectionsPermission = generalRole.permissions.find((permission) => permission.moduleKey === 'collections');
    assert.ok(collectionsPermission, 'general_user.collections permission should exist');

    const originalMask = Number(collectionsPermission.permMask);

    try {
      const disableCollections = await api('put', '/admin/access-control/roles/general_user/permissions', {
        token: actors.superAdmin.tokens.accessToken,
        body: {
          permissions: [
            {
              moduleKey: 'collections',
              permMask: 0,
            },
          ],
          replaceAll: false,
        },
      });
      assertStatus(disableCollections, 200, 'disable general_user collections permissions');

      const blockedTransactions = await api('get', '/user/transactions', {
        token: actors.generalUser.tokens.accessToken,
      });
      assertStatus(blockedTransactions, 403, 'general user should lose /user/transactions after permission update');
    } finally {
      const restoreCollections = await api('put', '/admin/access-control/roles/general_user/permissions', {
        token: actors.superAdmin.tokens.accessToken,
        body: {
          permissions: [
            {
              moduleKey: 'collections',
              permMask: originalMask,
            },
          ],
          replaceAll: false,
        },
      });
      assertStatus(restoreCollections, 200, 'restore general_user collections permissions');
    }

    const unblockedTransactions = await api('get', '/user/transactions', {
      token: actors.generalUser.tokens.accessToken,
    });
    assertStatus(unblockedTransactions, 200, 'general user should regain /user/transactions after restore');
  });

  await t.test('keeps super-admin-assigned user role after re-login', async () => {
    const promoted = await registerUser({
      fullName: `Promoted ${runId}`,
      email: `promoted.${runId}@example.test`,
      userKind: 2,
    });

    const assignManager = await api('patch', `/admin/access-control/users/${promoted.user.id}/role`, {
      token: actors.superAdmin.tokens.accessToken,
      body: {
        roleKey: 'manager',
      },
    });
    assertStatus(assignManager, 200, 'assign manager role to promoted user');

    const relogin = await loginUser(promoted.user.email);
    assert.equal(relogin.user.roleKey, 'manager');

    const managerDashboard = await api('get', '/admin/dashboard/summary', {
      token: relogin.tokens.accessToken,
    });
    assertStatus(managerDashboard, 200, 're-logged assigned manager should access /admin/dashboard/summary');
  });

  await t.test('covers PRD CRUD and reporting smoke across admin and user routes', async () => {
    const adminToken = actors.admin.tokens.accessToken;
    const userToken = actors.generalUser.tokens.accessToken;

    const createCollectionCategory = await api('post', '/admin/categories', {
      token: adminToken,
      body: {
        categoryName: `Donation ${runId}`,
        categoryType: 1,
        recurrenceType: 1,
        dueIntervalDays: 30,
        isAmountVariable: true,
        description: 'Collection category for integration test',
      },
    });
    assertStatus(createCollectionCategory, 201, 'create admin collection category');
    const collectionCategoryId = createCollectionCategory.body.row.id;

    const createLoanCategory = await api('post', '/admin/categories', {
      token: adminToken,
      body: {
        categoryName: `Loan ${runId}`,
        categoryType: 3,
        recurrenceType: 0,
        isAmountVariable: true,
      },
    });
    assertStatus(createLoanCategory, 201, 'create admin loan category');
    const loanCategoryId = createLoanCategory.body.row.id;

    const createExpenseCategory = await api('post', '/admin/categories', {
      token: adminToken,
      body: {
        categoryName: `Expense ${runId}`,
        categoryType: 4,
        recurrenceType: 0,
        isAmountVariable: true,
      },
    });
    assertStatus(createExpenseCategory, 201, 'create admin expense category');
    const expenseCategoryId = createExpenseCategory.body.row.id;

    const createTransferCategory = await api('post', '/admin/categories', {
      token: adminToken,
      body: {
        categoryName: `Transfer ${runId}`,
        categoryType: 1,
        recurrenceType: 0,
        isAmountVariable: true,
      },
    });
    assertStatus(createTransferCategory, 201, 'create admin transfer target category');
    const transferCategoryId = createTransferCategory.body.row.id;

    const categoriesList = await api('get', '/admin/categories', {
      token: adminToken,
    });
    assertStatus(categoriesList, 200, 'list admin categories');
    assert.ok(categoriesList.body.rows.some((row) => Number(row.id) === Number(collectionCategoryId)));

    const updateCategory = await api('patch', `/admin/categories/${collectionCategoryId}`, {
      token: adminToken,
      body: {
        description: 'Updated collection category',
      },
    });
    assertStatus(updateCategory, 200, 'update admin category');
    assert.equal(updateCategory.body.row.description, 'Updated collection category');

    const userCategories = await api('get', '/user/categories', { token: userToken });
    assertStatus(userCategories, 200, 'list user categories');

    const adminCollection = await api('post', '/admin/collections', {
      token: adminToken,
      body: {
        txType: 2,
        subjectUserId: actors.generalUser.user.id,
        categoryId: collectionCategoryId,
        amountMinor: 5000,
        note: 'Admin collection entry',
      },
    });
    assertStatus(adminCollection, 201, 'create admin collection entry');

    const adminCollections = await api('get', '/admin/collections', {
      token: adminToken,
      query: {
        subjectUserId: actors.generalUser.user.id,
      },
    });
    assertStatus(adminCollections, 200, 'list admin collections');
    assert.ok(adminCollections.body.rows.some((row) => Number(row.id) === Number(adminCollection.body.row.id)));

    const userTransaction = await api('post', '/user/transactions', {
      token: userToken,
      body: {
        txType: 2,
        categoryId: collectionCategoryId,
        amountMinor: 700,
        note: 'User donation',
      },
    });
    assertStatus(userTransaction, 201, 'create user transaction');

    const userTransactions = await api('get', '/user/transactions', {
      token: userToken,
    });
    assertStatus(userTransactions, 200, 'list user transactions');
    assert.ok(userTransactions.body.rows.some((row) => Number(row.id) === Number(userTransaction.body.row.id)));

    const dueOn = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const userLoan = await api('post', '/user/loans', {
      token: userToken,
      body: {
        categoryId: loanCategoryId,
        principalMinor: 2000,
        purpose: 'Loan for emergency',
        dueOn,
      },
    });
    assertStatus(userLoan, 201, 'create user loan request');
    const loanId = userLoan.body.row.id;

    const adminLoans = await api('get', '/admin/loans', {
      token: adminToken,
      query: {
        borrowerUserId: actors.generalUser.user.id,
      },
    });
    assertStatus(adminLoans, 200, 'list admin loans');
    assert.ok(adminLoans.body.rows.some((row) => Number(row.id) === Number(loanId)));

    const approveLoan = await api('post', `/admin/loans/${loanId}/approve`, {
      token: adminToken,
      body: {
        note: 'Approved by integration test',
      },
    });
    assertStatus(approveLoan, 200, 'approve loan');

    const addRepayment = await api('post', `/admin/loans/${loanId}/repayments`, {
      token: adminToken,
      body: {
        amountMinor: 500,
        note: 'Repayment recording',
      },
    });
    assertStatus(addRepayment, 201, 'create loan repayment');

    const userRepayments = await api('get', `/user/loans/${loanId}/repayments`, {
      token: userToken,
    });
    assertStatus(userRepayments, 200, 'list user loan repayment history');
    assert.ok(userRepayments.body.rows.some((row) => Number(row.loan_id) === Number(loanId)));

    const userExpense = await api('post', '/user/expenses', {
      token: userToken,
      body: {
        categoryId: expenseCategoryId,
        amountMinor: 320,
        note: 'User expense',
      },
    });
    assertStatus(userExpense, 201, 'create user expense');

    const userExpenses = await api('get', '/user/expenses', {
      token: userToken,
    });
    assertStatus(userExpenses, 200, 'list user expenses');
    assert.ok(userExpenses.body.rows.some((row) => Number(row.id) === Number(userExpense.body.row.id)));

    const adminExpense = await api('post', '/admin/expenses', {
      token: adminToken,
      body: {
        subjectUserId: actors.generalUser.user.id,
        categoryId: expenseCategoryId,
        amountMinor: 950,
        note: 'Admin expense',
      },
    });
    assertStatus(adminExpense, 201, 'create admin expense');

    const adminExpenses = await api('get', '/admin/expenses', {
      token: adminToken,
      query: {
        subjectUserId: actors.generalUser.user.id,
      },
    });
    assertStatus(adminExpenses, 200, 'list admin expenses');
    assert.ok(adminExpenses.body.rows.some((row) => Number(row.id) === Number(adminExpense.body.row.id)));

    const transfer = await api('post', '/admin/transfers', {
      token: adminToken,
      body: {
        fromUserId: actors.generalUser.user.id,
        toUserId: actors.memberInternal.user.id,
        fromCategoryId: collectionCategoryId,
        toCategoryId: transferCategoryId,
        amountMinor: 220,
        note: 'Admin transfer',
      },
    });
    assertStatus(transfer, 201, 'create transfer');
    assert.ok(transfer.body.data.outTxId);
    assert.ok(transfer.body.data.inTxId);

    const thread = await api('post', '/user/comments/threads', {
      token: userToken,
      body: {
        subject: `Help needed ${runId}`,
      },
    });
    assertStatus(thread, 201, 'create user comment thread');
    const threadId = thread.body.row.id;

    const userMessage = await api('post', `/user/comments/threads/${threadId}/messages`, {
      token: userToken,
      body: {
        messageBody: 'First user message',
      },
    });
    assertStatus(userMessage, 201, 'create user thread message');

    const userThreadMessages = await api('get', `/user/comments/threads/${threadId}/messages`, {
      token: userToken,
    });
    assertStatus(userThreadMessages, 200, 'list user thread messages');
    assert.ok(userThreadMessages.body.rows.some((row) => Number(row.id) === Number(userMessage.body.row.id)));

    const adminThreads = await api('get', '/admin/comments/threads', {
      token: adminToken,
    });
    assertStatus(adminThreads, 200, 'list admin comment threads');
    assert.ok(adminThreads.body.rows.some((row) => Number(row.id) === Number(threadId)));

    const adminMessage = await api('post', `/admin/comments/threads/${threadId}/messages`, {
      token: adminToken,
      body: {
        messageBody: 'Admin reply',
      },
    });
    assertStatus(adminMessage, 201, 'create admin thread message');

    const adminThreadMessages = await api('get', `/admin/comments/threads/${threadId}/messages`, {
      token: adminToken,
    });
    assertStatus(adminThreadMessages, 200, 'list admin thread messages');
    assert.ok(adminThreadMessages.body.rows.some((row) => Number(row.id) === Number(adminMessage.body.row.id)));

    const updateProfile = await api('patch', '/user/profile', {
      token: userToken,
      body: {
        fullName: `General Updated ${runId}`,
        addressLine: 'Dhaka',
      },
    });
    assertStatus(updateProfile, 200, 'update user profile');
    assert.equal(updateProfile.body.user.fullName, `General Updated ${runId}`);

    const profile = await api('get', '/user/profile', { token: userToken });
    assertStatus(profile, 200, 'get user profile');
    assert.equal(profile.body.user.fullName, `General Updated ${runId}`);

    const userReportCollections = await api('get', '/user/reports/collections', { token: userToken });
    assertStatus(userReportCollections, 200, 'user collections report');

    const userReportLoans = await api('get', '/user/reports/loans', { token: userToken });
    assertStatus(userReportLoans, 200, 'user loans report');

    const adminMembers = await api('get', '/admin/members', { token: adminToken });
    assertStatus(adminMembers, 200, 'admin members list');

    const adminReportCollections = await api('get', '/admin/reports/period-collections', {
      token: adminToken,
    });
    assertStatus(adminReportCollections, 200, 'admin period collections report');

    const adminReportDue = await api('get', '/admin/reports/categories/due-summary', {
      token: adminToken,
    });
    assertStatus(adminReportDue, 200, 'admin category due summary report');

    const adminNotifications = await api('get', '/user/notifications', {
      token: adminToken,
      query: { unread: true },
    });
    assertStatus(adminNotifications, 200, 'admin notifications list');

    const superAdminNotifications = await api('get', '/user/notifications', {
      token: actors.superAdmin.tokens.accessToken,
      query: { unread: true },
    });
    assertStatus(superAdminNotifications, 200, 'super admin notifications list');

    const managerNotifications = await api('get', '/user/notifications', {
      token: actors.manager.tokens.accessToken,
      query: { unread: true },
    });
    assertStatus(managerNotifications, 200, 'manager notifications list');

    const expectedEvents = [
      'user_transaction_created',
      'loan_request_created',
      'user_expense_created',
      'comment_thread_created',
    ];

    const adminEventSet = collectRoleEvents(adminNotifications.body.rows, actors.generalUser.user.id);
    const superEventSet = collectRoleEvents(superAdminNotifications.body.rows, actors.generalUser.user.id);
    const managerEventSet = collectRoleEvents(managerNotifications.body.rows, actors.generalUser.user.id);

    for (const eventName of expectedEvents) {
      assert.ok(adminEventSet.has(eventName), `admin should receive ${eventName}`);
      assert.ok(superEventSet.has(eventName), `super admin should receive ${eventName}`);
      assert.ok(managerEventSet.has(eventName), `manager should receive ${eventName}`);
    }

    assert.ok(adminNotifications.body.rows.length > 0, 'admin should have at least one notification');
    const markRead = await api('patch', `/user/notifications/${adminNotifications.body.rows[0].id}/read`, {
      token: adminToken,
    });
    assertStatus(markRead, 200, 'mark admin notification as read');
    assert.equal(markRead.body.row.is_read, true);
  });
});
