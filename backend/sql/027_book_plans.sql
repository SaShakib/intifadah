BEGIN;

CREATE TABLE IF NOT EXISTS book_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  book_title VARCHAR(240) NOT NULL,
  book_author VARCHAR(180),
  book_cover_url VARCHAR(600),
  total_pages INTEGER NOT NULL CHECK (total_pages > 0),
  current_page INTEGER NOT NULL DEFAULT 0 CHECK (current_page >= 0),
  note TEXT,
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)), -- 0=active, 1=completed
  completed_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_plans_user
  ON book_plans (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_book_plans_book
  ON book_plans (book_id);

COMMIT;