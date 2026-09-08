BEGIN;

CREATE TABLE IF NOT EXISTS savings_due_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subscription_id BIGINT NOT NULL REFERENCES category_subscriptions(id) ON DELETE CASCADE,
  due_on DATE NOT NULL,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_savings_due_runs_subscription_date UNIQUE (subscription_id, due_on)
);

COMMIT;
