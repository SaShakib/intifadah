BEGIN;

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(24) NOT NULL DEFAULT 'password',
  ADD COLUMN IF NOT EXISTS google_sub VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_google_sub
  ON app_users (google_sub)
  WHERE google_sub IS NOT NULL;

CREATE TABLE IF NOT EXISTS quran_penalty_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  penalty_per_missed_day_minor BIGINT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_quran_penalty_runs_range UNIQUE (from_date, to_date)
);

CREATE TABLE IF NOT EXISTS quran_penalties (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES quran_penalty_runs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  missed_days SMALLINT NOT NULL CHECK (missed_days >= 0),
  penalty_minor BIGINT NOT NULL CHECK (penalty_minor >= 0),
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_quran_penalties_run_user UNIQUE (run_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_quran_penalties_user_date
  ON quran_penalties (user_id, created_at DESC);

INSERT INTO categories (
  category_name,
  category_type,
  recurrence_type,
  amount_fixed,
  is_amount_variable,
  description,
  is_active
)
SELECT
  'Quran penalty',
  4,
  0,
  5,
  FALSE,
  'Auto-created penalty category for missed Quran tracking days',
  TRUE
WHERE NOT EXISTS (
  SELECT 1
  FROM categories
  WHERE category_name = 'Quran penalty'
    AND category_type = 4
);

COMMIT;
