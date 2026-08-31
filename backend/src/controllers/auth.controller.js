const {
  registerUser,
  loginUser,
  loginWithGoogle,
  refreshSession,
  logoutSession,
  requestPasswordReset,
  resetPasswordWithOtp,
  sanitizeUser,
} = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const result = await registerUser(req.body, req);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await loginUser(req.body, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function google(req, res, next) {
  try {
    const result = await loginWithGoogle(req.body || {}, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await refreshSession(req.body, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const result = await logoutSession(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await requestPasswordReset(req.body || {}, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await resetPasswordWithOtp(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({ user: sanitizeUser(req.auth.user) });
}

module.exports = {
  register,
  login,
  google,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me,
};
