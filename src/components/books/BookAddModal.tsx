'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Check, CircleHelp, ExternalLink, ImagePlus, Plus, Search } from 'lucide-react';
import { AppModal } from '@/components/semibase/AppModal';
import { ProgrammableCoverSearch } from '@/components/books/ProgrammableCoverSearch';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { createBook, createBookCategory, getBookCategories, uploadBookCover, type BookCategoryRow } from '@/lib/api';
import { googleImagesUrl } from '@/components/books/bookUtils';

const emptyForm = { title: '', authorName: '', searchAliases: '', bookPriceMinor: '', categoryId: '', description: '', coverUrl: '', coverPublicId: '', externalSource: '', externalVolumeId: '' };

interface BookAddModalProps {
  open: boolean;
  onClose: () => void;
  onMessage: (message: string) => void;
  onAdded: () => void;
}

export function BookAddModal({ open, onClose, onMessage, onAdded }: BookAddModalProps) {
  const [bookForm, setBookForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<BookCategoryRow[]>([]);
  const [coverSearchQuery, setCoverSearchQuery] = useState('');
  const [coverSearchRun, setCoverSearchRun] = useState(0);
  const [bookStep, setBookStep] = useState<1 | 2>(1);
  const [searchingCover, setSearchingCover] = useState(false);
  const [bookGuideOpen, setBookGuideOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    void getBookCategories().then((result) => setCategories(result.rows)).catch(() => undefined);
  }, [open]);

  const searchCover = () => {
    if (!bookForm.title.trim()) { onMessage('বইয়ের নাম দিন।'); return; }
    setCoverSearchQuery(bookForm.title.trim());
    setCoverSearchRun((run) => run + 1);
  };
  const handleCoverSearchStateChange = useCallback((loading: boolean) => setSearchingCover(loading), []);
  const nextBookStep = () => {
    if (!bookForm.title.trim()) { onMessage('বইয়ের নাম দিন।'); return; }
    if (!Number(bookForm.bookPriceMinor) || Number(bookForm.bookPriceMinor) < 1) { onMessage('বইয়ের মূল্য দিন।'); return; }
    setBookStep(2);
  };
  const closeModal = () => { setSearchingCover(false); setBookStep(1); setCoverSearchQuery(''); setBookForm(emptyForm); onClose(); };
  const createCategoryInline = async () => {
    if (!newCategory.trim()) return;
    const result = await createBookCategory(newCategory.trim());
    setCategories((current) => [...current, result.row].sort((a, b) => a.category_name.localeCompare(b.category_name)));
    setBookForm((current) => ({ ...current, categoryId: String(result.row.id) }));
    setNewCategory('');
  };
  const submitBook = async () => {
    if (!bookForm.title.trim()) { setBookStep(1); onMessage('বইয়ের নাম দিন।'); return; }
    if (!Number(bookForm.bookPriceMinor) || Number(bookForm.bookPriceMinor) < 1) { setBookStep(1); onMessage('বইয়ের মূল্য দিন।'); return; }
    setBusy(true);
    try {
      await createBook({ ...bookForm, categoryId: bookForm.categoryId ? Number(bookForm.categoryId) : undefined, bookPriceMinor: Number(bookForm.bookPriceMinor) });
      closeModal();
      onAdded();
      onMessage('বইটি বইঘরে যোগ করা হয়েছে।');
    } catch (error) { onMessage(error instanceof Error ? error.message : 'বই যোগ করা যায়নি'); } finally { setBusy(false); }
  };

  return (
    <>
      <AppModal open={open} title="বই যোগ করুন" onClose={closeModal} className="max-w-3xl" loading={searchingCover} loadingLabel="বই ও কভার খোঁজা হচ্ছে..." footer={<><Button variant="secondary" onClick={closeModal}>বাতিল</Button>{bookStep === 2 && <Button variant="secondary" onClick={() => setBookStep(1)}>পেছনে</Button>}{bookStep === 1 ? <Button disabled={searchingCover} onClick={nextBookStep}>পরের ধাপ</Button> : <Button disabled={busy} onClick={() => void submitBook()}><Check className="h-4 w-4" />বই যোগ করুন</Button>}</>}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold"><div className={bookStep === 1 ? 'rounded-lg bg-brand px-3 py-2 text-white' : 'rounded-lg bg-surface-2 px-3 py-2 text-muted'}>১. বই ও কভার</div><div className={bookStep === 2 ? 'rounded-lg bg-brand px-3 py-2 text-white' : 'rounded-lg bg-surface-2 px-3 py-2 text-muted'}>২. অন্যান্য তথ্য</div></div>
          <Button type="button" size="sm" variant="secondary" className="w-full" onClick={() => setBookGuideOpen(true)}><CircleHelp className="h-4 w-4" />দেখে নিন কিভাবে বই যোগ করতে হয়</Button>
          {bookStep === 1 ? <>
            <label className="block text-sm font-semibold text-fg">বইয়ের নাম <span className="text-danger">*</span><div className="mt-1 flex gap-2"><Input value={bookForm.title} onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); searchCover(); } }} placeholder="যেমন: তিন গোয়েন্দা" /><Button type="button" variant="secondary" disabled={searchingCover} onClick={searchCover}><Search className="h-4 w-4" />খুঁজুন</Button></div></label>
            <p className="-mt-3 text-xs text-muted">নাম লিখে Enter চাপুন বা খুঁজুন চাপুন।</p>
            {coverSearchQuery && <ProgrammableCoverSearch key={coverSearchRun} query={coverSearchQuery} onSearchStateChange={handleCoverSearchStateChange} />}
            {bookForm.title.trim() && <a href={googleImagesUrl(bookForm.title)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"><ExternalLink className="h-3.5 w-3.5" />Google Images-এ কভার খুঁজুন</a>}
            <label className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm font-semibold text-fg">
              <ImagePlus className="h-4 w-4" />কভার আপলোড করুন
              <input className="hidden" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { const upload = await uploadBookCover(file); setBookForm({ ...bookForm, ...upload, externalSource: '' }); onMessage('WebP কভার আপলোড হয়েছে'); } catch (error) { onMessage(error instanceof Error ? error.message : 'আপলোড হয়নি'); } finally { setBusy(false); } }} />
            </label>
            {bookForm.coverUrl && <Image src={bookForm.coverUrl} alt="নির্বাচিত কভার" width={96} height={132} className="h-36 w-24 rounded border border-border object-cover" unoptimized />}
            <label className="block text-sm font-semibold text-fg">বইয়ের মূল্য <span className="text-danger">*</span><Input className="mt-1" type="number" min="1" value={bookForm.bookPriceMinor} onChange={(event) => setBookForm({ ...bookForm, bookPriceMinor: event.target.value })} placeholder="হারালে যে মূল্য পরিশোধ করতে হবে" /></label>
            <p className="text-xs text-muted"><span className="text-danger">*</span> চিহ্নিত তথ্য অবশ্যই দিতে হবে।</p>
          </> : <>
            <label className="block text-sm font-semibold text-fg">লেখকের নাম <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={bookForm.authorName} onChange={(event) => setBookForm({ ...bookForm, authorName: event.target.value })} placeholder="লেখকের নাম" /></label>
            <label className="block text-sm font-semibold text-fg">বিভাগ <span className="font-normal text-muted">(ঐচ্ছিক)</span><select value={bookForm.categoryId} onChange={(event) => setBookForm({ ...bookForm, categoryId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"><option value="">বিভাগ নির্বাচন করুন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category_name}</option>)}</select></label>
            <div className="flex gap-2"><Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="নতুন বিভাগ (ঐচ্ছিক)" /><Button type="button" variant="secondary" onClick={() => void createCategoryInline()}><Plus className="h-4 w-4" /></Button></div>
            <label className="block text-sm font-semibold text-fg">বিকল্প নাম / বানান <span className="font-normal text-muted">(ঐচ্ছিক)</span><Input className="mt-1" value={bookForm.searchAliases} onChange={(event) => setBookForm({ ...bookForm, searchAliases: event.target.value })} placeholder="কমা দিয়ে লিখুন" /></label>
            <label className="block text-sm font-semibold text-fg">সংক্ষিপ্ত বিবরণ <span className="font-normal text-muted">(ঐচ্ছিক)</span><textarea value={bookForm.description} onChange={(event) => setBookForm({ ...bookForm, description: event.target.value })} className="mt-1 h-24 w-full rounded-lg border border-border p-3 text-sm" placeholder="বই সম্পর্কে লিখুন" /></label>
          </>}
        </div>
      </AppModal>
      <AppModal open={bookGuideOpen} title="কিভাবে বই যোগ করবেন" onClose={() => setBookGuideOpen(false)} className="max-w-3xl" footer={<Button onClick={() => setBookGuideOpen(false)}>বুঝেছি</Button>}>
<div className="space-y-5 text-sm leading-6 text-fg-2">
          <section><h3 className="font-bold text-fg">১. বইয়ের নাম দিয়ে খুঁজুন</h3><p className="mt-1">প্রথম ধাপে বইয়ের নাম লিখে <strong>Enter</strong> চাপুন বা <strong>খুঁজুন</strong> চাপুন। একই জায়গাতেই Google-এর কভার ফলাফল দেখাবে।</p></section>
          <section><h3 className="font-bold text-fg">২. পছন্দের কভারটি download করুন</h3><p className="mt-1">ফলাফল থেকে পছন্দের কভারটি বেছে নিন। প্রয়োজনে <strong>Google Images-এ কভার খুঁজুন</strong> বাটনে চাপুন। মোবাইলে ছবিটি খুলে <strong>Download image</strong> / <strong>ছবি ডাউনলোড</strong> করুন।</p></section>
          <section><h3 className="font-bold text-fg">৩. কভার আপলোড করুন</h3><p className="mt-1">এই পেজে ফিরে <strong>কভার আপলোড করুন</strong> চাপুন এবং ডাউনলোড করা ছবিটি নির্বাচন করুন। নিজের কাছে কোনো ছবি থাকলেও খোঁজা ছাড়াই সরাসরি আপলোড করতে পারবেন।</p><div className="mt-3 rounded-lg border border-brand/20 bg-brand-light p-3 text-xs leading-5 text-fg-2"><p className="font-bold text-brand">মোবাইলের জন্য সহজ নিয়ম</p><p className="mt-1">Google Images → ছবি Download → কভার আপলোড করুন → ডাউনলোড করা ছবি নির্বাচন</p></div></section>
          <section><h3 className="font-bold text-fg">৪. বইয়ের মূল্য দিন</h3><p className="mt-1">প্রথম ধাপেই বইয়ের মূল্য দিন (হারালে যে মূল্য পরিশোধ করতে হবে)। এই তথ্যটি আবশ্যক।</p></section>
          <section><h3 className="font-bold text-fg">৫. পরের ধাপে বিভাগ বেছে নিয়ে সংরক্ষণ করুন</h3><p className="mt-1"><strong>পরের ধাপ</strong> চাপুন। দ্বিতীয় ধাপে বিভাগ ইচ্ছামতো বেছে নিন, তারপর <strong>বই যোগ করুন</strong> চাপুন।</p></section>
        </div>
      </AppModal>
    </>
  );
}