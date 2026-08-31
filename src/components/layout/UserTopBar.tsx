'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/base/Avatar';
import { NotificationBell } from '@/components/layout/NotificationBell';

interface UserTopBarProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
  notifCount?: number;
  showProfile?: boolean;
}

export function UserTopBar({ title, subtitle, onMenuToggle, notifCount = 2, showProfile = true }: UserTopBarProps) {
  const { user } = useAuth();
  const today = useMemo(
    () => new Intl.DateTimeFormat('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    [],
  );

  return (
    <header className="sticky top-0 z-30 flex h-[var(--topbar-h)] items-center justify-between border-b border-border bg-white/90 px-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="মেনু"
          onClick={onMenuToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-fg-2 md:hidden"
        >
          <Menu className="h-5 w-5" />
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

        <NotificationBell defaultCount={notifCount} />

        {showProfile && (
          <Link href="/user/profile" aria-label="প্রোফাইল">
            <Avatar initials={user?.initials ?? 'র'} className="border-2 border-brand-light bg-brand text-white" />
          </Link>
        )}
      </div>
    </header>
  );
}
