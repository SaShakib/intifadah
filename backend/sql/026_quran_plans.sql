BEGIN;

CREATE TABLE IF NOT EXISTS quran_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  plan_name VARCHAR(120) NOT NULL,
  goal_type SMALLINT NOT NULL DEFAULT 1 CHECK (goal_type IN (1, 2)), -- 1=recitation (pages), 2=memorization (ayat)
  from_ref VARCHAR(80),
  to_ref VARCHAR(80),
  surah_reference VARCHAR(120),
  total_target INTEGER NOT NULL CHECK (total_target > 0),
  note TEXT,
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)), -- 0=active, 1=completed
  completed_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quran_plans_user
  ON quran_plans (user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS quran_plan_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES quran_plans(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_quran_plan_progress_plan_date UNIQUE (plan_id, record_date)
);

CREATE INDEX IF NOT EXISTS idx_quran_plan_progress_plan
  ON quran_plan_progress (plan_id, record_date DESC);

COMMIT;