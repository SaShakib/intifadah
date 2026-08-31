'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRoleKey } from '@/lib/api';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, roleKey } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    router.replace(roleKey && isAdminRoleKey(roleKey) ? '/admin/dashboard' : '/user/dashboard');
  }, [isAuthenticated, isReady, roleKey, router]);

  return <div className="flex min-h-screen items-center justify-center text-sm text-muted">লোড হচ্ছে...</div>;
}
