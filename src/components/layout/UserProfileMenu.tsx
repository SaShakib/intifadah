'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, CircleUserRound, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/base/Avatar';

export function UserProfileMenu() {
  const { user, canSwitchAccounts, accountMode, switchAccountMode, logout } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const isStaff = accountMode === 'staff';

  const handleSwitch = async () => {
    setBusy(true);
    try {
      await switchAccountMode(isStaff ? 'personal' : 'staff');
      router.replace(isStaff ? '/user/dashboard' : '/admin/dashboard');
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      router.replace('/login');
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="অ্যাকাউন্ট মেনু"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2"
      >
        <Avatar initials={user?.initials ?? 'র'} className="border-2 border-brand bg-brand-light text-brand shadow-sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-surface text-fg shadow-xl" role="menu">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-bold">{user?.name ?? 'ব্যবহারকারী'}</p>
            <p className="truncate text-xs text-muted">{user?.phone ?? user?.email ?? 'সদস্য অ্যাকাউন্ট'}</p>
          </div>
          <Link href="/user/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-surface-2">
            <CircleUserRound className="h-4 w-4 text-brand" />
            প্রোফাইল দেখুন
          </Link>
          {canSwitchAccounts && (
            <button type="button" onClick={() => void handleSwitch()} disabled={busy} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-surface-2">
              <ArrowLeftRight className="h-4 w-4 text-brand" />
              {busy ? 'সুইচ হচ্ছে...' : (isStaff ? 'ব্যক্তিগত অ্যাকাউন্টে সুইচ' : 'ম্যানেজমেন্ট অ্যাকাউন্টে সুইচ')}
            </button>
          )}
          <div className="border-t border-border" />
          <button type="button" onClick={() => void handleLogout()} disabled={busy} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-danger hover:bg-surface-2">
            <LogOut className="h-4 w-4" />
            {busy ? 'লগআউট হচ্ছে...' : 'লগআউট'}
          </button>
        </div>
      )}
    </div>
  );
}