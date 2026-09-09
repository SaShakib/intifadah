'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BookOpen, Check, UserRoundCheck, X } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { AppToast } from '@/components/semibase/AppModal';
import { apiRequest, getErrorMessage, type BookRow } from '@/lib/api';

interface ActivationApprovalRow {
  user_id: number;
  full_name: string;
  mobile: string;
  email: string | null;
  address_line: string | null;
  village: string;
  ward_no: number;
  father_name: string;
  occupation_type: 'student' | 'working' | 'business';
  institution_name: string | null;
  education_level: string | null;
  education_detail: string | null;
  profession_detail: string | null;
  updated_at: string;
}

interface ApprovalResponse { activations: ActivationApprovalRow[]; books: BookRow[]; }

export default function BooksApprovalsPage() {
  const [data, setData] = useState<ApprovalResponse | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const load = async () => {
    try { setData(await apiRequest<ApprovalResponse>('/admin/books/approvals')); } catch (error) { setToast(getErrorMessage(error)); }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const review = async (kind: 'activation' | 'book', id: string | number, approved: boolean) => {
    const key = `${kind}-${id}`;
    setBusyKey(key);
    try {
      await apiRequest(kind === 'activation' ? `/admin/books/activations/${id}` : `/admin/books/${id}/approval`, { method: 'PATCH', body: JSON.stringify({ approved }) });
      setData((current) => current ? { activations: kind === 'activation' ? current.activations.filter((row) => Number(row.user_id) !== Number(id)) : current.activations, books: kind === 'book' ? current.books.filter((row) => Number(row.id) !== Number(id)) : current.books } : current);
      setToast(approved ? 'অনুমোদন হয়েছে।' : 'অনুরোধ প্রত্যাখ্যান হয়েছে।');
    } catch (error) { setToast(getErrorMessage(error)); } finally { setBusyKey(null); }
  };
  const occupation = (row: ActivationApprovalRow) => row.occupation_type === 'student' ? [row.institution_name, row.education_level, row.education_detail].filter(Boolean).join(' · ') : row.occupation_type === 'business' ? `ব্যবসা: ${row.profession_detail || '-'}` : `পেশা: ${row.profession_detail || '-'}`;

  return <div className="mx-auto max-w-6xl space-y-6">
    <div><h1 className="text-2xl font-bold text-fg">বইঘর অনুমোদন</h1><p className="mt-1 text-sm text-muted">বইঘর সক্রিয় করার আবেদন ও নতুন বই প্রকাশের অনুরোধ যাচাই করুন।</p></div>
    <section><div className="mb-3 flex items-center gap-2"><UserRoundCheck className="h-5 w-5 text-brand" /><h2 className="font-bold text-fg">বইঘর সক্রিয় করার আবেদন</h2><span className="text-sm text-muted">({data?.activations.length ?? 0})</span></div><div className="space-y-3">{data?.activations.map((row) => <article key={row.user_id} className="border border-border bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-bold text-fg">{row.full_name}</h3><p className="mt-1 text-sm text-muted">{row.mobile}{row.email ? ` · ${row.email}` : ''}</p></div><div className="flex gap-2"><Button size="sm" disabled={busyKey === `activation-${row.user_id}`} onClick={() => void review('activation', row.user_id, true)}><Check className="h-4 w-4" />অনুমোদন</Button><Button size="sm" variant="danger" disabled={busyKey === `activation-${row.user_id}`} onClick={() => void review('activation', row.user_id, false)}><X className="h-4 w-4" />না</Button></div></div><dl className="mt-4 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2"><div><dt className="text-muted">ঠিকানা</dt><dd className="font-medium text-fg">{row.address_line || '-'}</dd></div><div><dt className="text-muted">গ্রাম / ওয়ার্ড</dt><dd className="font-medium text-fg">{row.village} · ওয়ার্ড {row.ward_no}</dd></div><div><dt className="text-muted">বাবার নাম</dt><dd className="font-medium text-fg">{row.father_name}</dd></div><div><dt className="text-muted">পরিচয়</dt><dd className="font-medium text-fg">{occupation(row) || '-'}</dd></div></dl></article>)}</div>{data && !data.activations.length && <p className="border border-dashed border-border py-8 text-center text-sm text-muted">কোনো অপেক্ষমাণ আবেদন নেই।</p>}</section>
    <section><div className="mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-brand" /><h2 className="font-bold text-fg">নতুন বই প্রকাশের অনুরোধ</h2><span className="text-sm text-muted">({data?.books.length ?? 0})</span></div><div className="space-y-3">{data?.books.map((book) => <article key={book.id} className="flex flex-wrap gap-4 border border-border bg-white p-4"><div className="relative h-28 w-20 overflow-hidden rounded border border-border bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt="" fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-6 w-6" /></div>}</div><div className="min-w-0 flex-1"><h3 className="font-bold text-fg">{book.title}</h3><p className="mt-1 text-sm text-muted">{book.author_name || 'লেখক অজানা'} · মালিক: {book.owner_name}</p><p className="mt-1 text-sm text-muted">মূল্য: ৳{Number(book.book_price_minor)} · {book.category_name || 'বিভাগহীন'}</p>{book.description && <p className="mt-2 text-sm text-fg-2">{book.description}</p>}</div><div className="flex items-start gap-2"><Button size="sm" disabled={busyKey === `book-${book.id}`} onClick={() => void review('book', book.id, true)}><Check className="h-4 w-4" />অনুমোদন</Button><Button size="sm" variant="danger" disabled={busyKey === `book-${book.id}`} onClick={() => void review('book', book.id, false)}><X className="h-4 w-4" />না</Button></div></article>)}</div>{data && !data.books.length && <p className="border border-dashed border-border py-8 text-center text-sm text-muted">কোনো অপেক্ষমাণ বই নেই।</p>}</section>
    <AppToast message={toast} />
  </div>;
}
