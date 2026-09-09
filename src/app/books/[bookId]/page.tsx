'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CalendarDays, Pencil, Send, Users } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { getPublicBook, requestBook, type BookRow } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BookEditModal } from '@/components/books/BookEditModal';

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [book, setBook] = useState<BookRow | null>(null);
  const [days, setDays] = useState(7);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  useEffect(() => { void getPublicBook(params.bookId).then((data) => setBook(data.row)).catch(() => setBook(null)); }, [params.bookId]);
  if (!book) return <main className="grid min-h-screen place-items-center bg-surface-2 text-sm text-muted">বই লোড হচ্ছে...</main>;
  const submit = async () => {
    setBusy(true);
    try { await requestBook(book.id, days); setOpen(false); setToast('অনুরোধ বইয়ের মালিককে পাঠানো হয়েছে।'); } catch (error) { setToast(error instanceof Error ? error.message : 'অনুরোধ পাঠানো যায়নি'); } finally { setBusy(false); }
  };
  const availableCopies = Number(book.available_copy_count ?? (book.status === 0 ? 1 : 0));
  const totalCopies = Number(book.total_copy_count ?? 1);
  const isOwner = isAuthenticated && Number(book.owner_user_id) === Number(user?.id);
  const estimatedFree = book.estimated_available_on ? new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'short' }).format(new Date(book.estimated_available_on)) : null;
  return <main className="min-h-screen bg-surface-2">
    <header className="border-b border-border bg-white"><div className="mx-auto max-w-5xl px-4 py-4"><Link href="/books" className="inline-flex items-center gap-2 text-sm font-semibold text-fg"><ArrowLeft className="h-4 w-4" />বইঘরে ফিরুন</Link></div></header>
    <article className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[300px_1fr]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-white shadow-sm">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-12 w-12" /></div>}</div>
      <div><p className="text-sm font-semibold text-brand">{book.category_name ?? 'বিভাগহীন'}</p><h1 className="mt-2 text-3xl font-bold text-fg">{book.title}</h1><p className="mt-2 text-lg text-fg-2">{book.author_name || 'লেখক অজানা'}</p><dl className="mt-7 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted">মালিক</dt><dd className="mt-1 font-semibold text-fg">{book.owner_name}</dd></div><div><dt className="text-muted">হারালে মূল্য</dt><dd className="mt-1 font-semibold text-fg">৳{Number(book.book_price_minor)}</dd></div></dl><div className="mt-5 space-y-2 text-sm text-muted"><p className="flex items-center gap-2"><Users className="h-4 w-4 text-brand" />{totalCopies > 1 ? `${availableCopies}/${totalCopies} কপি এখন উপলব্ধ` : availableCopies ? 'কপি এখন উপলব্ধ' : 'কপি এখন ধার দেওয়া আছে'}</p>{estimatedFree && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand" />সম্ভাব্য ফ্রি: {estimatedFree}</p>}</div>{book.description && <p className="mt-7 leading-7 text-fg-2">{book.description}</p>}<div className="mt-8 flex flex-wrap gap-2">{isAuthenticated ? <Button disabled={!availableCopies} onClick={() => setOpen(true)}><Send className="h-4 w-4" />{availableCopies ? 'ধার নেওয়ার অনুরোধ' : 'এখন কোনো কপি নেই'}</Button> : <Button onClick={() => router.push('/login?books=1')}><Send className="h-4 w-4" />লগইন করে অনুরোধ করুন</Button>}{isOwner && <Button variant="secondary" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" />সম্পাদনা করুন</Button>}</div></div>
    </article>
    <AppModal open={open} title="বই ধার নিন" onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>বাতিল</Button><Button disabled={busy || !availableCopies} onClick={() => void submit()}>অনুরোধ পাঠান</Button></>}><p className="text-sm text-muted">উপলব্ধ সব কপির মালিককে অনুরোধ পাঠানো হবে। যিনি আগে গ্রহণ করবেন, তাঁর কপিটিই আপনার জন্য সংরক্ষিত হবে।</p><select className="mt-4 h-10 w-full rounded-lg border border-border px-3 text-sm" value={days} onChange={(event) => setDays(Number(event.target.value))}>{[3, 7, 10, 15, 30].map((value) => <option key={value} value={value}>{value} দিন</option>)}</select></AppModal>
    {isOwner && <BookEditModal book={book} open={editOpen} onClose={() => setEditOpen(false)} onUpdated={setBook} onMessage={setToast} />}
    <AppToast message={toast} />
  </main>;
}
