'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopBar } from '@/components/layout/AdminTopBar';
import { BackgroundNotificationsPrompt } from '@/components/layout/BackgroundNotificationsPrompt';
import { ADMIN_PAGE_TITLES } from '@/components/layout/config/pageTitles';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, isAuthenticated, isAdmin, needsProfileCompletion, canManagePermissions } = useAuth();
  const title = ADMIN_PAGE_TITLES[pathname] ?? 'ড্যাশবোর্ড';

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (needsProfileCompletion) {
      router.replace('/onboarding');
      return;
    }

    if (!isAdmin) {
      router.replace('/user/dashboard');
      return;
    }

    if (pathname === '/admin/quran' && !canManagePermissions) {
      router.replace('/admin/dashboard');
    }
  }, [isReady, isAuthenticated, isAdmin, needsProfileCompletion, pathname, router, canManagePermissions]);

  if (!isReady || !isAuthenticated || !isAdmin || needsProfileCompletion || (pathname === '/admin/quran' && !canManagePermissions)) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen md:ml-64">
        <AdminTopBar title={title} onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="p-3 pb-6 md:p-6">{children}</main>
      </div>
      <BackgroundNotificationsPrompt />
    </div>
  );
}
