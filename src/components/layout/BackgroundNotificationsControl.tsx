'use client';

import { BellRing, BellOff, LoaderCircle } from 'lucide-react';
import { useBackgroundNotifications } from '@/hooks/useBackgroundNotifications';

export function BackgroundNotificationsControl() {
  const { status, busy, error, enable, disable } = useBackgroundNotifications();

  if (status === 'unsupported' || status === 'unconfigured') return null;

  if (status === 'enabled') {
    return (
      <button
        type="button"
        onClick={() => void disable()}
        disabled={busy}
        className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-left text-xs font-medium text-emerald-700 hover:bg-surface-2 disabled:cursor-wait"
      >
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
        <span>ব্যাকগ্রাউন্ড বিজ্ঞপ্তি চালু আছে</span>
      </button>
    );
  }

  if (status === 'blocked') {
    return <div className="border-t border-border px-4 py-3 text-xs leading-5 text-muted">ব্যাকগ্রাউন্ড বিজ্ঞপ্তি ব্রাউজার সেটিংস থেকে বন্ধ আছে।</div>;
  }

  return (
    <div className="border-t border-border px-4 py-3">
      <button
        type="button"
        onClick={() => void enable()}
        disabled={busy}
        className="flex w-full items-center gap-2 text-left text-xs font-semibold text-brand hover:text-brand-dark disabled:cursor-wait"
      >
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
        <span>অ্যাপ বন্ধ থাকলেও বিজ্ঞপ্তি পান</span>
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
