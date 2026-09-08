BEGIN;

CREATE TABLE IF NOT EXISTS namaj_penalty_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  penalty_per_missed_day_minor BIGINT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_namaj_penalty_runs_range UNIQUE (from_date, to_date)
);

CREATE TABLE IF NOT EXISTS namaj_penalties (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES namaj_penalty_runs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  missed_days SMALLINT NOT NULL CHECK (missed_days >= 0),
  penalty_minor BIGINT NOT NULL CHECK (penalty_minor >= 0),
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_namaj_penalties_run_user UNIQUE (run_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_namaj_penalties_user_date
  ON namaj_penalties (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS category_subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_due_on DATE,
  UNIQUE (category_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_category_subscriptions_due
  ON category_subscriptions (category_id, is_active, last_due_on);

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
  'Namaj penalty',
  2,
  0,
  5,
  FALSE,
  'Auto-created pending savings due for missed Namaj tracking days',
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE category_name = 'Namaj penalty' AND category_type = 2
);

UPDATE categories
SET category_type = 2,
    description = 'Auto-created pending savings due for missed Quran tracking days'
WHERE category_name = 'Quran penalty'
  AND category_type = 4;

UPDATE transactions t
SET tx_type = 3,
    status = 0,
    approved_by_user_id = NULL,
    approved_at = NULL
WHERE t.id IN (SELECT transaction_id FROM quran_penalties WHERE transaction_id IS NOT NULL);

COMMIT;
