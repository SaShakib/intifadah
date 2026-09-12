'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BookMarked, BookOpen, PauseCircle, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { BooksHeader } from '@/components/books/BooksHeader';
import { BookActivationModal } from '@/components/books/BookActivationModal';
import { BookAddModal } from '@/components/books/BookAddModal';
import { BookEditModal } from '@/components/books/BookEditModal';
import { Button } from '@/components/base/Button';
import { useAuth } from '@/contexts/AuthContext';
import { deleteBook, getBookActivation, getMyBooks, getMyBookRequests, setBookHold, type BookActivationInput, type BookRequestRow, type BookRow } from '@/lib/api';

export default function MyBooksPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, user } = useAuth();
  const [activation, setActivation] = useState<BookActivationInput | null | undefined>(undefined);
  const [modal, setModal] = useState<'activate' | 'add' | 'delete' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [myRequests, setMyRequests] = useState<BookRequestRow[]>([]);
  const [myBooks, setMyBooks] = useState<BookRow[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<BookRow | null>(null);
  const [pendingAdd, setPendingAdd] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthenticated) { router.replace('/login?books=my'); return; }
  }, [isReady, isAuthenticated, router]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('add') === '1') {
      window.history.replaceState({}, '', '/books/my');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingAdd(true);
    }
  }, []);
  useEffect(() => {
    if (!pendingAdd || activation === undefined) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingAdd(false);
    if (!activation) { setModal('activate'); return; }
    setModal('add');
  }, [pendingAdd, activation]);
  const loadMyBooks = useCallback(async () => {
    if (!isAuthenticated) { setMyBooks([]); return; }
    setMyBooks((await getMyBooks()).rows);
  }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setTimeout(() => { void loadMyBooks(); }, 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, loadMyBooks]);
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
    if (!isAuthenticated) { setActivation(undefined); return; }
    void getBookActivation().then((result) => setActivation(result.row)).catch(() => setActivation(null));
  }, [isAuthenticated]);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };
  const requireActivated = (next: 'add') => {
    if (!activation) { setModal('activate'); return; }
    setModal(next);
  };
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
  const updateBookHold = async (book: BookRow) => {
    const held = Number(book.status) !== 3;
    setBusy(true);
    try {
      await setBookHold(book.id, held);
      await loadMyBooks();
      showToast(held ? 'বইটি সাময়িকভাবে বন্ধ করা হয়েছে। এখন কেউ এটি ধার নেওয়ার অনুরোধ করতে পারবে না।' : 'বইটি আবার ধার দেওয়ার জন্য উন্মুক্ত করা হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'বইটির অবস্থা বদলানো যায়নি'); } finally { setBusy(false); }
  };
  const openEdit = (book: BookRow) => { setBookToEdit(book); setEditOpen(true); };
  const handleBookUpdated = (updated: BookRow) => setMyBooks((current) => current.map((item) => Number(item.id) === Number(updated.id) ? updated : item));
  const startRemove = (book: BookRow) => { setDeleteTarget(book); setModal('delete'); };
  const removeBook = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteBook(deleteTarget.id);
      setModal(null); setDeleteTarget(null);
      await loadMyBooks();
      showToast('বইটি বইঘর থেকে মুছে ফেলা হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'বইটি মুছে ফেলা যায়নি'); } finally { setBusy(false); }
  };
  const myBookState = (status: number) => {
    if (status === 3) return { label: 'সাময়িকভাবে বন্ধ', tone: 'bg-warning-bg text-warning' };
    if (status === 2) return { label: 'ধার দেওয়া আছে', tone: 'bg-info-bg text-info' };
    return { label: 'ধার দেওয়ার জন্য উন্মুক্ত', tone: 'bg-success-bg text-success' };
  };

  if (!isReady || !isAuthenticated) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-2" />;
  }

  return (
    <main className="min-h-screen bg-surface-2 pb-12">
      <BooksHeader active="my" myBookCount={myBooks.length} requestCount={visibleRequests.length} onAddBook={() => requireActivated('add')} />

      <section className="mx-auto max-w-6xl px-4 py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-fg">আমার বই</h2>
            <p className="mt-1 text-xs text-muted">আপনার যোগ করা বইয়ের তালিকা। সম্পাদনা, অস্থায়ীভাবে বন্ধ রাখা বা মুছে ফেলা — সবকিছু এখান থেকে করুন।</p>
          </div>
          <Button size="sm" onClick={() => requireActivated('add')}><Plus className="h-4 w-4" />নতুন বই যোগ করুন</Button>
        </div>
        {myBooks.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{myBooks.map((book) => { const state = myBookState(Number(book.status)); return (
          <article key={book.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="flex items-start gap-3 p-3">
              <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-6 w-6" /></div>}</div>
              <div className="min-w-0 flex-1">
                <Link href={`/books/${book.id}`} className="line-clamp-2 font-bold text-fg hover:text-brand">{book.title}</Link>
                <p className="mt-0.5 text-xs text-muted">{book.author_name || 'লেখক অজানা'}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${state.tone}`}>{state.label}</span>
                <p className="mt-2 text-xs text-muted">হারালে মূল্য: ৳{Number(book.book_price_minor)} · {book.category_name ?? 'বিভাগহীন'}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-2/50 p-3">
              <Button size="sm" variant="secondary" onClick={() => openEdit(book)}><Pencil className="h-3.5 w-3.5" />সম্পাদনা</Button>
              {(Number(book.status) === 0 || Number(book.status) === 3) && <Button size="sm" variant="secondary" disabled={busy} onClick={() => void updateBookHold(book)}>{Number(book.status) === 3 ? <><PlayCircle className="h-3.5 w-3.5" />চালু করুন</> : <><PauseCircle className="h-3.5 w-3.5" />এখন দেব না</>}</Button>}
              <Button size="sm" variant="danger" disabled={busy} className="ml-auto" onClick={() => startRemove(book)}><Trash2 className="h-3.5 w-3.5" />মুছুন</Button>
            </div>
          </article>
        ); })}</div> : <div className="mt-5 rounded-xl border border-dashed border-border bg-white p-10 text-center"><BookMarked className="mx-auto h-10 w-10 text-muted" /><p className="mt-3 font-semibold text-fg">আপনি এখনো কোনো বই যোগ করেননি</p><p className="mt-1 text-sm text-muted">বইঘর সক্রিয় করে আপনার বই তালিকায় যোগ করুন, তারপর এখান থেকে সেগুলো পরিচালনা করুন।</p><Button className="mt-5" onClick={() => requireActivated('add')}><Plus className="h-4 w-4" />প্রথম বই যোগ করুন</Button></div>}
      </section>

      <BookActivationModal open={modal === 'activate'} onClose={() => setModal(null)} onActivated={(result) => setActivation(result)} onMessage={showToast} />
      <BookAddModal open={modal === 'add'} onClose={() => setModal(null)} onMessage={showToast} onAdded={() => void loadMyBooks()} />

      <AppModal open={modal === 'delete'} title="বইটি মুছে ফেলবেন?" onClose={() => setModal(null)} footer={<><Button variant="secondary" disabled={busy} onClick={() => setModal(null)}>বাতিল</Button><Button variant="danger" disabled={busy} onClick={() => void removeBook()}><Trash2 className="h-4 w-4" />{busy ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}</Button></>}><p className="text-sm leading-6 text-fg-2"><strong>{deleteTarget?.title}</strong> বইটি আর বইঘরে দেখা যাবে না। আগের সম্পন্ন ধার নেওয়ার রেকর্ড থাকবে, তবে কোনো চলমান অনুরোধ বা ধার থাকলে বইটি সরানো যাবে না।</p></AppModal>
      {bookToEdit && <BookEditModal book={bookToEdit} open={editOpen} onClose={() => { setEditOpen(false); setBookToEdit(null); }} onUpdated={handleBookUpdated} onMessage={showToast} />}
      <AppToast message={toast} />
    </main>
  );
}