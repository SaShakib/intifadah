'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, BookOpenCheck, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { BookPageUpdateModal } from '@/components/books/BookPageUpdateModal';
import { BookPlanModal, type BookPlanModalInput } from '@/components/books/BookPlanModal';
import { BooksHeader } from '@/components/books/BooksHeader';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { RichTextPreview } from '@/components/custom/RichTextPreview';
import { useAuth } from '@/contexts/AuthContext';
import {
  createBookPlan,
  deleteBookPlan,
  getBookPlans,
  getErrorMessage,
  queryKeys,
  toBanglaDate,
  updateBookPlan,
  useApiQuery,
} from '@/lib/api';
import type { ApiBookPlanRow } from '@/lib/api';

export default function BookPlansPage() {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [planModal, setPlanModal] = useState<{ open: boolean; plan: ApiBookPlanRow | null }>({ open: false, plan: null });
  const [pageModal, setPageModal] = useState<ApiBookPlanRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiBookPlanRow | null>(null);

  const loadPlans = useCallback(async () => {
    return { rows: await getBookPlans() };
  }, []);
  const { data, loading, error, refetch } = useApiQuery(loadPlans, { rows: [] }, [], {
    cacheKey: queryKeys.user.bookPlans(),
    staleTimeMs: 60_000,
  });

  const plans = data.rows;

  useEffect(() => {
    if (isReady && !isAuthenticated) { router.replace('/login?books=plans'); }
  }, [isReady, isAuthenticated, router]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const savePlan = async (input: BookPlanModalInput) => {
    setBusy(true);
    try {
      if (planModal.plan) {
        await updateBookPlan(planModal.plan.id, {
          bookId: input.book.id,
          totalPages: input.totalPages,
          currentPage: input.currentPage,
          note: input.note,
        });
        showToast('প্ল্যান আপডেট হয়েছে।');
      } else {
        await createBookPlan({
          bookId: input.book.id,
          totalPages: input.totalPages,
          currentPage: input.currentPage,
          note: input.note,
        });
        showToast('নতুন পড়ার প্ল্যান তৈরি হয়েছে।');
      }
      setPlanModal({ open: false, plan: null });
      await refetch();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const savePage = async (input: { currentPage: number; note: string }) => {
    if (!pageModal) return;
    setBusy(true);
    try {
      const updated = await updateBookPlan(pageModal.id, { currentPage: input.currentPage, note: input.note });
      setPageModal(updated);
      showToast('অগ্রগতি সংরক্ষণ হয়েছে।');
      await refetch();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleComplete = async (plan: ApiBookPlanRow) => {
    setBusy(true);
    try {
      await updateBookPlan(plan.id, { status: plan.status === 1 ? 0 : 1 });
      showToast(plan.status === 1 ? 'প্ল্যান আবার সক্রিয় করা হয়েছে।' : 'চমৎকার! বই পড়া শেষ হিসেবে চিহ্নিত হয়েছে।');
      await refetch();
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
      await deleteBookPlan(confirmDelete.id);
      showToast('প্ল্যান মুছে ফেলা হয়েছে।');
      setConfirmDelete(null);
      await refetch();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!isReady || !isAuthenticated) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-2" />;
  }

  const percent = (plan: ApiBookPlanRow) => Math.min(100, Math.round((Number(plan.current_page) / Math.max(1, Number(plan.total_pages))) * 100));

  return (
    <main className="min-h-screen bg-surface-2 pb-12">
      <BooksHeader active="plans" onAddBook={() => setPlanModal({ open: true, plan: null })} />

      <section className="mx-auto max-w-6xl px-4 py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-fg">পড়ার প্ল্যান</h2>
            <p className="mt-1 text-xs text-muted">কোন বই পড়ছেন ঠিক করুন, বইয়ের মোট পৃষ্ঠা জানিয়ে দিন — পৃষ্ঠা আপডেট করলেই অগ্রগতি দেখা যাবে। একটি বই একাধিক প্ল্যানে থাকতে পারে।</p>
          </div>
          <Button size="sm" onClick={() => setPlanModal({ open: true, plan: null })} disabled={busy}><Plus className="h-4 w-4" />নতুন প্ল্যান</Button>
        </div>

        {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

        {loading ? (
          <ApiLoadingNotice label="প্ল্যান লোড হচ্ছে..." />
        ) : plans.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-white p-10 text-center">
            <BookOpenCheck className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 font-semibold text-fg">এখনও কোনো পড়ার প্ল্যান নেই</p>
            <p className="mt-1 text-sm text-muted">বইঘর থেকে বই বেছে একটি প্ল্যান তৈরি করুন এবং পৃষ্ঠা ধরে ধরে অগ্রগতি রেকর্ড করুন।</p>
            <Button className="mt-5" onClick={() => setPlanModal({ open: true, plan: null })} disabled={busy}><Plus className="h-4 w-4" />প্রথম প্ল্যান তৈরি করুন</Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {plans.map((plan) => {
              const isCompleted = plan.status === 1;
              const pct = percent(plan);
              return (
                <article key={plan.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                  <div className="flex flex-wrap items-start gap-4 p-4">
                    <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
                      {plan.book_cover_url ? <Image src={plan.book_cover_url} alt={plan.book_title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-7 w-7" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-fg">{plan.book_title}</h3>
                        {isCompleted && <Badge variant="success">সম্পন্ন</Badge>}
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{plan.book_author || 'লেখক অজানা'}</p>
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-semibold text-fg-2">পড়েছেন: {plan.current_page} / {plan.total_pages} পৃষ্ঠা</span>
                          <span className="font-bold text-fg">{pct}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                          <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-success' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
                        </div>
                        {isCompleted && plan.completed_on && <p className="mt-1 text-right text-xs text-muted">{toBanglaDate(plan.completed_on)} তারিখে সম্পন্ন</p>}
                      </div>
                      {plan.note && (
                        <div className="mt-3 rounded-lg border border-border bg-surface-2/50 px-3 py-2">
                          <RichTextPreview html={plan.note} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-2/50 p-3">
                    {!isCompleted && (
                      <Button size="sm" disabled={busy} onClick={() => setPageModal(plan)}>অগ্রগতি আপডেট করুন</Button>
                    )}
                    {isCompleted ? (
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => void toggleComplete(plan)}><RotateCcw className="h-3.5 w-3.5" />আবার সক্রিয় করুন</Button>
                    ) : (
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => void toggleComplete(plan)}>সম্পন্ন চিহ্নিত করুন</Button>
                    )}
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => setPlanModal({ open: true, plan })}><Pencil className="h-3.5 w-3.5" />সম্পাদনা</Button>
                    <Button size="sm" variant="danger" disabled={busy} className="ml-auto" onClick={() => setConfirmDelete(plan)}><Trash2 className="h-3.5 w-3.5" />মুছুন</Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <AppToast message={toast} />

        <BookPlanModal
          open={planModal.open}
          plan={planModal.plan}
          saving={busy}
          onClose={() => setPlanModal({ open: false, plan: null })}
          onSave={(input) => void savePlan(input)}
        />
        <BookPageUpdateModal
          open={Boolean(pageModal)}
          plan={pageModal}
          saving={busy}
          onClose={() => setPageModal(null)}
          onSave={(input) => void savePage(input)}
        />

        <AppModal
          open={Boolean(confirmDelete)}
          title="পড়ার প্ল্যান মুছে ফেলবেন?"
          onClose={() => setConfirmDelete(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={busy}>বাতিল</Button>
              <Button variant="danger" onClick={() => void removePlan()} disabled={busy}><Trash2 className="h-4 w-4" />হ্যাঁ, মুছে ফেলুন</Button>
            </>
          )}
        >
          <p className="text-sm leading-6 text-fg-2"><strong>{confirmDelete?.book_title}</strong> বইয়ের এই প্ল্যান এবং এর পড়ার অগ্রগতি মুছে যাবে।</p>
        </AppModal>
      </section>
    </main>
  );
}