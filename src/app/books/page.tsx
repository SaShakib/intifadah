'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BookMarked, BookOpen, CalendarDays, Pencil, Search, Send, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { BooksHeader } from '@/components/books/BooksHeader';
import { BookActivationModal } from '@/components/books/BookActivationModal';
import { BookAddModal } from '@/components/books/BookAddModal';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { useAuth } from '@/contexts/AuthContext';
import { getBookActivation, getBookCategories, getMyBooks, getMyBookRequests, getPublicBooks, requestBook, type BookActivationInput, type BookCategoryRow, type BookRequestRow, type BookRow } from '@/lib/api';
import { bookDate } from '@/components/books/bookUtils';

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [categories, setCategories] = useState<BookCategoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [activation, setActivation] = useState<BookActivationInput | null | undefined>(undefined);
  const [modal, setModal] = useState<'activate' | 'add' | 'request' | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestDays, setRequestDays] = useState(7);
  const [myRequests, setMyRequests] = useState<BookRequestRow[]>([]);
  const [myBooks, setMyBooks] = useState<BookRow[]>([]);

  const load = useCallback(async () => {
    const [bookResult, categoryResult] = await Promise.all([getPublicBooks({ search, categoryId }), getBookCategories()]);
    setBooks(bookResult.rows);
    setCategories(categoryResult.rows);
  }, [categoryId, search]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = window.setTimeout(() => setActivation(undefined), 0);
      return () => window.clearTimeout(timer);
    }
    void getBookActivation().then((result) => setActivation(result.row)).catch(() => setActivation(null));
  }, [isAuthenticated]);
  const loadRequests = useCallback(async () => {
    if (!isAuthenticated) { setMyRequests([]); return; }
    setMyRequests((await getMyBookRequests()).rows);
  }, [isAuthenticated]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRequests(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRequests]);
  const loadMyBooks = useCallback(async () => {
    if (!isAuthenticated) { setMyBooks([]); return; }
    setMyBooks((await getMyBooks()).rows);
  }, [isAuthenticated]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadMyBooks(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMyBooks]);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };
  const requireActivated = (next: 'add' | 'request', book?: BookRow) => {
    if (!isAuthenticated) { router.push('/login?books=1'); return; }
    setSelectedBook(book ?? null);
    if (!activation) { setModal('activate'); return; }
    setModal(next);
  };
  const submitRequest = async () => {
    if (!selectedBook) return;
    setBusy(true);
    try { const result = await requestBook(selectedBook.id, requestDays); setModal(null); await load(); showToast(result.row.copiesNotified && result.row.copiesNotified > 1 ? `${result.row.copiesNotified} জন মালিকের কাছে অনুরোধ পাঠানো হয়েছে।` : 'বইয়ের অনুরোধ মালিকের কাছে পাঠানো হয়েছে।'); } catch (error) { showToast(error instanceof Error ? error.message : 'অনুরোধ পাঠানো যায়নি'); } finally { setBusy(false); }
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

  return (
    <main className="min-h-screen bg-surface-2 pb-12">
      <BooksHeader active="store" myBookCount={myBooks.length} requestCount={visibleRequests.length} onAddBook={() => requireActivated('add')} />

      <section className="border-b border-border bg-white"><div className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-3xl font-bold text-fg">বইঘর</h1><p className="mt-2 text-sm text-muted">সবার জন্য বই দেখুন, সক্রিয় হওয়ার পর বই যোগ করুন বা ধার নিন। বই হারালে তালিকাভুক্ত মূল্য পরিশোধ করতে হবে।</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="বই বা লেখক খুঁজুন" /></div><select value={categoryId ?? ''} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">সব বিভাগ</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category_name}</option>)}</select></div></div></section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:grid-cols-2 lg:grid-cols-4">{books.map((book) => {
        const availableCopies = Number(book.available_copy_count ?? (book.status === 0 ? 1 : 0));
        const totalCopies = Number(book.total_copy_count ?? 1);
        const estimatedFree = bookDate(book.estimated_available_on);
        const isOwner = isAuthenticated && Number(book.owner_user_id) === Number(user?.id);
        return <article key={book.id} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"><div className="relative aspect-[3/4] bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-10 w-10" /></div>}</div><div className="p-4"><p className="text-xs font-semibold text-brand">{book.category_name ?? 'বিভাগহীন'}</p><Link href={`/books/${book.id}`} className="mt-1 block font-bold text-fg hover:text-brand">{book.title}</Link><p className="mt-1 text-sm text-muted">{book.author_name || 'লেখক অজানা'}</p><p className="mt-3 text-xs text-muted">মালিক: {book.owner_name}</p><div className="mt-3 space-y-1 text-xs text-muted">{isOwner ? <p className="flex items-center gap-1 font-semibold text-brand"><BookMarked className="h-3.5 w-3.5" />এটি আপনার বই</p> : <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{totalCopies > 1 ? `${availableCopies}/${totalCopies} কপি এখন উপলব্ধ` : availableCopies ? 'কপি উপলব্ধ' : Number(book.status) === 3 ? 'মালিক সাময়িকভাবে বইটি বন্ধ রেখেছেন' : 'কপি এখন ধার দেওয়া আছে'}</p>}{estimatedFree && <p className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />সম্ভাব্য ফ্রি: {estimatedFree}</p>}</div><div className="mt-3 flex gap-2"><Link href={`/books/${book.id}`} className="flex-1"><Button size="sm" fullWidth variant="secondary">বিস্তারিত</Button></Link>{isOwner ? <Link href="/books/my"><Button size="sm" variant="secondary"><Pencil className="h-3.5 w-3.5" />ব্যবস্থাপনা</Button></Link> : <Button size="sm" disabled={!availableCopies} onClick={() => requireActivated('request', book)}><Send className="h-3.5 w-3.5" />{availableCopies ? 'ধার নিন' : 'ব্যস্ত'}</Button>}</div></div></article>;
      })}</section>
      {!books.length && <p className="py-12 text-center text-sm text-muted">কোনো বই পাওয়া যায়নি।</p>}

      <BookActivationModal open={modal === 'activate'} onClose={() => setModal(null)} onActivated={(result) => setActivation(result)} onMessage={showToast} />
      <BookAddModal open={modal === 'add'} onClose={() => setModal(null)} onMessage={showToast} onAdded={() => { void load(); void loadMyBooks(); }} />

      <AppModal open={modal === 'request'} title="বই ধার নিন" onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>বাতিল</Button><Button disabled={busy || !selectedBook?.available_copy_count} onClick={() => void submitRequest()}><Send className="h-4 w-4" />অনুরোধ পাঠান</Button></>}><p className="font-bold">{selectedBook?.title}</p><p className="mt-2 text-sm text-muted">একই বইয়ের উপলব্ধ সব মালিককে অনুরোধ যাবে। যিনি আগে গ্রহণ করবেন, তাঁর কপিটিই আপনার জন্য সংরক্ষিত হবে।</p>{selectedBook && <p className="mt-2 flex items-center gap-1 text-xs text-brand"><Users className="h-3.5 w-3.5" />{selectedBook.available_copy_count} কপি উপলব্ধ</p>}<select value={requestDays} onChange={(event) => setRequestDays(Number(event.target.value))} className="mt-4 h-10 w-full rounded-lg border border-border px-3 text-sm">{[3, 7, 10, 15, 30].map((days) => <option key={days} value={days}>{days} দিন</option>)}</select></AppModal>

      <AppToast message={toast} />
    </main>
  );
}