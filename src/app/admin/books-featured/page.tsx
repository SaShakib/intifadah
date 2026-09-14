'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, BookOpen, Plus, Search, Trash2 } from 'lucide-react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { Button } from '@/components/base/Button';
import { AppToast } from '@/components/semibase/AppModal';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminFeaturedBooks, getPublicBooks, saveAdminFeaturedBooks, type BookRow } from '@/lib/api';

export default function AdminBooksFeaturedPage() {
  const router = useRouter();
  const { isReady, roleKey } = useAuth();
  const isSuperAdmin = roleKey === 'super_admin';
  const [featured, setFeatured] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<BookRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [featuredIds, setFeaturedIds] = useState<Set<string | number>>(new Set());
  const [addBusyId, setAddBusyId] = useState<string | number | null>(null);
  const originalRef = useRef<string>('[]');

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
      const result = await getAdminFeaturedBooks();
      setFeatured(result.rows);
      setFeaturedIds(new Set(result.rows.map((book) => book.id)));
      originalRef.current = JSON.stringify(result.rows.map((book) => book.id));
      setDirty(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'শীর্ষ রেটেড তালিকা আনা যায়নি');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!debouncedSearch) {
      const timer = window.setTimeout(() => setSearchResults([]), 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    void (async () => {
      setSearching(true);
      try {
        const result = await getPublicBooks({ search: debouncedSearch, limit: 12 });
        if (!cancelled) setSearchResults(result.rows);
      } catch { if (!cancelled) setSearchResults([]); } finally { if (!cancelled) setSearching(false); }
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };

  const addBook = (book: BookRow) => {
    if (featuredIds.has(book.id)) return;
    setAddBusyId(book.id);
    setTimeout(() => {
      const next = [...featured, book];
      setFeatured(next);
      setFeaturedIds(new Set(next.map((b) => b.id)));
      setDirty(JSON.stringify(next.map((b) => b.id)) !== originalRef.current);
      setAddBusyId(null);
    }, 0);
  };

  const removeBook = (bookId: string | number) => {
    const next = featured.filter((book) => book.id !== bookId);
    setFeatured(next);
    setFeaturedIds(new Set(next.map((b) => b.id)));
    setDirty(JSON.stringify(next.map((b) => b.id)) !== originalRef.current);
  };

  const moveBook = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= featured.length) return;
    const next = [...featured];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setFeatured(next);
    setDirty(JSON.stringify(next.map((b) => b.id)) !== originalRef.current);
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await saveAdminFeaturedBooks(featured.map((book) => Number(book.id)));
      setFeatured(result.rows);
      setFeaturedIds(new Set(result.rows.map((book) => book.id)));
      originalRef.current = JSON.stringify(result.rows.map((book) => book.id));
      setDirty(false);
      showToast('সংরক্ষিত হয়েছে');
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : 'সংরক্ষণ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || !isSuperAdmin) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  const addedIds = new Set(featured.map((book) => book.id));

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void load()} />}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-fg">শীর্ষ রেটেড বই</h1>
            <p className="mt-1 text-sm text-muted">বইঘরের প্রথম পাতায় এই বইগুলো আলাদা সেকশনে দেখানো হবে। তালিকা পরিবর্তন করে <span className="font-semibold text-fg">সংরক্ষণ</span> চাপুন।</p>
          </div>
          {dirty && <Button disabled={saving} onClick={() => void save()}>{saving ? 'সংরক্ষিত হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>}
        </div>
      </section>

      {loading ? (
        <ApiLoadingNotice />
      ) : (
        <section className="space-y-3">
          {featured.length === 0 && <p className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">এখনো কোনো বই শীর্ষ রেটেড হিসেবে নির্বাচন করা হয়নি। নিচে সার্চ করে বই যোগ করুন।</p>}
          {featured.map((book, index) => (
            <article key={book.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">{index + 1}</span>
              <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-4 w-4" /></div>}</div>
              <div className="min-w-0 flex-1"><p className="truncate font-bold text-fg">{book.title}</p><p className="truncate text-xs text-muted">{book.author_name || 'লেখক অজানা'} · {book.owner_name}</p></div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => moveBook(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" disabled={index === featured.length - 1} onClick={() => moveBook(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => removeBook(book.id)}><Trash2 className="h-4 w-4 text-danger" /></Button>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-fg">বই খুঁজে যোগ করুন</h2>
        <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-sm">
          <Search className="h-4 w-4 text-muted" />
          <input className="w-full bg-transparent outline-none placeholder:text-muted" placeholder="বইয়ের নাম বা লেখকের নাম..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        {search.trim() && (
          <div className="space-y-2">
            {searching && <ApiLoadingNotice />}
            {!searching && searchResults.length === 0 && <p className="text-sm text-muted">কোনো বই পাওয়া যায়নি।</p>}
            {searchResults.map((book) => {
              const alreadyAdded = addedIds.has(book.id);
              return (
                <article key={book.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm">
                  <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-4 w-4" /></div>}</div>
                  <div className="min-w-0 flex-1"><p className="truncate font-bold text-fg">{book.title}</p><p className="truncate text-xs text-muted">{book.author_name || 'লেখক অজানা'} · {book.owner_name}</p></div>
                  <Button size="sm" variant={alreadyAdded ? 'secondary' : 'primary'} disabled={alreadyAdded || addBusyId === book.id} onClick={() => addBook(book)}>{alreadyAdded ? 'যোগ হয়েছে' : <><Plus className="h-3.5 w-3.5" />যোগ করুন</>}</Button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="sticky bottom-0 mt-6 flex justify-end border-t border-border bg-surface-2 py-3">
        <Button disabled={!dirty || saving} onClick={() => void save()}>{saving ? 'সংরক্ষিত হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>
      </div>

      <AppToast message={toast} />
    </PageStack>
  );
}