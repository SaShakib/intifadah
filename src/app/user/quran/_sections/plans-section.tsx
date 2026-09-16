'use client';

import { useCallback, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { RichTextPreview } from '@/components/custom/RichTextPreview';
import {
  createUserQuranPlan,
  deleteUserQuranPlan,
  deleteUserQuranPlanProgress,
  getErrorMessage,
  getUserQuranPlanProgress,
  getUserQuranPlans,
  queryKeys,
  toBanglaDate,
  updateUserQuranPlan,
  upsertUserQuranPlanProgress,
  useApiQuery,
} from '@/lib/api';
import type { ApiQuranPlanProgressRow, ApiQuranPlanRow, QuranPlanGoalType, QuranPlanInput } from '@/lib/api';
import { PlanModal } from './plan-modal';
import { ProgressModal } from './progress-modal';

const today = () => new Date().toISOString().slice(0, 10);

const GOAL_LABELS: Record<QuranPlanGoalType, string> = {
  1: 'তিলাওয়াত',
  2: 'মুখস্থ',
};

const GOAL_DETAILS: Record<QuranPlanGoalType, string> = {
  1: 'তিলাওয়াত · পৃষ্ঠা দিয়ে অগ্রগতি',
  2: 'মুখস্থ · আয়াত দিয়ে অগ্রগতি',
};

export default function PlansSection() {
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [planModal, setPlanModal] = useState<{ open: boolean; plan: ApiQuranPlanRow | null }>({ open: false, plan: null });
  const [progressPlan, setProgressPlan] = useState<ApiQuranPlanRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiQuranPlanRow | null>(null);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [progressByPlan, setProgressByPlan] = useState<Record<string, ApiQuranPlanProgressRow[]>>({});
  const [progressLoadingById, setProgressLoadingById] = useState<Record<string, boolean>>({});

  const loadPlans = useCallback(async () => {
    const rows = await getUserQuranPlans();
    return { rows };
  }, []);
  const { data, loading, error, refetch } = useApiQuery(loadPlans, { rows: [] }, [], {
    cacheKey: queryKeys.user.quranPlans(),
    staleTimeMs: 60_000,
  });

  const plans = data.rows;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const loadProgressFor = async (planId: string | number) => {
    const key = String(planId);
    if (progressByPlan[key] || progressLoadingById[key]) {
      return;
    }
    setProgressLoadingById((current) => ({ ...current, [key]: true }));
    try {
      const rows = await getUserQuranPlanProgress(planId);
      setProgressByPlan((current) => ({ ...current, [key]: rows }));
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setProgressLoadingById((current) => ({ ...current, [key]: false }));
    }
  };

  const refreshPlans = async () => {
    await refetch();
  };

  const savePlan = async (input: QuranPlanInput) => {
    setBusy(true);
    try {
      if (planModal.plan) {
        await updateUserQuranPlan(planModal.plan.id, input);
        showToast('প্ল্যান আপডেট হয়েছে।');
      } else {
        await createUserQuranPlan(input);
        showToast('নতুন প্ল্যান তৈরি হয়েছে।');
      }
      setPlanModal({ open: false, plan: null });
      await refreshPlans();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removePlan = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteUserQuranPlan(confirmDelete.id);
      showToast('প্ল্যান মুছে ফেলা হয়েছে।');
      setConfirmDelete(null);
      if (expandedId === String(confirmDelete.id)) {
        setExpandedId(null);
      }
      await refreshPlans();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleComplete = async (plan: ApiQuranPlanRow) => {
    setBusy(true);
    try {
      await updateUserQuranPlan(plan.id, { status: plan.status === 1 ? 0 : 1 });
      showToast(plan.status === 1 ? 'প্ল্যান আবার সক্রিয় করা হয়েছে।' : 'চমৎকার! প্ল্যান সম্পন্ন হিসেবে চিহ্নিত হয়েছে।');
      await refreshPlans();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openProgress = async (plan: ApiQuranPlanRow) => {
    setProgressPlan(plan);
    await loadProgressFor(plan.id);
  };

  const todayEntryFor = (plan: ApiQuranPlanRow): ApiQuranPlanProgressRow | null => {
    const rows = progressByPlan[String(plan.id)];
    if (!rows) return null;
    return rows.find((entry) => entry.record_date.slice(0, 10) === today()) ?? null;
  };

  const saveProgress = async (input: { recordDate: string; quantity: number; note: string }) => {
    if (!progressPlan) return;
    setBusy(true);
    try {
      const result = await upsertUserQuranPlanProgress(progressPlan.id, input);
      setProgressByPlan((current) => {
        const key = String(progressPlan.id);
        const rows = current[key] ?? [];
        const existing = rows.find((entry) => entry.record_date.slice(0, 10) === input.recordDate);
        const entry: ApiQuranPlanProgressRow = {
          id: result.row.id,
          plan_id: result.row.plan_id,
          record_date: result.row.record_date,
          quantity: result.row.quantity,
          note: result.row.note,
          created_at: result.row.created_at,
          updated_at: result.row.updated_at,
        };
        const nextRows = existing
          ? rows.map((item) => (item.record_date.slice(0, 10) === input.recordDate ? entry : item))
          : [entry, ...rows];
        return { ...current, [key]: nextRows.sort((a, b) => b.record_date.localeCompare(a.record_date)) };
      });
      setProgressPlan(result.plan);
      showToast('আজকের অগ্রগতি সংরক্ষণ হয়েছে।');
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeProgressEntry = async (plan: ApiQuranPlanRow, progressId: string | number) => {
    setBusy(true);
    try {
      await deleteUserQuranPlanProgress(plan.id, progressId);
      setProgressByPlan((current) => ({
        ...current,
        [String(plan.id)]: (current[String(plan.id)] ?? []).filter((entry) => String(entry.id) !== String(progressId)),
      }));
      showToast('অগ্রগতি এন্ট্রি মুছে ফেলা হয়েছে।');
      await refreshPlans();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleExpand = async (plan: ApiQuranPlanRow) => {
    const key = String(plan.id);
    const next = expandedId === key ? null : key;
    setExpandedId(next);
    if (next) {
      await loadProgressFor(plan.id);
    }
  };

  const unitShort = (plan: ApiQuranPlanRow) => (plan.goal_type === 1 ? 'পৃষ্ঠা' : 'আয়াত');
  const percent = (plan: ApiQuranPlanRow) => Math.min(100, Math.round((Number(plan.total_quantity) / Math.max(1, Number(plan.total_target))) * 100));

  return (
    <section>
      <Card className="border-brand/20 bg-brand-light/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-fg">Quran প্ল্যান</h2>
            <p className="mt-1 text-sm text-fg-2">তিলাওয়াত বা মুখস্থের লক্ষ্য বানিয়ে প্রতিদিনের অগ্রগতি রেকর্ড করুন।</p>
          </div>
          <Button onClick={() => setPlanModal({ open: true, plan: null })} disabled={busy}>
            <Plus className="h-4 w-4" />নতুন প্ল্যান
          </Button>
        </div>
      </Card>

      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      {loading ? (
        <ApiLoadingNotice label="প্ল্যান লোড হচ্ছে..." />
      ) : plans.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-muted"><CalendarDays className="h-6 w-6" /></span>
            <h3 className="mt-3 text-base font-bold text-fg">এখনও কোনো প্ল্যান নেই</h3>
            <p className="mt-1 text-sm text-fg-2">প্রথম প্ল্যান তৈরি করে প্রতিদিনের অগ্রগতি শুরু করুন।</p>
            <Button className="mt-4" onClick={() => setPlanModal({ open: true, plan: null })} disabled={busy}>
              <Plus className="h-4 w-4" />নতুন প্ল্যান তৈরি করুন
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const isCompleted = plan.status === 1;
            const unit = unitShort(plan);
            const pct = percent(plan);
            const expanded = expandedId === String(plan.id);
            const progressRows = progressByPlan[String(plan.id)] ?? [];
            const progressLoading = Boolean(progressLoadingById[String(plan.id)]);
            const range = [plan.from_ref, plan.to_ref].filter(Boolean).join(' → ');
            const meta = [range, plan.surah_reference].filter(Boolean).join(' · ');

            return (
              <Card key={plan.id} className="w-full">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-fg">{plan.plan_name}</h3>
                      <Badge variant={plan.goal_type === 1 ? 'info' : 'brand'}>{GOAL_LABELS[plan.goal_type]}</Badge>
                      {isCompleted && <Badge variant="success">সম্পন্ন</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-fg-2">
                      {GOAL_DETAILS[plan.goal_type]}{meta ? ` · ${meta}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" aria-label="সম্পাদনা" disabled={busy} onClick={() => setPlanModal({ open: true, plan })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-bg" aria-label="মুছে ফেলুন" disabled={busy} onClick={() => setConfirmDelete(plan)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg-2">মোট {unit} লক্ষ্য: {plan.total_target}</span>
                    <span className="font-bold text-fg">{plan.total_quantity} / {plan.total_target} {unit}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full transition-all ${isCompleted ? 'bg-success' : 'bg-brand'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs font-semibold text-muted">{pct}% {isCompleted && plan.completed_on ? `· ${toBanglaDate(plan.completed_on)} তারিখে সম্পন্ন` : ''}</p>
                </div>

                {plan.note && (
                  <div className="mt-3 rounded-lg border border-border bg-surface-2/50 px-3 py-2">
                    <RichTextPreview html={plan.note} />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {!isCompleted && (
                    <Button onClick={() => void openProgress(plan)} disabled={busy}>
                      <CalendarDays className="h-4 w-4" />আজকের অগ্রগতি
                    </Button>
                  )}
                  {isCompleted ? (
                    <Button variant="secondary" size="md" disabled={busy} onClick={() => void toggleComplete(plan)}>
                      <RotateCcw className="h-4 w-4" />আবার সক্রিয় করুন
                    </Button>
                  ) : (
                    <Button variant="secondary" size="md" disabled={busy} onClick={() => void toggleComplete(plan)}>
                      সম্পন্ন চিহ্নিত করুন
                    </Button>
                  )}
                  <Button variant="ghost" size="md" disabled={busy} onClick={() => void toggleExpand(plan)}>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {expanded ? 'ইতিহাস বন্ধ করুন' : 'অগ্রগতি দেখুন'}
                  </Button>
                </div>

                {expanded && (
                  <div className="mt-4 border-t border-border pt-4">
                    <SectionHeader title="অগ্রগতির ইতিহাস" subtitle={`একটি তারিখে একবার অগ্রগতি রেকর্ড হয়`} />
                    {progressLoading ? (
                      <ApiLoadingNotice label="অগ্রগতি লোড হচ্ছে..." />
                    ) : (
                      <DataTable
                        headers={['তারিখ', unit, 'নোট', '']}
                        rows={progressRows.map((entry) => ({
                          id: String(entry.id),
                          searchText: `${entry.record_date} ${entry.note ?? ''}`,
                          sortValues: [entry.record_date, entry.quantity],
                          cells: [
                            toBanglaDate(entry.record_date),
                            <span key={`${entry.id}-qty`} className="font-bold text-fg">{entry.quantity}</span>,
                            entry.note ? <RichTextPreview key={`${entry.id}-note`} html={entry.note} className="max-w-72" /> : <span className="text-muted">-</span>,
                            <Button
                              key={`${entry.id}-del`}
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:bg-danger-bg"
                              aria-label="মুছে ফেলুন"
                              disabled={busy}
                              onClick={() => void removeProgressEntry(plan, entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>,
                          ],
                        }))}
                        enableSearch={false}
                        emptyMessage="এখনও কোনো অগ্রগতি রেকর্ড করা হয়নি"
                      />
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <PlanModal
        open={planModal.open}
        plan={planModal.plan}
        saving={busy}
        onClose={() => setPlanModal({ open: false, plan: null })}
        onSave={(input) => void savePlan(input)}
      />

      <ProgressModal
        open={Boolean(progressPlan) && !isCompletedFor(progressPlan)}
        plan={progressPlan}
        todayEntry={progressPlan ? todayEntryFor(progressPlan) : null}
        saving={busy}
        onClose={() => setProgressPlan(null)}
        onSave={(input) => void saveProgress(input)}
      />

      <AppModal
        open={Boolean(confirmDelete)}
        title="প্ল্যান মুছে ফেলবেন?"
        onClose={() => setConfirmDelete(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={busy}>বাতিল</Button>
            <Button variant="danger" onClick={() => void removePlan()} disabled={busy}>হ্যাঁ, মুছে ফেলুন</Button>
          </>
        )}
      >
        <p className="text-sm text-fg-2">“{confirmDelete?.plan_name}” প্ল্যানসহ এর সব অগ্রগতি ইতিহাস মুছে যাবে।</p>
      </AppModal>

      <AppToast message={toast} />
    </section>
  );
}

function isCompletedFor(plan: ApiQuranPlanRow | null): boolean {
  return plan?.status === 1;
}