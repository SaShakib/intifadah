'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { UserRole } from '@/types';
import { CURRENT_ADMIN, CURRENT_USER } from '@/lib/data/members';
import type { Member } from '@/types';

interface AuthContextValue {
  user: Member | null;
  role: UserRole | null;
  isAdmin: boolean;
  login: (role: 'admin' | 'user') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('intifadah-user');
    if (stored) {
      setUser(stored === 'admin' ? CURRENT_ADMIN : CURRENT_USER);
    }
  }, []);

  const login = (role: 'admin' | 'user') => {
    const member = role === 'admin' ? CURRENT_ADMIN : CURRENT_USER;
    setUser(member);
    localStorage.setItem('intifadah-user', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('intifadah-user');
  };

  const isAdmin = user?.role === 'manager' || user?.role === 'super_admin' || user?.role === 'accountant';

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
