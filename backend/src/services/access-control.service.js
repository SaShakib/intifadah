const { parsePermissionMask, maskToActions } = require('../config/permissions');
const { clearPermissionCache, getRolePermissions } = require('./permission.service');
const { repositories } = require('../repositories');

const { accessRepository, authRepository } = repositories;

async function listRoles() {
  return accessRepository.listRoles();
}

async function listRolePermissionMatrix() {
  const flat = await accessRepository.listRolePermissionsMatrix();
  const byRole = new Map();

  for (const row of flat) {
    if (!byRole.has(row.role_id)) {
      byRole.set(row.role_id, {
        roleId: row.role_id,
        roleKey: row.role_key,
        roleName: row.role_name,
        permissions: [],
      });
    }

    byRole.get(row.role_id).permissions.push({
      moduleId: row.module_id,
      moduleKey: row.module_key,
      moduleName: row.module_name,
      permMask: row.perm_mask,
      actions: maskToActions(Number(row.perm_mask)),
    });
  }

  return [...byRole.values()];
}

function normalizePermissionEntries(entries) {
  if (!Array.isArray(entries)) {
    const error = new Error('permissions must be an array');
    error.statusCode = 400;
    throw error;
  }

  return entries.map((entry) => {
    const moduleKey = String(entry.moduleKey || '').trim();
    if (!moduleKey) {
      const error = new Error('Each permission entry must include moduleKey');
      error.statusCode = 400;
      throw error;
    }

    const permMask = parsePermissionMask(
      entry.permMask !== undefined
        ? entry.permMask
        : entry.actions !== undefined
          ? entry.actions
          : entry,
    );

    return { moduleKey, permMask };
  });
}

async function updateRolePermissions({ actorUserId, roleKey, permissions, replaceAll = false }) {
  const role = await authRepository.getRoleByKey(roleKey);
  if (!role) {
    const error = new Error(`Role not found: ${roleKey}`);
    error.statusCode = 404;
    throw error;
  }

  const normalized = normalizePermissionEntries(permissions);

  await accessRepository.updateRolePermissions({
    actorUserId,
    roleId: role.id,
    entries: normalized,
    replaceAll,
  });

  clearPermissionCache(role.id);
  return getRolePermissions(role.id);
}

async function assignRoleToUser({ actorUserId, targetUserId, targetRoleKey }) {
  const user = await authRepository.getUserById(targetUserId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const targetRole = await authRepository.getRoleByKey(targetRoleKey);
  if (!targetRole) {
    const error = new Error(`Role not found: ${targetRoleKey}`);
    error.statusCode = 404;
    throw error;
  }

  if (user.role_id === targetRole.id) {
    return {
      userId: user.id,
      roleId: user.role_id,
      roleKey: user.role_key,
      roleName: user.role_name,
      changed: false,
    };
  }

  if (user.role_key === 'super_admin' && targetRole.role_key !== 'super_admin') {
    const activeSuperAdminCount = await accessRepository.countActiveUsersByRoleKey('super_admin');

    if (activeSuperAdminCount <= 1) {
      const error = new Error('Cannot remove the last active super admin');
      error.statusCode = 400;
      throw error;
    }
  }

  await accessRepository.assignUserRoleWithAudit({
    actorUserId,
    userId: user.id,
    beforeRoleId: user.role_id,
    beforeRoleKey: user.role_key,
    newRoleId: targetRole.id,
    newRoleKey: targetRole.role_key,
  });

  return {
    userId: user.id,
    roleId: targetRole.id,
    roleKey: targetRole.role_key,
    roleName: targetRole.role_name,
    changed: true,
  };
}

module.exports = {
  listRoles,
  listRolePermissionMatrix,
  updateRolePermissions,
  assignRoleToUser,
};
