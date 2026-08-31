BEGIN;

WITH internal_org AS (
  SELECT id FROM organizations WHERE org_type = 1 ORDER BY id LIMIT 1
)
INSERT INTO app_users (
  user_kind,
  role_id,
  organization_id,
  full_name,
  mobile,
  email,
  password_hash,
  gender,
  address_line,
  ward_no,
  is_active
)
VALUES
  (
    1,
    (SELECT id FROM roles WHERE role_key = 'super_admin'),
    (SELECT id FROM internal_org),
    'Super Admin',
    '01700000001',
    'superadmin@intifadah.org',
    '85bafae72f292ddd0849fbea43f6cb5e:ca42a49bec0f739821a95cd0d7aa819eafa86f9fbffc6847a27e5de09afb60ddc8bf6612a8616f90592253db8fe06168144eb3f1589214e1fd7d3c5df3578c7b',
    0,
    'ঢাকা',
    1,
    TRUE
  ),
  (
    1,
    (SELECT id FROM roles WHERE role_key = 'member_internal'),
    (SELECT id FROM internal_org),
    'ইনতিফাদাহ সদস্য',
    '01700000003',
    'internal@intifadah.org',
    'c6dd0c1c0e615d97efb4aa2e235b4056:2bedfa80d43259e6a8c88b5d01351bd1f61aa27686b296634f67958640c88e8c55c3a6d9fef40253969125111e79c00f6baf64df62a455a788acf0164b282e60',
    0,
    'ঢাকা',
    2,
    TRUE
  ),
  (
    2,
    (SELECT id FROM roles WHERE role_key = 'general_user'),
    NULL,
    'সাধারণ সদস্য',
    '01700000002',
    'user@intifadah.org',
    '0338421f2c3faf6b619717d6e2ef8a84:c8955e7230e84481cfbd53a15bba055d9f24849d3a732e0ee8e757242e88dc09bf7f23be9fe2c7de9a65f2fd3ab913c681c099986acebfd2cdcd735c4ca4d742',
    0,
    'ঢাকা',
    3,
    TRUE
  ),
  (
    3,
    (SELECT id FROM roles WHERE role_key = 'org_user'),
    (SELECT id FROM internal_org),
    'সংগঠন সদস্য',
    '01700000004',
    'org@intifadah.org',
    '734648217259afd9f04f5f607c00eb18:5d621d21e6d825a60f8cc200ecf2cab2fa19dd8c8a570a519657be4d5c9e27168decfbabb8193153ccd4427d6a6780224c180d71a7ec09677fd529872891baa9',
    0,
    'ঢাকা',
    4,
    TRUE
  )
ON CONFLICT (mobile) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  is_active = TRUE,
  updated_at = NOW();

INSERT INTO categories (
  category_name,
  category_type,
  recurrence_type,
  amount_fixed,
  is_amount_variable,
  description,
  created_by_user_id
)
SELECT name, category_type, recurrence_type, amount_fixed, is_amount_variable, description, admin_id
FROM (
  VALUES
    ('দান তহবিল', 1, 0, NULL::BIGINT, TRUE, 'সাধারণ দান সংগ্রহ'),
    ('ব্যক্তিগত সঞ্চয়', 2, 3, 2000::BIGINT, TRUE, 'মাসিক সঞ্চয়'),
    ('কর্যে হাসানাঃ ঋণ', 3, 0, NULL::BIGINT, TRUE, 'সুদমুক্ত ঋণ'),
    ('অপারেশন ব্যয়', 4, 0, NULL::BIGINT, TRUE, 'প্রশাসনিক ব্যয়')
) AS seed(name, category_type, recurrence_type, amount_fixed, is_amount_variable, description)
CROSS JOIN (
  SELECT id AS admin_id FROM app_users WHERE email = 'superadmin@intifadah.org' LIMIT 1
) AS admin_user
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.category_name = seed.name
);

INSERT INTO transactions (
  tx_type,
  status,
  actor_user_id,
  subject_user_id,
  category_id,
  amount_minor,
  occurred_on,
  approved_by_user_id,
  approved_at,
  note
)
SELECT
  3,
  1,
  admin_user.id,
  member_user.id,
  savings_category.id,
  2000,
  CURRENT_DATE,
  admin_user.id,
  NOW(),
  'Seed monthly savings'
FROM app_users admin_user
CROSS JOIN app_users member_user
CROSS JOIN categories savings_category
WHERE admin_user.email = 'superadmin@intifadah.org'
  AND member_user.mobile = '01700000002'
  AND savings_category.category_name = 'ব্যক্তিগত সঞ্চয়'
  AND NOT EXISTS (
    SELECT 1
    FROM transactions t
    WHERE t.subject_user_id = member_user.id
      AND t.category_id = savings_category.id
      AND t.note = 'Seed monthly savings'
  );

INSERT INTO loans (
  borrower_user_id,
  category_id,
  principal_minor,
  purpose,
  requested_on,
  issued_on,
  due_on,
  term_days,
  status,
  approved_by_user_id,
  approved_at
)
SELECT
  member_user.id,
  loan_category.id,
  10000,
  'কর্যে হাসানাঃ জরুরি সহায়তা',
  CURRENT_DATE - INTERVAL '20 days',
  CURRENT_DATE - INTERVAL '19 days',
  CURRENT_DATE + INTERVAL '40 days',
  90,
  1,
  admin_user.id,
  NOW()
FROM app_users member_user
CROSS JOIN app_users admin_user
CROSS JOIN categories loan_category
WHERE member_user.mobile = '01700000002'
  AND admin_user.email = 'superadmin@intifadah.org'
  AND loan_category.category_name = 'কর্যে হাসানাঃ ঋণ'
  AND NOT EXISTS (
    SELECT 1
    FROM loans l
    WHERE l.borrower_user_id = member_user.id
      AND l.purpose = 'কর্যে হাসানাঃ জরুরি সহায়তা'
  );

COMMIT;
