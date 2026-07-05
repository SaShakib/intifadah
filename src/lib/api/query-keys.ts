import { createQueryString } from './client';

export const queryKeys = {
  admin: {
    dashboard: () => 'admin:dashboard',
    members: (params: Record<string, unknown> = {}) => `admin:members${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    categories: (params: Record<string, unknown> = {}) => `admin:categories${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    collections: (params: Record<string, unknown> = {}) => `admin:collections${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    loans: (params: Record<string, unknown> = {}) => `admin:loans${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    reports: () => 'admin:reports',
    rolesPermissions: () => 'admin:roles_permissions',
  },
  user: {
    dashboard: () => 'user:dashboard',
    transactions: (params: Record<string, unknown> = {}) => `user:transactions${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    categories: (params: Record<string, unknown> = {}) => `user:categories${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    loans: (params: Record<string, unknown> = {}) => `user:loans${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    expenses: (params: Record<string, unknown> = {}) => `user:expenses${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
    commentsThreads: () => 'user:comments:threads',
    commentsMessages: (threadId: string | number) => `user:comments:threads:${threadId}:messages`,
    profile: () => 'user:profile',
    notifications: (params: Record<string, unknown> = {}) => `user:notifications${createQueryString(params as Record<string, string | number | boolean | null | undefined>)}`,
  },
};
