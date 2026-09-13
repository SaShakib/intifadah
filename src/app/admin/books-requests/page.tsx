'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Activity, Mail, Phone, Search } from 'lucide-react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { Button } from '@/components/base/Button';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { useAuth } from '@/contexts/AuthContext';
import { adminBookRequestUpdate, getAdminBookRequests, toBanglaDate, type AdminBookRequestRow } from '@/lib/api';
import type { ButtonVariant } from '@/components/base/Button';

const PAGE_SIZE = 15;

const STATUS_LABELS: Record<number, string> = {
  0: 'অপেক্ষমাণ',
  1: 'রিজার্ভ হয়েছে',
  2: 'প্রত্যাখ্যাত',
  3: 'দেওয়া হয়েছে',
  4: 'পেয়েছে',
  5: 'ফেরত দিয়েছে',
  6: 'ফেরত সম্পন্ন',
  7: 'বাতিল',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'border-amber-200 bg-amber-50 text-amber-700',
  1: 'border-blue-200 bg-blue-50 text-blue-700',
  2: 'border-red-200 bg-red-50 text-red-700',
  3: 'border-violet-200 bg-violet-50 text-violet-700',
  4: 'border-teal-200 bg-teal-50 text-teal-700',
  5: 'border-sky-200 bg-sky-50 text-sky-700',
  6: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  7: 'border-slate-200 bg-slate-100 text-slate-500',
};

const EXTENSION_LABELS: Record<number, string> = { 0: 'অপেক্ষমাণ', 1: 'অনুমোদিত', 2: 'প্রত্যাখ্যাত' };

const EVENT_LABELS: Record<string, string> = {
  requested: 'অনুরোধ পাঠিয়েছেন',
  accepted: 'গ্রহণ করেছেন',
  rejected: 'প্রত্যাখ্যান করেছেন',
  given: 'বই দিয়ে দিয়েছেন',
  received: 'বই হাতে পেয়েছে',
  returned: 'বই ফেরত দিয়েছে',
  return_received: 'ফেরত গ্রহণ নিশ্চিত করেছেন',
  extension_requested: 'বর্ধিত সময় চেয়েছেন',
  extension_accepted: 'বর্ধিত সময় অনুমোদন করেছেন',
  extension_rejected: 'বর্ধিত সময় প্রত্যাখ্যান করেছেন',
  cancelled: 'বাতিল করেছেন',
};

const ACTION_TITLES: Record<number, string> = {
  1: 'অনুরোধটি গ্রহণ করুন',
  2: 'অনুরোধটি প্রত্যাখ্যান করুন',
  3: 'বই দেওয়া হয়েছে চিহ্নিত করুন',
  4: 'অনুরোধকারী বই পেয়েছে চিহ্নিত করুন',
  5: 'বই ফেরত দেওয়া হয়েছে চিহ্নিত করুন',
  6: 'বইয়ের ফেরত নিশ্চিত করুন',
  7: 'অনুরোধটি বাতিল করুন',
};

const ACTION_TARGETS: Record<number, string> = {
  1: 'অনুরোধটি গ্রহণ করা হবে এবং কপিটি রিজার্ভ করা হবে।',
  2: 'অনুরোধটি প্রত্যাখ্যান করা হবে।',
  3: 'বইটি হস্তান্তর হয়েছে ধরা হবে।',
  4: 'বইটি অনুরোধকারীর হাতে পৌঁছেছে ধরা হবে।',
  5: 'বইটি ফেরত দেওয়া হয়েছে ধরা হবে।',
  6: 'বইয়ের ফেরত সম্পন্ন ধরা হবে এবং কপিটি আবার পাওয়া যাবে।',
  7: 'অনুরোধটি বাতিল করা হবে এবং প্রয়োজনে কপিটি আনরিজার্ভ হবে।',
};

const STATUS_FILTERS: Array<{ value: number | ''; label: string }> = [
  { value: '', label: 'সব' },
  { value: 0, label: 'অপেক্ষমাণ' },
  { value: 1, label: 'রিজার্ভ' },
  { value: 3, label: 'হস্তান্তর' },
  { value: 4, label: 'পড়ছে' },
  { value: 6, label: 'সম্পন্ন' },
  { value: 2, label: 'প্রত্যাখ্যাত' },
  { value: 7, label: 'বাতিল' },
];

const ACTION_OPTIONS: Record<number, Array<{ status: number; label: string; variant: ButtonVariant }>> = {
  0: [
    { status: 1, label: 'গ্রহণ', variant: 'primary' },
    { status: 2, label: 'প্রত্যাখ্যান', variant: 'danger' },
    { status: 7, label: 'বাতিল', variant: 'secondary' },
  ],
  1: [
    { status: 3, label: 'দিয়েছি', variant: 'primary' },
    { status: 2, label: 'প্রত্যাখ্যান', variant: 'danger' },
    { status: 7, label: 'বাতিল', variant: 'secondary' },
  ],
  3: [{ status: 4, label: 'পেয়েছে', variant: 'primary' }],
  4: [
    { status: 5, label: 'ফেরত দিয়েছে', variant: 'primary' },
    { status: 7, label: 'বাতিল', variant: 'secondary' },
  ],
  5: [{ status: 6, label: 'ফেরত নিশ্চিত', variant: 'primary' }],
};

function phoneLink(value: string | null | undefined) {
  return value ? <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${value}`}><Phone className="h-3 w-3" />{value}</a> : '-';
}

function emailLink(value: string | null | undefined) {
  return value ? <a className="inline-flex items-center gap-1 break-all hover:underline" href={`mailto:${value}`}><Mail className="h-3 w-3" />{value}</a> : '-';
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('bn-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

export default function AdminBooksRequestsPage() {
  const router = useRouter();
  const { isReady, roleKey } = useAuth();
  const isSuperAdmin = roleKey === 'super_admin';

  const [rows, setRows] = useState<AdminBookRequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activityRequest, setActivityRequest] = useState<AdminBookRequestRow | null>(null);
  const [actionTarget, setActionTarget] = useState<{ request: AdminBookRequestRow; status: number } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isSuperAdmin) router.replace('/admin/dashboard');
  }, [isReady, isSuperAdmin, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminBookRequests({ search: debouncedSearch, status: statusFilter, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
      setRows(result.rows);
      setTotal(result.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'অনুরোধ তালিকা আনা যায়নি');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, debouncedSearch, statusFilter, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const runAction = async () => {
    if (!actionTarget) return;
    const { request, status } = actionTarget;
    setActionBusy(true);
    try {
      await adminBookRequestUpdate(request.id, { status, note: actionNote.trim() || undefined });
      setActionTarget(null);
      setActionNote('');
      showToast(STATUS_LABELS[status] ?? 'অবস্থা আপডেট হয়েছে');
      await load();
    } catch (actionError) {
      showToast(actionError instanceof Error ? actionError.message : 'আপডেট করা যায়নি');
    } finally {
      setActionBusy(false);
    }
  };

  if (!isReady || !isSuperAdmin) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void load()} />}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-fg">বইয়ের অনুরোধ</h1>
            <p className="mt-1 text-sm text-muted">সদস্যদের সব বইয়ের অনুরোধ, তাদের তথ্য ও কার্জক্রম এক জায়গায়। মোট {total}টি অনুরোধ।</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-sm md:w-80">
            <Search className="h-4 w-4 text-muted" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-muted"
              placeholder="বই, মালিক বা অনুরোধকারীর নাম/মোবাইল..."
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={String(filter.value)}
              type="button"
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                statusFilter === filter.value
                  ? 'border-brand bg-brand text-white'
                  : 'border-border bg-white text-fg hover:bg-surface-2'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <ApiLoadingNotice />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <Activity className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 font-semibold text-fg">কোনো অনুরোধ পাওয়া যায়নি</p>
          <p className="mt-1 text-sm text-muted">সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            {rows.map((request) => {
              const actions = ACTION_OPTIONS[request.status] ?? [];
              const pendingExtensions = (request.extensions ?? []).filter((extension) => extension.status === 0);
              return (
                <article key={request.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {request.cover_url
                        ? <Image src={request.cover_url} alt="" width={40} height={56} className="h-14 w-10 shrink-0 rounded-md object-cover" unoptimized />
                        : <div className="grid h-14 w-10 shrink-0 place-items-center rounded-md bg-surface-2 text-sm font-bold text-muted">বই</div>}
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-fg">{request.title}</h3>
                        <p className="mt-0.5 text-xs text-muted">
                          {request.requested_days} দিন · ফেরত প্রস্তাবিত: {toBanglaDate(request.due_on)}
                          {pendingExtensions.length > 0 && <span className="ml-1 font-semibold text-brand">· +{pendingExtensions[0].requestedDays} দিনের অনুরোধ</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[request.status] ?? ''}`}>
                        {STATUS_LABELS[request.status] ?? `অবস্থা ${request.status}`}
                      </span>
                      <div className="flex flex-wrap justify-end gap-2">
                        {actions.map((action) => (
                          <Button key={action.status} size="sm" variant={action.variant} onClick={() => setActionTarget({ request, status: action.status })}>
                            {action.label}
                          </Button>
                        ))}
                        <Button size="sm" variant="secondary" onClick={() => setActivityRequest(request)}>কার্জক্রম</Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div className="rounded-xl bg-surface-2 p-3">
                      <p className="text-xs font-semibold text-muted">মালিক (যার বই)</p>
                      <div className="mt-1 text-fg">• {request.owner_name}</div>
                      {request.owner_village && <div className="mt-1 text-fg">• {request.owner_village}{request.owner_ward_no != null ? `, ওয়ার্ড ${request.owner_ward_no}` : ''}</div>}
                      <div className="mt-1 flex flex-col gap-1 text-xs text-brand">{phoneLink(request.owner_mobile)}{emailLink(request.owner_email)}</div>
                    </div>
                    <div className="rounded-xl bg-surface-2 p-3">
                      <p className="text-xs font-semibold text-muted">অনুরোধকারী (যে পড়বে)</p>
                      <div className="mt-1 text-fg">• {request.requester_name}</div>
                      {request.requester_village && <div className="mt-1 text-fg">• {request.requester_village}{request.requester_ward_no != null ? `, ওয়ার্ড ${request.requester_ward_no}` : ''}{request.requester_father_name ? ` · ${request.requester_father_name}` : ''}</div>}
                      <div className="mt-1 flex flex-col gap-1 text-xs text-brand">{phoneLink(request.requester_mobile)}{emailLink(request.requester_email)}</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-muted">
            <span>দেখানো হচ্ছে {rangeStart}–{rangeEnd} / {total}টি</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((previous) => previous - 1)}>আগের</Button>
              <span className="text-xs font-medium">পাতা {page} / {totalPages}</span>
              <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((previous) => previous + 1)}>পরের</Button>
            </div>
          </div>
        </>
      )}

      <AppModal
        open={actionTarget !== null}
        title={actionTarget ? (ACTION_TITLES[actionTarget.status] ?? 'অবস্থা আপডেট করুন') : ''}
        onClose={() => { if (!actionBusy) { setActionTarget(null); setActionNote(''); } }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={actionBusy} onClick={() => setActionTarget(null)}>বাতিল</Button>
            <Button disabled={actionBusy} onClick={() => void runAction()}>{actionBusy ? 'হালনাগাদ হচ্ছে...' : 'নিশ্চিত'}</Button>
          </div>
        }
      >
        {actionTarget && (
          <div className="space-y-3">
            <p className="text-sm text-fg">
              <span className="font-semibold">{actionTarget.request.title}</span> — {STATUS_LABELS[actionTarget.request.status]} থেকে{' '}
              <span className="font-semibold text-brand">{STATUS_LABELS[actionTarget.status]}</span> এ যাবে।
            </p>
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">{ACTION_TARGETS[actionTarget.status]}</p>
            <label className="block">
              <span className="text-xs font-semibold text-muted">মন্তব্য (ঐচ্ছিক)</span>
              <textarea
                className="mt-1.5 w-full resize-none rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
                rows={3}
                maxLength={500}
                placeholder="এই পরিবর্তনের কারণ (অনুরোধকারী ও মালিককে দেখা যাবে)..."
                value={actionNote}
                onChange={(event) => setActionNote(event.target.value)}
              />
            </label>
          </div>
        )}
      </AppModal>

      <AppModal
        open={activityRequest !== null}
        title="কার্জক্রম ও বিস্তারিত"
        onClose={() => setActivityRequest(null)}
        footer={<div className="flex justify-end"><Button variant="secondary" onClick={() => setActivityRequest(null)}>বন্ধ করুন</Button></div>}
        className="max-w-xl"
      >
        {activityRequest && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-fg">{activityRequest.title}</h3>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[activityRequest.status] ?? ''}`}>{STATUS_LABELS[activityRequest.status]}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span>অনুরোধ: {formatDateTime(activityRequest.requested_at)}</span>
              {activityRequest.accepted_at && <span>গ্রহণ: {formatDateTime(activityRequest.accepted_at)}</span>}
              {activityRequest.given_at && <span>হস্তান্তর: {formatDateTime(activityRequest.given_at)}</span>}
              {activityRequest.received_at && <span>লাভ: {formatDateTime(activityRequest.received_at)}</span>}
              {activityRequest.returned_at && <span>ফেরত: {formatDateTime(activityRequest.returned_at)}</span>}
              {activityRequest.return_received_at && <span>ফেরত নিশ্চিত: {formatDateTime(activityRequest.return_received_at)}</span>}
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">সম্প্রতি ঘটনাপঞ্জি ({activityRequest.events?.length ?? 0})</p>
              <ol className="mt-3 space-y-3">
                {(activityRequest.events ?? []).length === 0 && <li className="text-sm text-muted">কোনো কার্জক্রম নেই।</li>}
                {(activityRequest.events ?? []).map((event, index) => (
                  <li key={`${event.at}-${index}`} className="relative flex gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <div>
                      <p className="font-medium text-fg">{EVENT_LABELS[event.action] ?? event.action}<span className="ml-1 text-muted">— {event.actorName ?? 'সিস্টেম'}</span></p>
                      <p className="text-xs text-muted">{formatDateTime(event.at)}</p>
                      {event.note && <p className="mt-0.5 text-xs text-muted">মন্তব্য: {event.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {(activityRequest.extensions?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold text-fg">বর্ধিত সময়ের অনুরোধ</p>
                <ul className="mt-2 space-y-1.5 text-sm text-fg">
                  {(activityRequest.extensions ?? []).map((extension) => (
                    <li key={extension.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                      <span>+{extension.requestedDays} দিন</span>
                      <span className={`text-xs font-semibold ${EXTENSION_LABELS[extension.status] === 'অনুমোদিত' ? 'text-emerald-700' : EXTENSION_LABELS[extension.status] === 'প্রত্যাখ্যাত' ? 'text-red-700' : 'text-amber-700'}`}>
                        {EXTENSION_LABELS[extension.status] ?? 'অজানা'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </AppModal>

      <AppToast message={toast} />
    </PageStack>
  );
}