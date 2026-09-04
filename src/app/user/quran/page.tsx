'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { PageStack } from '@/components/custom/PageStack';
import { useAuth } from '@/contexts/AuthContext';
import {
  createUserQuranProgress,
  getErrorMessage,
  getInternalQuranWeeklyCompletion,
  getMyQuranPenalties,
  getUserQuranProgress,
  queryKeys,
  toBanglaDate,
  toMinorNumber,
  useApiQuery,
  updateUserQuranProgress,
} from '@/lib/api';
import type { ApiQuranProgressRow, QuranProgressInput } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';

const today = () => new Date().toISOString().slice(0, 10);
const fortyTwoDaysAgo = () => new Date(Date.now() - 42 * 86400000).toISOString().slice(0, 10);

function addDays(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function weekRange(offset: number) {
  const dateText = today();
  const dayOfWeek = new Date(`${dateText}T00:00:00.000Z`).getUTCDay();
  const daysSinceFriday = (dayOfWeek + 2) % 7;
  const fromDate = addDays(dateText, -daysSinceFriday - (offset * 7)) || dateText;
  return { fromDate, toDate: addDays(fromDate, 6) || fromDate };
}

const DEFAULT_FORM: QuranProgressInput = {
  progressDate: today(),
  pagesRead: null,
  surahName: '',
  minutesRead: null,
  prayersOffered: null,
  congregationalPrayers: null,
  note: '',
};

export default function UserQuranPage() {
  const { userKind } = useAuth();
  const isIntifadahMember = userKind === 1;
  const [form, setForm] = useState<QuranProgressInput>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const loadProgress = useCallback(async () => {
    const rows = await getUserQuranProgress({ fromDate: fortyTwoDaysAgo() });
    return { rows };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadProgress, { rows: [] }, [], {
    cacheKey: queryKeys.user.quranProgress({ scope: '30d' }),
    staleTimeMs: 5 * 60_000,
  });
  // Earlier app versions warmed this cache with the raw array. Keep that cached
  // shape valid while the current bundle replaces it with the object form.
  const progressRows: ApiQuranProgressRow[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.rows) ? data.rows : [];

  const loadWeeklyCompletion = useCallback(() => getInternalQuranWeeklyCompletion({ weekOffset }), [weekOffset]);
  const {
    data: weeklyCompletion,
    loading: weeklyLoading,
    error: weeklyError,
    refetch: refetchWeeklyCompletion,
  } = useApiQuery(loadWeeklyCompletion, { fromDate: '', toDate: '', rows: [] }, [weekOffset], {
    cacheKey: queryKeys.user.quranWeeklyCompletion({ weekOffset }),
    staleTimeMs: 60_000,
    enabled: isIntifadahMember,
  });

  const loadPenalties = useCallback(() => getMyQuranPenalties(), []);
  const {
    data: penalties,
    loading: penaltiesLoading,
    error: penaltiesError,
    refetch: refetchPenalties,
  } = useApiQuery(loadPenalties, { rows: [], totalPenaltyMinor: 0, totalMissedDays: 0 }, [], {
    cacheKey: queryKeys.user.quranPenalties(),
    staleTimeMs: 60_000,
  });

  const selectedDate = form.progressDate || today();
  const selectedRecord = progressRows.find((item) => item.progress_date.slice(0, 10) === selectedDate);
  const selectedRecordId = selectedRecord?.id;
  const selectedRecordPages = selectedRecord?.pages_read ?? null;
  const selectedRecordSurah = selectedRecord?.surah_name ?? '';
  const selectedRecordMinutes = selectedRecord?.minutes_read ?? null;
  const selectedRecordPrayersOffered = selectedRecord?.prayers_offered ?? null;
  const selectedRecordCongregationalPrayers = selectedRecord?.congregational_prayers ?? null;
  const selectedRecordNote = selectedRecord?.note ?? '';
  const selectedDateDone = Boolean(selectedRecord);
  const todayDone = progressRows.some((item) => item.progress_date.slice(0, 10) === today());

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const updateForm = <K extends keyof QuranProgressInput>(key: K, value: QuranProgressInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectRecordDate = (progressDate: string) => {
    const record = progressRows.find((item) => item.progress_date.slice(0, 10) === progressDate);
    setForm({
      progressDate,
      pagesRead: record?.pages_read ?? null,
      surahName: record?.surah_name ?? '',
      minutesRead: record?.minutes_read ?? null,
      prayersOffered: record?.prayers_offered ?? null,
      congregationalPrayers: record?.congregational_prayers ?? null,
      note: record?.note ?? '',
    });
  };

  useEffect(() => {
    if (!selectedRecordId) return;
    // The server record becomes editable as soon as it arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((current) => ({
      ...current,
      pagesRead: selectedRecordPages,
      surahName: selectedRecordSurah,
      minutesRead: selectedRecordMinutes,
      prayersOffered: selectedRecordPrayersOffered,
      congregationalPrayers: selectedRecordCongregationalPrayers,
      note: selectedRecordNote,
    }));
  }, [selectedRecordCongregationalPrayers, selectedRecordId, selectedRecordMinutes, selectedRecordNote, selectedRecordPages, selectedRecordPrayersOffered, selectedRecordSurah]);

  const saveProgress = async () => {
    setSaving(true);
    try {
      const input = {
        progressDate: selectedDate,
        pagesRead: form.pagesRead ?? null,
        surahName: form.surahName?.trim() || undefined,
        minutesRead: form.minutesRead ?? null,
        prayersOffered: form.prayersOffered ?? null,
        congregationalPrayers: form.congregationalPrayers ?? null,
        note: form.note?.trim() || undefined,
      };

      if (selectedRecord) {
        await updateUserQuranProgress(selectedRecord.id, input);
        showToast('Quran ও Namaj রেকর্ডের তথ্য আপডেট করা হয়েছে।');
      } else {
        await createUserQuranProgress(input);
        showToast(selectedDate === today() ? 'আজকের Quran ও Namaj রেকর্ড করা হয়েছে।' : 'Quran ও Namaj রেকর্ড সংরক্ষণ হয়েছে।');
      }
      await refetch();
      await refetchPenalties();
      if (isIntifadahMember) {
        await refetchWeeklyCompletion();
      }
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const rows = progressRows.map((item) => ({
    id: String(item.id),
    searchText: `${item.progress_date} ${item.surah_name ?? ''} ${item.note ?? ''}`,
    sortValues: [item.progress_date, item.pages_read ?? 0, item.minutes_read ?? 0, item.surah_name ?? ''],
    cells: [
      toBanglaDate(item.progress_date),
      item.pages_read ?? '-',
      item.surah_name ?? '-',
      item.minutes_read ? `${item.minutes_read} মিনিট` : '-',
      item.prayers_offered ?? '-',
      item.congregational_prayers ?? '-',
      item.note ?? '-',
    ],
  }));

  const metrics = useMemo(() => {
    const pages = progressRows.reduce((sum, item) => sum + Number(item.pages_read ?? 0), 0);
    const minutes = progressRows.reduce((sum, item) => sum + Number(item.minutes_read ?? 0), 0);
    return [
      { label: '৩০ দিনের রেকর্ড', value: String(progressRows.length), hint: 'কুরআন পড়া হয়েছে এমন দিন' },
      { label: 'আজ', value: todayDone ? 'পড়া হয়েছে' : 'বাকি', hint: todayDone ? 'আজকের রেকর্ড আছে' : 'এখনও রেকর্ড করা হয়নি' },
      { label: 'মোট পৃষ্ঠা', value: String(pages), hint: 'দেওয়া তথ্য থেকে' },
      { label: 'মোট সময়', value: `${minutes} মিনিট`, hint: 'দেওয়া তথ্য থেকে' },
    ];
  }, [progressRows, todayDone]);

  const selectedWeek = useMemo(() => weekRange(weekOffset), [weekOffset]);
  const weeklyStartDate = isCalendarDate(weeklyCompletion.fromDate) ? weeklyCompletion.fromDate : selectedWeek.fromDate;
  const weeklyEndDate = isCalendarDate(weeklyCompletion.toDate) ? weeklyCompletion.toDate : selectedWeek.toDate;
  const weeklyDays = useMemo(() => {
    if (!weeklyStartDate) {
      return [];
    }

    return Array.from({ length: 7 }, (_, index) => addDays(weeklyStartDate, index)).filter((date): date is string => Boolean(date));
  }, [weeklyStartDate]);

  const weeklyRows = weeklyCompletion.rows.map((row) => ({
    id: String(row.user_id),
    searchText: row.full_name,
    sortValues: [row.full_name, ...weeklyDays.map((date) => row.days?.[date]?.done ? 1 : 0)],
    cells: [
      <p key={`${row.user_id}-name`} className="font-bold text-fg">{row.full_name}</p>,
      ...weeklyDays.map((date) => (
        <span key={`${row.user_id}-${date}`} className={row.days?.[date]?.done ? 'font-bold text-success' : 'text-muted'}>
          {row.days?.[date]?.done ? 'Done' : '-'}
        </span>
      )),
      `${weeklyDays.filter((date) => row.days?.[date]?.done).length}/7`,
    ],
  }));

  const personalWeeklyRows = weeklyDays.map((date) => {
    const record = progressRows.find((item) => item.progress_date.slice(0, 10) === date);
    const quranDetails = [
      record?.surah_name,
      record?.pages_read !== null && record?.pages_read !== undefined ? `${record.pages_read} পৃষ্ঠা` : '',
      record?.minutes_read !== null && record?.minutes_read !== undefined ? `${record.minutes_read} মিনিট` : '',
    ].filter(Boolean).join(' · ');

    return {
      id: date,
      searchText: date,
      sortValues: [date, record ? 1 : 0],
      cells: [
        toBanglaDate(date),
        <span key={`${date}-done`} className={record ? 'font-bold text-success' : 'text-muted'}>{record ? 'Done' : '-'}</span>,
        quranDetails || '-',
        record?.prayers_offered ?? '-',
        record?.congregational_prayers ?? '-',
      ],
    };
  });

  const penaltyRows = penalties.rows.map((row) => ({
    id: String(row.id),
    searchText: `${row.from_date} ${row.to_date}`,
    sortValues: [row.to_date, row.missed_days, toMinorNumber(row.penalty_minor)],
    cells: [
      `${toBanglaDate(row.from_date)} - ${toBanglaDate(row.to_date)}`,
      String(row.missed_days),
      <span key={`${row.id}-amount`} className="font-semibold text-danger tabular-nums">{formatCurrencyBn(toMinorNumber(row.penalty_minor))}</span>,
      row.transaction_id ? `#${row.transaction_id}` : '-',
    ],
  }));

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <Card className="border-brand/20 bg-brand-light/25">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white"><BookOpenCheck className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-bold text-fg">{selectedDate === today() ? 'আজ Quran ও Namaj হয়েছে?' : 'এই দিনের Quran ও Namaj রেকর্ড'}</h2>
              <p className="mt-1 text-sm text-fg-2">Quran-এর তথ্য ও Namaj-এর ওয়াক্ত চাইলে দিন। কিছু না দিলেও দিনের রেকর্ড সংরক্ষণ করতে পারবেন।</p>
            </div>
          </div>
          {selectedDateDone && <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success"><CheckCircle2 className="h-4 w-4" />রেকর্ড করা হয়েছে, তথ্য আপডেট করা যাবে</span>}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={selectedDate} onChange={(event) => selectRecordDate(event.target.value)} /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পৃষ্ঠা</span><Input type="number" value={form.pagesRead ?? ''} onChange={(event) => updateForm('pagesRead', event.target.value ? Number(event.target.value) : null)} placeholder="ঐচ্ছিক" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">সুরা</span><Input value={form.surahName ?? ''} onChange={(event) => updateForm('surahName', event.target.value)} placeholder="ঐচ্ছিক" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">সময়</span><Input type="number" value={form.minutesRead ?? ''} onChange={(event) => updateForm('minutesRead', event.target.value ? Number(event.target.value) : null)} placeholder="মিনিট (ঐচ্ছিক)" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">Namaj পড়া হয়েছে</span><Input type="number" min="0" max="5" value={form.prayersOffered ?? ''} onChange={(event) => updateForm('prayersOffered', event.target.value ? Number(event.target.value) : null)} placeholder="কত ওয়াক্ত" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">Jamat-এ পড়া হয়েছে</span><Input type="number" min="0" max="5" value={form.congregationalPrayers ?? ''} onChange={(event) => updateForm('congregationalPrayers', event.target.value ? Number(event.target.value) : null)} placeholder="কত ওয়াক্ত" /></label>
          <label className="space-y-1 sm:col-span-2 xl:col-span-3"><span className="text-xs font-semibold text-fg-2">নোট</span><Input value={form.note ?? ''} onChange={(event) => updateForm('note', event.target.value)} placeholder="ঐচ্ছিক নোট" /></label>
          <div className="flex items-end">
            <Button fullWidth size="lg" onClick={() => void saveProgress()} disabled={saving}>
              <Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : selectedRecord ? 'তথ্য আপডেট করুন' : selectedDate === today() ? 'আজ Quran ও Namaj হয়েছে' : 'রেকর্ড সংরক্ষণ করুন'}
            </Button>
          </div>
        </div>
      </Card>

      <section>
        <SectionHeader title="Quran ও Namaj অগ্রগতি" subtitle="প্রতিদিনের অগ্রগতি একবারে রেকর্ড করুন" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>
      </section>

      <section>
        <Card>
          <SectionHeader
            title="আমার সাপ্তাহিক Quran ও Namaj"
            subtitle={`${toBanglaDate(weeklyStartDate)} - ${toBanglaDate(weeklyEndDate)}`}
            action={(
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
            )}
          />
          <DataTable
            headers={['তারিখ', 'Done', 'Quran', 'Namaj', 'Jamat']}
            rows={personalWeeklyRows}
            searchPlaceholder="তারিখ দিয়ে খুঁজুন..."
            emptyMessage="এই সপ্তাহে কোনো দিন নেই"
          />
        </Card>
      </section>

      {isIntifadahMember && (
        <section>
          {weeklyError && <ApiErrorNotice message={weeklyError} onRetry={() => void refetchWeeklyCompletion()} />}
          <Card>
            <SectionHeader
              title="ইনতিফাদাহ সদস্যদের সাপ্তাহিক Done"
              subtitle={`${toBanglaDate(weeklyStartDate)} - ${toBanglaDate(weeklyEndDate)}`}
            />
            {weeklyLoading ? <ApiLoadingNotice label="সাপ্তাহিক Done অবস্থা লোড হচ্ছে..." /> : (
              <DataTable
                headers={['সদস্য', ...weeklyDays.map((date) => toBanglaDate(date)), 'মোট']}
                rows={weeklyRows}
                searchPlaceholder="সদস্যের নাম..."
                emptyMessage="এই সপ্তাহে কোনো ইনতিফাদাহ সদস্য পাওয়া যায়নি"
              />
            )}
          </Card>
        </section>
      )}

      <section>
        {penaltiesError && <ApiErrorNotice message={penaltiesError} onRetry={() => void refetchPenalties()} />}
        <Card>
          <SectionHeader title="আপনার Quran penalty" subtitle={`${penalties.totalMissedDays} missed days, মোট ${formatCurrencyBn(penalties.totalPenaltyMinor)}`} />
          {penaltiesLoading ? <ApiLoadingNotice label="Penalty হিসাব লোড হচ্ছে..." /> : (
            <DataTable
              headers={['ইন্টারভাল', 'Missed', 'Penalty', 'Transaction']}
              rows={penaltyRows}
              searchPlaceholder="তারিখ দিয়ে খুঁজুন..."
              emptyMessage="আপনার কোনো Quran penalty নেই"
            />
          )}
        </Card>
      </section>

      <section>
        <Card>
          <SectionHeader title="রেকর্ড ইতিহাস" subtitle="সর্বশেষ ৪২ দিনের Quran ও Namaj progress" />
          {loading ? <ApiLoadingNotice label="Quran ও Namaj রেকর্ড লোড হচ্ছে..." /> : (
            <DataTable
              headers={['তারিখ', 'পৃষ্ঠা', 'সুরা', 'সময়', 'Namaj', 'Jamat', 'নোট']}
              rows={rows}
              searchPlaceholder="তারিখ, সুরা বা নোট..."
              emptyMessage="এখনও কোনো Quran রেকর্ড নেই"
            />
          )}
        </Card>
      </section>

      <AppToast message={toast} />
    </PageStack>
  );
}
