BEGIN;

CREATE TABLE IF NOT EXISTS book_featured (
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INT NOT NULL,
  created_by_user_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (book_id)
);

CREATE INDEX IF NOT EXISTS idx_book_featured_position
  ON book_featured (position);

COMMIT;