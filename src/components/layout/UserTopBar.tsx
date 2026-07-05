'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrFetchCached, getUserNotifications, queryKeys } from '@/lib/api';
import { Avatar } from '@/components/base/Avatar';

interface UserTopBarProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
  notifCount?: number;
  showProfile?: boolean;
}

export function UserTopBar({ title, subtitle, onMenuToggle, notifCount = 2, showProfile = true }: UserTopBarProps) {
  const { user } = useAuth();
  const [liveNotifCount, setLiveNotifCount] = useState(notifCount);
  const today = useMemo(
    () => new Intl.DateTimeFormat('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    [],
  );

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
    <header className="sticky top-0 z-30 flex h-[var(--topbar-h)] items-center justify-between border-b border-border bg-white/90 px-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="মেনু"
          onClick={onMenuToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-fg-2 md:hidden"
        >
          ☰
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-fg md:text-base">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted md:inline-flex">
          {today}
        </span>

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

        {showProfile && (
          <Link href="/user/profile" aria-label="প্রোফাইল">
            <Avatar initials={user?.initials ?? 'র'} className="border-2 border-brand-light bg-brand text-white" />
          </Link>
        )}
      </div>
    </header>
  );
}
