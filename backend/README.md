# Intifadah Backend (Express + PostgreSQL on Neon)

Storage-optimized, memory-conscious backend for Vercel free deployment.

## Key Features

- PostgreSQL schema optimized for low storage overhead:
  - `SMALLINT` enums for status/type fields
  - `BIGINT` minor units for money (no float errors)
  - partial/targeted indexes for common filters
  - permission bitmask (`read/write/update/delete`)
- JWT access token + rotating refresh token auth
- Email OTP password reset via Resend
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
# set the full Neon connection string, including password, and update JWT secrets
npm run db:migrate
npm run dev
```

Demo seed accounts created by `002_seed_demo_data.sql`:

- Admin: `superadmin@intifadah.org` / `Passw0rd!123`
- User: `01700000002` / `Passw0rd!123`
- Internal type-1 member: `01700000003` / `Passw0rd!123`

Email settings:

- `RESEND_API_KEY`
- `MAIL_FROM=Intifadah <noreply@mail.intifadah.org>`
- `PASSWORD_RESET_OTP_TTL_MINUTES=10`

Google sign-in:

- Backend: `GOOGLE_CLIENT_ID`
- Frontend: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

Realtime notifications:

- Backend: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- Frontend: `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`

Quran tracking scheduler:

- Daily reminder: every day at 9:00 PM in `QURAN_CRON_TIMEZONE`
- Weekly penalty: every Friday at 12:10 AM, for the previous seven days excluding the current Friday
- Penalty amount: `QURAN_PENALTY_PER_MISSED_DAY_MINOR=5`

## Endpoints

### System
- `GET /`
- `GET /health`
- `GET /db/health`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Admin (protected)
- `GET /admin/dashboard/summary`
- `GET /admin/members`
- `POST /admin/members`
- `GET /admin/members/:userId`
- `PATCH /admin/members/:userId`
- `DELETE /admin/members/:userId`
- `GET /admin/members/financial-summary`
- `GET /admin/categories`
- `POST /admin/categories`
- `PATCH /admin/categories/:categoryId`
- `DELETE /admin/categories/:categoryId`
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
- `GET /admin/quran/weekly-report`
- `GET /admin/quran/penalties`
- `POST /admin/quran/run-penalties`
- `GET /admin/roles-permissions` (admin/super admin only)
- `GET /admin/access-control/modules` (admin/super admin only)
- `GET /admin/access-control/roles` (admin/super admin only)
- `GET /admin/access-control/matrix` (admin/super admin only)
- `PUT /admin/access-control/roles/:roleKey/permissions` (admin/super admin only)
- `PATCH /admin/access-control/users/:userId/role` (admin/super admin only)

### User (protected)
- `GET /user/dashboard/summary`
- `GET /user/categories`
- `GET /user/transactions`
- `POST /user/transactions`
- `GET /user/loans`
- `POST /user/loans`
- `GET /user/loans/:loanId/repayments`
- `POST /user/loans/:loanId/repayments`
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
- `POST /user/pusher/auth`
- `GET /user/quran/progress`
- `POST /user/quran/progress`

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
- `password_reset_otps`
- `quran_progress`
- `quran_penalty_runs`
- `quran_penalties`

View:
- `v_member_financial_summary`

## Vercel Deployment

- Entry: `api/index.js`
- Config: `vercel.json`
- Keep `PG_CONNECTION_LIMIT=1` on free/serverless to avoid connection spikes.
