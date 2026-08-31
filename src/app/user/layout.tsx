'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { UserBottomNav } from '@/components/layout/UserBottomNav';
import { BackgroundNotificationsPrompt } from '@/components/layout/BackgroundNotificationsPrompt';
import { USER_PAGE_TITLES } from '@/components/layout/config/pageTitles';
import { useAuth } from '@/contexts/AuthContext';
import { getOrFetchCached, getUserQuranProgress, queryKeys } from '@/lib/api';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, isAuthenticated, needsProfileCompletion } = useAuth();
  const pageInfo = USER_PAGE_TITLES[pathname] ?? { title: 'ইনতিফাদাহ' };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
    } else if (needsProfileCompletion) {
      router.replace('/onboarding');
    }
  }, [isReady, isAuthenticated, needsProfileCompletion, router]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || needsProfileCompletion) {
      return;
    }

    router.prefetch('/user/quran');
    const fromDate = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    void getOrFetchCached(
      queryKeys.user.quranProgress({ scope: '30d' }),
      () => getUserQuranProgress({ fromDate }),
      5 * 60_000,
    ).catch(() => {
      // Quran data can load normally if the warm-up request is unavailable.
    });
  }, [isReady, isAuthenticated, needsProfileCompletion, router]);

  if (!isReady || !isAuthenticated || needsProfileCompletion) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen">
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen pb-[calc(var(--bottomnav-h)+0.5rem)] md:ml-64 md:pb-0">
        <UserTopBar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="p-3 md:p-6">{children}</main>
      </div>
      <UserBottomNav />
      <BackgroundNotificationsPrompt />
    </div>
  );
}
