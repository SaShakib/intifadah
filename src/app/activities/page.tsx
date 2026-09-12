'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalendarHeart, LayoutDashboard, UserRound } from 'lucide-react';
import { AppToast } from '@/components/semibase/AppModal';
import { Button } from '@/components/base/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicActivities, toBanglaDate, type ActivityRow } from '@/lib/api';

export default function ActivitiesPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };

  const load = useCallback(async () => {
    try {
      setRows((await getPublicActivities()).rows);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'কার্জক্রম আনা যায়নি');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const dashboardHref = isAdmin ? '/admin/dashboard' : '/user/dashboard';

  return (
    <main className="min-h-screen bg-surface-2 pb-12">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/activities" className="flex items-center gap-2 font-bold text-fg">
            <CalendarHeart className="h-5 w-5 text-brand" />
            ইনতিফাদাহ কার্জক্রম
          </Link>
          <div className="flex gap-2">
            {isAuthenticated && <Link href={dashboardHref}><Button size="sm" variant="secondary"><LayoutDashboard className="h-4 w-4" />ড্যাশবোর্ড</Button></Link>}
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-3xl font-bold text-fg">কার্জক্রম</h1>
          <p className="mt-2 text-sm text-muted">ইনতিফাদাহর নানা কার্যক্রম, সেবা ও আয়োজনের খবরাখবর এক জায়গায়।</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((activity) => (
          <article key={activity.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="relative aspect-[16/9] bg-surface-2">
              {activity.image_url
                ? <Image src={activity.image_url} alt={activity.title} fill className="object-cover" unoptimized />
                : <div className="grid h-full place-items-center text-muted"><CalendarHeart className="h-10 w-10" /></div>}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-lg font-bold text-fg">{activity.title}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-fg-2">{activity.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{activity.created_by_name}</span>
                <span>{toBanglaDate(activity.created_at)}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!loading && rows.length === 0 && <p className="py-12 text-center text-sm text-muted">এখনো কোনো কার্জক্রম প্রকাশ করা হয়নি।</p>}

      <AppToast message={toast} />
    </main>
  );
}