BEGIN;

CREATE TABLE IF NOT EXISTS book_activation_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  village VARCHAR(120) NOT NULL,
  ward_no SMALLINT NOT NULL CHECK (ward_no >= 0),
  father_name VARCHAR(120) NOT NULL,
  occupation_type VARCHAR(16) NOT NULL CHECK (occupation_type IN ('student', 'working', 'business')),
  institution_name VARCHAR(180),
  education_level VARCHAR(40),
  education_detail VARCHAR(80),
  profession_detail VARCHAR(180),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  created_by_user_id INTEGER REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_user_id INTEGER NOT NULL REFERENCES app_users(id),
  category_id INTEGER REFERENCES book_categories(id),
  title VARCHAR(240) NOT NULL,
  author_name VARCHAR(180),
  book_price_minor BIGINT NOT NULL CHECK (book_price_minor > 0),
  cover_url VARCHAR(600),
  cover_public_id VARCHAR(255),
  external_source VARCHAR(32),
  external_volume_id VARCHAR(120),
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2, 3)), -- available, reserved, lent, unavailable
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_listing ON books (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_owner ON books (owner_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS book_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  requester_user_id INTEGER NOT NULL REFERENCES app_users(id),
  requested_days SMALLINT NOT NULL CHECK (requested_days IN (3, 7, 10, 15, 30)),
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2, 3, 4, 5, 6)), -- pending, accepted, rejected, given, received, returned, lost
  owner_note VARCHAR(500),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  given_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  due_on DATE,
  returned_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_requests_book_status ON book_requests (book_id, status);
CREATE INDEX IF NOT EXISTS idx_book_requests_requester ON book_requests (requester_user_id, requested_at DESC);

CREATE TABLE IF NOT EXISTS book_request_extensions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES book_requests(id) ON DELETE CASCADE,
  requested_days SMALLINT NOT NULL CHECK (requested_days IN (3, 7, 10, 15, 30)),
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)), -- pending, accepted, rejected
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  owner_note VARCHAR(500)
);

COMMIT;
