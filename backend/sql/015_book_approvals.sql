BEGIN;

ALTER TABLE book_activation_profiles
  ADD COLUMN IF NOT EXISTS approval_status SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id INTEGER REFERENCES app_users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note VARCHAR(500);

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS approval_status SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id INTEGER REFERENCES app_users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note VARCHAR(500);

UPDATE book_activation_profiles SET approval_status = 1 WHERE approval_status = 0;
UPDATE books SET approval_status = 1 WHERE approval_status = 0;

ALTER TABLE book_activation_profiles ALTER COLUMN approval_status SET DEFAULT 0;
ALTER TABLE books ALTER COLUMN approval_status SET DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_book_activation_approval ON book_activation_profiles (approval_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_approval_listing ON books (approval_status, created_at DESC);

COMMIT;
