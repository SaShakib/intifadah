BEGIN;

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS staff_role_id SMALLINT REFERENCES roles(id);

CREATE INDEX IF NOT EXISTS idx_app_users_staff_role
  ON app_users (staff_role_id)
  WHERE staff_role_id IS NOT NULL;

UPDATE role_permissions AS rp
SET perm_mask = 7
FROM roles AS r, app_modules AS m
WHERE rp.role_id = r.id
  AND rp.module_id = m.id
  AND r.role_key = 'manager'
  AND m.module_key IN ('dashboard', 'members', 'collections', 'loans', 'repayments', 'reports', 'categories', 'comments', 'expenses');

COMMIT;
