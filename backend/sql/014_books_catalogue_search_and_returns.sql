BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS canonical_key VARCHAR(300),
  ADD COLUMN IF NOT EXISTS search_text TEXT;

UPDATE books
SET
  canonical_key = COALESCE(NULLIF(canonical_key, ''), regexp_replace(lower(title), '[[:space:][:punct:]]+', '', 'g')),
  search_text = COALESCE(NULLIF(search_text, ''), concat_ws(' ', title, author_name));

ALTER TABLE books
  ALTER COLUMN canonical_key SET NOT NULL,
  ALTER COLUMN search_text SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_books_canonical_key ON books (canonical_key);
CREATE INDEX IF NOT EXISTS idx_books_search_vector ON books USING GIN (to_tsvector('simple', search_text));
CREATE INDEX IF NOT EXISTS idx_books_search_trgm ON books USING GIN (search_text gin_trgm_ops);

ALTER TABLE book_requests
  ADD COLUMN IF NOT EXISTS request_group_id UUID,
  ADD COLUMN IF NOT EXISTS return_initiated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS return_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS return_received_by_user_id INTEGER REFERENCES app_users(id);

CREATE INDEX IF NOT EXISTS idx_book_requests_group_status ON book_requests (request_group_id, status);

ALTER TABLE book_requests DROP CONSTRAINT IF EXISTS book_requests_status_check;
ALTER TABLE book_requests
  ADD CONSTRAINT book_requests_status_check CHECK (status IN (0, 1, 2, 3, 4, 5, 6, 7));

COMMIT;
