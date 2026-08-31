const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { env } = require('../config/env');
const { hashPassword, randomToken, sha256, verifyPassword } = require('../lib/hash');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../lib/jwt');
const { repositories } = require('../repositories');
const { sendPasswordResetOtpEmail, sendTemporaryPasswordEmail } = require('./mail.service');

const { authRepository } = repositories;

const ROLE_BY_KIND = {
  1: 'member_internal',
  2: 'general_user',
  3: 'org_user',
};

let googleClient = null;

function getGoogleClient() {
  if (!env.googleClientId) {
    return null;
  }

  if (!googleClient) {
    googleClient = new OAuth2Client(env.googleClientId);
  }

  return googleClient;
}

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
    authProvider: user.auth_provider,
    googleSub: user.google_sub,
    needsProfileCompletion: needsProfileCompletion(user),
    isActive: user.is_active,
    joinedOn: user.joined_on,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
  };
}

function needsProfileCompletion(user) {
  return user?.auth_provider === 'google'
    && (!user.full_name || !user.mobile || user.mobile.startsWith('g-') || !user.address_line);
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

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
  const refreshToken = signRefreshToken({
    sub: user.id,
    roleId: user.role_id,
    roleKey: user.role_key,
    jti: randomToken(16),
  });
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
  const providedPassword = String(input.password || '').trim();
  const password = providedPassword || `Int-${randomToken(9)}1a`;
  const userKind = 2;
  const gender = Number(input.gender || 0);

  if (!fullName || !mobile) {
    const error = new Error('fullName and mobile are required');
    error.statusCode = 400;
    throw error;
  }

  if (providedPassword && password.length < 8) {
    const error = new Error('Password must be at least 8 characters');
    error.statusCode = 400;
    throw error;
  }

  const existingByMobile = await authRepository.getUserByIdentifier(mobile);
  const existingByEmail = email ? await authRepository.getUserByIdentifier(email) : null;
  if (existingByMobile || existingByEmail) {
    const error = new Error('User already exists with email/mobile');
    error.statusCode = 409;
    throw error;
  }

  const roleKey = 'general_user';
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
    authProvider: 'password',
  });

  const createdUser = await authRepository.getUserById(inserted.id);
  if (!providedPassword && email) {
    try {
      await sendTemporaryPasswordEmail({ to: email, fullName, password });
    } catch (error) {
      console.error(`Could not send temporary password to ${email}:`, error.message);
    }
  }
  const tokens = await issueTokenPair(createdUser, getContextFromRequest(req));

  return {
    user: sanitizeUser(createdUser),
    tokens,
  };
}

async function verifyGoogleCredential(idToken) {
  const client = getGoogleClient();
  if (!client) {
    const error = new Error('Google login is not configured');
    error.statusCode = 503;
    throw error;
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub) {
    const error = new Error('Invalid Google token');
    error.statusCode = 401;
    throw error;
  }

  return payload;
}

async function loginWithGoogle(input, req) {
  const idToken = String(input.idToken || input.credential || '').trim();
  if (!idToken) {
    const error = new Error('idToken is required');
    error.statusCode = 400;
    throw error;
  }

  const profile = await verifyGoogleCredential(idToken);
  const googleSub = String(profile.sub);
  const email = normalizeEmail(profile.email);
  const emailVerified = profile.email_verified === true || profile.email_verified === 'true';

  let user = await authRepository.getUserByGoogleSub(googleSub);
  if (!user && email) {
    user = await authRepository.getUserByIdentifier(email);
    if (user && !emailVerified) {
      const error = new Error('Google email verification is required');
      error.statusCode = 401;
      throw error;
    }
    if (user && !user.google_sub) {
      await authRepository.updateUserAdmin(user.id, {
        authProvider: 'google',
        googleSub,
        photoUrl: profile.picture || undefined,
      });
      user = await authRepository.getUserById(user.id);
    } else if (user && user.google_sub !== googleSub) {
      const error = new Error('This email is already linked to another Google account');
      error.statusCode = 409;
      throw error;
    }
  }

  if (!user) {
    const fullName = String(input.fullName || profile.name || email || 'Google User').trim();
    const mobile = String(input.mobile || '').trim() || `g-${sha256(googleSub).slice(0, 18)}`;
    const existingByMobile = await authRepository.getUserByIdentifier(mobile);
    if (existingByMobile) {
      const error = new Error('User already exists with this mobile');
      error.statusCode = 409;
      throw error;
    }

    const role = await authRepository.getRoleByKey('general_user');
    if (!role) {
      const error = new Error('Role not configured: general_user');
      error.statusCode = 500;
      throw error;
    }

    const created = await authRepository.createUser({
      userKind: 2,
      roleId: role.id,
      organizationId: null,
      fullName,
      mobile,
      email,
      passwordHash: hashPassword(`Google-${randomToken(18)}1a`),
      gender: 0,
      addressLine: input.addressLine,
      wardNo: input.wardNo ? Number(input.wardNo) : null,
      photoUrl: profile.picture || input.photoUrl,
      authProvider: 'google',
      googleSub,
    });

    user = await authRepository.getUserById(created.id);
  }

  if (!user.is_active) {
    const error = new Error('User is inactive');
    error.statusCode = 401;
    throw error;
  }

  await authRepository.updateUserLastLogin(user.id);
  const freshUser = await authRepository.getUserById(user.id);
  const tokens = await issueTokenPair(freshUser, getContextFromRequest(req));

  return {
    user: sanitizeUser(freshUser),
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

async function requestPasswordReset(input, req) {
  const identifier = String(input.identifier || input.email || '').trim();
  if (!identifier) {
    const error = new Error('identifier is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.getUserByIdentifier(identifier);
  if (!user || !user.is_active || !user.email) {
    return { message: 'If the account has an email, an OTP has been sent.' };
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.passwordResetOtpTtlMinutes * 60 * 1000);
  await authRepository.createPasswordResetOtp({
    userId: user.id,
    code: otp,
    expiresAt,
    userAgent: req.headers['user-agent'] || null,
    ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
  });

  await sendPasswordResetOtpEmail({
    to: user.email,
    fullName: user.full_name,
    otp,
    ttlMinutes: env.passwordResetOtpTtlMinutes,
  });

  return { message: 'If the account has an email, an OTP has been sent.' };
}

async function resetPasswordWithOtp(input) {
  const identifier = String(input.identifier || input.email || '').trim();
  const otp = String(input.otp || '').trim();
  const password = String(input.password || '');

  if (!identifier || !otp || !password) {
    const error = new Error('identifier, otp and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters');
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.getUserByIdentifier(identifier);
  if (!user || !user.is_active) {
    const error = new Error('Invalid OTP or account');
    error.statusCode = 401;
    throw error;
  }

  const otpRecord = await authRepository.getLatestValidPasswordResetOtp(user.id, otp);
  if (!otpRecord) {
    await authRepository.incrementPasswordResetOtpAttempts(user.id);
    const error = new Error('Invalid or expired OTP');
    error.statusCode = 401;
    throw error;
  }

  if (Number(otpRecord.attempts) >= 5) {
    await authRepository.consumePasswordResetOtp(otpRecord.id);
    const error = new Error('OTP attempt limit exceeded');
    error.statusCode = 429;
    throw error;
  }

  await authRepository.updateUserPassword(user.id, hashPassword(password));
  await authRepository.consumePasswordResetOtpsForUser(user.id);

  return { message: 'Password reset successful' };
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
  loginWithGoogle,
  refreshSession,
  logoutSession,
  requestPasswordReset,
  resetPasswordWithOtp,
  sanitizeUser,
  needsProfileCompletion,
};
