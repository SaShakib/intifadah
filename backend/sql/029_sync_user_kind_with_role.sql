BEGIN;

-- Editing only the role in the admin member form used to leave user_kind
-- unchanged. Intifadah-only features filter by user_kind, so realign every
-- base-role account with its role.
UPDATE app_users AS u
SET user_kind = CASE r.role_key
      WHEN 'member_internal' THEN 1
      WHEN 'general_user' THEN 2
      WHEN 'org_user' THEN 3
    END,
    updated_at = NOW()
FROM roles AS r
WHERE u.role_id = r.id
  AND r.role_key IN ('member_internal', 'general_user', 'org_user')
  AND u.user_kind IS DISTINCT FROM CASE r.role_key
      WHEN 'member_internal' THEN 1
      WHEN 'general_user' THEN 2
      WHEN 'org_user' THEN 3
    END;

-- Admin/Manager duty can only be linked to an Intifadah member account.
-- Drop links left behind on accounts that are no longer Intifadah members.
UPDATE app_users AS u
SET staff_role_id = NULL,
    updated_at = NOW()
FROM roles AS r
WHERE u.role_id = r.id
  AND u.staff_role_id IS NOT NULL
  AND (r.role_key <> 'member_internal' OR u.user_kind <> 1);

COMMIT;
