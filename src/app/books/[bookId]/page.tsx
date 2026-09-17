'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CalendarDays, Copy, Pencil, Send, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { deleteBook, getPublicBook, requestBook, type BookCopyRow, type BookRow } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BookEditModal } from '@/components/books/BookEditModal';
import { BooksBottomNav } from '@/components/books/BooksBottomNav';
import { ScrollToTopButton } from '@/components/books/ScrollToTopButton';
import { ShareButton } from '@/components/books/ShareButton';
import { cn } from '@/lib/utils/cn';

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const { isAuthenticated, roleKey, user } = useAuth();
  const [book, setBook] = useState<BookRow | null>(null);
  const [copies, setCopies] = useState<BookCopyRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [days, setDays] = useState(7);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  useEffect(() => {
    void getPublicBook(params.bookId)
      .then((data) => {
        setBook(data.row);
        setCopies(data.copies);
        setSelectedId(data.row?.id ?? null);
      })
      .catch(() => setBook(null));
  }, [params.bookId]);
  if (!book) return <main className="grid min-h-screen place-items-center bg-surface-2 text-sm text-muted">বই লোড হচ্ছে...</main>;
  const active = copies.find((copy) => Number(copy.id) === Number(selectedId)) ?? book;
  const isOwnerActive = isAuthenticated && Number(active.owner_user_id) === Number(user?.id);
  const canDeleteAnyBook = roleKey === 'super_admin' || roleKey === 'admin';
  const canDeleteBook = isOwnerActive || canDeleteAnyBook;
  const availableCopies = Number(book.available_copy_count ?? (book.status === 0 ? 1 : 0));
  const totalCopies = Number(book.total_copy_count ?? 1);
  const copyAvailable = Number(active.status) === 0;
  const copyStatus = Number(active.status);
  const estimatedFree = active.estimated_available_on ? new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'short' }).format(new Date(active.estimated_available_on)) : null;
  const submit = async () => {
    setBusy(true);
    try {
      await requestBook(active.id, days);
      setOpen(false);
      setToast('অনুরোধ এই বইয়ের উপলব্ধ মালিকদের পাঠানো হয়েছে।');
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'অনুরোধ পাঠানো যায়নি');
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await deleteBook(active.id);
      setDeleteOpen(false);
      router.replace('/books');
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'বইটি সরানো যায়নি');
    } finally {
      setBusy(false);
    }
  };
  return <main className="min-h-screen bg-surface-2 pb-[calc(var(--bottomnav-h)+1.5rem)] md:pb-12">
    <header className="border-b border-border bg-white"><div className="mx-auto max-w-5xl px-4 py-4"><Link href="/books" className="inline-flex items-center gap-2 text-sm font-semibold text-fg"><ArrowLeft className="h-4 w-4" />বইঘরে ফিরুন</Link></div></header>
    {copies.length > 1 && (
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-fg-2"><Copy className="h-3.5 w-3.5" />একই বইয়ের {totalCopies}টি কপি — যেটি দেখতে চান বাছাই করুন</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {copies.map((copy, index) => {
              const selected = Number(copy.id) === Number(selectedId);
              return (
                <button
                  key={copy.id}
                  type="button"
                  onClick={() => setSelectedId(copy.id)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-xl border bg-white p-3 text-left transition',
                    selected ? 'border-brand bg-brand-light/40 ring-2 ring-brand-light' : 'border-border hover:border-brand/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-fg">কপি #{index + 1}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', copyAvailable ? 'bg-success-bg text-success' : copyStatus === 1 ? 'bg-warning-bg text-warning' : copyStatus === 2 ? 'bg-surface-2 text-muted' : 'bg-danger-bg text-danger')}>
                      {copyAvailable ? 'উপলব্ধ' : copyStatus === 1 ? 'সংরক্ষিত' : copyStatus === 2 ? 'ধার দেওয়া' : 'উপলব্ধ নয়'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-fg-2">মালিক: {copy.owner_name}</p>
                  <p className="mt-0.5 text-xs text-muted">৳{Number(copy.book_price_minor)} হারালে মূল্য</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    )}
    <article className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[300px_1fr]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-white shadow-sm">{active.cover_url ? <Image src={active.cover_url} alt={active.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-12 w-12" /></div>}</div>
      <div><div className="flex flex-wrap gap-2">{(active.categories ?? []).length ? active.categories!.map((categoryRef) => (categoryRef.slug ? <Link key={categoryRef.id} href={`/books?category=${encodeURIComponent(categoryRef.slug)}`} className="rounded-full border border-brand/30 bg-brand-light px-3 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-white">{categoryRef.categoryName}</Link> : <span key={categoryRef.id} className="rounded-full border border-brand/30 bg-brand-light px-3 py-1 text-xs font-semibold text-brand">{categoryRef.categoryName}</span>)) : <span className="text-sm font-semibold text-brand">বিভাগহীন</span>}</div><h1 className="mt-3 text-3xl font-bold text-fg">{active.title}</h1><p className="mt-2 text-lg text-fg-2">{active.author_name || 'লেখক অজানা'}</p><dl className="mt-7 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted">মালিক</dt><dd className="mt-1 font-semibold text-fg">{active.owner_name}</dd></div><div><dt className="text-muted">হারালে মূল্য</dt><dd className="mt-1 font-semibold text-fg">৳{Number(active.book_price_minor)}</dd></div></dl><div className="mt-5 space-y-2 text-sm text-muted"><p className="flex items-center gap-2"><Users className="h-4 w-4 text-brand" />{totalCopies > 1 ? `${availableCopies}/${totalCopies} কপি এখন উপলব্ধ` : copyAvailable ? 'কপি এখন উপলব্ধ' : copyStatus === 2 ? 'কপি এখন ধার দেওয়া আছে' : 'কপি এখন উপলব্ধ নেই'}</p>{estimatedFree && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand" />সম্ভাব্য ফ্রি: {estimatedFree}</p>}</div>{active.description && <p className="mt-7 leading-7 text-fg-2">{active.description}</p>}<div className="mt-8 flex flex-wrap gap-2">{isAuthenticated && !isOwnerActive ? <Button disabled={!copyAvailable && availableCopies === 0} onClick={() => setOpen(true)}><Send className="h-4 w-4" />{copyAvailable || availableCopies > 0 ? 'ধার নেওয়ার অনুরোধ' : 'এখন কোনো কপি নেই'}</Button> : !isAuthenticated ? <Button onClick={() => router.push('/login?books=1')}><Send className="h-4 w-4" />লগইন করে অনুরোধ করুন</Button> : null}{isOwnerActive && <Button variant="secondary" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" />সম্পাদনা করুন</Button>}{canDeleteBook && <Button variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4" />সরিয়ে দিন</Button>}<ShareButton url={`/books/${active.id}`} title={active.title} text={`বই দেখুন: ${active.title}`} size="md" /></div></div>
    </article>
    <AppModal open={open} title="বই ধার নিন" onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>বাতিল</Button><Button disabled={busy || !copyAvailable} onClick={() => void submit()}>অনুরোধ পাঠান</Button></>}><p className="text-sm text-muted">উপলব্ধ সব কপির মালিককে অনুরোধ পাঠানো হবে। যিনি আগে গ্রহণ করবেন, তাঁর কপিটিই আপনার জন্য সংরক্ষিত হবে।</p><select className="mt-4 h-10 w-full rounded-lg border border-border px-3 text-sm" value={days} onChange={(event) => setDays(Number(event.target.value))}>{[3, 7, 10, 15, 30].map((value) => <option key={value} value={value}>{value} দিন</option>)}</select></AppModal>
    <AppModal open={deleteOpen} title="বইটি সরিয়ে দেবেন?" onClose={() => setDeleteOpen(false)} footer={<><Button variant="secondary" disabled={busy} onClick={() => setDeleteOpen(false)}>বাতিল</Button><Button variant="danger" disabled={busy} onClick={() => void remove()}><Trash2 className="h-4 w-4" />{busy ? 'সরানো হচ্ছে...' : 'হ্যাঁ, সরিয়ে দিন'}</Button></>}><p className="text-sm leading-6 text-fg-2">বইটি আর বইঘরে দেখা যাবে না। আগের সম্পন্ন ধার নেওয়ার রেকর্ড থাকবে, তবে কোনো চলমান অনুরোধ বা ধার থাকলে বইটি সরানো যাবে না।</p>{canDeleteAnyBook && !isOwnerActive && <p className="mt-3 text-xs text-muted">আপনি অ্যাডমিন হিসেবে অন্য সদস্যের বই সরাচ্ছেন।</p>}</AppModal>
    {isOwnerActive && <BookEditModal book={{ ...active, total_copy_count: totalCopies, available_copy_count: availableCopies }} open={editOpen} onClose={() => setEditOpen(false)} onUpdated={(updated) => { setBook((current) => ({ ...(current ?? updated), ...updated, total_copy_count: totalCopies, available_copy_count: availableCopies })); setCopies((current) => current.map((copy) => (Number(copy.id) === Number(updated.id) ? { ...copy, ...updated } : copy))); }} onMessage={setToast} />}
    <BooksBottomNav />
    <ScrollToTopButton />
    <AppToast message={toast} />
  </main>;
}