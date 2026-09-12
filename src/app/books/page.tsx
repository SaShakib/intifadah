'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BookMarked, BookOpen, CalendarDays, Check, CircleHelp, ExternalLink, ImagePlus, LayoutDashboard, Mail, MessagesSquare, PauseCircle, Pencil, Phone, PlayCircle, Plus, Search, Send, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { ProgrammableCoverSearch } from '@/components/books/ProgrammableCoverSearch';
import { BookEditModal } from '@/components/books/BookEditModal';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { useAuth } from '@/contexts/AuthContext';
import { activateBooks, confirmBookReceived, createBook, createBookCategory, deleteBook, getBookActivation, getBookCategories, getMyBooks, getMyBookRequests, getPublicBooks, ownerBookRequestAction, requestBook, requestBookExtension, resolveBookExtension, setBookHold, uploadBookCover, type BookActivationInput, type BookCategoryRow, type BookRequestRow, type BookRow } from '@/lib/api';

const educationLevels = ['Below SSC', 'SSC', 'HSC 1st', 'HSC 2nd', 'Honours 1st year', 'Honours 2nd year', 'Honours 3rd year', 'Honours 4th year', 'Masters'];

function bookDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'short' }).format(date);
}

function googleImagesUrl(title: string) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${title} book cover`)}`;
}

type BooksTab = 'store' | 'my-books' | 'requests';

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [categories, setCategories] = useState<BookCategoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [activation, setActivation] = useState<BookActivationInput | null | undefined>(undefined);
  const [modal, setModal] = useState<'activate' | 'add' | 'request' | 'delete' | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activationStep, setActivationStep] = useState(0);
  const [activationForm, setActivationForm] = useState<BookActivationInput>({ village: '', wardNo: 0, fatherName: '', occupationType: 'student', institutionName: '', educationLevel: '', educationDetail: '', professionDetail: '' });
  const [bookForm, setBookForm] = useState({ title: '', authorName: '', searchAliases: '', bookPriceMinor: '', categoryId: '', description: '', coverUrl: '', coverPublicId: '', externalSource: '', externalVolumeId: '' });
  const [newCategory, setNewCategory] = useState('');
  const [coverSearchQuery, setCoverSearchQuery] = useState('');
  const [coverSearchRun, setCoverSearchRun] = useState(0);
  const [bookStep, setBookStep] = useState<1 | 2>(1);
  const [searchingCover, setSearchingCover] = useState(false);
  const [bookGuideOpen, setBookGuideOpen] = useState(false);
  const [requestDays, setRequestDays] = useState(7);
  const [myRequests, setMyRequests] = useState<BookRequestRow[]>([]);
  const [myBooks, setMyBooks] = useState<BookRow[]>([]);
  const [activeTab, setActiveTab] = useState<BooksTab>('store');
  const [editOpen, setEditOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<BookRow | null>(null);

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
    if (next === 'add') setBookStep(1);
    setModal(next);
  };
  const submitActivation = async () => {
    setBusy(true);
    try {
      await activateBooks(activationForm);
      setActivation({ ...activationForm, approval_status: 1 });
      setModal(null);
      showToast('বইঘর সক্রিয় হয়েছে। এখন বই যোগ বা ধার নিতে পারবেন।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'তথ্য সংরক্ষণ হয়নি'); } finally { setBusy(false); }
  };
  const searchCover = () => {
    if (!bookForm.title.trim()) { showToast('বইয়ের নাম দিন।'); return; }
    setCoverSearchQuery(bookForm.title.trim());
    setCoverSearchRun((run) => run + 1);
  };
  const handleCoverSearchStateChange = useCallback((loading: boolean) => setSearchingCover(loading), []);
  const nextBookStep = () => {
    if (!bookForm.title.trim()) { showToast('বইয়ের নাম দিন।'); return; }
    setBookStep(2);
  };
  const closeBookModal = () => { setSearchingCover(false); setBookStep(1); setModal(null); };
  const createCategoryInline = async () => {
    if (!newCategory.trim()) return;
    const result = await createBookCategory(newCategory.trim());
    setCategories((current) => [...current, result.row].sort((a, b) => a.category_name.localeCompare(b.category_name)));
    setBookForm((current) => ({ ...current, categoryId: String(result.row.id) }));
    setNewCategory('');
  };
  const submitBook = async () => {
    if (!bookForm.title.trim()) { setBookStep(1); showToast('বইয়ের নাম দিন।'); return; }
    if (!Number(bookForm.bookPriceMinor) || Number(bookForm.bookPriceMinor) < 1) { showToast('বইয়ের মূল্য দিন।'); return; }
    setBusy(true);
    try {
      await createBook({ ...bookForm, categoryId: bookForm.categoryId ? Number(bookForm.categoryId) : undefined, bookPriceMinor: Number(bookForm.bookPriceMinor) });
      closeBookModal();
      await Promise.all([load(), loadMyBooks()]); showToast('বইটি বইঘরে যোগ করা হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'বই যোগ করা যায়নি'); } finally { setBusy(false); }
  };
  const submitRequest = async () => {
    if (!selectedBook) return;
    setBusy(true);
    try { const result = await requestBook(selectedBook.id, requestDays); setModal(null); await load(); showToast(result.row.copiesNotified && result.row.copiesNotified > 1 ? `${result.row.copiesNotified} জন মালিকের কাছে অনুরোধ পাঠানো হয়েছে।` : 'বইয়ের অনুরোধ মালিকের কাছে পাঠানো হয়েছে।'); } catch (error) { showToast(error instanceof Error ? error.message : 'অনুরোধ পাঠানো যায়নি'); } finally { setBusy(false); }
  };
  const updateRequest = async (request: BookRequestRow, action: 'accept' | 'reject' | 'given' | 'return_received' | 'returned' | 'received' | 'extend') => {
    setBusy(true);
    try {
      if (action === 'received' || action === 'returned') await confirmBookReceived(request.id, action);
      else if (action === 'extend') await requestBookExtension(request.id, 7);
      else await ownerBookRequestAction(request.id, action);
      await Promise.all([loadRequests(), load(), loadMyBooks()]);
      showToast(action === 'extend' ? '৭ দিনের বাড়তি সময়ের অনুরোধ পাঠানো হয়েছে।' : 'বইয়ের অবস্থা আপডেট হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'আপডেট করা যায়নি'); } finally { setBusy(false); }
  };
  const updateExtension = async (extensionId: string | number, accepted: boolean) => {
    setBusy(true);
    try { await resolveBookExtension(extensionId, accepted); await loadRequests(); showToast(accepted ? 'বর্ধিত সময় অনুমোদন হয়েছে।' : 'বর্ধিত সময়ের অনুরোধ প্রত্যাখ্যান হয়েছে।'); } catch (error) { showToast(error instanceof Error ? error.message : 'আপডেট করা যায়নি'); } finally { setBusy(false); }
  };
  const updateBookHold = async (book: BookRow) => {
    const held = Number(book.status) !== 3;
    setBusy(true);
    try {
      await setBookHold(book.id, held);
      await Promise.all([load(), loadMyBooks()]);
      showToast(held ? 'বইটি সাময়িকভাবে বন্ধ করা হয়েছে। এখন কেউ এটি ধার নেওয়ার অনুরোধ করতে পারবে না।' : 'বইটি আবার ধার দেওয়ার জন্য উন্মুক্ত করা হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'বইটির অবস্থা বদলানো যায়নি'); } finally { setBusy(false); }
  };
  const openEdit = (book: BookRow) => { setBookToEdit(book); setEditOpen(true); };
  const handleBookUpdated = (updated: BookRow) => {
    setMyBooks((current) => current.map((item) => Number(item.id) === Number(updated.id) ? updated : item));
    void load();
  };
  const startRemove = (book: BookRow) => { setDeleteTarget(book); setModal('delete'); };
  const removeBook = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteBook(deleteTarget.id);
      setModal(null); setDeleteTarget(null);
      await Promise.all([load(), loadMyBooks()]);
      showToast('বইটি বইঘর থেকে মুছে ফেলা হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'বইটি মুছে ফেলা যায়নি'); } finally { setBusy(false); }
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
  const incomingRequests = visibleRequests.filter((request) => Number(request.owner_user_id) === Number(user?.id));
  const outgoingRequests = visibleRequests.filter((request) => Number(request.owner_user_id) !== Number(user?.id));
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/user/dashboard';
  const myBookState = (status: number) => {
    if (status === 3) return { label: 'সাময়িকভাবে বন্ধ', tone: 'bg-warning-bg text-warning' };
    if (status === 2) return { label: 'ধার দেওয়া আছে', tone: 'bg-info-bg text-info' };
    return { label: 'ধার দেওয়ার জন্য উন্মুক্ত', tone: 'bg-success-bg text-success' };
  };
  const tabClass = (active: boolean) => active
    ? 'flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-2 py-2 text-sm font-bold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60'
    : 'flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-fg-2 transition hover:bg-white hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60';

  return (
    <main className="min-h-screen bg-surface-2 pb-12">
      <header className="border-b border-border bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4"><Link href="/books" className="flex items-center gap-2 font-bold text-fg"><BookOpen className="h-5 w-5 text-brand" />ইনতিফাদাহ বইঘর</Link><div className="flex gap-2">{isAuthenticated && <Link href={dashboardHref}><Button size="sm" variant="secondary"><LayoutDashboard className="h-4 w-4" />ড্যাশবোর্ড</Button></Link>}{isAuthenticated ? <Button size="sm" variant="secondary" onClick={() => requireActivated('add')}><Plus className="h-4 w-4" />বই যোগ করুন</Button> : <Link href="/login?books=1"><Button size="sm">লগইন করে যোগ করুন</Button></Link>}</div></div></header>

      {isAuthenticated && <nav className="border-b border-border bg-white"><div className="mx-auto max-w-6xl px-4 py-3"><div className="grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1">
        <button type="button" onClick={() => setActiveTab('store')} aria-pressed={activeTab === 'store'} className={tabClass(activeTab === 'store')}><BookOpen className="h-4 w-4" />বইঘর</button>
        <button type="button" onClick={() => setActiveTab('my-books')} aria-pressed={activeTab === 'my-books'} className={tabClass(activeTab === 'my-books')}><BookMarked className="h-4 w-4" />আমার বই{myBooks.length > 0 && <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">{myBooks.length}</span>}</button>
        <button type="button" onClick={() => setActiveTab('requests')} aria-pressed={activeTab === 'requests'} className={tabClass(activeTab === 'requests')}><MessagesSquare className="h-4 w-4" />অনুরোধ{visibleRequests.length > 0 && <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">{visibleRequests.length}</span>}</button>
      </div></div></nav>}

      {activeTab === 'store' && <section className="border-b border-border bg-white"><div className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-3xl font-bold text-fg">বইঘর</h1><p className="mt-2 text-sm text-muted">সবার জন্য বই দেখুন, সক্রিয় হওয়ার পর বই যোগ করুন বা ধার নিন। বই হারালে তালিকাভুক্ত মূল্য পরিশোধ করতে হবে।</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="বই বা লেখক খুঁজুন" /></div><select value={categoryId ?? ''} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">সব বিভাগ</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category_name}</option>)}</select></div></div></section>}

      {activeTab === 'store' && <section className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:grid-cols-2 lg:grid-cols-4">{books.map((book) => {
        const availableCopies = Number(book.available_copy_count ?? (book.status === 0 ? 1 : 0));
        const totalCopies = Number(book.total_copy_count ?? 1);
        const estimatedFree = bookDate(book.estimated_available_on);
        return <article key={book.id} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"><div className="relative aspect-[3/4] bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-10 w-10" /></div>}</div><div className="p-4"><p className="text-xs font-semibold text-brand">{book.category_name ?? 'বিভাগহীন'}</p><Link href={`/books/${book.id}`} className="mt-1 block font-bold text-fg hover:text-brand">{book.title}</Link><p className="mt-1 text-sm text-muted">{book.author_name || 'লেখক অজানা'}</p><p className="mt-3 text-xs text-muted">মালিক: {book.owner_name}</p><div className="mt-3 space-y-1 text-xs text-muted"><p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{totalCopies > 1 ? `${availableCopies}/${totalCopies} কপি এখন উপলব্ধ` : availableCopies ? 'কপি উপলব্ধ' : Number(book.status) === 3 ? 'মালিক সাময়িকভাবে বইটি বন্ধ রেখেছেন' : 'কপি এখন ধার দেওয়া আছে'}</p>{estimatedFree && <p className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />সম্ভাব্য ফ্রি: {estimatedFree}</p>}</div><div className="mt-3 flex gap-2"><Link href={`/books/${book.id}`} className="flex-1"><Button size="sm" fullWidth variant="secondary">বিস্তারিত</Button></Link><Button size="sm" disabled={!availableCopies} onClick={() => requireActivated('request', book)}><Send className="h-3.5 w-3.5" />{availableCopies ? 'ধার নিন' : 'ব্যস্ত'}</Button></div></div></article>;
      })}</section>}
      {activeTab === 'store' && !books.length && <p className="py-12 text-center text-sm text-muted">কোনো বই পাওয়া যায়নি।</p>}

      {isAuthenticated && activeTab === 'my-books' && <section className="mx-auto max-w-6xl px-4 py-7">
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
      </section>}

      {isAuthenticated && activeTab === 'requests' && <section className="mx-auto max-w-6xl space-y-5 px-4 py-7">
        <div>
          <h2 className="text-xl font-bold text-fg">আমার অনুরোধ</h2>
          <p className="mt-1 text-xs text-muted">আপনার বইয়ের জন্য আসা অনুরোধ ও আপনার ধার নেওয়ার অনুরোধের খতিয়ান।</p>
        </div>
        {incomingRequests.length > 0 && <div className="border border-border bg-white p-5"><h3 className="font-bold text-fg">আমার বইয়ের জন্য আসা অনুরোধ</h3><div className="mt-4 space-y-3">{incomingRequests.map((request) => { const pendingExtension = request.extensions?.find((extension) => extension.status === 0); return <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0"><div><p className="font-semibold text-fg">{request.title}</p><p className="text-xs text-muted">অনুরোধকারী: {request.requester_name} · {request.requested_days} দিন{request.due_on ? ` · সম্ভাব্য ফেরত: ${bookDate(request.due_on)}` : ''}</p></div><div className="flex flex-wrap gap-2">{request.status === 0 && <><Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'accept')}>গ্রহণ</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => void updateRequest(request, 'reject')}>প্রত্যাখ্যান</Button></>}{request.status === 1 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'given')}>দিয়েছি</Button>}{request.status === 5 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'return_received')}>ফেরত গ্রহণ নিশ্চিত</Button>}{pendingExtension && <><Button size="sm" disabled={busy} onClick={() => void updateExtension(pendingExtension.id, true)}>+{pendingExtension.requestedDays} দিন</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => void updateExtension(pendingExtension.id, false)}>না</Button></>}</div></div>; })}</div></div>}
        {outgoingRequests.length > 0 && <div className="border border-border bg-white p-5"><h3 className="font-bold text-fg">আমার ধার নেওয়ার অনুরোধ</h3><div className="mt-4 space-y-3">{outgoingRequests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0"><div><p className="font-semibold text-fg">{request.title}</p><p className="text-xs text-muted">মালিক: {request.owner_name} · {request.requested_days} দিন</p>{request.status >= 1 && request.status !== 2 && <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-brand">{request.owner_mobile && <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${request.owner_mobile}`}><Phone className="h-3.5 w-3.5" />{request.owner_mobile}</a>}{request.owner_email && <a className="inline-flex items-center gap-1 hover:underline" href={`mailto:${request.owner_email}`}><Mail className="h-3.5 w-3.5" />{request.owner_email}</a>}</div>}</div><div className="flex flex-wrap gap-2">{request.status === 3 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'received')}>পেয়েছি</Button>}{request.status === 4 && <><Button size="sm" variant="secondary" disabled={busy} onClick={() => void updateRequest(request, 'extend')}>আরও ৭ দিন চাই</Button><Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'returned')}>ফেরত দিয়েছি</Button></>}</div></div>)}</div></div>}
        {!incomingRequests.length && !outgoingRequests.length && <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center"><MessagesSquare className="mx-auto h-10 w-10 text-muted" /><p className="mt-3 font-semibold text-fg">কোনো অনুরোধ নেই</p><p className="mt-1 text-sm text-muted">যখন কেউ আপনার বই চাইবে বা আপনি বই ধার নিতে অনুরোধ পাঠাবেন, তখন তা এখানে দেখা যাবে।</p></div>}
      </section>}

      <AppModal open={modal === 'activate'} title="বইঘর সক্রিয় করুন" onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>এখন নয়</Button>{activationStep > 0 && <Button variant="secondary" onClick={() => setActivationStep((step) => step - 1)}>পেছনে</Button>}<Button disabled={busy} onClick={() => activationStep < 2 ? setActivationStep((step) => step + 1) : void submitActivation()}>{activationStep < 2 ? 'পরের ধাপ' : busy ? 'সংরক্ষণ হচ্ছে...' : 'সক্রিয় করুন'}</Button></>}>
        <div className="space-y-4">{activationStep === 0 && <><p className="text-sm text-muted">আপনার অবস্থান ও পরিচয় দিয়ে বইঘর সক্রিয় করুন।</p><Input value={activationForm.village} onChange={(event) => setActivationForm({ ...activationForm, village: event.target.value })} placeholder="গ্রাম / এলাকা" /><Input type="number" value={activationForm.wardNo || ''} onChange={(event) => setActivationForm({ ...activationForm, wardNo: Number(event.target.value) })} placeholder="ওয়ার্ড নম্বর" /><Input value={activationForm.fatherName} onChange={(event) => setActivationForm({ ...activationForm, fatherName: event.target.value })} placeholder="বাবার নাম" /></>}{activationStep === 1 && <div className="grid grid-cols-3 gap-2">{(['student', 'working', 'business'] as const).map((type) => <button key={type} type="button" onClick={() => setActivationForm({ ...activationForm, occupationType: type })} className={activationForm.occupationType === type ? 'rounded-lg border border-brand bg-brand-light p-4 font-bold text-brand' : 'rounded-lg border border-border p-4 text-sm'}>{type === 'student' ? 'শিক্ষার্থী' : type === 'working' ? 'চাকরি' : 'ব্যবসা'}</button>)}</div>}{activationStep === 2 && (activationForm.occupationType === 'student' ? <><Input value={activationForm.institutionName} onChange={(event) => setActivationForm({ ...activationForm, institutionName: event.target.value })} placeholder="স্কুল / কলেজ / বিশ্ববিদ্যালয়" /><select value={activationForm.educationLevel} onChange={(event) => setActivationForm({ ...activationForm, educationLevel: event.target.value })} className="h-10 w-full rounded-lg border border-border px-3 text-sm"><option value="">শ্রেণি নির্বাচন করুন</option>{educationLevels.map((level) => <option key={level}>{level}</option>)}</select>{activationForm.educationLevel === 'Below SSC' && <Input value={activationForm.educationDetail} onChange={(event) => setActivationForm({ ...activationForm, educationDetail: event.target.value })} placeholder="কোন শ্রেণি? যেমন: Class 8" />}</> : <Input value={activationForm.professionDetail} onChange={(event) => setActivationForm({ ...activationForm, professionDetail: event.target.value })} placeholder={activationForm.occupationType === 'business' ? 'ব্যবসার ধরন' : 'পেশা'} />)}</div>
      </AppModal>

      <AppModal open={modal === 'request'} title="বই ধার নিন" onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>বাতিল</Button><Button disabled={busy || !selectedBook?.available_copy_count} onClick={() => void submitRequest()}><Send className="h-4 w-4" />অনুরোধ পাঠান</Button></>}><p className="font-bold">{selectedBook?.title}</p><p className="mt-2 text-sm text-muted">একই বইয়ের উপলব্ধ সব মালিককে অনুরোধ যাবে। যিনি আগে গ্রহণ করবেন, তাঁর কপিটিই আপনার জন্য সংরক্ষিত হবে।</p>{selectedBook && <p className="mt-2 flex items-center gap-1 text-xs text-brand"><Users className="h-3.5 w-3.5" />{selectedBook.available_copy_count} কপি উপলব্ধ</p>}<select value={requestDays} onChange={(event) => setRequestDays(Number(event.target.value))} className="mt-4 h-10 w-full rounded-lg border border-border px-3 text-sm">{[3, 7, 10, 15, 30].map((days) => <option key={days} value={days}>{days} দিন</option>)}</select></AppModal>

      <AppModal open={modal === 'add'} title="বই যোগ করুন" onClose={closeBookModal} className="max-w-3xl" loading={searchingCover} loadingLabel="বই ও কভার খোঁজা হচ্ছে..." footer={<><Button variant="secondary" onClick={closeBookModal}>বাতিল</Button>{bookStep === 2 && <Button variant="secondary" onClick={() => setBookStep(1)}>পেছনে</Button>}{bookStep === 1 ? <Button disabled={searchingCover} onClick={nextBookStep}>পরের ধাপ</Button> : <Button disabled={busy} onClick={() => void submitBook()}><Check className="h-4 w-4" />বই যোগ করুন</Button>}</>}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold"><div className={bookStep === 1 ? 'rounded-lg bg-brand px-3 py-2 text-white' : 'rounded-lg bg-surface-2 px-3 py-2 text-muted'}>১. বই ও কভার</div><div className={bookStep === 2 ? 'rounded-lg bg-brand px-3 py-2 text-white' : 'rounded-lg bg-surface-2 px-3 py-2 text-muted'}>২. অন্যান্য তথ্য</div></div>
          <Button type="button" size="sm" variant="secondary" className="w-full" onClick={() => setBookGuideOpen(true)}><CircleHelp className="h-4 w-4" />দেখে নিন কিভাবে বই যোগ করতে হয়</Button>
          {bookStep === 1 ? <>
            <label className="block text-sm font-semibold text-fg">বইয়ের নাম <span className="text-danger">*</span><div className="mt-1 flex gap-2"><Input value={bookForm.title} onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); searchCover(); } }} placeholder="যেমন: তিন গোয়েন্দা" /><Button type="button" variant="secondary" disabled={searchingCover} onClick={searchCover}><Search className="h-4 w-4" />খুঁজুন</Button></div></label>
            <p className="-mt-3 text-xs text-muted">নাম লিখে Enter চাপুন বা খুঁজুন চাপুন।</p>
            {coverSearchQuery && <ProgrammableCoverSearch key={coverSearchRun} query={coverSearchQuery} onSearchStateChange={handleCoverSearchStateChange} />}
            {bookForm.title.trim() && <a href={googleImagesUrl(bookForm.title)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"><ExternalLink className="h-3.5 w-3.5" />Google Images-এ কভার খুঁজুন</a>}
            <label className="block text-sm font-semibold text-fg">কভারের সরাসরি image URL <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={bookForm.coverUrl} onChange={(event) => setBookForm({ ...bookForm, coverUrl: event.target.value, coverPublicId: '', externalSource: 'manual_url', externalVolumeId: '' })} placeholder="https://.../book-cover.jpg" /></label>
            <p className="-mt-3 rounded-lg border border-brand/20 bg-brand-light px-3 py-2 text-xs leading-5 text-fg-2">কম্পিউটারে কভারের উপর right-click করে “Copy image address” নিয়ে উপরের ঘরে paste করুন। মোবাইলে Google Images থেকে কভারটি download করে নিচের <strong>কভার আপলোড করুন</strong> থেকে upload করুন।</p>
            <label onClick={() => { if (!coverSearchQuery) showToast('প্রথমে বইয়ের কভার খুঁজুন। কভার না পেলে তারপর ছবি আপলোড করুন।'); }} className={`flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm font-semibold ${coverSearchQuery ? 'cursor-pointer border-border' : 'cursor-not-allowed border-border bg-surface-2 text-muted'}`}>
              <ImagePlus className="h-4 w-4" />কভার আপলোড করুন <span className="font-normal text-muted">(Google-এ না পেলে)</span>
              <input className="hidden" type="file" accept="image/*" disabled={!coverSearchQuery} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { const upload = await uploadBookCover(file); setBookForm({ ...bookForm, ...upload, externalSource: '' }); showToast('WebP কভার আপলোড হয়েছে'); } catch (error) { showToast(error instanceof Error ? error.message : 'আপলোড হয়নি'); } finally { setBusy(false); } }} />
            </label>
            {!coverSearchQuery && <p className="-mt-3 text-xs leading-5 text-muted">আগে বইয়ের নাম দিয়ে খুঁজুন। ফলাফলে কভার না পেলে তখন নিজের ছবি আপলোড করতে পারবেন।</p>}
            {bookForm.coverUrl && <Image src={bookForm.coverUrl} alt="নির্বাচিত কভার" width={96} height={132} className="h-36 w-24 rounded border border-border object-cover" unoptimized />}
          </> : <>
            <label className="block text-sm font-semibold text-fg">লেখকের নাম <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={bookForm.authorName} onChange={(event) => setBookForm({ ...bookForm, authorName: event.target.value })} placeholder="লেখকের নাম" /></label>
            <label className="block text-sm font-semibold text-fg">বইয়ের মূল্য <span className="text-danger">*</span><Input className="mt-1" type="number" min="1" value={bookForm.bookPriceMinor} onChange={(event) => setBookForm({ ...bookForm, bookPriceMinor: event.target.value })} placeholder="হারালে যে মূল্য পরিশোধ করতে হবে" /></label>
            <label className="block text-sm font-semibold text-fg">বিভাগ <span className="font-normal text-muted">(ঐচ্ছিক)</span><select value={bookForm.categoryId} onChange={(event) => setBookForm({ ...bookForm, categoryId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"><option value="">বিভাগ নির্বাচন করুন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category_name}</option>)}</select></label>
            <div className="flex gap-2"><Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="নতুন বিভাগ (ঐচ্ছিক)" /><Button type="button" variant="secondary" onClick={() => void createCategoryInline()}><Plus className="h-4 w-4" /></Button></div>
            <label className="block text-sm font-semibold text-fg">বিকল্প নাম / বানান <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={bookForm.searchAliases} onChange={(event) => setBookForm({ ...bookForm, searchAliases: event.target.value })} placeholder="কমা দিয়ে লিখুন" /></label>
            <label className="block text-sm font-semibold text-fg">সংক্ষিপ্ত বিবরণ <span className="font-normal text-muted">(ঐচ্ছিক)</span><textarea value={bookForm.description} onChange={(event) => setBookForm({ ...bookForm, description: event.target.value })} className="mt-1 h-24 w-full rounded-lg border border-border p-3 text-sm" placeholder="বই সম্পর্কে লিখুন" /></label>
            <p className="text-xs text-muted"><span className="text-danger">*</span> চিহ্নিত তথ্য অবশ্যই দিতে হবে।</p>
          </>}
        </div>
      </AppModal>
      <AppModal open={modal === 'delete'} title="বইটি মুছে ফেলবেন?" onClose={() => setModal(null)} footer={<><Button variant="secondary" disabled={busy} onClick={() => setModal(null)}>বাতিল</Button><Button variant="danger" disabled={busy} onClick={() => void removeBook()}><Trash2 className="h-4 w-4" />{busy ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}</Button></>}><p className="text-sm leading-6 text-fg-2"><strong>{deleteTarget?.title}</strong> বইটি আর বইঘরে দেখা যাবে না। আগের সম্পন্ন ধার নেওয়ার রেকর্ড থাকবে, তবে কোনো চলমান অনুরোধ বা ধার থাকলে বইটি সরানো যাবে না।</p></AppModal>
      {bookToEdit && <BookEditModal book={bookToEdit} open={editOpen} onClose={() => { setEditOpen(false); setBookToEdit(null); }} onUpdated={handleBookUpdated} onMessage={showToast} />}
      <AppModal open={bookGuideOpen} title="কিভাবে বই যোগ করবেন" onClose={() => setBookGuideOpen(false)} className="max-w-3xl" footer={<Button onClick={() => setBookGuideOpen(false)}>বুঝেছি</Button>}>
        <div className="space-y-5 text-sm leading-6 text-fg-2">
          <section><h3 className="font-bold text-fg">১. বইয়ের নাম দিয়ে খুঁজুন</h3><p className="mt-1">প্রথম ধাপে বইয়ের নাম লিখে <strong>Enter</strong> চাপুন বা <strong>খুঁজুন</strong> চাপুন। একই জায়গাতেই Google-এর কভার ফলাফল দেখাবে।</p></section>
          <section><h3 className="font-bold text-fg">২. পছন্দের কভারের address কপি করুন</h3><p className="mt-1">ছবির উপরেই right-click করুন। তারপর <strong>Copy Image Address</strong> নির্বাচন করুন। ফলাফলের নাম বা ওয়েবসাইটের লিংক নয়, অবশ্যই ছবির address কপি করবেন।</p><figure className="mt-3 overflow-hidden rounded-lg border border-border bg-surface-2"><Image src="/book-guide/copy-image-address-desktop.png" alt="Desktop browser menu with Copy Image Address highlighted" width={1072} height={798} className="h-auto w-full" /><figcaption className="px-3 py-2 text-xs text-muted">কম্পিউটারে ছবির উপর right-click করে Copy Image Address নির্বাচন করুন।</figcaption></figure></section>
          <section><h3 className="font-bold text-fg">৩. মোবাইলে কভার download করে upload করুন</h3><p className="mt-1">মোবাইলে <strong>Google Images-এ কভার খুঁজুন</strong> বাটনে চাপুন। পছন্দের কভারটি খুলে <strong>Download image</strong> / <strong>ছবি ডাউনলোড</strong> করুন। এরপর এই পেজে ফিরে <strong>কভার আপলোড করুন</strong> চাপুন এবং ডাউনলোড করা ছবিটি নির্বাচন করুন।</p><div className="mt-3 rounded-lg border border-brand/20 bg-brand-light p-3 text-xs leading-5 text-fg-2"><p className="font-bold text-brand">মোবাইলের জন্য সহজ নিয়ম</p><p className="mt-1">Google Images → ছবি Download → কভার আপলোড করুন → ডাউনলোড করা ছবি নির্বাচন</p></div></section>
          <section><h3 className="font-bold text-fg">৪. ফলাফল না পেলে অন্য কভার খুঁজুন</h3><p className="mt-1"><strong>Google Images-এ কভার খুঁজুন</strong> বাটনে চাপুন। কভার পেলে কম্পিউটারে তার address কপি করুন, আর মোবাইলে ছবিটি download করে <strong>কভার আপলোড করুন</strong> থেকে upload করুন।</p></section>
          <section><h3 className="font-bold text-fg">৫. কভার দিয়ে পরের ধাপে যান</h3><p className="mt-1">কম্পিউটারে <strong>কভারের সরাসরি image URL</strong> ঘরে address paste করুন। মোবাইলে download করা ছবি <strong>কভার আপলোড করুন</strong> থেকে upload করুন। এরপর <strong>পরের ধাপ</strong> চাপুন। দ্বিতীয় ধাপে বইয়ের মূল্য দিন, তারপর <strong>বই যোগ করুন</strong> চাপুন।</p></section>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </main>
  );
}