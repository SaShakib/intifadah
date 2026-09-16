'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { BookOpen, Check, Library, PenLine, Search, X } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { RichTextEditor } from '@/components/custom/RichTextEditor';
import { AppModal } from '@/components/semibase/AppModal';
import { cn } from '@/lib/utils/cn';
import { getPublicBooks, type BookRow } from '@/lib/api';
import type { ApiBookPlanRow } from '@/lib/api';

export interface PickedBook {
  id: string | number;
  title: string;
  author_name: string | null;
  cover_url: string | null;
}

export interface BookPlanModalInput {
  book?: PickedBook;
  bookTitle?: string;
  bookAuthor?: string;
  totalPages: number;
  currentPage: number;
  note: string;
}

type Source = 'store' | 'custom';

interface BookPlanModalProps {
  open: boolean;
  plan: ApiBookPlanRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: BookPlanModalInput) => void;
}

export function BookPlanModal({ open, plan, saving, onClose, onSave }: BookPlanModalProps) {
  const [source, setSource] = useState<Source>('store');
  const [selected, setSelected] = useState<PickedBook | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [note, setNote] = useState('');
  const [invalid, setInvalid] = useState<Record<string, string>>({});
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      const isCustom = !plan?.book_id;
      setSource(isCustom ? 'custom' : 'store');
      setSelected(plan && !isCustom ? { id: plan.book_id, title: plan.book_title, author_name: plan.book_author, cover_url: plan.book_cover_url } : null);
      setBookTitle(isCustom ? plan?.book_title ?? '' : '');
      setBookAuthor((!plan || isCustom) ? plan?.book_author ?? '' : '');
      setQuery('');
      setResults([]);
      setTotalPages(plan ? String(plan.total_pages) : '');
      setCurrentPage(plan ? String(plan.current_page) : '');
      setNote(plan?.note ?? '');
      setInvalid({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, plan]);

  useEffect(() => {
    if (!open || source !== 'store' || !query.trim() || selected) return;
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setSearching(true);
      getPublicBooks({ search: query.trim(), limit: 8 })
        .then((data) => setResults(data.rows))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [query, open, source, selected]);

  const switchSource = (next: Source) => {
    setSource(next);
    setInvalid((current) => {
      const errors = { ...current };
      delete errors.book;
      delete errors.bookTitle;
      return errors;
    });
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (source === 'store' && !selected) {
      errors.book = 'বই বাছাই করুন';
    }
    if (source === 'custom' && !bookTitle.trim()) {
      errors.bookTitle = 'বইয়ের নাম দিন';
    }
    const pages = Number(totalPages);
    if (!totalPages.trim() || !Number.isInteger(pages) || pages <= 0) {
      errors.totalPages = 'মোট পৃষ্ঠা সংখ্যা দিন (১ বা তার বেশি)';
    }
    let page = 0;
    if (currentPage.trim()) {
      page = Number(currentPage);
      if (!Number.isInteger(page) || page < 0 || page > pages) {
        errors.currentPage = `০ থেকে ${pages} এর মধ্যে পৃষ্ঠা সংখ্যা দিন`;
      }
    }
    setInvalid(errors);
    if (Object.keys(errors).length) return;

    if (source === 'store' && selected) {
      onSave({ book: selected, totalPages: pages, currentPage: page, note });
    } else {
      onSave({ bookTitle: bookTitle.trim(), bookAuthor: bookAuthor.trim(), totalPages: pages, currentPage: page, note });
    }
  };

  const sourceTab = (value: Source, label: string, Icon: typeof Library) => (
    <button
      type="button"
      onClick={() => switchSource(value)}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition',
        source === value ? 'bg-brand text-white shadow-sm' : 'text-fg-2 hover:bg-surface-2',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <AppModal
      open={open}
      title={plan ? 'পড়ার প্ল্যান সম্পাদনা করুন' : 'নতুন পড়ার প্ল্যান তৈরি করুন'}
      onClose={onClose}
      loading={saving}
      loadingLabel={plan ? 'সংরক্ষণ হচ্ছে...' : 'তৈরি হচ্ছে...'}
      className="max-w-lg"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>বাতিল</Button>
          <Button onClick={handleSave} disabled={saving}>{plan ? 'আপডেট করুন' : 'প্ল্যান তৈরি করুন'}</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-fg-2">বই</span>
          <div className="flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
            {sourceTab('store', 'বইঘর থেকে', Library)}
            {sourceTab('custom', 'নতুন বই', PenLine)}
          </div>

          {source === 'store' && (
            <div className="space-y-1.5">
              {selected ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                    {selected.cover_url ? <Image src={selected.cover_url} alt={selected.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-5 w-5" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-fg">{selected.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{selected.author_name || 'লেখক অজানা'}</p>
                  </div>
                  <Button variant="ghost" size="sm" aria-label="বই বদলান" disabled={saving} onClick={() => { setSelected(null); setResults([]); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="বইয়ের নাম বা লেখক লিখে খুঁজুন..." className="pl-9" autoFocus />
                  </div>
                  {searching && <p className="px-1 text-xs text-muted">খোঁজা হচ্ছে...</p>}
                  {!searching && results.length > 0 && (
                    <ul className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-border bg-white p-1">
                      {results.map((book) => (
                        <li key={book.id}>
                          <button
                            type="button"
                            onClick={() => setSelected({ id: book.id, title: book.title, author_name: book.author_name, cover_url: book.cover_url })}
                            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-surface-2"
                          >
                            <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded border border-border bg-surface-2">
                              {book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-4 w-4" /></div>}
                            </div>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-fg">{book.title}</span>
                              <span className="block truncate text-xs text-muted">{book.author_name || 'লেখক অজানা'}</span>
                            </span>
                            <Check className="h-4 w-4 text-brand" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!searching && query.trim() && results.length === 0 && <p className="px-1 text-xs text-muted">কোনো বই পাওয়া যায়নি।</p>}
                </div>
              )}
              {invalid.book && <span className="text-xs font-semibold text-danger">{invalid.book}</span>}
            </div>
          )}

          {source === 'custom' && (
            <div className="space-y-3 rounded-xl border border-border bg-surface-2/50 p-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-fg-2">বইয়ের নাম</span>
                <Input value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} placeholder="যেমন: সীরাতে রাসূলুল্লাহ (সা.)" autoFocus />
                {invalid.bookTitle && <span className="text-xs font-semibold text-danger">{invalid.bookTitle}</span>}
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-fg-2">লেখক (ঐচ্ছিক)</span>
                <Input value={bookAuthor} onChange={(event) => setBookAuthor(event.target.value)} placeholder="যেমন: ড. মুহাম্মদ ইবনে আব্দুল্লাহ" />
              </label>
              <p className="text-xs text-muted">বইঘরে না থাকা যেকোনো বই এখানে যোগ করে পড়ার প্ল্যান করতে পারবেন।</p>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">বইয়ের মোট পৃষ্ঠা</span>
            <Input type="number" min="1" value={totalPages} onChange={(event) => setTotalPages(event.target.value)} placeholder="যেমন: ৩২০" />
            {invalid.totalPages && <span className="text-xs font-semibold text-danger">{invalid.totalPages}</span>}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">আপনি পড়েছেন (পৃষ্ঠা)</span>
            <Input type="number" min="0" value={currentPage} onChange={(event) => setCurrentPage(event.target.value)} placeholder="যেমন: ৪৫" />
            {invalid.currentPage && <span className="text-xs font-semibold text-danger">{invalid.currentPage}</span>}
          </label>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">নোট</span>
          <RichTextEditor value={note} onChange={setNote} placeholder="পড়ার প্ল্যান নোট..." />
        </div>
      </div>
    </AppModal>
  );
}