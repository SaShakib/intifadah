const { PERMISSION_BITS, maskToActions } = require('../config/permissions');
const { repositories } = require('../repositories');

const { accessRepository } = repositories;

const rolePermissionCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function isCacheValid(cacheEntry) {
  return cacheEntry && Date.now() - cacheEntry.fetchedAt < CACHE_TTL_MS;
}

async function getRolePermissionMap(roleId) {
  const cacheEntry = rolePermissionCache.get(roleId);
  if (isCacheValid(cacheEntry)) {
    return cacheEntry.map;
  }

  const map = new Map();
  const rows = await accessRepository.getRolePermissionMap(roleId);
  for (const [moduleKey, permMask] of rows.entries()) {
    map.set(moduleKey, Number(permMask));
  }

  rolePermissionCache.set(roleId, { fetchedAt: Date.now(), map });
  return map;
}

async function hasPermission(roleId, moduleKey, action) {
  const bit = PERMISSION_BITS[action];
  if (!bit) {
    return false;
  }

  const map = await getRolePermissionMap(roleId);
  const mask = map.get(moduleKey) || 0;
  return (mask & bit) === bit;
}

async function hasAnyPermission(roleId, moduleKey, actions) {
  const map = await getRolePermissionMap(roleId);
  const mask = map.get(moduleKey) || 0;

  return actions.some((action) => {
    const bit = PERMISSION_BITS[action];
    return bit ? (mask & bit) === bit : false;
  });
}

async function listModules() {
  return accessRepository.listModules();
}

async function getRolePermissions(roleId) {
  const rows = await accessRepository.getRolePermissionRows(roleId);

  return rows.map((row) => ({
    moduleId: row.module_id,
    moduleKey: row.module_key,
    moduleName: row.module_name,
    permMask: row.perm_mask,
    actions: maskToActions(Number(row.perm_mask)),
  }));
}

function clearPermissionCache(roleId) {
  if (roleId) {
    rolePermissionCache.delete(roleId);
    return;
  }

  rolePermissionCache.clear();
}

module.exports = {
  hasPermission,
  hasAnyPermission,
  listModules,
  getRolePermissions,
  clearPermissionCache,
};
