const { query, withTransaction } = require('../../db/pool');

async function getRolePermissionMap(roleId) {
  const res = await query(
    `SELECT m.module_key, rp.perm_mask
     FROM role_permissions rp
     JOIN app_modules m ON m.id = rp.module_id
     WHERE rp.role_id = $1`,
    [roleId],
  );

  const map = new Map();
  for (const row of res.rows) {
    map.set(row.module_key, Number(row.perm_mask));
  }
  return map;
}

async function listModules() {
  const res = await query(
    `SELECT id, module_key, module_name
     FROM app_modules
     ORDER BY id`,
  );
  return res.rows;
}

async function listRoles() {
  const res = await query(
    `SELECT id, role_key, role_name, is_internal
     FROM roles
     ORDER BY id`,
  );
  return res.rows;
}

async function listRolePermissionsMatrix() {
  const res = await query(
    `SELECT
      r.id AS role_id,
      r.role_key,
      r.role_name,
      m.id AS module_id,
      m.module_key,
      m.module_name,
      COALESCE(rp.perm_mask, 0)::int AS perm_mask
     FROM roles r
     CROSS JOIN app_modules m
     LEFT JOIN role_permissions rp
       ON rp.role_id = r.id
      AND rp.module_id = m.id
     ORDER BY r.id, m.id`,
  );

  return res.rows;
}

async function getRolePermissionRows(roleId) {
  const res = await query(
    `SELECT m.id AS module_id, m.module_key, m.module_name, COALESCE(rp.perm_mask, 0)::int AS perm_mask
     FROM app_modules m
     LEFT JOIN role_permissions rp
       ON rp.module_id = m.id
      AND rp.role_id = $1
     ORDER BY m.id`,
    [roleId],
  );
  return res.rows;
}

async function updateRolePermissions({ actorUserId, roleId, entries, replaceAll }) {
  return withTransaction(async (client) => {
    const modulesRes = await client.query('SELECT id, module_key FROM app_modules');
    const moduleMap = new Map(modulesRes.rows.map((row) => [row.module_key, row.id]));

    const beforeRows = await client.query(
      `SELECT module_id, perm_mask
       FROM role_permissions
       WHERE role_id = $1`,
      [roleId],
    );

    const providedModuleIds = [];
    for (const item of entries) {
      const moduleId = moduleMap.get(item.moduleKey);
      if (!moduleId) {
        const error = new Error(`Invalid moduleKey: ${item.moduleKey}`);
        error.statusCode = 400;
        throw error;
      }

      providedModuleIds.push(moduleId);
      // eslint-disable-next-line no-await-in-loop
      await client.query(
        `INSERT INTO role_permissions (role_id, module_id, perm_mask)
         VALUES ($1, $2, $3)
         ON CONFLICT (role_id, module_id)
         DO UPDATE SET perm_mask = EXCLUDED.perm_mask`,
        [roleId, moduleId, item.permMask],
      );
    }

    if (replaceAll) {
      await client.query(
        `UPDATE role_permissions
         SET perm_mask = 0
         WHERE role_id = $1
           AND module_id <> ALL($2::smallint[])`,
        [roleId, providedModuleIds.length ? providedModuleIds : [-1]],
      );
    }

    const afterRows = await client.query(
      `SELECT module_id, perm_mask
       FROM role_permissions
       WHERE role_id = $1`,
      [roleId],
    );

    await client.query(
      `INSERT INTO audit_logs (
        actor_user_id,
        action_type,
        entity_type,
        entity_id,
        before_json,
        after_json
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        actorUserId,
        2,
        1,
        roleId,
        JSON.stringify(beforeRows.rows),
        JSON.stringify(afterRows.rows),
      ],
    );

    return true;
  });
}

async function countActiveUsersByRoleKey(roleKey) {
  const res = await query(
    `SELECT COUNT(*)::int AS count
     FROM app_users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.is_active = TRUE
       AND r.role_key = $1`,
    [roleKey],
  );

  return Number(res.rows[0]?.count || 0);
}

async function assignUserRoleWithAudit({ actorUserId, userId, beforeRoleId, beforeRoleKey, newRoleId, newRoleKey }) {
  await withTransaction(async (client) => {
    await client.query('UPDATE app_users SET role_id = $2, updated_at = NOW() WHERE id = $1', [userId, newRoleId]);

    await client.query(
      `INSERT INTO audit_logs (
        actor_user_id,
        action_type,
        entity_type,
        entity_id,
        before_json,
        after_json
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        actorUserId,
        2,
        2,
        userId,
        JSON.stringify({ roleId: beforeRoleId, roleKey: beforeRoleKey }),
        JSON.stringify({ roleId: newRoleId, roleKey: newRoleKey }),
      ],
    );
  });
}

module.exports = {
  getRolePermissionMap,
  listModules,
  listRoles,
  listRolePermissionsMatrix,
  getRolePermissionRows,
  updateRolePermissions,
  countActiveUsersByRoleKey,
  assignUserRoleWithAudit,
};
