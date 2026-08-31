'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotificationCount } from '@/hooks/useNotificationCount';
import { getErrorMessage, getUserNotifications, markNotificationRead, toBanglaDate } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import type { ApiNotificationRow } from '@/lib/api';
import { BackgroundNotificationsControl } from '@/components/layout/BackgroundNotificationsControl';

function notificationTitle(row: ApiNotificationRow) {
  const payload = row.payload_json ?? {};
  if (typeof payload.title === 'string') return payload.title;
  if (payload.event === 'quran_daily_reminder') return 'Quran reminder';
  if (payload.event === 'quran_weekly_penalty_run') return 'Quran penalty report';
  if (payload.event === 'quran_weekly_penalty_assigned') return 'Quran penalty assigned';
  if (payload.event === 'user_transaction_created') return 'নতুন লেনদেন';
  if (payload.event === 'loan_request_created') return 'নতুন ঋণ আবেদন';
  return 'বিজ্ঞপ্তি';
}

function notificationMessage(row: ApiNotificationRow) {
  const payload = row.payload_json ?? {};
  if (typeof payload.message === 'string') return payload.message;
  if (payload.event === 'quran_weekly_penalty_run') {
    return `${payload.penaltyCount ?? 0} জনের penalty, মোট ${payload.totalPenaltyMinor ?? 0} টাকা`;
  }
  if (payload.event === 'quran_weekly_penalty_assigned') {
    return `${payload.fromDate ?? ''} থেকে ${payload.toDate ?? ''} Quran tracking penalty তৈরি হয়েছে`;
  }
  return row.created_at ? toBanglaDate(row.created_at) : '';
}

function notificationUrl(row: ApiNotificationRow) {
  const payload = row.payload_json ?? {};
  if (typeof payload.url === 'string' && payload.url.startsWith('/')) return payload.url;
  if (payload.event === 'quran_daily_reminder' || payload.event === 'quran_weekly_penalty_assigned') return '/user/quran';
  if (payload.event === 'quran_weekly_penalty_run') return '/admin/quran';
  if (payload.event === 'loan_request_created') return '/admin/loans';
  if (payload.event === 'user_transaction_created') return '/admin/fund-collection';
  return null;
}

export function NotificationBell({ defaultCount = 0 }: { defaultCount?: number }) {
  const router = useRouter();
  const liveCount = useNotificationCount(defaultCount);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ApiNotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      setError(null);

      try {
        const nextRows = await getUserNotifications({ limit: 10 });
        if (active) setRows(nextRows);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [open, liveCount]);

  const markRead = async (row: ApiNotificationRow) => {
    if (row.is_read) return;
    await markNotificationRead(row.id);
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, is_read: true } : item));
  };

  const openNotification = async (row: ApiNotificationRow) => {
    try {
      await markRead(row);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      const url = notificationUrl(row);
      if (url) {
        setOpen(false);
        router.push(url);
      }
    }
  };

  return (
    <div className="relative">
      <button
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:bg-surface-2 hover:text-fg-2"
        aria-label="বিজ্ঞপ্তি"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-[17px] w-[17px]" />
        {liveCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-danger" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-fg">বিজ্ঞপ্তি</p>
            <p className="text-xs text-muted">{liveCount}টি unread</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="px-4 py-5 text-center text-sm text-muted">লোড হচ্ছে...</p>}
            {error && <p className="px-4 py-5 text-center text-sm text-danger">{error}</p>}
            {!loading && !error && rows.length === 0 && <p className="px-4 py-5 text-center text-sm text-muted">কোনো বিজ্ঞপ্তি নেই</p>}
            {!loading && !error && rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => void openNotification(row)}
                className={cn(
                  'block w-full border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-2',
                  !row.is_read && 'bg-brand-light/40',
                )}
              >
                <p className="text-sm font-semibold text-fg">{notificationTitle(row)}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{notificationMessage(row)}</p>
              </button>
            ))}
          </div>
          <BackgroundNotificationsControl />
        </div>
      )}
    </div>
  );
}
