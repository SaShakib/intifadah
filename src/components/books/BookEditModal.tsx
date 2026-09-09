'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Check, ImagePlus, Search } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { AppModal } from '@/components/semibase/AppModal';
import { getBookCategories, updateBook, uploadBookCover, type BookCategoryRow, type BookRow } from '@/lib/api';
import { ProgrammableCoverSearch } from './ProgrammableCoverSearch';

interface BookEditModalProps {
  book: BookRow;
  open: boolean;
  onClose: () => void;
  onUpdated: (book: BookRow) => void;
  onMessage: (message: string) => void;
}

export function BookEditModal({ book, open, onClose, onUpdated, onMessage }: BookEditModalProps) {
  const [form, setForm] = useState(() => ({
    title: book.title,
    authorName: book.author_name || '',
    searchAliases: '',
    bookPriceMinor: String(book.book_price_minor),
    categoryId: book.category_id ? String(book.category_id) : '',
    description: book.description || '',
    coverUrl: book.cover_url || '',
    coverPublicId: book.cover_public_id || '',
    externalSource: book.external_source || '',
    externalVolumeId: book.external_volume_id || '',
  }));
  const [categories, setCategories] = useState<BookCategoryRow[]>([]);
  const [coverSearchQuery, setCoverSearchQuery] = useState('');
  const [coverSearchRun, setCoverSearchRun] = useState(0);
  const [searchingCover, setSearchingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void getBookCategories().then((result) => setCategories(result.rows)).catch(() => setCategories([])); }, []);

  const searchCover = () => {
    if (!form.title.trim()) { onMessage('বইয়ের নাম দিন।'); return; }
    setCoverSearchQuery(form.title.trim());
    setCoverSearchRun((run) => run + 1);
  };
  const handleCoverSearchStateChange = useCallback((loading: boolean) => setSearchingCover(loading), []);
  const save = async () => {
    if (!form.title.trim()) { onMessage('বইয়ের নাম দিন।'); return; }
    if (!Number(form.bookPriceMinor) || Number(form.bookPriceMinor) < 1) { onMessage('বইয়ের মূল্য দিন।'); return; }
    setSaving(true);
    try {
      const result = await updateBook(book.id, { ...form, categoryId: form.categoryId ? Number(form.categoryId) : undefined, bookPriceMinor: Number(form.bookPriceMinor) });
      onUpdated(result.row);
      onClose();
      onMessage('বইয়ের তথ্য আপডেট হয়েছে।');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'বইয়ের তথ্য আপডেট করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  return <AppModal open={open} title="বই সম্পাদনা করুন" onClose={onClose} className="max-w-3xl" loading={searchingCover || saving} loadingLabel={saving ? 'তথ্য সংরক্ষণ হচ্ছে...' : 'কভার খোঁজা হচ্ছে...'} footer={<><Button variant="secondary" onClick={onClose}>বাতিল</Button><Button disabled={saving || searchingCover} onClick={() => void save()}><Check className="h-4 w-4" />পরিবর্তন সংরক্ষণ করুন</Button></>}>
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-fg">বইয়ের নাম <span className="text-danger">*</span><div className="mt-1 flex gap-2"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); searchCover(); } }} /><Button type="button" variant="secondary" onClick={searchCover}><Search className="h-4 w-4" />খুঁজুন</Button></div></label>
      {coverSearchQuery && <ProgrammableCoverSearch key={coverSearchRun} query={coverSearchQuery} onSearchStateChange={handleCoverSearchStateChange} />}
      <label className="block text-sm font-semibold text-fg">কভারের সরাসরি image URL <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={form.coverUrl} onChange={(event) => setForm({ ...form, coverUrl: event.target.value, coverPublicId: '', externalSource: 'manual_url', externalVolumeId: '' })} placeholder="https://.../book-cover.jpg" /></label>
      <p className="-mt-2 rounded-lg border border-brand/20 bg-brand-light px-3 py-2 text-xs leading-5 text-fg-2">Google ফলাফলের ছবির উপর right-click বা long-press করে Copy Image Address নিন, তারপর উপরের ঘরে paste করুন।</p>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm font-semibold"><ImagePlus className="h-4 w-4" />নতুন কভার আপলোড করুন<input className="hidden" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setSaving(true); try { const upload = await uploadBookCover(file); setForm({ ...form, ...upload, externalSource: '', externalVolumeId: '' }); onMessage('WebP কভার আপলোড হয়েছে'); } catch (error) { onMessage(error instanceof Error ? error.message : 'কভার আপলোড হয়নি'); } finally { setSaving(false); } }} /></label>
      {form.coverUrl && <Image src={form.coverUrl} alt="নির্বাচিত কভার" width={96} height={132} className="h-36 w-24 rounded border border-border object-cover" unoptimized />}
      <label className="block text-sm font-semibold text-fg">লেখকের নাম <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} /></label>
      <label className="block text-sm font-semibold text-fg">বইয়ের মূল্য <span className="text-danger">*</span><Input className="mt-1" type="number" min="1" value={form.bookPriceMinor} onChange={(event) => setForm({ ...form, bookPriceMinor: event.target.value })} /></label>
      <label className="block text-sm font-semibold text-fg">বিভাগ <span className="font-normal text-muted">(ঐচ্ছিক)</span><select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"><option value="">বিভাগ নির্বাচন করুন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category_name}</option>)}</select></label>
      <label className="block text-sm font-semibold text-fg">বিকল্প নাম / বানান <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={form.searchAliases} onChange={(event) => setForm({ ...form, searchAliases: event.target.value })} placeholder="কমা দিয়ে লিখুন" /></label>
      <label className="block text-sm font-semibold text-fg">সংক্ষিপ্ত বিবরণ <span className="font-normal text-muted">(ঐচ্ছিক)</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 h-24 w-full rounded-lg border border-border p-3 text-sm" /></label>
    </div>
  </AppModal>;
}
