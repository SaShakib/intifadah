BEGIN;

ALTER TABLE book_requests DROP CONSTRAINT IF EXISTS book_requests_status_check;
ALTER TABLE book_requests ADD CONSTRAINT book_requests_status_check CHECK (status IN (0, 1, 2, 3, 4, 5, 6, 7)); -- added 7 = cancelled

CREATE TABLE IF NOT EXISTS book_request_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES book_requests(id) ON DELETE CASCADE,
  action VARCHAR(40) NOT NULL,
  actor_user_id INTEGER REFERENCES app_users(id),
  note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_request_events_request ON book_request_events (request_id, created_at DESC);

COMMIT;