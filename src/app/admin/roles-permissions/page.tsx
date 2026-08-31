'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { RolesBottomSection, RolesMiddleSection, RolesTopSection } from './_sections';
import type { RoleSummary } from './_sections/types';
import { queryKeys, toInitials, useApiQuery } from '@/lib/api';
import { getAccessModules, getAdminMembers, getRolesPermissions } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiAccessModuleRow, ApiRolePermissionRow } from '@/lib/api';

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'সুপার অ্যাডমিন',
  admin: 'অ্যাডমিন',
  manager: 'ম্যানেজার',
  member_internal: 'ইন্টারনাল সদস্য',
  general_user: 'সাধারণ সদস্য',
  org_user: 'সংগঠন সদস্য',
};

const initialData = {
  roleRows: [] as RoleSummary[],
  moduleRows: [] as string[][],
  matrix: [] as ApiRolePermissionRow[],
  modules: [] as ApiAccessModuleRow[],
  assignableMembers: [] as Array<{ id: string; name: string; mobile: string; initials: string; roleKey: string }>,
};

function toRoleLevel(permMasks: number[]): RoleSummary['level'] {
  if (!permMasks.length) {
    return 'low';
  }

  const activeMasks = permMasks.filter((mask) => mask > 0);
  if (!activeMasks.length) {
    return 'low';
  }

  const allFull = activeMasks.every((mask) => mask === 15);
  if (allFull) {
    return 'high';
  }

  const avg = activeMasks.reduce((sum, mask) => sum + mask, 0) / activeMasks.length;
  return avg >= 8 ? 'high' : 'medium';
}

export default function RolesPermissionsPage() {
  const router = useRouter();
  const { canManagePermissions, isReady } = useAuth();
  useEffect(() => {
    if (isReady && !canManagePermissions) {
      router.replace('/admin/settings');
    }
  }, [canManagePermissions, isReady, router]);

  const loadRoles = useCallback(async () => {
    const [matrix, modules, members] = await Promise.all([
      getRolesPermissions(),
      getAccessModules(),
      getAdminMembers({ limit: 1000 }),
    ]);

    const roleCount = members.reduce<Record<string, number>>((acc, member) => {
      acc[member.role_key] = (acc[member.role_key] ?? 0) + 1;
      return acc;
    }, {});

    const roleRows: RoleSummary[] = matrix.map((item) => {
      const activePermissions = item.permissions.filter((permission) => permission.permMask > 0);
      const modulesText = activePermissions.length
        ? activePermissions.slice(0, 4).map((permission) => permission.moduleName).join(', ')
        : 'কোন মডিউল নেই';

      return {
        roleKey: item.roleKey,
        role: ROLE_LABEL[item.roleKey] ?? item.roleName,
        members: roleCount[item.roleKey] ?? 0,
        modules: modulesText,
        level: toRoleLevel(item.permissions.map((permission) => permission.permMask)),
      };
    });

    const moduleRows = modules.map((module) => {
      const allowedRoles = matrix
        .filter((role) => role.permissions.some((permission) => permission.moduleKey === module.module_key && permission.permMask > 0))
        .map((role) => ROLE_LABEL[role.roleKey] ?? role.roleName)
        .join(', ');

      return [module.module_name, allowedRoles || 'কেউ নয়'];
    });

    return {
      roleRows,
      moduleRows,
      matrix,
      modules,
      assignableMembers: members.map((member) => ({
        id: String(member.id),
        name: member.full_name,
        mobile: member.mobile,
        initials: toInitials(member.full_name),
        roleKey: member.role_key,
      })),
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadRoles, initialData, [], {
    cacheKey: queryKeys.admin.rolesPermissions(),
    staleTimeMs: 90_000,
  });

  if (!isReady || !canManagePermissions) {
    return <div className="text-sm text-muted">সেটিংসে নিয়ে যাওয়া হচ্ছে...</div>;
  }

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <RolesTopSection roleRows={data.roleRows} />
      <RolesMiddleSection
        roleRows={data.roleRows}
        matrix={data.matrix}
        modules={data.modules}
        assignableMembers={data.assignableMembers}
        onMutationSuccess={() => void refetch()}
      />
      <RolesBottomSection moduleRows={data.moduleRows} />
    </PageStack>
  );
}
