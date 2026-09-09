BEGIN;

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_user_id INTEGER REFERENCES app_users(id);

CREATE INDEX IF NOT EXISTS idx_books_active_listing
  ON books (approval_status, status, created_at DESC)
  WHERE deleted_at IS NULL;

COMMIT;
