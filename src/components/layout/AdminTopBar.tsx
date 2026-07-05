'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrFetchCached, getUserNotifications, queryKeys } from '@/lib/api';
import { Avatar } from '@/components/base/Avatar';
import { Input } from '@/components/base/Input';

interface AdminTopBarProps {
  title: string;
  onMenuToggle: () => void;
  notifCount?: number;
}

export function AdminTopBar({ title, onMenuToggle, notifCount = 3 }: AdminTopBarProps) {
  const { user } = useAuth();
  const [liveNotifCount, setLiveNotifCount] = useState(notifCount);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const rows = await getOrFetchCached(
          queryKeys.user.notifications({ unread: true, limit: 50 }),
          () => getUserNotifications({ unread: true, limit: 50 }),
          30_000,
        );
        if (active) {
          setLiveNotifCount(rows.length);
        }
      } catch {
        // keep previous count on failure
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 45000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-[var(--topbar-h)] items-center gap-3 border-b border-border bg-white/90 px-3 backdrop-blur md:px-6">
      <button
        aria-label="মেনু"
        onClick={onMenuToggle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-fg-2 md:hidden"
      >
        ☰
      </button>

      <p className="text-sm font-semibold text-fg md:text-base">{title}</p>

      <div className="ml-auto hidden w-56 md:block">
        <Input type="search" placeholder="খুঁজুন..." className="h-9" />
      </div>

      <button
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-fg-2"
        aria-label="বিজ্ঞপ্তি"
      >
        🔔
        {liveNotifCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {liveNotifCount}
          </span>
        )}
      </button>

      <div className="hidden items-center gap-2 md:flex">
        <Avatar initials={user?.initials ?? 'আ'} className="bg-emerald-200 text-emerald-900" />
        <span className="text-sm text-fg-2">{user?.name?.split(' ')[0] ?? 'আবু'}</span>
      </div>
    </header>
  );
}
