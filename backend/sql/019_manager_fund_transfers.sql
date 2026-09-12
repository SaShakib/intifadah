BEGIN;

CREATE TABLE IF NOT EXISTS fund_transfers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_user_id INTEGER NOT NULL REFERENCES app_users(id),
  to_user_id INTEGER NOT NULL REFERENCES app_users(id),
  initiated_by_user_id INTEGER NOT NULL REFERENCES app_users(id),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)), -- 0=pending, 1=received, 2=rejected
  transferred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  note VARCHAR(500),
  received_by_user_id INTEGER REFERENCES app_users(id),
  received_at TIMESTAMPTZ,
  receiver_note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fund_transfers_distinct_holders CHECK (from_user_id <> to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_fund_transfers_recipient_status
  ON fund_transfers (to_user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fund_transfers_sender_date
  ON fund_transfers (from_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS fund_transfer_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fund_transfer_id BIGINT NOT NULL REFERENCES fund_transfers(id) ON DELETE CASCADE,
  actor_user_id INTEGER NOT NULL REFERENCES app_users(id),
  event_type SMALLINT NOT NULL CHECK (event_type IN (1, 2, 3)), -- 1=created, 2=received, 3=rejected
  note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fund_transfer_events_transfer_date
  ON fund_transfer_events (fund_transfer_id, created_at ASC);

COMMIT;
