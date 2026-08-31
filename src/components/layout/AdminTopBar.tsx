'use client';

import { Menu, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/base/Avatar';
import { NotificationBell } from '@/components/layout/NotificationBell';

interface AdminTopBarProps {
  title: string;
  onMenuToggle: () => void;
  notifCount?: number;
}

export function AdminTopBar({ title, onMenuToggle, notifCount = 3 }: AdminTopBarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-[var(--topbar-h)] items-center gap-3 border-b border-border bg-white/90 px-3 backdrop-blur md:px-6">
      <button
        aria-label="মেনু"
        onClick={onMenuToggle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-fg-2 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <p className="text-[15px] font-semibold text-fg md:text-base">{title}</p>

      <div className="relative ml-auto hidden w-80 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="দ্রুত খুঁজুন..."
          className="h-9 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-fg outline-none transition placeholder:text-muted focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
        />
      </div>

      <NotificationBell defaultCount={notifCount} />

      <div className="hidden items-center gap-2 md:flex">
        <Avatar initials={user?.initials ?? 'আ'} className="bg-emerald-200 text-emerald-900" />
        <span className="text-sm text-fg-2">{user?.name?.split(' ')[0] ?? 'ব্যবহারকারী'}</span>
      </div>
    </header>
  );
}
