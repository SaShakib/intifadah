const { query } = require('../../db/pool');
const { sha256 } = require('../../lib/hash');

async function getRoleByKey(roleKey) {
  const res = await query('SELECT id, role_key, role_name, is_internal FROM roles WHERE role_key = $1 LIMIT 1', [roleKey]);
  return res.rows[0] || null;
}

async function getRoleById(roleId) {
  const res = await query('SELECT id, role_key, role_name, is_internal FROM roles WHERE id = $1 LIMIT 1', [roleId]);
  return res.rows[0] || null;
}

async function getUserByIdentifier(identifier) {
  const normalized = String(identifier || '').trim().toLowerCase();
  const res = await query(
    `SELECT
      u.id,
      u.user_kind,
      u.role_id,
      u.organization_id,
      u.full_name,
      u.mobile,
      u.email,
      u.password_hash,
      u.gender,
      u.address_line,
      u.ward_no,
      u.photo_url,
      u.auth_provider,
      u.google_sub,
      u.is_active,
      u.joined_on,
      u.last_login_at,
      u.created_at,
      u.updated_at,
      r.role_key,
      r.role_name
    FROM app_users u
    JOIN roles r ON r.id = u.role_id
    WHERE lower(u.email) = $1 OR u.mobile = $2
    LIMIT 1`,
    [normalized, identifier],
  );
  return res.rows[0] || null;
}

async function getUserByGoogleSub(googleSub) {
  const res = await query(
    `SELECT
      u.id,
      u.user_kind,
      u.role_id,
      u.organization_id,
      u.full_name,
      u.mobile,
      u.email,
      u.password_hash,
      u.gender,
      u.address_line,
      u.ward_no,
      u.photo_url,
      u.auth_provider,
      u.google_sub,
      u.is_active,
      u.joined_on,
      u.last_login_at,
      u.created_at,
      u.updated_at,
      r.role_key,
      r.role_name
    FROM app_users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.google_sub = $1
    LIMIT 1`,
    [googleSub],
  );
  return res.rows[0] || null;
}

async function getUserById(id) {
  const res = await query(
    `SELECT
      u.id,
      u.user_kind,
      u.role_id,
      u.organization_id,
      u.full_name,
      u.mobile,
      u.email,
      u.password_hash,
      u.gender,
      u.address_line,
      u.ward_no,
      u.photo_url,
      u.auth_provider,
      u.google_sub,
      u.is_active,
      u.joined_on,
      u.last_login_at,
      u.created_at,
      u.updated_at,
      r.role_key,
      r.role_name
    FROM app_users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
    LIMIT 1`,
    [id],
  );
  return res.rows[0] || null;
}

async function createUser(payload) {
  const res = await query(
    `INSERT INTO app_users (
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
      photo_url,
      auth_provider,
      google_sub,
      is_active,
      joined_on
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE,CURRENT_DATE)
    RETURNING id`,
    [
      payload.userKind,
      payload.roleId,
      payload.organizationId || null,
      payload.fullName,
      payload.mobile,
      payload.email,
      payload.passwordHash,
      payload.gender,
      payload.addressLine || null,
      payload.wardNo || null,
      payload.photoUrl || null,
      payload.authProvider || 'password',
      payload.googleSub || null,
    ],
  );

  return res.rows[0];
}

async function updateUserRole(userId, roleId) {
  await query('UPDATE app_users SET role_id = $2, updated_at = NOW() WHERE id = $1', [userId, roleId]);
}

async function updateUserLastLogin(userId) {
  await query('UPDATE app_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [userId]);
}

async function updateUserProfile(userId, input) {
  await query(
    `UPDATE app_users
     SET
      full_name = COALESCE($2, full_name),
      mobile = COALESCE($3, mobile),
      email = COALESCE($4, email),
      gender = COALESCE($5, gender),
      address_line = COALESCE($6, address_line),
      ward_no = COALESCE($7, ward_no),
      photo_url = COALESCE($8, photo_url),
      updated_at = NOW()
     WHERE id = $1`,
    [
      userId,
      input.fullName,
      input.mobile,
      input.email,
      input.gender,
      input.addressLine,
      input.wardNo,
      input.photoUrl,
    ],
  );
}

async function updateUserPassword(userId, passwordHash) {
  await query(
    `UPDATE app_users
     SET password_hash = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [userId, passwordHash],
  );
}

async function updateUserAdmin(userId, input) {
  await query(
    `UPDATE app_users
     SET
      user_kind = COALESCE($2, user_kind),
      role_id = COALESCE($3, role_id),
      organization_id = COALESCE($4, organization_id),
      full_name = COALESCE($5, full_name),
      mobile = COALESCE($6, mobile),
      email = COALESCE($7, email),
      gender = COALESCE($8, gender),
      address_line = COALESCE($9, address_line),
      ward_no = COALESCE($10, ward_no),
      photo_url = COALESCE($11, photo_url),
      auth_provider = COALESCE($12, auth_provider),
      google_sub = COALESCE($13, google_sub),
      is_active = COALESCE($14, is_active),
      updated_at = NOW()
     WHERE id = $1`,
    [
      userId,
      input.userKind,
      input.roleId,
      input.organizationId,
      input.fullName,
      input.mobile,
      input.email,
      input.gender,
      input.addressLine,
      input.wardNo,
      input.photoUrl,
      input.authProvider,
      input.googleSub,
      input.isActive,
    ],
  );
}

async function storeRefreshToken({ userId, refreshToken, expiresAt, userAgent, ipAddress }) {
  const tokenHash = sha256(refreshToken);

  await query(
    `INSERT INTO auth_refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, expiresAt, userAgent || null, ipAddress || null],
  );

  return tokenHash;
}

async function getValidRefreshToken(refreshToken) {
  const tokenHash = sha256(refreshToken);
  const res = await query(
    `SELECT id, user_id, token_hash, expires_at, revoked_at
     FROM auth_refresh_tokens
     WHERE token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash],
  );

  return res.rows[0] || null;
}

async function revokeRefreshToken(refreshToken) {
  const tokenHash = sha256(refreshToken);
  await query(
    `UPDATE auth_refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1
       AND revoked_at IS NULL`,
    [tokenHash],
  );
}

async function revokeRefreshTokenById(tokenId) {
  await query(
    `UPDATE auth_refresh_tokens
     SET revoked_at = NOW()
     WHERE id = $1
       AND revoked_at IS NULL`,
    [tokenId],
  );
}

async function createPasswordResetOtp({ userId, code, expiresAt, ipAddress, userAgent }) {
  const codeHash = sha256(code);
  const res = await query(
    `INSERT INTO password_reset_otps (
      user_id,
      code_hash,
      expires_at,
      requested_ip,
      user_agent
    ) VALUES ($1,$2,$3,$4,$5)
    RETURNING id, user_id, expires_at, created_at`,
    [userId, codeHash, expiresAt, ipAddress || null, userAgent || null],
  );

  return res.rows[0];
}

async function getLatestValidPasswordResetOtp(userId, code) {
  const codeHash = sha256(code);
  const res = await query(
    `SELECT id, user_id, attempts, expires_at
     FROM password_reset_otps
     WHERE user_id = $1
       AND code_hash = $2
       AND consumed_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, codeHash],
  );

  return res.rows[0] || null;
}

async function incrementPasswordResetOtpAttempts(userId) {
  await query(
    `UPDATE password_reset_otps
     SET attempts = attempts + 1
     WHERE user_id = $1
       AND consumed_at IS NULL
       AND expires_at > NOW()`,
    [userId],
  );
}

async function consumePasswordResetOtp(otpId) {
  await query(
    `UPDATE password_reset_otps
     SET consumed_at = NOW()
     WHERE id = $1
       AND consumed_at IS NULL`,
    [otpId],
  );
}

async function consumePasswordResetOtpsForUser(userId) {
  await query(
    `UPDATE password_reset_otps
     SET consumed_at = NOW()
     WHERE user_id = $1
       AND consumed_at IS NULL`,
    [userId],
  );
}

module.exports = {
  getRoleByKey,
  getRoleById,
  getUserByIdentifier,
  getUserByGoogleSub,
  getUserById,
  createUser,
  updateUserRole,
  updateUserLastLogin,
  updateUserPassword,
  updateUserProfile,
  updateUserAdmin,
  storeRefreshToken,
  getValidRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokenById,
  createPasswordResetOtp,
  getLatestValidPasswordResetOtp,
  incrementPasswordResetOtpAttempts,
  consumePasswordResetOtp,
  consumePasswordResetOtpsForUser,
};
