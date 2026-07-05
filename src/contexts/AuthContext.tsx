'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Member, UserRole } from '@/types';
import {
  AUTH_SESSION_EVENT,
  clearApiCache,
  clearAuthSession,
  getAuthSession,
  isAdminRoleKey,
  loginApi,
  logoutApi,
  mapAuthUserToMember,
  meApi,
  registerApi,
  setAuthSession,
  type BackendRoleKey,
  type LoginInput,
  type RegisterInput,
} from '@/lib/api';

interface AuthContextValue {
  user: Member | null;
  role: UserRole | null;
  roleKey: BackendRoleKey | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  authError: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const noopAsync = async () => {};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  roleKey: null,
  isAdmin: false,
  isAuthenticated: false,
  isReady: false,
  authError: null,
  login: noopAsync,
  register: noopAsync,
  logout: noopAsync,
  refreshMe: noopAsync,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionUser, setSessionUser] = useState(() => getAuthSession()?.user ?? null);
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      const current = getAuthSession();
      if (!current) {
        if (!cancelled) {
          setSessionUser(null);
          setIsReady(true);
        }
        return;
      }

      try {
        const user = await meApi();
        const next = { ...current, user };
        setAuthSession(next);
        if (!cancelled) {
          setSessionUser(user);
          setAuthError(null);
        }
      } catch {
        clearAuthSession();
        if (!cancelled) {
          setSessionUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    const onSessionChange = () => {
      const next = getAuthSession();
      setSessionUser(next?.user ?? null);
    };

    void syncSession();
    window.addEventListener(AUTH_SESSION_EVENT, onSessionChange);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_SESSION_EVENT, onSessionChange);
    };
  }, []);

  const login = async (input: LoginInput) => {
    setAuthError(null);
    clearApiCache();
    const response = await loginApi(input);
    setSessionUser(response.user);
  };

  const register = async (input: RegisterInput) => {
    setAuthError(null);
    clearApiCache();
    const response = await registerApi(input);
    setSessionUser(response.user);
  };

  const logout = async () => {
    setAuthError(null);

    try {
      await logoutApi();
    } finally {
      clearApiCache();
      setSessionUser(null);
    }
  };

  const refreshMe = async () => {
    const current = getAuthSession();
    if (!current) {
      setSessionUser(null);
      return;
    }

    const user = await meApi();
    setAuthSession({ ...current, user });
    setSessionUser(user);
  };

  const memberUser = useMemo(() => {
    if (!sessionUser) {
      return null;
    }

    return mapAuthUserToMember(sessionUser);
  }, [sessionUser]);

  const value = useMemo<AuthContextValue>(() => {
    const roleKey = sessionUser?.roleKey ?? null;
    const role = memberUser?.role ?? null;

    return {
      user: memberUser,
      role,
      roleKey,
      isAdmin: roleKey ? isAdminRoleKey(roleKey) : false,
      isAuthenticated: Boolean(sessionUser),
      isReady,
      authError,
      login,
      register,
      logout,
      refreshMe,
    };
  }, [memberUser, sessionUser, isReady, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
