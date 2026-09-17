'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { BookMarked, BookOpen, CalendarDays, Copy, FolderOpen, Pencil, Search, Send, Star, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { BooksHeader } from '@/components/books/BooksHeader';
import { BooksBottomNav } from '@/components/books/BooksBottomNav';
import { ScrollToTopButton } from '@/components/books/ScrollToTopButton';
import { BookActivationModal } from '@/components/books/BookActivationModal';
import { BookAddModal } from '@/components/books/BookAddModal';
import { ShareButton } from '@/components/books/ShareButton';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { useAuth } from '@/contexts/AuthContext';
import { getBookActivation, getBookCategories, getMyBooks, getMyBookRequests, getPublicBooks, getPublicBooksGrouped, requestBook, toggleAdminFeaturedBook, type BookActivationInput, type BookCategoryRow, type BookRequestRow, type BookRow, type BookStoreSection } from '@/lib/api';
import { bookDate } from '@/components/books/bookUtils';

function BooksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, roleKey, user } = useAuth();
  const isSuperAdmin = roleKey === 'super_admin';
  const PAGE_SIZE = 40;
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1);

  const [books, setBooks] = useState<BookRow[]>([]);
  const [featured, setFeatured] = useState<BookRow[]>([]);
  const [sections, setSections] = useState<BookStoreSection[]>([]);
  const [uncategorized, setUncategorized] = useState<BookRow[]>([]);
  const [categories, setCategories] = useState<BookCategoryRow[]>([]);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [totalCount, setTotalCount] = useState(0);
  const [activation, setActivation] = useState<BookActivationInput | null | undefined>(undefined);
  const [modal, setModal] = useState<'activate' | 'add' | 'request' | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestDays, setRequestDays] = useState(7);
  const [featuredBusyId, setFeaturedBusyId] = useState<string | number | null>(null);
  const [myRequests, setMyRequests] = useState<BookRequestRow[]>([]);
  const [myBooks, setMyBooks] = useState<BookRow[]>([]);

  const grouped = !categoryParam && !searchParam;

  const updateParams = useCallback((patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `/books?${query}` : '/books');
  }, [router, searchParams]);

  const load = useCallback(async () => {
    if (!categoryParam && !searchParam) {
      const [groupedResult, categoryResult] = await Promise.all([getPublicBooksGrouped(), getBookCategories()]);
      setFeatured(groupedResult.featured ?? []);
      setSections(groupedResult.sections);
      setUncategorized(groupedResult.uncategorized);
      setCategories(categoryResult.rows);
      setBooks([]);
      setTotalCount(0);
    } else {
      const [bookResult, categoryResult] = await Promise.all([
        getPublicBooks({ category: categoryParam || undefined, search: searchParam || undefined, limit: PAGE_SIZE, offset: (pageParam - 1) * PAGE_SIZE }),
        getBookCategories(),
      ]);
      setBooks(bookResult.rows);
      setTotalCount(bookResult.total ?? bookResult.rows.length);
      setCategories(categoryResult.rows);
      setFeatured([]);
      setSections([]);
      setUncategorized([]);
    }
  }, [categoryParam, pageParam, searchParam]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 300);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchInput(searchParam), 0);
    return () => window.clearTimeout(timer);
  }, [searchParam]);
  useEffect(() => {
    if (searchInput.trim() === searchParam) return;
    const timer = window.setTimeout(() => updateParams({ search: searchInput.trim() || undefined, page: undefined }), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchParam, updateParams]);
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

  const categoryCounts = useMemo(() => new Map(categories.map((category) => [category.id, category.book_count ?? 0])), [categories]);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };
  const toggleFeatured = async (book: BookRow) => {
    if (featuredBusyId !== null) return;
    setFeaturedBusyId(book.id);
    try {
      await toggleAdminFeaturedBook(book.id, !Boolean(book.featured));
      showToast(!book.featured ? 'শীর্ষ রেটেড করা হয়েছে' : 'শীর্ষ রেটেড থেকে সরানো হয়েছে');
      await load();
    } catch (error) { showToast(error instanceof Error ? error.message : 'হালনাগাদ করা যায়নি'); } finally { setFeaturedBusyId(null); }
  };
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

  const renderBook = (book: BookRow) => {
    const availableCopies = Number(book.available_copy_count ?? (book.status === 0 ? 1 : 0));
    const totalCopies = Number(book.total_copy_count ?? 1);
    const estimatedFree = bookDate(book.estimated_available_on);
    const isOwner = isAuthenticated && Number(book.owner_user_id) === Number(user?.id);
    return <article key={book.id} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"><div className="relative aspect-[3/4] bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-10 w-10" /></div>}{isSuperAdmin && <button type="button" title={book.featured ? 'শীর্ষ রেটেড থেকে সরান' : 'শীর্ষ রেটেড করুন'} aria-label={book.featured ? 'শীর্ষ রেটেড থেকে সরান' : 'শীর্ষ রেটেড করুন'} disabled={featuredBusyId === book.id} onClick={() => void toggleFeatured(book)} className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition hover:scale-110 disabled:opacity-60"><Star className={`h-4 w-4 ${book.featured ? 'fill-amber-400 text-amber-400' : 'text-white'}`} /></button>}</div><div className="p-4"><p className="text-xs font-semibold text-brand">{book.category_name ?? 'বিভাগহীন'}</p><Link href={`/books/${book.id}`} className="mt-1 block font-bold text-fg hover:text-brand">{book.title}</Link><p className="mt-1 text-sm text-muted">{book.author_name || 'লেখক অজানা'}</p>{Number(book.total_copy_count) > 1 ? <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand"><Copy className="h-3.5 w-3.5" />একাধিক কপি উপলব্ধ — বিস্তারিত দেখুন</p> : <p className="mt-3 text-xs text-muted">মালিক: {book.owner_name}</p>}<div className="mt-3 space-y-1 text-xs text-muted">{isOwner ? <p className="flex items-center gap-1 font-semibold text-brand"><BookMarked className="h-3.5 w-3.5" />এটি আপনার বই</p> : <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{totalCopies > 1 ? `${availableCopies}/${totalCopies} কপি এখন উপলব্ধ` : availableCopies ? 'কপি উপলব্ধ' : Number(book.status) === 3 ? 'মালিক সাময়িকভাবে বইটি বন্ধ রেখেছেন' : 'কপি এখন ধার দেওয়া আছে'}</p>}{estimatedFree && <p className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />সম্ভাব্য ফ্রি: {estimatedFree}</p>}</div><div className="mt-3 flex gap-2"><Link href={`/books/${book.id}`} className="flex-1"><Button size="sm" fullWidth variant="secondary">বিস্তারিত</Button></Link>{isOwner ? <Link href="/books/my"><Button size="sm" variant="secondary"><Pencil className="h-3.5 w-3.5" />ব্যবস্থাপনা</Button></Link> : <Button size="sm" disabled={!availableCopies} onClick={() => requireActivated('request', book)}><Send className="h-3.5 w-3.5" />{availableCopies ? 'ধার নিন' : 'ব্যস্ত'}</Button>}<ShareButton url={`/books/${book.id}`} title={book.title} /></div></div></article>;
  };

  return (
    <main className="min-h-screen bg-surface-2 pb-[calc(var(--bottomnav-h)+1.5rem)] md:pb-12">
      <BooksHeader active="store" myBookCount={myBooks.length} requestCount={visibleRequests.length} onAddBook={() => requireActivated('add')} />
      <BooksBottomNav />
      <ScrollToTopButton />

      <section className="border-b border-border bg-white"><div className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-3xl font-bold text-fg">বইঘর</h1><p className="mt-2 text-sm text-muted">সবার জন্য বই দেখুন, সক্রিয় হওয়ার পর বই যোগ করুন বা ধার নিন। বই হারালে তালিকাভুক্ত মূল্য পরিশোধ করতে হবে।</p><div className="mt-5"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && searchInput.trim()) { window.open(`https://www.google.com/search?q=${encodeURIComponent(searchInput.trim())}`, '_blank', 'noopener,noreferrer'); } }} placeholder="বই বা লেখক খুঁজুন" /></div><p className="mt-2 text-xs text-muted">টাইপ করলেই বইয়ের তালিকা ফিল্টার হবে; Enter চাপলে সেই নাম Google-এ সার্চ হবে।</p><div className="mt-3 flex flex-wrap gap-2">{[{ slug: null, label: 'সব বিভাগ' }, ...categories.map((category) => ({ slug: category.slug, label: `${category.category_name} (${category.book_count ?? 0})` }))].map((item) => <button key={item.slug ?? 'all'} type="button" onClick={() => updateParams({ category: item.slug ?? undefined, page: undefined })} className={categoryParam === (item.slug ?? '') ? 'rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand/30' : 'rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-fg-2 hover:border-brand/40 hover:text-brand'}>{item.label}</button>)}</div></div></div></section>

      {grouped ? (
        <>
          {featured.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 pt-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-fg"><Star className="h-5 w-5 text-amber-400 fill-amber-400" />শীর্ষ রেটেড বই<span className="text-xs font-normal text-muted">({featured.length}টি)</span></h2>
                <ShareButton url="/books" title="ইনতিফাদাহ বইঘর" text="শীর্ষ রেটেড বই দেখুন" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map(renderBook)}</div>
            </section>
          )}
          {sections.map((section) => (
            <section key={section.categoryId} className="mx-auto max-w-6xl px-4 pt-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-fg"><FolderOpen className="h-5 w-5 text-brand" />{section.categoryName}<span className="text-xs font-normal text-muted">({categoryCounts.get(section.categoryId) ?? section.books.length}টি)</span></h2>
                <div className="flex items-center gap-2">{section.slug && <Link href={`/books?category=${encodeURIComponent(section.slug)}`} className="text-sm font-semibold text-brand hover:underline">সব দেখুন</Link>}{section.slug && <ShareButton url={`/books?category=${encodeURIComponent(section.slug)}`} title={section.categoryName} text={`বিভাগের বই দেখুন: ${section.categoryName}`} />}</div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{section.books.map(renderBook)}</div>
            </section>
          ))}
          {uncategorized.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 pt-7">
              <h2 className="flex items-center gap-2 text-lg font-bold text-fg"><FolderOpen className="h-5 w-5 text-muted" />বিভাগহীন</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{uncategorized.map(renderBook)}</div>
            </section>
          )}
        </>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-7">
          {categoryParam && (() => { const activeCategory = categories.find((category) => category.slug === categoryParam); return activeCategory && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-bold text-fg"><FolderOpen className="h-5 w-5 text-brand" />{activeCategory.category_name}<span className="text-xs font-normal text-muted">({activeCategory.book_count ?? 0}টি)</span></h2><ShareButton url={`/books?category=${encodeURIComponent(activeCategory.slug ?? '')}`} title={activeCategory.category_name} text={`বিভাগের বই দেখুন: ${activeCategory.category_name}`} /></div>; })()}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{books.map(renderBook)}</div>
        </section>
      )}
      {!grouped && totalCount > PAGE_SIZE && <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2"><p className="text-xs text-muted">দেখানো হচ্ছে {Math.min((pageParam - 1) * PAGE_SIZE + 1, totalCount)}–{Math.min(pageParam * PAGE_SIZE, totalCount)} / {totalCount}টি বই</p><div className="flex gap-2"><Button size="sm" variant="secondary" disabled={pageParam <= 1} onClick={() => { updateParams({ page: String(pageParam - 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>আগের</Button><Button size="sm" variant="secondary" disabled={pageParam * PAGE_SIZE >= totalCount} onClick={() => { updateParams({ page: String(pageParam + 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>পরের</Button></div></div>}
      {!grouped && !books.length && <p className="py-12 text-center text-sm text-muted">কোনো বই পাওয়া যায়নি।</p>}
      {grouped && !featured.length && !sections.length && !uncategorized.length && <p className="py-12 text-center text-sm text-muted">কোনো বই পাওয়া যায়নি।</p>}

      <BookActivationModal open={modal === 'activate'} onClose={() => setModal(null)} onActivated={(result) => setActivation(result)} onMessage={showToast} />
      <BookAddModal open={modal === 'add'} onClose={() => setModal(null)} onMessage={showToast} onAdded={() => { void load(); void loadMyBooks(); }} />

      <AppModal open={modal === 'request'} title="বই ধার নিন" onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>বাতিল</Button><Button disabled={busy || !selectedBook?.available_copy_count} onClick={() => void submitRequest()}><Send className="h-4 w-4" />অনুরোধ পাঠান</Button></>}><p className="font-bold">{selectedBook?.title}</p><p className="mt-2 text-sm text-muted">একই বইয়ের উপলব্ধ সব মালিককে অনুরোধ যাবে। যিনি আগে গ্রহণ করবেন, তাঁর কপিটিই আপনার জন্য সংরক্ষিত হবে।</p>{selectedBook && <p className="mt-2 flex items-center gap-1 text-xs text-brand"><Users className="h-3.5 w-3.5" />{selectedBook.available_copy_count} কপি উপলব্ধ</p>}<select value={requestDays} onChange={(event) => setRequestDays(Number(event.target.value))} className="mt-4 h-10 w-full rounded-lg border border-border px-3 text-sm">{[3, 7, 10, 15, 30].map((days) => <option key={days} value={days}>{days} দিন</option>)}</select></AppModal>

      <AppToast message={toast} />
    </main>
  );
}

export default function BooksPage() {
  return <Suspense fallback={<main className="min-h-screen bg-surface-2" />}><BooksPageContent /></Suspense>;
}