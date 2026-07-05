'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthSession, getErrorMessage, isAdminRoleKey } from '@/lib/api';
import { LoginBottomSection, LoginMiddleSection, LoginTopSection } from './_sections';
import type { LoginRole } from './_sections/types';

const QUICK_PRESET: Record<LoginRole, { identifier: string; password: string }> = {
  admin: {
    identifier: 'superadmin@intifadah.org',
    password: 'Passw0rd!123',
  },
  user: {
    identifier: '01700000002',
    password: 'Passw0rd!123',
  },
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleQuickFill = (role: LoginRole) => {
    setIdentifier(QUICK_PRESET[role].identifier);
    setPassword(QUICK_PRESET[role].password);
    setError(null);
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('ইমেইল/মোবাইল এবং পাসওয়ার্ড দিন।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ identifier: identifier.trim(), password });
      const roleKey = getAuthSession()?.user.roleKey;
      router.push(roleKey && isAdminRoleKey(roleKey) ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg md:grid-cols-2">
      <LoginTopSection loading={loading} onQuickFill={handleQuickFill} />

      <div className="flex flex-col justify-center gap-6 p-4 md:p-8">
        <LoginMiddleSection
          showPassword={showPassword}
          identifier={identifier}
          password={password}
          loading={loading}
          error={error}
          onIdentifierChange={setIdentifier}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
          onSubmit={handleLogin}
        />
        <LoginBottomSection />
      </div>
    </div>
  );
}
