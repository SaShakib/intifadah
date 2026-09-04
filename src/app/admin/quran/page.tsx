'use client';

import { useCallback, useMemo, useState } from 'react';
import { BellRing, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { PageStack } from '@/components/custom/PageStack';
import { AppToast } from '@/components/semibase/AppModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAdminQuranWeeklyReport,
  getAdminQuranPenalties,
  queryKeys,
  runAdminQuranPenalties,
  sendAdminQuranReminder,
  toBanglaDate,
  toMinorNumber,
  useApiQuery,
} from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';

function addDays(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

export default function AdminQuranPage() {
  const { roleKey } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [running, setRunning] = useState(false);
  const [reapplying, setReapplying] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    const [weekly, penaltyWeekly, penalties] = await Promise.all([
      getAdminQuranWeeklyReport({ weekOffset }),
      getAdminQuranWeeklyReport({ weekOffset: 1 }),
      getAdminQuranPenalties(),
    ]);
    return { weekly, penaltyWeekly, penalties };
  }, [weekOffset]);

  const { data, loading, error, refetch } = useApiQuery(loadReport, { weekly: { fromDate: '', toDate: '', rows: [] }, penaltyWeekly: { fromDate: '', toDate: '', rows: [] }, penalties: { fromDate: '', toDate: '', rows: [], totalPenaltyMinor: 0, totalMissedDays: 0 } }, [weekOffset], {
    cacheKey: `${queryKeys.admin.quranWeekly({ weekOffset })}:${queryKeys.admin.quranWeekly({ weekOffset: 1 })}:${queryKeys.admin.quranPenalties()}`,
    staleTimeMs: 30_000,
  });

  const runPenalties = async (reapply = false) => {
    const setBusy = reapply ? setReapplying : setRunning;
    setBusy(true);
    try {
      const result = await runAdminQuranPenalties({ reapply });
      if (result.skipped) {
        setToast(result.unchanged ? 'Quran রেকর্ডে কোনো পরিবর্তন নেই, penalty অপরিবর্তিত আছে।' : 'এই সপ্তাহের penalty আগে থেকেই চালানো হয়েছে।');
      } else if (reapply) {
        setToast('সর্বশেষ সম্পূর্ণ সপ্তাহের penalty পুনরায় হিসাব করা হয়েছে।');
      } else {
        setToast('সর্বশেষ সম্পূর্ণ সপ্তাহের penalty হিসাব করা হয়েছে।');
      }
      await refetch();
    } finally {
      setBusy(false);
    }
  };

  const sendReminder = async () => {
    setSendingReminder(true);
    try {
      const result = await sendAdminQuranReminder();
      const { notifiedUsers, devicePush } = result.data;
      if (!devicePush.enabled) {
        setToast(`${notifiedUsers} জনের in-app reminder তৈরি হয়েছে, কিন্তু device push server-এ চালু নেই।`);
      } else if (!devicePush.sent) {
        setToast(`${notifiedUsers} জনের in-app reminder তৈরি হয়েছে, কিন্তু কোনো device push পাঠানো যায়নি।`);
      } else {
        setToast(`${notifiedUsers} জনকে reminder এবং ${devicePush.sent}টি device push পাঠানো হয়েছে।`);
      }
    } catch {
      setToast('Quran reminder পাঠানো যায়নি।');
    } finally {
      setSendingReminder(false);
    }
  };

  const days = useMemo(() => {
    if (!isCalendarDate(data.weekly.fromDate)) {
      return [];
    }
    return Array.from({ length: 7 }, (_, index) => addDays(data.weekly.fromDate, index)).filter((date): date is string => Boolean(date));
  }, [data.weekly.fromDate]);
  const penaltyDays = useMemo(() => {
    if (!isCalendarDate(data.penaltyWeekly.fromDate)) {
      return [];
    }
    return Array.from({ length: 7 }, (_, index) => addDays(data.penaltyWeekly.fromDate, index)).filter((date): date is string => Boolean(date));
  }, [data.penaltyWeekly.fromDate]);
  const completedUsers = data.weekly.rows.filter((row) => days.some((date) => row.days?.[date]?.done)).length;
  const totalMarks = data.weekly.rows.reduce((sum, row) => sum + days.filter((date) => row.days?.[date]?.done).length, 0);
  const totalPages = data.weekly.rows.reduce((sum, row) => (
    sum + days.reduce((daySum, date) => daySum + Number(row.days?.[date]?.pagesRead ?? 0), 0)
  ), 0);
  const totalMinutes = data.weekly.rows.reduce((sum, row) => (
    sum + days.reduce((daySum, date) => daySum + Number(row.days?.[date]?.minutesRead ?? 0), 0)
  ), 0);

  const rows = data.weekly.rows.map((row) => ({
    id: String(row.user_id),
    searchText: `${row.full_name} ${row.mobile}`,
    sortValues: [row.full_name, row.mobile, ...days.map((date) => row.days?.[date]?.done ? 1 : 0)],
    cells: [
      <div key={`${row.user_id}-user`}>
        <p className="font-bold text-fg">{row.full_name}</p>
        <p className="text-xs text-muted">{row.mobile}</p>
      </div>,
      ...days.map((date) => {
        const item = row.days?.[date];
        return (
          <div key={`${row.user_id}-${date}`} className="min-w-20 text-center">
            <span className={item?.done ? 'font-bold text-success' : 'text-muted'}>{item?.done ? 'Done' : '-'}</span>
            {(item?.pagesRead || item?.minutesRead || item?.surahName || item?.prayersOffered || item?.congregationalPrayers) && (
              <p className="mt-1 text-[11px] leading-4 text-muted">
                {[
                  item.surahName,
                  item.pagesRead ? `${item.pagesRead} পৃ.` : '',
                  item.minutesRead ? `${item.minutesRead} মি.` : '',
                  item.prayersOffered !== null && item.prayersOffered !== undefined ? `Namaj ${item.prayersOffered} ওয়াক্ত` : '',
                  item.congregationalPrayers !== null && item.congregationalPrayers !== undefined ? `Jamat ${item.congregationalPrayers} ওয়াক্ত` : '',
                ].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        );
      }),
      `${days.filter((date) => row.days?.[date]?.done).length}/7`,
    ],
  }));

  const penaltiesByUserId = new Map(data.penalties.rows.map((row) => [row.user_id, row]));
  const penaltyRows = data.penaltyWeekly.rows.map((member) => {
    const penalty = penaltiesByUserId.get(member.user_id);
    const doneDays = penaltyDays.filter((date) => member.days?.[date]?.done).length;
    const missedDays = penalty?.missed_days ?? Math.max(0, 7 - doneDays);
    const penaltyAmount = toMinorNumber(penalty?.penalty_minor);

    return {
      id: String(member.user_id),
      searchText: `${member.full_name} ${member.mobile}`,
      sortValues: [member.full_name, doneDays, missedDays, penaltyAmount],
      cells: [
        <div key={`${member.user_id}-user`}>
          <p className="font-bold text-fg">{member.full_name}</p>
          <p className="text-xs text-muted">{member.mobile}</p>
        </div>,
        `${doneDays}/7`,
        String(missedDays),
        <span key={`${member.user_id}-amount`} className={penaltyAmount ? 'font-semibold text-danger tabular-nums' : 'font-semibold text-success tabular-nums'}>{formatCurrencyBn(penaltyAmount)}</span>,
        penalty?.transaction_id ? `#${penalty.transaction_id}` : '-',
      ],
    };
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <section>
        <SectionHeader title="Quran সাপ্তাহিক রিপোর্ট" subtitle={`${toBanglaDate(data.weekly.fromDate)} - ${toBanglaDate(data.weekly.toDate)}`} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="সদস্য" value={String(data.weekly.rows.length)} hint="সক্রিয় ইনতিফাদাহ ব্যবহারকারী" />
          <MetricCard label="অংশগ্রহণ" value={String(completedUsers)} hint="এই সপ্তাহে অন্তত ১ দিন" />
          <MetricCard label="মোট Done" value={String(totalMarks)} hint={`${totalPages} পৃষ্ঠা / ${totalMinutes} মিনিট`} />
          <MetricCard label="Penalty" value={formatCurrencyBn(data.penalties.totalPenaltyMinor)} hint={`${data.penalties.totalMissedDays} missed days (গত পূর্ণ সপ্তাহ)`} />
        </div>
      </section>

      <section>
        <Card>
          <SectionHeader
            title="সদস্যভিত্তিক ৭ দিনের ট্র্যাক"
            subtitle="শুক্রবার থেকে বৃহস্পতিবারের Done অবস্থা"
            action={(
              <div className="flex flex-wrap gap-2">
                <label className="relative">
                  <span className="sr-only">সপ্তাহ বাছাই</span>
                  <select value={weekOffset} onChange={(event) => setWeekOffset(Number(event.target.value))} className="h-10 rounded-lg border border-border bg-white px-3 pr-8 text-sm font-semibold text-fg outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20">
                    <option value={0}>চলতি সপ্তাহ</option>
                    <option value={1}>গত সপ্তাহ</option>
                    <option value={2}>২ সপ্তাহ আগে</option>
                    <option value={3}>৩ সপ্তাহ আগে</option>
                    <option value={4}>৪ সপ্তাহ আগে</option>
                  </select>
                </label>
                {roleKey === 'super_admin' && (
                  <Button variant="secondary" onClick={() => void sendReminder()} disabled={sendingReminder}>
                    <BellRing className="h-4 w-4" />{sendingReminder ? 'পাঠানো হচ্ছে...' : 'Quran reminder পাঠান'}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => void runPenalties(true)} disabled={running || reapplying}><RefreshCw className="h-4 w-4" />{reapplying ? 'পুনরায় হিসাব হচ্ছে...' : 'Reapply penalty'}</Button>
                <Button onClick={() => void runPenalties()} disabled={running || reapplying}><Play className="h-4 w-4" />{running ? 'চলছে...' : 'Penalty run'}</Button>
              </div>
            )}
          />
          <DataTable
            headers={[
              'সদস্য',
              ...days.map((date) => toBanglaDate(date)),
              'মোট',
            ]}
            rows={rows}
            searchPlaceholder="সদস্য বা ফোন..."
            emptyMessage="এই সপ্তাহে কোনো সদস্য পাওয়া যায়নি"
          />
        </Card>
      </section>

      <section>
        <Card>
          <SectionHeader title="সদস্যভিত্তিক Quran penalty" subtitle={`${toBanglaDate(data.penalties.fromDate)} - ${toBanglaDate(data.penalties.toDate)} এর মিসড দিনের হিসাব`} />
          <DataTable
            headers={['সদস্য', 'Done', 'Missed', 'Penalty', 'Transaction']}
            rows={penaltyRows}
            searchPlaceholder="সদস্য, ফোন বা তারিখ..."
            emptyMessage="এই ইন্টারভালে কোনো সদস্য পাওয়া যায়নি"
          />
        </Card>
      </section>

      <AppToast message={toast} />
    </PageStack>
  );
}
