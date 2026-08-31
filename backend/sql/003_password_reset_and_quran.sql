BEGIN;

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  code_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts SMALLINT NOT NULL DEFAULT 0,
  requested_ip INET,
  user_agent VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_user_valid
  ON password_reset_otps (user_id, expires_at DESC)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS quran_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pages_read SMALLINT,
  surah_name VARCHAR(120),
  minutes_read SMALLINT,
  note VARCHAR(300),
  is_done BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_quran_progress_user_date UNIQUE (user_id, progress_date),
  CONSTRAINT chk_quran_pages_nonnegative CHECK (pages_read IS NULL OR pages_read >= 0),
  CONSTRAINT chk_quran_minutes_nonnegative CHECK (minutes_read IS NULL OR minutes_read >= 0)
);

CREATE INDEX IF NOT EXISTS idx_quran_progress_date_user
  ON quran_progress (progress_date DESC, user_id);

INSERT INTO app_modules (id, module_key, module_name)
VALUES (11, 'quran', 'Quran Progress')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permissions (role_id, module_id, perm_mask)
SELECT r.id, 11,
  CASE
    WHEN r.role_key IN ('super_admin', 'admin') THEN 15
    WHEN r.role_key IN ('manager', 'member_internal', 'general_user', 'org_user') THEN 3
    ELSE 0
  END
FROM roles r
ON CONFLICT (role_id, module_id) DO NOTHING;

COMMIT;
