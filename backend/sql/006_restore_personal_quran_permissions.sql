BEGIN;

UPDATE role_permissions AS rp
SET perm_mask = CASE
  WHEN r.role_key IN ('super_admin', 'admin') THEN 15
  WHEN r.role_key IN ('manager', 'member_internal', 'general_user', 'org_user') THEN 3
  ELSE 0
END
FROM roles AS r
JOIN app_modules AS m ON m.module_key = 'quran'
WHERE rp.role_id = r.id
  AND rp.module_id = m.id;

COMMIT;
