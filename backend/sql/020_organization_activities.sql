BEGIN;

CREATE TABLE IF NOT EXISTS organization_activities (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  image_public_id VARCHAR(255),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id INTEGER NOT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organization_activities_public
  ON organization_activities (is_published, created_at DESC);

COMMIT;
