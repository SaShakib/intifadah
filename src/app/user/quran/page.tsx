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
  getUserQuranProgress,
  queryKeys,
  toBanglaDate,
  useApiQuery,
  updateUserQuranProgress,
} from '@/lib/api';
import type { QuranProgressInput } from '@/lib/api';

const today = () => new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = () => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

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

const DEFAULT_FORM: QuranProgressInput = {
  progressDate: today(),
  pagesRead: null,
  surahName: '',
  minutesRead: null,
  note: '',
};

export default function UserQuranPage() {
  const { userKind } = useAuth();
  const isIntifadahMember = userKind === 1;
  const [form, setForm] = useState<QuranProgressInput>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    const rows = await getUserQuranProgress({ fromDate: thirtyDaysAgo() });
    return { rows };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadProgress, { rows: [] }, [], {
    cacheKey: queryKeys.user.quranProgress({ scope: '30d' }),
    staleTimeMs: 5 * 60_000,
  });

  const loadWeeklyCompletion = useCallback(() => getInternalQuranWeeklyCompletion(), []);
  const {
    data: weeklyCompletion,
    loading: weeklyLoading,
    error: weeklyError,
    refetch: refetchWeeklyCompletion,
  } = useApiQuery(loadWeeklyCompletion, { fromDate: '', toDate: '', rows: [] }, [], {
    cacheKey: queryKeys.user.quranWeeklyCompletion(),
    staleTimeMs: 60_000,
    enabled: isIntifadahMember,
  });

  const selectedDate = form.progressDate || today();
  const selectedRecord = data.rows.find((item) => item.progress_date.slice(0, 10) === selectedDate);
  const selectedRecordId = selectedRecord?.id;
  const selectedRecordPages = selectedRecord?.pages_read ?? null;
  const selectedRecordSurah = selectedRecord?.surah_name ?? '';
  const selectedRecordMinutes = selectedRecord?.minutes_read ?? null;
  const selectedRecordNote = selectedRecord?.note ?? '';
  const selectedDateDone = Boolean(selectedRecord);
  const todayDone = data.rows.some((item) => item.progress_date.slice(0, 10) === today());

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const updateForm = <K extends keyof QuranProgressInput>(key: K, value: QuranProgressInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectRecordDate = (progressDate: string) => {
    const record = data.rows.find((item) => item.progress_date.slice(0, 10) === progressDate);
    setForm({
      progressDate,
      pagesRead: record?.pages_read ?? null,
      surahName: record?.surah_name ?? '',
      minutesRead: record?.minutes_read ?? null,
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
      note: selectedRecordNote,
    }));
  }, [selectedRecordId, selectedRecordMinutes, selectedRecordNote, selectedRecordPages, selectedRecordSurah]);

  const saveProgress = async () => {
    setSaving(true);
    try {
      const input = {
        progressDate: selectedDate,
        pagesRead: form.pagesRead ?? null,
        surahName: form.surahName?.trim() || undefined,
        minutesRead: form.minutesRead ?? null,
        note: form.note?.trim() || undefined,
      };

      if (selectedRecord) {
        await updateUserQuranProgress(selectedRecord.id, input);
        showToast('Quran রেকর্ডের তথ্য আপডেট করা হয়েছে।');
      } else {
        await createUserQuranProgress(input);
        showToast(selectedDate === today() ? 'আজকের Quran পড়া রেকর্ড করা হয়েছে।' : 'Quran পড়ার রেকর্ড সংরক্ষণ হয়েছে।');
      }
      await refetch();
      if (isIntifadahMember) {
        await refetchWeeklyCompletion();
      }
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const rows = data.rows.map((item) => ({
    id: String(item.id),
    searchText: `${item.progress_date} ${item.surah_name ?? ''} ${item.note ?? ''}`,
    sortValues: [item.progress_date, item.pages_read ?? 0, item.minutes_read ?? 0, item.surah_name ?? ''],
    cells: [
      toBanglaDate(item.progress_date),
      item.pages_read ?? '-',
      item.surah_name ?? '-',
      item.minutes_read ? `${item.minutes_read} মিনিট` : '-',
      item.note ?? '-',
    ],
  }));

  const metrics = useMemo(() => {
    const pages = data.rows.reduce((sum, item) => sum + Number(item.pages_read ?? 0), 0);
    const minutes = data.rows.reduce((sum, item) => sum + Number(item.minutes_read ?? 0), 0);
    return [
      { label: '৩০ দিনের রেকর্ড', value: String(data.rows.length), hint: 'কুরআন পড়া হয়েছে এমন দিন' },
      { label: 'আজ', value: todayDone ? 'পড়া হয়েছে' : 'বাকি', hint: todayDone ? 'আজকের রেকর্ড আছে' : 'এখনও রেকর্ড করা হয়নি' },
      { label: 'মোট পৃষ্ঠা', value: String(pages), hint: 'দেওয়া তথ্য থেকে' },
      { label: 'মোট সময়', value: `${minutes} মিনিট`, hint: 'দেওয়া তথ্য থেকে' },
    ];
  }, [data.rows, todayDone]);

  const weeklyStartDate = isCalendarDate(weeklyCompletion.fromDate) ? weeklyCompletion.fromDate : null;
  const weeklyEndDate = isCalendarDate(weeklyCompletion.toDate) ? weeklyCompletion.toDate : null;
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

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <Card className="border-brand/20 bg-brand-light/25">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white"><BookOpenCheck className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-bold text-fg">{selectedDate === today() ? 'আজ কুরআন পড়া হয়েছে?' : 'এই দিনের কুরআন রেকর্ড'}</h2>
              <p className="mt-1 text-sm text-fg-2">পৃষ্ঠা, সুরা, সময় ও নোট চাইলে দিন। কিছু না দিলেও শুধু পড়া হয়েছে হিসেবে সংরক্ষণ করতে পারবেন।</p>
            </div>
          </div>
          {selectedDateDone && <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success"><CheckCircle2 className="h-4 w-4" />রেকর্ড করা হয়েছে, তথ্য আপডেট করা যাবে</span>}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={selectedDate} onChange={(event) => selectRecordDate(event.target.value)} /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পৃষ্ঠা</span><Input type="number" value={form.pagesRead ?? ''} onChange={(event) => updateForm('pagesRead', event.target.value ? Number(event.target.value) : null)} placeholder="ঐচ্ছিক" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">সুরা</span><Input value={form.surahName ?? ''} onChange={(event) => updateForm('surahName', event.target.value)} placeholder="ঐচ্ছিক" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">সময়</span><Input type="number" value={form.minutesRead ?? ''} onChange={(event) => updateForm('minutesRead', event.target.value ? Number(event.target.value) : null)} placeholder="মিনিট (ঐচ্ছিক)" /></label>
          <label className="space-y-1 sm:col-span-2 xl:col-span-3"><span className="text-xs font-semibold text-fg-2">নোট</span><Input value={form.note ?? ''} onChange={(event) => updateForm('note', event.target.value)} placeholder="ঐচ্ছিক নোট" /></label>
          <div className="flex items-end">
            <Button fullWidth size="lg" onClick={() => void saveProgress()} disabled={saving}>
              <Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : selectedRecord ? 'তথ্য আপডেট করুন' : selectedDate === today() ? 'আজ কুরআন পড়া হয়েছে' : 'রেকর্ড সংরক্ষণ করুন'}
            </Button>
          </div>
        </div>
      </Card>

      <section>
        <SectionHeader title="Quran অগ্রগতি" subtitle="প্রতিদিনের পড়া একবারে রেকর্ড করুন" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>
      </section>

      {isIntifadahMember && (
        <section>
          {weeklyError && <ApiErrorNotice message={weeklyError} onRetry={() => void refetchWeeklyCompletion()} />}
          <Card>
            <SectionHeader
              title="ইনতিফাদাহ সদস্যদের সাপ্তাহিক Done"
              subtitle={weeklyStartDate && weeklyEndDate ? `${toBanglaDate(weeklyStartDate)} - ${toBanglaDate(weeklyEndDate)}` : 'শুক্রবার থেকে বৃহস্পতিবার'}
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
        <Card>
          <SectionHeader title="রেকর্ড ইতিহাস" subtitle="সর্বশেষ ৩০ দিনের Quran progress" />
          {loading ? <ApiLoadingNotice label="Quran রেকর্ড লোড হচ্ছে..." /> : (
            <DataTable
              headers={['তারিখ', 'পৃষ্ঠা', 'সুরা', 'সময়', 'নোট']}
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
