BEGIN;

-- Book houses and book listings are immediately active; migrate existing records too.
UPDATE book_activation_profiles SET approval_status = 1 WHERE approval_status <> 1;
UPDATE books SET approval_status = 1 WHERE approval_status <> 1;

ALTER TABLE book_activation_profiles ALTER COLUMN approval_status SET DEFAULT 1;
ALTER TABLE books ALTER COLUMN approval_status SET DEFAULT 1;

COMMIT;
