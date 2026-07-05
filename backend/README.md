# Intifadah Backend (Express + PostgreSQL on Aiven)

Storage-optimized, memory-conscious backend for Vercel free deployment.

## Key Features

- PostgreSQL schema optimized for low storage overhead:
  - `SMALLINT` enums for status/type fields
  - `BIGINT` minor units for money (no float errors)
  - partial/targeted indexes for common filters
  - permission bitmask (`read/write/update/delete`)
- JWT access token + rotating refresh token auth
- Role-based + module-permission-based access control
- Super admin / admin auto-assignment by email from `.env`
- Request interceptor middleware (request ID + slow request logs)
- Vercel-ready Express entry (`api/index.js`)
- Clean architecture:
  - `routes` (HTTP mapping + middleware only)
  - `controllers` (request/response shaping)
  - `services` (business rules)
  - `repositories` (data access provider)
  - provider switch via `DATA_PROVIDER` (currently `postgres`)

## Roles and User Kinds

- User kinds:
  - `1`: internal member
  - `2`: general user
  - `3`: organization user
- Role override by email:
  - `SUPERADMIN_EMAILS`
  - `ADMIN_EMAILS`

If email matches env list, role is assigned automatically on login/registration.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# update JWT secrets before production
npm run db:migrate
npm run dev
```

## Endpoints

### System
- `GET /`
- `GET /health`
- `GET /db/health`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Admin (protected)
- `GET /admin/dashboard/summary`
- `GET /admin/members`
- `GET /admin/members/:userId`
- `GET /admin/members/financial-summary`
- `GET /admin/categories`
- `POST /admin/categories`
- `PATCH /admin/categories/:categoryId`
- `GET /admin/collections`
- `POST /admin/collections`
- `GET /admin/loans`
- `POST /admin/loans`
- `POST /admin/loans/:loanId/approve`
- `GET /admin/loans/:loanId/repayments`
- `POST /admin/loans/:loanId/repayments`
- `GET /admin/expenses`
- `POST /admin/expenses`
- `POST /admin/transfers`
- `GET /admin/comments/threads`
- `POST /admin/comments/threads`
- `GET /admin/comments/threads/:threadId/messages`
- `POST /admin/comments/threads/:threadId/messages`
- `GET /admin/reports/period-collections`
- `GET /admin/reports/members/financial-summary`
- `GET /admin/reports/categories/due-summary`
- `GET /admin/roles-permissions` (super admin only)
- `GET /admin/access-control/modules` (super admin only)
- `GET /admin/access-control/roles` (super admin only)
- `GET /admin/access-control/matrix` (super admin only)
- `PUT /admin/access-control/roles/:roleKey/permissions` (super admin only)
- `PATCH /admin/access-control/users/:userId/role` (super admin only)

### User (protected)
- `GET /user/dashboard/summary`
- `GET /user/categories`
- `GET /user/transactions`
- `POST /user/transactions`
- `GET /user/loans`
- `POST /user/loans`
- `GET /user/loans/:loanId/repayments`
- `GET /user/expenses`
- `POST /user/expenses`
- `GET /user/comments/threads`
- `POST /user/comments/threads`
- `GET /user/comments/threads/:threadId/messages`
- `POST /user/comments/threads/:threadId/messages`
- `GET /user/reports/collections`
- `GET /user/reports/loans`
- `GET /user/profile`
- `PATCH /user/profile`
- `GET /user/notifications`
- `PATCH /user/notifications/:notificationId/read`

## Authentication Flow

1. Login returns `accessToken` + `refreshToken`
2. Use access token in `Authorization: Bearer ...`
3. If access token expires, call `/auth/refresh` with refresh token
4. If refresh is valid, new token pair is returned
5. Only if both invalid => user must sign in again

See example interceptor:
- `examples/frontend-refresh-interceptor.ts`

## Access Control Middleware

- `requireAuth`
- `requireRoles(...roles)`
- `requireSuperAdmin`
- `requirePermission(moduleKey, action)`
- `requireAnyPermission(moduleKey, actions[])`
- `requireSelfOrPermission({ moduleKey, action, userIdParam })`

Dynamic permission changes by super admin are applied from DB and permission cache is invalidated immediately after update.

## Data Provider Swap

All business logic now depends on repository interfaces from `src/repositories/index.js`.

- current: `DATA_PROVIDER=postgres`
- to add another DB:
  - create `src/repositories/<provider>/...`
  - export same repository contract keys as postgres
  - extend `createRepositories()` switch

Routes/controllers/services stay unchanged when switching providers.

## Database Tables (PRD mapping)

- `app_users`, `roles`, `app_modules`, `role_permissions`
- `categories`
- `transactions`
- `loans`, `loan_repayments`
- `expense_entries`
- `transfer_links`
- `comment_threads`, `comments`
- `notifications`
- `audit_logs`
- `auth_refresh_tokens`

View:
- `v_member_financial_summary`

## Vercel Deployment

- Entry: `api/index.js`
- Config: `vercel.json`
- Keep `PG_CONNECTION_LIMIT=1` on free/serverless to avoid connection spikes.
