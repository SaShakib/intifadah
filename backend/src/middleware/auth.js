const { verifyAccessToken } = require('../lib/jwt');
const { getUserById } = require('../services/user.service');
const { hasPermission, hasAnyPermission } = require('../services/permission.service');
const { needsProfileCompletion } = require('../services/auth.service');

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Missing access token' });
    }

    const payload = verifyAccessToken(token);
    const user = await getUserById(Number(payload.sub));

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid user session' });
    }

    req.auth = {
      userId: user.id,
      roleId: user.role_id,
      roleKey: user.role_key,
      userKind: user.user_kind,
      email: user.email,
      needsProfileCompletion: needsProfileCompletion(user),
      user,
      tokenPayload: payload,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

function requireCompletedProfile(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.auth.needsProfileCompletion) {
    return res.status(403).json({ message: 'Profile completion is required' });
  }

  return next();
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.auth.roleKey)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    return next();
  };
}

function requireSuperAdmin(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.auth.roleKey !== 'super_admin') {
    return res.status(403).json({ message: 'Forbidden: super admin only' });
  }

  return next();
}

function requireAnyRoles(...allowedRoles) {
  return requireRoles(...allowedRoles);
}

function requirePermission(moduleKey, action) {
  return async (req, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const allowed = await hasPermission(req.auth.roleId, moduleKey, action);
      if (!allowed) {
        return res.status(403).json({ message: `Forbidden: missing ${moduleKey}.${action} permission` });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireAnyPermission(moduleKey, actions) {
  return async (req, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const allowed = await hasAnyPermission(req.auth.roleId, moduleKey, actions);
      if (!allowed) {
        return res.status(403).json({ message: `Forbidden: missing ${moduleKey} permission` });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireSelfOrPermission(options) {
  const {
    moduleKey,
    action,
    userIdParam = 'userId',
  } = options;

  return async (req, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const targetUserId = Number(req.params[userIdParam]);
      if (Number.isFinite(targetUserId) && targetUserId === req.auth.userId) {
        return next();
      }

      const allowed = await hasPermission(req.auth.roleId, moduleKey, action);
      if (!allowed) {
        return res.status(403).json({ message: 'Forbidden: scope violation' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  requireAuth,
  requireCompletedProfile,
  requireRoles,
  requireAnyRoles,
  requireSuperAdmin,
  requirePermission,
  requireAnyPermission,
  requireSelfOrPermission,
};
