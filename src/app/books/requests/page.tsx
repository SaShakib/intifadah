'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, MessagesSquare, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppToast } from '@/components/semibase/AppModal';
import { BooksHeader } from '@/components/books/BooksHeader';
import { Button } from '@/components/base/Button';
import { useAuth } from '@/contexts/AuthContext';
import { confirmBookReceived, getMyBooks, getMyBookRequests, ownerBookRequestAction, requestBookExtension, resolveBookExtension, type BookRequestRow, type BookRow } from '@/lib/api';
import { bookDate } from '@/components/books/bookUtils';

export default function BookRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [myRequests, setMyRequests] = useState<BookRequestRow[]>([]);
  const [myBooks, setMyBooks] = useState<BookRow[]>([]);

  useEffect(() => {
    if (isReady && !isAuthenticated) { router.replace('/login?books=requests'); return; }
  }, [isReady, isAuthenticated, router]);
  const loadRequests = useCallback(async () => {
    if (!isAuthenticated) { setMyRequests([]); return; }
    setMyRequests((await getMyBookRequests()).rows);
  }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setTimeout(() => { void loadRequests(); }, 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, loadRequests]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isAuthenticated) { setMyBooks([]); return; }
    void getMyBooks().then((result) => setMyBooks(result.rows)).catch(() => undefined);
  }, [isAuthenticated]);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };
  const requestStatusPriority: Record<number, number> = { 6: 7, 5: 6, 4: 5, 3: 4, 1: 3, 0: 2, 2: 1 };
  const visibleRequests = myRequests.reduce<BookRequestRow[]>((rows, request) => {
    const owner = Number(request.owner_user_id) === Number(user?.id);
    if (owner || !request.request_group_id) return [...rows, request];
    const existingIndex = rows.findIndex((item) => item.request_group_id === request.request_group_id && Number(item.owner_user_id) !== Number(user?.id));
    if (existingIndex < 0) return [...rows, request];
    if ((requestStatusPriority[request.status] ?? 0) > (requestStatusPriority[rows[existingIndex].status] ?? 0)) {
      const next = [...rows];
      next[existingIndex] = request;
      return next;
    }
    return rows;
  }, []);
  const incomingRequests = visibleRequests.filter((request) => Number(request.owner_user_id) === Number(user?.id));
  const outgoingRequests = visibleRequests.filter((request) => Number(request.owner_user_id) !== Number(user?.id));
  const updateRequest = async (request: BookRequestRow, action: 'accept' | 'reject' | 'given' | 'return_received' | 'returned' | 'received' | 'extend') => {
    setBusy(true);
    try {
      if (action === 'received' || action === 'returned') await confirmBookReceived(request.id, action);
      else if (action === 'extend') await requestBookExtension(request.id, 7);
      else await ownerBookRequestAction(request.id, action);
      await loadRequests();
      showToast(action === 'extend' ? '৭ দিনের বাড়তি সময়ের অনুরোধ পাঠানো হয়েছে।' : 'বইয়ের অবস্থা আপডেট হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'আপডেট করা যায়নি'); } finally { setBusy(false); }
  };
  const updateExtension = async (extensionId: string | number, accepted: boolean) => {
    setBusy(true);
    try { await resolveBookExtension(extensionId, accepted); await loadRequests(); showToast(accepted ? 'বর্ধিত সময় অনুমোদন হয়েছে।' : 'বর্ধিত সময়ের অনুরোধ প্রত্যাখ্যান হয়েছে।'); } catch (error) { showToast(error instanceof Error ? error.message : 'আপডেট করা যায়নি'); } finally { setBusy(false); }
  };

  if (!isReady || !isAuthenticated) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-2" />;
  }

  return (
    <main className="min-h-screen bg-surface-2 pb-12">
      <BooksHeader active="requests" myBookCount={myBooks.length} requestCount={visibleRequests.length} onAddBook={() => router.push('/books/my?add=1')} />

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-7">
        <div>
          <h2 className="text-xl font-bold text-fg">আমার অনুরোধ</h2>
          <p className="mt-1 text-xs text-muted">আপনার বইয়ের জন্য আসা অনুরোধ ও আপনার ধার নেওয়ার অনুরোধের খতিয়ান।</p>
        </div>
        {incomingRequests.length > 0 && <div className="border border-border bg-white p-5"><h3 className="font-bold text-fg">আমার বইয়ের জন্য আসা অনুরোধ</h3><div className="mt-4 space-y-3">{incomingRequests.map((request) => { const pendingExtension = request.extensions?.find((extension) => extension.status === 0); return <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0"><div><p className="font-semibold text-fg">{request.title}</p><p className="text-xs text-muted">অনুরোধকারী: {request.requester_name} · {request.requested_days} দিন{request.due_on ? ` · সম্ভাব্য ফেরত: ${bookDate(request.due_on)}` : ''}</p></div><div className="flex flex-wrap gap-2">{request.status === 0 && <><Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'accept')}>গ্রহণ</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => void updateRequest(request, 'reject')}>প্রত্যাখ্যান</Button></>}{request.status === 1 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'given')}>দিয়েছি</Button>}{request.status === 5 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'return_received')}>ফেরত গ্রহণ নিশ্চিত</Button>}{pendingExtension && <><Button size="sm" disabled={busy} onClick={() => void updateExtension(pendingExtension.id, true)}>+{pendingExtension.requestedDays} দিন</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => void updateExtension(pendingExtension.id, false)}>না</Button></>}</div></div>; })}</div></div>}
        {outgoingRequests.length > 0 && <div className="border border-border bg-white p-5"><h3 className="font-bold text-fg">আমার ধার নেওয়ার অনুরোধ</h3><div className="mt-4 space-y-3">{outgoingRequests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0"><div><p className="font-semibold text-fg">{request.title}</p><p className="text-xs text-muted">মালিক: {request.owner_name} · {request.requested_days} দিন</p>{request.status >= 1 && request.status !== 2 && <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-brand">{request.owner_mobile && <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${request.owner_mobile}`}><Phone className="h-3.5 w-3.5" />{request.owner_mobile}</a>}{request.owner_email && <a className="inline-flex items-center gap-1 hover:underline" href={`mailto:${request.owner_email}`}><Mail className="h-3.5 w-3.5" />{request.owner_email}</a>}</div>}</div><div className="flex flex-wrap gap-2">{request.status === 3 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'received')}>পেয়েছি</Button>}{request.status === 4 && <><Button size="sm" variant="secondary" disabled={busy} onClick={() => void updateRequest(request, 'extend')}>আরও ৭ দিন চাই</Button><Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'returned')}>ফেরত দিয়েছি</Button></>}</div></div>)}</div></div>}
        {!incomingRequests.length && !outgoingRequests.length && <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center"><MessagesSquare className="mx-auto h-10 w-10 text-muted" /><p className="mt-3 font-semibold text-fg">কোনো অনুরোধ নেই</p><p className="mt-1 text-sm text-muted">যখন কেউ আপনার বই চাইবে বা আপনি বই ধার নিতে অনুরোধ পাঠাবেন, তখন তা এখানে দেখা যাবে।</p></div>}
      </section>

      <AppToast message={toast} />
    </main>
  );
}