BEGIN;

CREATE TABLE IF NOT EXISTS quran_memorization_sections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  surah_name VARCHAR(120) NOT NULL,
  from_ayah INTEGER,
  to_ayah INTEGER,
  mushaf_page INTEGER,
  page_half SMALLINT CHECK (page_half IN (1, 2)),
  from_line INTEGER,
  to_line INTEGER,
  memorized_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_date DATE,
  next_review_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day')::date,
  interval_level SMALLINT NOT NULL DEFAULT 0,
  current_interval_days INTEGER NOT NULL DEFAULT 1,
  recall_quality VARCHAR(16),
  error_count INTEGER NOT NULL DEFAULT 0,
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quran_memorization_sections_user_due
  ON quran_memorization_sections (user_id, next_review_date, status);

CREATE INDEX IF NOT EXISTS idx_quran_memorization_sections_user_memorized
  ON quran_memorization_sections (user_id, memorized_date DESC);

CREATE TABLE IF NOT EXISTS quran_memorization_reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section_id BIGINT NOT NULL REFERENCES quran_memorization_sections(id) ON DELETE CASCADE,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  result VARCHAR(16) NOT NULL CHECK (result IN ('strong', 'shaky', 'weak', 'failed')),
  error_count INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quran_memorization_reviews_section
  ON quran_memorization_reviews (section_id, review_date DESC, id DESC);

COMMIT;
