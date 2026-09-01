'use client';

import { BellRing, BellOff, LoaderCircle } from 'lucide-react';
import { useBackgroundNotifications } from '@/hooks/useBackgroundNotifications';

export function BackgroundNotificationsControl() {
  const { status, busy, error, enable, disable, test } = useBackgroundNotifications();

  if (status === 'unsupported' || status === 'unconfigured') return null;

  if (status === 'enabled') {
    return (
      <div className="border-t border-border px-4 py-3">
        <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
          <BellRing className="h-4 w-4" />
          ব্যাকগ্রাউন্ড বিজ্ঞপ্তি চালু আছে
        </p>
        <div className="mt-2 flex gap-3 text-xs font-semibold">
          <button type="button" onClick={() => void test()} disabled={busy} className="text-brand hover:text-brand-dark disabled:cursor-wait">
            {busy ? 'পাঠানো হচ্ছে...' : 'ডিভাইসে পরীক্ষা করুন'}
          </button>
          <button type="button" onClick={() => void disable()} disabled={busy} className="text-muted hover:text-fg disabled:cursor-wait">বন্ধ করুন</button>
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
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
