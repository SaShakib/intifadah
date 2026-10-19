'use client';

import { useCallback, useMemo, useState } from 'react';
import { Brain, CalendarClock, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { MetricCard } from '@/components/semibase/MetricCard';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { RichTextEditor } from '@/components/custom/RichTextEditor';
import {
  createUserQuranMemorizationReview,
  createUserQuranMemorizationSection,
  deleteUserQuranMemorizationSection,
  getErrorMessage,
  getUserQuranMemorizationSections,
  queryKeys,
  toBanglaDate,
  updateUserQuranMemorizationSection,
  useApiQuery,
} from '@/lib/api';
import type {
  ApiQuranMemorizationSectionRow,
  QuranMemorizationRecallResult,
  QuranMemorizationSectionInput,
} from '@/lib/api';

const today = () => new Date().toISOString().slice(0, 10);

function daysBetween(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00.000Z`).getTime();
  const to = new Date(`${toDate}T00:00:00.000Z`).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / 86400000);
}

const RECALL_LABELS: Record<QuranMemorizationRecallResult, string> = {
  strong: 'শক্তিশালী',
  shaky: 'অনিশ্চিত',
  weak: 'দুর্বল',
  failed: 'ব্যর্থ',
};

const STATUS_LABELS: Record<number, string> = {
  0: 'শিখছে',
  1: 'স্থিতিশীল হচ্ছে',
  2: 'সংরক্ষিত',
};

const RESULT_SEVERITY: Record<string, number> = {
  failed: 0,
  weak: 1,
  shaky: 2,
  strong: 3,
};

const DEFAULT_FORM: QuranMemorizationSectionInput = {
  surahName: '',
  fromAyah: '',
  toAyah: '',
  mushafPage: '',
  pageHalf: '',
  fromLine: '',
  toLine: '',
  memorizedDate: today(),
  note: '',
};

export default function MemorizationSection() {
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sectionModal, setSectionModal] = useState<{ open: boolean; section: ApiQuranMemorizationSectionRow | null }>({ open: false, section: null });
  const [reviewTarget, setReviewTarget] = useState<ApiQuranMemorizationSectionRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiQuranMemorizationSectionRow | null>(null);
  const [form, setForm] = useState<QuranMemorizationSectionInput>(DEFAULT_FORM);
  const [reviewResult, setReviewResult] = useState<QuranMemorizationRecallResult>('strong');
  const [reviewErrors, setReviewErrors] = useState('');
  const [reviewVerified, setReviewVerified] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRecall, setFilterRecall] = useState('all');
  const [browsePage, setBrowsePage] = useState(1);

  const loadSections = useCallback(async () => {
    const rows = await getUserQuranMemorizationSections();
    return { rows };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadSections, { rows: [] }, [], {
    cacheKey: queryKeys.user.quranMemorization(),
    staleTimeMs: 30_000,
  });

  const sections = data.rows;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const refresh = async () => {
    await refetch();
  };

  const dueSections = useMemo(() => {
    const todayText = today();
    return sections
      .filter((item) => item.next_review_date <= todayText)
      .sort((a, b) => {
        const severityDiff = (RESULT_SEVERITY[a.recall_quality ?? 'strong'] ?? 3) - (RESULT_SEVERITY[b.recall_quality ?? 'strong'] ?? 3);
        if (severityDiff !== 0) return severityDiff;
        if (a.next_review_date !== b.next_review_date) return a.next_review_date.localeCompare(b.next_review_date);
        return b.memorized_date.localeCompare(a.memorized_date);
      });
  }, [sections]);

  const weakSections = useMemo(
    () => sections.filter((item) => item.recall_quality === 'weak' || item.recall_quality === 'failed' || item.error_count > 0).slice(0, 8),
    [sections],
  );

  const metrics = useMemo(() => {
    const dueCount = dueSections.length;
    const weakCount = sections.filter((item) => item.recall_quality === 'weak' || item.recall_quality === 'failed').length;
    const maintainedCount = sections.filter((item) => item.status === 2).length;
    return [
      { label: 'মোট সেকশন', value: String(sections.length), hint: 'মুখস্থ করা হাফ-পৃষ্ঠা' },
      { label: 'আজ রিভিউ', value: String(dueCount), hint: 'সময়সীমা পেরিয়েছেসহ' },
      { label: 'দুর্বল', value: String(weakCount), hint: 'দুর্বল বা ব্যর্থ' },
      { label: 'সংরক্ষিত', value: String(maintainedCount), hint: 'দীর্ঘ বিরতিতে স্থিতিশীল' },
    ];
  }, [dueSections.length, sections]);

  const openAdd = () => {
    setForm({ ...DEFAULT_FORM, memorizedDate: today() });
    setSectionModal({ open: true, section: null });
  };

  const openEdit = (section: ApiQuranMemorizationSectionRow) => {
    setForm({
      surahName: section.surah_name,
      fromAyah: section.from_ayah ?? '',
      toAyah: section.to_ayah ?? '',
      mushafPage: section.mushaf_page ?? '',
      pageHalf: section.page_half ?? '',
      fromLine: section.from_line ?? '',
      toLine: section.to_line ?? '',
      memorizedDate: section.memorized_date,
      note: section.note ?? '',
    });
    setSectionModal({ open: true, section });
  };

  const saveSection = async () => {
    if (!form.surahName?.trim()) {
      showToast('সূরার নাম দিন');
      return;
    }
    setBusy(true);
    try {
      const input: QuranMemorizationSectionInput = {
        surahName: form.surahName.trim(),
        fromAyah: form.fromAyah === '' ? null : Number(form.fromAyah),
        toAyah: form.toAyah === '' ? null : Number(form.toAyah),
        mushafPage: form.mushafPage === '' ? null : Number(form.mushafPage),
        pageHalf: form.pageHalf === '' ? null : Number(form.pageHalf),
        fromLine: form.fromLine === '' ? null : Number(form.fromLine),
        toLine: form.toLine === '' ? null : Number(form.toLine),
        memorizedDate: form.memorizedDate,
        note: form.note,
      };
      if (sectionModal.section) {
        await updateUserQuranMemorizationSection(sectionModal.section.id, input);
        showToast('সেকশন আপডেট হয়েছে।');
      } else {
        await createUserQuranMemorizationSection(input);
        showToast('নতুন মুখস্থ সেকশন যোগ হয়েছে।');
      }
      setSectionModal({ open: false, section: null });
      await refresh();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeSection = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteUserQuranMemorizationSection(confirmDelete.id);
      showToast('সেকশন মুছে ফেলা হয়েছে।');
      setConfirmDelete(null);
      await refresh();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openReview = (section: ApiQuranMemorizationSectionRow) => {
    setReviewTarget(section);
    setReviewResult('strong');
    setReviewErrors('');
    setReviewVerified(false);
    setReviewNote('');
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    if (!reviewVerified) {
      showToast('মুশাফ দেখে যাচাই করুন');
      return;
    }
    setBusy(true);
    try {
      await createUserQuranMemorizationReview(reviewTarget.id, {
        result: reviewResult,
        errorCount: reviewErrors ? Number(reviewErrors) : 0,
        verified: true,
        note: reviewNote,
      });
      showToast('রিভিউ সংরক্ষণ হয়েছে।');
      setReviewTarget(null);
      await refresh();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const filteredBrowseSections = useMemo(() => sections.filter((section) => {
    if (filterStatus !== 'all' && String(section.status) !== filterStatus) return false;
    if (filterRecall === 'none' && section.recall_quality) return false;
    if (filterRecall !== 'all' && filterRecall !== 'none' && section.recall_quality !== filterRecall) return false;
    return true;
  }), [sections, filterStatus, filterRecall]);

  const browsePageSize = 10;
  const browseTotalPages = Math.max(1, Math.ceil(filteredBrowseSections.length / browsePageSize));
  const safeBrowsePage = Math.min(browsePage, browseTotalPages);
  const pagedBrowseSections = filteredBrowseSections.slice((safeBrowsePage - 1) * browsePageSize, safeBrowsePage * browsePageSize);

  const sectionToRow = (section: ApiQuranMemorizationSectionRow) => {
    const ayatRange = [section.from_ayah, section.to_ayah].filter((value) => value !== null && value !== undefined).join('–');
    const pageRange = section.mushaf_page ? `${section.mushaf_page}${section.page_half ? (section.page_half === 1 ? ' (প্রথম)' : ' (দ্বিতীয়)') : ''}` : '-';
    const lineRange = [section.from_line, section.to_line].filter((value) => value !== null && value !== undefined).join('–') || '-';
    const category = daysBetween(section.memorized_date, today()) <= 14 ? (daysBetween(section.memorized_date, today()) <= 7 ? 'সাবক' : 'সাবকি') : 'মানজিল';
    return {
      id: String(section.id),
      searchText: `${section.surah_name} ${ayatRange} ${section.note ?? ''}`,
      sortValues: [section.next_review_date, section.surah_name],
      cells: [
        <div key={`${section.id}-title`}>
          <p className="font-bold text-fg">{section.surah_name}</p>
          <p className="text-xs text-fg-2">আয়াত: {ayatRange || '-'} · {category}</p>
        </div>,
        <div key={`${section.id}-location`}>
          <p className="text-sm text-fg">পৃষ্ঠা: {pageRange}</p>
          <p className="text-xs text-fg-2">লাইন: {lineRange}</p>
        </div>,
        toBanglaDate(section.memorized_date),
        toBanglaDate(section.next_review_date),
        <Badge key={`${section.id}-status`} variant={section.status === 2 ? 'success' : section.status === 1 ? 'info' : 'warning'}>{STATUS_LABELS[section.status] ?? '-'}</Badge>,
        <span key={`${section.id}-recall`} className="text-sm font-semibold text-fg">{section.recall_quality ? RECALL_LABELS[section.recall_quality] : '-'}</span>,
        <span key={`${section.id}-errors`} className="tabular-nums text-sm">{section.error_count}</span>,
        <div key={`${section.id}-actions`} className="flex gap-1">
          <Button size="sm" onClick={() => openReview(section)}>রিভিউ</Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(section)}>সম্পাদনা</Button>
          <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-bg" onClick={() => setConfirmDelete(section)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>,
      ],
    };
  };

  const browseRows = pagedBrowseSections.map(sectionToRow);

  return (
    <>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <Card className="border-brand/20 bg-brand-light/25">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white"><Brain className="h-6 w-6" /></span>
            <div>
              <h2 className="text-lg font-bold text-fg">মুখস্থ রিভিউ (Hifz)</h2>
              <p className="mt-1 text-sm text-fg-2">প্রতিটি হাফ-পৃষ্ঠা আলাদা ট্র্যাক করুন, আজকের রিভিউ কিউ দেখুন এবং ফলাফল অনুযায়ী পরবর্তী বিরতি ঠিক করুন।</p>
            </div>
          </div>
          <Button onClick={openAdd} disabled={busy}><Plus className="h-4 w-4" />নতুন সেকশন</Button>
        </div>
      </Card>


      <section>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-fg">সব মুখস্থ সেকশন</h2>
              <p className="mt-1 text-sm text-fg-2">প্রয়োজনে সব সেকশন দেখুন; ফিল্টার ও পেজিনেশনসহ সব সেকশন দেখানো হবে।</p>
            </div>
            <Button variant="secondary" onClick={() => setBrowseOpen((value) => !value)}>
              {browseOpen ? 'বন্ধ করুন' : 'সব সেকশন দেখুন'}
            </Button>
          </div>

          {browseOpen && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-fg-2">অবস্থা</span>
                  <select
                    value={filterStatus}
                    onChange={(event) => { setFilterStatus(event.target.value); setBrowsePage(1); }}
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-fg outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="all">সব</option>
                    <option value="0">শিখছে</option>
                    <option value="1">স্থিতিশীল হচ্ছে</option>
                    <option value="2">সংরক্ষিত</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-fg-2">ফলাফল</span>
                  <select
                    value={filterRecall}
                    onChange={(event) => { setFilterRecall(event.target.value); setBrowsePage(1); }}
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-fg outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="all">সব</option>
                    <option value="strong">শক্তিশালী</option>
                    <option value="shaky">অনিশ্চিত</option>
                    <option value="weak">দুর্বল</option>
                    <option value="failed">ব্যর্থ</option>
                    <option value="none">এখনও রিভিউ হয়নি</option>
                  </select>
                </label>
              </div>

              {loading ? <ApiLoadingNotice label="সেকশন লোড হচ্ছে..." /> : (
                <>
                  <DataTable
                    headers={['সেকশন', 'অবস্থান', 'মুখস্থ তারিখ', 'পরবর্তী রিভিউ', 'অবস্থা', 'ফলাফল', 'ভুল', 'কাজ']}
                    rows={browseRows}
                    searchPlaceholder="সূরা, আয়াত বা নোট..."
                    emptyMessage="এই ফিল্টারে কোনো সেকশন নেই"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-fg-2">
                      {filteredBrowseSections.length}টির মধ্যে {(safeBrowsePage - 1) * browsePageSize + 1}-{Math.min(safeBrowsePage * browsePageSize, filteredBrowseSections.length)} দেখানো হচ্ছে
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" disabled={safeBrowsePage <= 1} onClick={() => setBrowsePage((value) => Math.max(1, value - 1))}>আগে</Button>
                      <span className="inline-flex h-8 items-center px-2 text-sm font-semibold text-fg">{safeBrowsePage}/{browseTotalPages}</span>
                      <Button variant="secondary" size="sm" disabled={safeBrowsePage >= browseTotalPages} onClick={() => setBrowsePage((value) => Math.min(browseTotalPages, value + 1))}>পরে</Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section>
        <Card>
          <SectionHeader title="আজকের রিভিউ কিউ" subtitle="সময়সীমা পেরিয়ে যাওয়া ও দুর্বল সেকশন আগে দেখানো হচ্ছে" />
          {loading ? <ApiLoadingNotice label="মুখস্থ সেকশন লোড হচ্ছে..." /> : dueSections.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 text-sm font-semibold text-fg">আজ কোনো রিভিউ বাকি নেই</p>
              <p className="mt-1 text-xs text-fg-2">নতুন মুখস্থ করতে চাইলে উপরের বাটন ব্যবহার করুন।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueSections.map((section) => {
                const overdueDays = daysBetween(section.next_review_date, today());
                return (
                  <div key={section.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-bold text-fg">{section.surah_name} {section.from_ayah && section.to_ayah ? `· আয়াত ${section.from_ayah}–${section.to_ayah}` : ''}</p>
                      <p className="mt-1 text-xs text-fg-2">
                        পৃষ্ঠা {section.mushaf_page ?? '-'}{section.page_half ? (section.page_half === 1 ? ' (প্রথম)' : ' (দ্বিতীয়)') : ''} · পরবর্তী রিভিউ {toBanglaDate(section.next_review_date)}
                        {overdueDays > 0 ? ` · ${overdueDays} দিন বিলম্ব` : ''}
                        {section.recall_quality ? ` · ${RECALL_LABELS[section.recall_quality]}` : ''}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => openReview(section)}>রিভিউ করুন</Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      {weakSections.length > 0 && (
        <section>
          <Card>
            <SectionHeader title="দুর্বল সেকশন" subtitle="ভুল বা hesitation হয়েছে, এগুলো আগে শক্তিশালী করুন" />
            <div className="space-y-2">
              {weakSections.map((section) => (
                <div key={section.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/20 bg-danger-bg/40 px-3 py-2">
                  <div>
                    <p className="font-semibold text-fg">{section.surah_name}</p>
                    <p className="text-xs text-fg-2">ভুল: {section.error_count} · সর্বশেষ: {section.recall_quality ? RECALL_LABELS[section.recall_quality] : '-'}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => openReview(section)}>আবার রিভিউ</Button>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {dueSections.length > 0 && dueSections.length <= 8 && (
        <section>
          <Card className="border-success/20 bg-success/5">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-bold text-fg">নতুন মুখস্থের সময়</p>
                <p className="text-xs text-fg-2">আজকের রিভিউ কিউ ছোট, তাই ½ পৃষ্ঠা নতুন মুখস্থ করতে পারেন।</p>
              </div>
            </div>
          </Card>
        </section>
      )}

      <AppModal
        open={sectionModal.open}
        title={sectionModal.section ? 'সেকশন সম্পাদনা' : 'নতুন মুখস্থ সেকশন'}
        onClose={() => setSectionModal({ open: false, section: null })}
        loading={busy}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setSectionModal({ open: false, section: null })} disabled={busy}>বাতিল</Button>
            <Button onClick={() => void saveSection()} disabled={busy}>{sectionModal.section ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">সূরা / অধ্যায়</span>
            <Input value={form.surahName ?? ''} onChange={(event) => setForm((current) => ({ ...current, surahName: event.target.value }))} placeholder="যেমন: সূরা আল-বাকারা" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">শুরু আয়াত</span>
              <Input type="number" value={form.fromAyah ?? ''} onChange={(event) => setForm((current) => ({ ...current, fromAyah: event.target.value }))} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">শেষ আয়াত</span>
              <Input type="number" value={form.toAyah ?? ''} onChange={(event) => setForm((current) => ({ ...current, toAyah: event.target.value }))} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">মুশাফ পৃষ্ঠা</span>
              <Input type="number" value={form.mushafPage ?? ''} onChange={(event) => setForm((current) => ({ ...current, mushafPage: event.target.value }))} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">হাফ</span>
              <select
                value={form.pageHalf ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, pageHalf: event.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-fg outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">নির্বাচন</option>
                <option value="1">প্রথম</option>
                <option value="2">দ্বিতীয়</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">মুখস্থের তারিখ</span>
              <Input type="date" value={form.memorizedDate ?? ''} onChange={(event) => setForm((current) => ({ ...current, memorizedDate: event.target.value }))} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">শুরু লাইন</span>
              <Input type="number" value={form.fromLine ?? ''} onChange={(event) => setForm((current) => ({ ...current, fromLine: event.target.value }))} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">শেষ লাইন</span>
              <Input type="number" value={form.toLine ?? ''} onChange={(event) => setForm((current) => ({ ...current, toLine: event.target.value }))} />
            </label>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">নোট</span>
            <RichTextEditor value={form.note ?? ''} onChange={(value) => setForm((current) => ({ ...current, note: value }))} placeholder="নোট লিখুন..." />
          </div>
        </div>
      </AppModal>

      <AppModal
        open={Boolean(reviewTarget)}
        title={reviewTarget ? `${reviewTarget.surah_name} — রিভিউ` : 'রিভিউ'}
        onClose={() => setReviewTarget(null)}
        loading={busy}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setReviewTarget(null)} disabled={busy}>বাতিল</Button>
            <Button onClick={() => void submitReview()} disabled={busy}>সংরক্ষণ করুন</Button>
          </>
        )}
      >
        {reviewTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-fg-2">
              প্রথমে মুখস্থ থেকে পড়ুন, তারপর মুশাফ খুলে যাচাই করুন। ফলাফল অনুযায়ী পরবর্তী বিরতি ঠিক হবে।
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['strong', 'shaky', 'weak', 'failed'] as QuranMemorizationRecallResult[]).map((result) => (
                <button
                  key={result}
                  type="button"
                  onClick={() => setReviewResult(result)}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${reviewResult === result ? 'border-brand bg-brand-light/40 ring-2 ring-brand/20 text-brand' : 'border-border bg-white text-fg hover:border-brand/40'}`}
                >
                  {RECALL_LABELS[result]}
                </button>
              ))}
            </div>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">এই রিভিউতে ভুলের সংখ্যা</span>
              <Input type="number" min="0" value={reviewErrors} onChange={(event) => setReviewErrors(event.target.value)} placeholder="০" />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-fg">
              <input type="checkbox" checked={reviewVerified} onChange={(event) => setReviewVerified(event.target.checked)} />
              মুশাফ দেখে সঠিক শব্দ, হরকত, তাজবিদ ও আয়াত সংযোগ যাচাই করেছি
            </label>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-fg-2">নোট</span>
              <RichTextEditor value={reviewNote} onChange={setReviewNote} placeholder="ভুল, hesitation বা নোট..." />
            </div>
          </div>
        )}
      </AppModal>

      <AppModal
        open={Boolean(confirmDelete)}
        title="সেকশন মুছে ফেলবেন?"
        onClose={() => setConfirmDelete(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={busy}>বাতিল</Button>
            <Button variant="danger" onClick={() => void removeSection()} disabled={busy}>হ্যাঁ, মুছে ফেলুন</Button>
          </>
        )}
      >
        <p className="text-sm text-fg-2">“{confirmDelete?.surah_name}” সেকশন ও এর সব রিভিউ ইতিহাস মুছে যাবে।</p>
      </AppModal>

      <AppToast message={toast} />
    </>
  );
}
