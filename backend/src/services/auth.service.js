const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { hashPassword, verifyPassword } = require('../lib/hash');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../lib/jwt');
const { repositories } = require('../repositories');

const { authRepository } = repositories;

const ROLE_BY_KIND = {
  1: 'member_internal',
  2: 'general_user',
  3: 'org_user',
};

function normalizeEmail(email) {
  return email ? String(email).trim().toLowerCase() : null;
}

function resolveEmailRoleOverride(email) {
  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail && env.superAdminEmails.includes(normalizedEmail)) {
    return 'super_admin';
  }

  if (normalizedEmail && env.adminEmails.includes(normalizedEmail)) {
    return 'admin';
  }

  return null;
}

function resolveRegistrationRoleKey({ email, userKind }) {
  return resolveEmailRoleOverride(email) || ROLE_BY_KIND[userKind] || 'general_user';
}

function resolveLoginRoleKey({ email, currentRoleKey }) {
  return resolveEmailRoleOverride(email) || currentRoleKey;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    mobile: user.mobile,
    email: user.email,
    userKind: user.user_kind,
    roleId: user.role_id,
    roleKey: user.role_key,
    roleName: user.role_name,
    organizationId: user.organization_id,
    gender: user.gender,
    addressLine: user.address_line,
    wardNo: user.ward_no,
    photoUrl: user.photo_url,
    isActive: user.is_active,
    joinedOn: user.joined_on,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
  };
}

function getRefreshExpiryDate(refreshToken) {
  const decoded = jwt.decode(refreshToken);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + env.refreshTokenDays);
  return expires;
}

async function issueTokenPair(user, context) {
  const payload = {
    sub: user.id,
    userKind: user.user_kind,
    roleId: user.role_id,
    roleKey: user.role_key,
    email: user.email,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user.id, roleId: user.role_id, roleKey: user.role_key });
  const refreshExpiresAt = getRefreshExpiryDate(refreshToken);

  await authRepository.storeRefreshToken({
    userId: user.id,
    refreshToken,
    expiresAt: refreshExpiresAt,
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenType: 'Bearer',
    accessExpiresIn: env.jwtAccessTtl,
    refreshExpiresAt,
  };
}

function getContextFromRequest(req) {
  return {
    userAgent: req.headers['user-agent'] || null,
    ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
  };
}

async function registerUser(input, req) {
  const fullName = String(input.fullName || '').trim();
  const mobile = String(input.mobile || '').trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');
  const userKind = Number(input.userKind || 2);
  const gender = Number(input.gender || 0);

  if (!fullName || !mobile || !password) {
    const error = new Error('fullName, mobile and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters');
    error.statusCode = 400;
    throw error;
  }

  const existing = await authRepository.getUserByIdentifier(email || mobile);
  if (existing) {
    const error = new Error('User already exists with email/mobile');
    error.statusCode = 409;
    throw error;
  }

  const roleKey = resolveRegistrationRoleKey({ email, userKind });
  const role = await authRepository.getRoleByKey(roleKey);
  if (!role) {
    const error = new Error(`Role not configured: ${roleKey}`);
    error.statusCode = 500;
    throw error;
  }

  const passwordHash = hashPassword(password);
  const inserted = await authRepository.createUser({
    userKind,
    roleId: role.id,
    organizationId: input.organizationId ? Number(input.organizationId) : null,
    fullName,
    mobile,
    email,
    passwordHash,
    gender,
    addressLine: input.addressLine,
    wardNo: input.wardNo ? Number(input.wardNo) : null,
    photoUrl: input.photoUrl,
  });

  const createdUser = await authRepository.getUserById(inserted.id);
  const tokens = await issueTokenPair(createdUser, getContextFromRequest(req));

  return {
    user: sanitizeUser(createdUser),
    tokens,
  };
}

async function loginUser(input, req) {
  const identifier = String(input.identifier || '').trim();
  const password = String(input.password || '');

  if (!identifier || !password) {
    const error = new Error('identifier and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.getUserByIdentifier(identifier);
  if (!user || !user.is_active) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const desiredRoleKey = resolveLoginRoleKey({ email: user.email, currentRoleKey: user.role_key });
  if (desiredRoleKey !== user.role_key) {
    const desiredRole = await authRepository.getRoleByKey(desiredRoleKey);
    if (desiredRole && desiredRole.id !== user.role_id) {
      await authRepository.updateUserRole(user.id, desiredRole.id);
    }
  }

  await authRepository.updateUserLastLogin(user.id);
  const freshUser = await authRepository.getUserById(user.id);
  const tokens = await issueTokenPair(freshUser, getContextFromRequest(req));

  return {
    user: sanitizeUser(freshUser),
    tokens,
  };
}

async function refreshSession(input, req) {
  const refreshToken = String(input.refreshToken || '').trim();
  if (!refreshToken) {
    const error = new Error('refreshToken is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const tokenRecord = await authRepository.getValidRefreshToken(refreshToken);
  if (!tokenRecord || Number(decoded.sub) !== tokenRecord.user_id) {
    const error = new Error('Refresh token expired or revoked');
    error.statusCode = 401;
    throw error;
  }

  const user = await authRepository.getUserById(tokenRecord.user_id);
  if (!user || !user.is_active) {
    const error = new Error('User is inactive');
    error.statusCode = 401;
    throw error;
  }

  await authRepository.revokeRefreshTokenById(tokenRecord.id);
  const tokens = await issueTokenPair(user, getContextFromRequest(req));

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

async function logoutSession(input) {
  const refreshToken = String(input.refreshToken || '').trim();
  if (!refreshToken) {
    return { success: true };
  }

  await authRepository.revokeRefreshToken(refreshToken);
  return { success: true };
}

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logoutSession,
  sanitizeUser,
};
