import type { PermissionAction } from '@/lib/api';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: string;
  permissionOnly?: boolean;
  superAdminOnly?: boolean;
  requiredModule?: string;
  requiredAction?: PermissionAction;
}
