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
      is_active,
      joined_on
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,CURRENT_DATE)
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
      email = COALESCE($3, email),
      gender = COALESCE($4, gender),
      address_line = COALESCE($5, address_line),
      ward_no = COALESCE($6, ward_no),
      photo_url = COALESCE($7, photo_url),
      updated_at = NOW()
     WHERE id = $1`,
    [
      userId,
      input.fullName,
      input.email,
      input.gender,
      input.addressLine,
      input.wardNo,
      input.photoUrl,
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

module.exports = {
  getRoleByKey,
  getRoleById,
  getUserByIdentifier,
  getUserById,
  createUser,
  updateUserRole,
  updateUserLastLogin,
  updateUserProfile,
  storeRefreshToken,
  getValidRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokenById,
};
