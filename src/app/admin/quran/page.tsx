'use client';

import { useCallback, useMemo, useState } from 'react';
import { Play, Search } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { PageStack } from '@/components/custom/PageStack';
import {
  getAdminQuranWeeklyReport,
  getAdminQuranPenalties,
  queryKeys,
  runAdminQuranPenalties,
  toBanglaDate,
  toMinorNumber,
  useApiQuery,
} from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';

function getWeekStart(date = new Date()) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  return monday.toISOString().slice(0, 10);
}

function addDays(dateText: string, days: number) {
  const date = new Date(dateText);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function AdminQuranPage() {
  const [fromDate, setFromDate] = useState(getWeekStart());
  const [running, setRunning] = useState(false);

  const params = useMemo(() => ({
    fromDate,
    toDate: addDays(fromDate, 6),
  }), [fromDate]);

  const loadReport = useCallback(async () => {
    const [weekly, penalties] = await Promise.all([
      getAdminQuranWeeklyReport(params),
      getAdminQuranPenalties(params),
    ]);
    return { weekly, penalties };
  }, [params]);

  const { data, loading, error, refetch } = useApiQuery(loadReport, { weekly: { ...params, rows: [] }, penalties: { rows: [], totalPenaltyMinor: 0, totalMissedDays: 0 } }, [params.fromDate, params.toDate], {
    cacheKey: `${queryKeys.admin.quranWeekly(params)}:${queryKeys.admin.quranPenalties(params)}`,
    staleTimeMs: 30_000,
  });

  const runPenalties = async () => {
    setRunning(true);
    try {
      await runAdminQuranPenalties(params);
      await refetch();
    } finally {
      setRunning(false);
    }
  };

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(data.weekly.fromDate, index)), [data.weekly.fromDate]);
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
            {(item?.pagesRead || item?.minutesRead || item?.surahName) && (
              <p className="mt-1 text-[11px] leading-4 text-muted">
                {[item.surahName, item.pagesRead ? `${item.pagesRead} পৃ.` : '', item.minutesRead ? `${item.minutesRead} মি.` : ''].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        );
      }),
      `${days.filter((date) => row.days?.[date]?.done).length}/7`,
    ],
  }));

  const penaltyRows = data.penalties.rows.map((row) => ({
    id: String(row.id),
    searchText: `${row.full_name} ${row.mobile} ${row.from_date} ${row.to_date}`,
    sortValues: [row.full_name, row.missed_days, toMinorNumber(row.penalty_minor), row.to_date],
    cells: [
      <div key={`${row.id}-user`}>
        <p className="font-bold text-fg">{row.full_name}</p>
        <p className="text-xs text-muted">{row.mobile}</p>
      </div>,
      `${toBanglaDate(row.from_date)} - ${toBanglaDate(row.to_date)}`,
      String(row.missed_days),
      <span key={`${row.id}-amount`} className="font-semibold text-danger tabular-nums">{formatCurrencyBn(toMinorNumber(row.penalty_minor))}</span>,
      row.transaction_id ? `#${row.transaction_id}` : '-',
    ],
  }));

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
          <MetricCard label="Penalty" value={formatCurrencyBn(data.penalties.totalPenaltyMinor)} hint={`${data.penalties.totalMissedDays} missed days`} />
        </div>
      </section>

      <section>
        <Card>
          <SectionHeader
            title="সদস্যভিত্তিক ৭ দিনের ট্র্যাক"
            subtitle="প্রতিটি সারিতে সপ্তাহের Done অবস্থা"
            action={(
              <div className="flex items-center gap-2">
                <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                <Button variant="secondary" onClick={() => void refetch()}><Search className="h-4 w-4" />দেখুন</Button>
                <Button onClick={() => void runPenalties()} disabled={running}><Play className="h-4 w-4" />{running ? 'চলছে...' : 'Penalty run'}</Button>
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
          <SectionHeader title="Quran penalty" subtitle="মিসড দিনের হিসাব ও সংরক্ষিত penalty transaction" />
          <DataTable
            headers={['সদস্য', 'ইন্টারভাল', 'Missed', 'Penalty', 'Transaction']}
            rows={penaltyRows}
            searchPlaceholder="সদস্য, ফোন বা তারিখ..."
            emptyMessage="এই ইন্টারভালে কোনো penalty নেই"
          />
        </Card>
      </section>
    </PageStack>
  );
}
