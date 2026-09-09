BEGIN;

ALTER TABLE category_subscriptions
  ADD COLUMN IF NOT EXISTS amount_override_minor BIGINT;

ALTER TABLE category_subscriptions
  DROP CONSTRAINT IF EXISTS category_subscriptions_amount_override_positive;

ALTER TABLE category_subscriptions
  ADD CONSTRAINT category_subscriptions_amount_override_positive
  CHECK (amount_override_minor IS NULL OR amount_override_minor > 0);

COMMIT;
