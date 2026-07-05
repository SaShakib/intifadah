BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SMALLINT PRIMARY KEY,
  role_key VARCHAR(32) NOT NULL UNIQUE,
  role_name VARCHAR(64) NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_modules (
  id SMALLINT PRIMARY KEY,
  module_key VARCHAR(32) NOT NULL UNIQUE,
  module_name VARCHAR(64) NOT NULL
);

-- bitmask: read=1, write=2, update=4, delete=8
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_id SMALLINT NOT NULL REFERENCES app_modules(id) ON DELETE CASCADE,
  perm_mask SMALLINT NOT NULL DEFAULT 1 CHECK (perm_mask BETWEEN 0 AND 15),
  PRIMARY KEY (role_id, module_id)
);

CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org_name VARCHAR(120) NOT NULL,
  org_type SMALLINT NOT NULL DEFAULT 1 CHECK (org_type IN (1, 2)), -- 1=intifadah, 2=external
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_kind SMALLINT NOT NULL CHECK (user_kind IN (1, 2, 3)), -- 1=internal, 2=general, 3=organization
  role_id SMALLINT NOT NULL REFERENCES roles(id),
  organization_id INTEGER NULL REFERENCES organizations(id),
  full_name VARCHAR(120) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(160),
  password_hash VARCHAR(255) NOT NULL,
  gender SMALLINT NOT NULL DEFAULT 0 CHECK (gender IN (0, 1, 2, 3)), -- 0=unknown,1=male,2=female,3=other
  address_line VARCHAR(255),
  ward_no SMALLINT,
  photo_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_on DATE NOT NULL DEFAULT CURRENT_DATE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_app_users_mobile UNIQUE (mobile)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_email_lower
  ON app_users ((LOWER(email)))
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_users_kind_role
  ON app_users (user_kind, role_id)
  WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_name VARCHAR(120) NOT NULL,
  category_type SMALLINT NOT NULL CHECK (category_type IN (1, 2, 3, 4, 5)),
  recurrence_type SMALLINT NOT NULL DEFAULT 0 CHECK (recurrence_type IN (0, 1, 2, 3, 4)),
  due_interval_days SMALLINT,
  amount_fixed BIGINT,
  is_amount_variable BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id INTEGER REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_type_active
  ON categories (category_type, is_active);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tx_type SMALLINT NOT NULL CHECK (tx_type IN (1, 2, 3, 4, 5, 6, 7, 8, 9)),
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)), -- 0=pending,1=approved,2=rejected
  actor_user_id INTEGER NOT NULL REFERENCES app_users(id),
  subject_user_id INTEGER NOT NULL REFERENCES app_users(id),
  category_id INTEGER REFERENCES categories(id),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  source_holder_user_id INTEGER REFERENCES app_users(id),
  target_holder_user_id INTEGER REFERENCES app_users(id),
  approved_by_user_id INTEGER REFERENCES app_users(id),
  approved_at TIMESTAMPTZ,
  note VARCHAR(500),
  meta_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_subject_date
  ON transactions (subject_user_id, occurred_on DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category_date
  ON transactions (category_id, occurred_on DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_pending
  ON transactions (status, created_at)
  WHERE status = 0;

CREATE TABLE IF NOT EXISTS loans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  borrower_user_id INTEGER NOT NULL REFERENCES app_users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  principal_minor BIGINT NOT NULL CHECK (principal_minor > 0),
  purpose VARCHAR(255) NOT NULL,
  requested_on DATE NOT NULL DEFAULT CURRENT_DATE,
  issued_on DATE,
  due_on DATE NOT NULL,
  term_days SMALLINT,
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2, 3, 4)), -- 0=pending,1=active,2=repaid,3=overdue,4=cancelled
  disbursed_tx_id BIGINT UNIQUE REFERENCES transactions(id),
  approved_by_user_id INTEGER REFERENCES app_users(id),
  approved_at TIMESTAMPTZ,
  total_repaid_minor BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_borrower_status_due
  ON loans (borrower_user_id, status, due_on);

CREATE INDEX IF NOT EXISTS idx_loans_status_due
  ON loans (status, due_on);

CREATE TABLE IF NOT EXISTS loan_repayments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  repayment_tx_id BIGINT NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by_user_id INTEGER REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan_date
  ON loan_repayments (loan_id, paid_on DESC);

CREATE TABLE IF NOT EXISTS expense_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  expense_tx_id BIGINT NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  expense_type SMALLINT NOT NULL DEFAULT 1,
  description VARCHAR(300),
  receipt_url VARCHAR(255),
  created_by_user_id INTEGER REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transfer_links (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transfer_tx_id BIGINT NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  from_category_id INTEGER NOT NULL REFERENCES categories(id),
  to_category_id INTEGER NOT NULL REFERENCES categories(id),
  from_user_id INTEGER NOT NULL REFERENCES app_users(id),
  to_user_id INTEGER NOT NULL REFERENCES app_users(id),
  approved_by_user_id INTEGER REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comment_threads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject VARCHAR(160) NOT NULL,
  created_by_user_id INTEGER NOT NULL REFERENCES app_users(id),
  assigned_to_user_id INTEGER REFERENCES app_users(id),
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)), -- 0=open,1=pending,2=closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_threads_creator_status
  ON comment_threads (created_by_user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES comment_threads(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES app_users(id),
  message_body VARCHAR(2000) NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_thread_date
  ON comments (thread_id, created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipient_user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  notif_type SMALLINT NOT NULL,
  payload_json JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read
  ON notifications (recipient_user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id INTEGER REFERENCES app_users(id),
  action_type SMALLINT NOT NULL,
  entity_type SMALLINT NOT NULL,
  entity_id BIGINT,
  before_json JSONB,
  after_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_date
  ON audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  user_agent VARCHAR(200),
  ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_expiry
  ON auth_refresh_tokens (user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_valid
  ON auth_refresh_tokens (token_hash)
  WHERE revoked_at IS NULL;

-- Financial summary view for member-wise report pages
CREATE OR REPLACE VIEW v_member_financial_summary AS
SELECT
  u.id AS user_id,
  u.full_name,
  COALESCE(SUM(CASE WHEN t.tx_type IN (1, 2, 3) AND t.status = 1 THEN t.amount_minor ELSE 0 END), 0) AS total_deposit_minor,
  COALESCE(SUM(CASE WHEN t.tx_type IN (4, 8, 7) AND t.status = 1 THEN t.amount_minor ELSE 0 END), 0) AS total_withdraw_minor,
  COALESCE(SUM(CASE WHEN t.tx_type = 5 AND t.status = 1 THEN t.amount_minor ELSE 0 END), 0) AS total_repaid_minor
FROM app_users u
LEFT JOIN transactions t ON t.subject_user_id = u.id
GROUP BY u.id, u.full_name;

INSERT INTO roles (id, role_key, role_name, is_internal)
VALUES
  (1, 'super_admin', 'Super Admin', TRUE),
  (2, 'admin', 'Admin', TRUE),
  (3, 'manager', 'Manager', TRUE),
  (4, 'member_internal', 'Internal Member', TRUE),
  (5, 'general_user', 'General User', FALSE),
  (6, 'org_user', 'Organization User', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_modules (id, module_key, module_name)
VALUES
  (1, 'dashboard', 'Dashboard'),
  (2, 'members', 'Members'),
  (3, 'collections', 'Fund Collection'),
  (4, 'loans', 'Loans'),
  (5, 'repayments', 'Repayments'),
  (6, 'reports', 'Reports'),
  (7, 'categories', 'Categories'),
  (8, 'roles_permissions', 'Roles & Permissions'),
  (9, 'comments', 'Comments'),
  (10, 'expenses', 'Expenses')
ON CONFLICT (id) DO NOTHING;

-- super_admin full permissions for all modules
INSERT INTO role_permissions (role_id, module_id, perm_mask)
SELECT 1, m.id, 15 FROM app_modules m
ON CONFLICT (role_id, module_id) DO NOTHING;

-- admin default permissions (full except roles_permissions)
INSERT INTO role_permissions (role_id, module_id, perm_mask)
SELECT 2, m.id,
  CASE WHEN m.module_key = 'roles_permissions' THEN 0 ELSE 15 END
FROM app_modules m
ON CONFLICT (role_id, module_id) DO NOTHING;

-- manager defaults
INSERT INTO role_permissions (role_id, module_id, perm_mask)
SELECT 3, m.id,
  CASE
    WHEN m.module_key IN ('dashboard', 'members', 'collections', 'loans', 'repayments', 'reports', 'categories', 'comments', 'expenses') THEN 7
    ELSE 0
  END
FROM app_modules m
ON CONFLICT (role_id, module_id) DO NOTHING;

-- internal member defaults
INSERT INTO role_permissions (role_id, module_id, perm_mask)
SELECT 4, m.id,
  CASE
    WHEN m.module_key IN ('dashboard', 'collections', 'loans', 'repayments', 'comments', 'expenses') THEN 3
    WHEN m.module_key = 'categories' THEN 1
    ELSE 0
  END
FROM app_modules m
ON CONFLICT (role_id, module_id) DO NOTHING;

-- general and org users
INSERT INTO role_permissions (role_id, module_id, perm_mask)
SELECT r.id, m.id,
  CASE
    WHEN m.module_key IN ('dashboard', 'collections', 'loans', 'repayments', 'comments', 'expenses') THEN 3
    WHEN m.module_key = 'categories' THEN 1
    ELSE 0
  END
FROM roles r
CROSS JOIN app_modules m
WHERE r.id IN (5, 6)
ON CONFLICT (role_id, module_id) DO NOTHING;

-- default internal organization row
INSERT INTO organizations (org_name, org_type)
SELECT 'ইনতিফাদাহ', 1
WHERE NOT EXISTS (
  SELECT 1 FROM organizations WHERE org_type = 1
);

COMMIT;
