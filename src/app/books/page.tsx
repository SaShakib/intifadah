'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, ImagePlus, Plus, Search, Send, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { useAuth } from '@/contexts/AuthContext';
import { activateBooks, confirmBookReceived, createBook, createBookCategory, getBookActivation, getBookCategories, getMyBookRequests, getPublicBooks, ownerBookRequestAction, requestBook, requestBookExtension, resolveBookExtension, searchBookMetadata, uploadBookCover, type BookActivationInput, type BookCategoryRow, type BookMetadataRow, type BookRequestRow, type BookRow } from '@/lib/api';

const educationLevels = ['Below SSC', 'SSC', 'HSC 1st', 'HSC 2nd', 'Honours 1st year', 'Honours 2nd year', 'Honours 3rd year', 'Honours 4th year', 'Masters'];

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
  const [activationStep, setActivationStep] = useState(0);
  const [activationForm, setActivationForm] = useState<BookActivationInput>({ village: '', wardNo: 0, fatherName: '', occupationType: 'student', institutionName: '', educationLevel: '', educationDetail: '', professionDetail: '' });
  const [bookForm, setBookForm] = useState({ title: '', authorName: '', bookPriceMinor: '', categoryId: '', description: '', coverUrl: '', coverPublicId: '', externalSource: '', externalVolumeId: '' });
  const [newCategory, setNewCategory] = useState('');
  const [metadata, setMetadata] = useState<BookMetadataRow[]>([]);
  const [requestDays, setRequestDays] = useState(7);
  const [myRequests, setMyRequests] = useState<BookRequestRow[]>([]);

  const load = useCallback(async () => {
    const [bookResult, categoryResult] = await Promise.all([getPublicBooks({ search, categoryId }), getBookCategories()]);
    setBooks(bookResult.rows);
    setCategories(categoryResult.rows);
  }, [categoryId, search]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!isAuthenticated) { setActivation(undefined); return; }
    void getBookActivation().then((result) => setActivation(result.row)).catch(() => setActivation(null));
  }, [isAuthenticated]);
  const loadRequests = useCallback(async () => {
    if (!isAuthenticated) { setMyRequests([]); return; }
    setMyRequests((await getMyBookRequests()).rows);
  }, [isAuthenticated]);
  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };
  const requireActivated = (next: 'add' | 'request', book?: BookRow) => {
    if (!isAuthenticated) { router.push('/login?books=1'); return; }
    setSelectedBook(book ?? null);
    if (!activation) { setModal('activate'); return; }
    setModal(next);
  };
  const submitActivation = async () => {
    setBusy(true);
    try {
      await activateBooks(activationForm);
      setActivation(activationForm);
      setModal(selectedBook ? 'request' : 'add');
      showToast('Books বিভাগ সক্রিয় হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'তথ্য সংরক্ষণ হয়নি'); } finally { setBusy(false); }
  };
  const findMetadata = async () => {
    if (!bookForm.title.trim()) return;
    setBusy(true);
    try { setMetadata((await searchBookMetadata(bookForm.title)).rows); } catch { showToast('বইয়ের তথ্য খুঁজে পাওয়া যায়নি'); } finally { setBusy(false); }
  };
  const createCategoryInline = async () => {
    if (!newCategory.trim()) return;
    const result = await createBookCategory(newCategory.trim());
    setCategories((current) => [...current, result.row].sort((a, b) => a.category_name.localeCompare(b.category_name)));
    setBookForm((current) => ({ ...current, categoryId: String(result.row.id) }));
    setNewCategory('');
  };
  const submitBook = async () => {
    setBusy(true);
    try {
      await createBook({ ...bookForm, categoryId: bookForm.categoryId ? Number(bookForm.categoryId) : undefined, bookPriceMinor: Number(bookForm.bookPriceMinor) });
      setModal(null); setBookForm({ title: '', authorName: '', bookPriceMinor: '', categoryId: '', description: '', coverUrl: '', coverPublicId: '', externalSource: '', externalVolumeId: '' });
      await load(); showToast('বই যোগ হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'বই যোগ করা যায়নি'); } finally { setBusy(false); }
  };
  const submitRequest = async () => {
    if (!selectedBook) return;
    setBusy(true);
    try { await requestBook(selectedBook.id, requestDays); setModal(null); await load(); showToast('বইয়ের অনুরোধ মালিকের কাছে পাঠানো হয়েছে।'); } catch (error) { showToast(error instanceof Error ? error.message : 'অনুরোধ পাঠানো যায়নি'); } finally { setBusy(false); }
  };
  const updateRequest = async (request: BookRequestRow, action: 'accept' | 'reject' | 'given' | 'returned' | 'received' | 'extend') => {
    setBusy(true);
    try {
      if (action === 'received') await confirmBookReceived(request.id, true);
      else if (action === 'extend') await requestBookExtension(request.id, 7);
      else await ownerBookRequestAction(request.id, action);
      await Promise.all([loadRequests(), load()]);
      showToast(action === 'extend' ? '৭ দিনের বাড়তি সময়ের অনুরোধ পাঠানো হয়েছে।' : 'বইয়ের অবস্থা আপডেট হয়েছে।');
    } catch (error) { showToast(error instanceof Error ? error.message : 'আপডেট করা যায়নি'); } finally { setBusy(false); }
  };
  const updateExtension = async (extensionId: string | number, accepted: boolean) => {
    setBusy(true);
    try { await resolveBookExtension(extensionId, accepted); await loadRequests(); showToast(accepted ? 'বর্ধিত সময় অনুমোদন হয়েছে।' : 'বর্ধিত সময়ের অনুরোধ প্রত্যাখ্যান হয়েছে।'); } catch (error) { showToast(error instanceof Error ? error.message : 'আপডেট করা যায়নি'); } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-surface-2 pb-12">
      <header className="border-b border-border bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4"><Link href="/books" className="flex items-center gap-2 font-bold text-fg"><BookOpen className="h-5 w-5 text-brand" />ইনতিফাদাহ বইঘর</Link><div className="flex gap-2">{isAuthenticated ? <Button size="sm" variant="secondary" onClick={() => requireActivated('add')}><Plus className="h-4 w-4" />বই যোগ করুন</Button> : <Link href="/login?books=1"><Button size="sm">লগইন করে যোগ করুন</Button></Link>}</div></div></header>
      <section className="border-b border-border bg-white"><div className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-3xl font-bold text-fg">বইঘর</h1><p className="mt-2 text-sm text-muted">সবার জন্য বই দেখুন, সক্রিয় হওয়ার পর বই যোগ করুন বা ধার নিন। বই হারালে তালিকাভুক্ত মূল্য পরিশোধ করতে হবে।</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="বই বা লেখক খুঁজুন" /></div><select value={categoryId ?? ''} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">সব বিভাগ</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category_name}</option>)}</select></div></div></section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:grid-cols-2 lg:grid-cols-4">{books.map((book) => <article key={book.id} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"><div className="relative aspect-[3/4] bg-surface-2">{book.cover_url ? <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-muted"><BookOpen className="h-10 w-10" /></div>}</div><div className="p-4"><p className="text-xs font-semibold text-brand">{book.category_name ?? 'বিভাগহীন'}</p><Link href={`/books/${book.id}`} className="mt-1 block font-bold text-fg hover:text-brand">{book.title}</Link><p className="mt-1 text-sm text-muted">{book.author_name || 'লেখক অজানা'}</p><p className="mt-3 text-xs text-muted">মালিক: {book.owner_name}</p><div className="mt-3 flex gap-2"><Link href={`/books/${book.id}`} className="flex-1"><Button size="sm" fullWidth variant="secondary">বিস্তারিত</Button></Link><Button size="sm" onClick={() => requireActivated('request', book)}><Send className="h-3.5 w-3.5" />ধার নিন</Button></div></div></article>)}</section>
      {!books.length && <p className="py-12 text-center text-sm text-muted">কোনো বই পাওয়া যায়নি।</p>}
      {isAuthenticated && myRequests.length > 0 && <section className="mx-auto max-w-6xl px-4 pb-4"><div className="border border-border bg-white p-5"><h2 className="font-bold text-fg">আমার বইয়ের অনুরোধ</h2><div className="mt-4 space-y-3">{myRequests.map((request) => { const owner = Number(request.owner_user_id) === Number(user?.id); const pendingExtension = request.extensions?.find((extension) => extension.status === 0); return <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0"><div><p className="font-semibold text-fg">{request.title}</p><p className="text-xs text-muted">{owner ? `অনুরোধকারী: ${request.requester_name}` : `মালিক: ${request.owner_name}`} · {request.requested_days} দিন{request.due_on ? ` · ফেরত: ${request.due_on}` : ''}</p></div><div className="flex flex-wrap gap-2">{owner && request.status === 0 && <><Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'accept')}>গ্রহণ</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => void updateRequest(request, 'reject')}>প্রত্যাখ্যান</Button></>}{owner && request.status === 1 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'given')}>দিয়েছি</Button>}{!owner && request.status === 3 && <Button size="sm" disabled={busy} onClick={() => void updateRequest(request, 'received')}>পেয়েছি</Button>}{!owner && request.status === 4 && <Button size="sm" variant="secondary" disabled={busy} onClick={() => void updateRequest(request, 'extend')}>আরও ৭ দিন চাই</Button>}{owner && request.status === 4 && <Button size="sm" variant="secondary" disabled={busy} onClick={() => void updateRequest(request, 'returned')}>ফেরত পেয়েছি</Button>}{owner && pendingExtension && <><Button size="sm" disabled={busy} onClick={() => void updateExtension(pendingExtension.id, true)}>+{pendingExtension.requestedDays} দিন</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => void updateExtension(pendingExtension.id, false)}>না</Button></>}</div></div>; })}</div></div></section>}

      <AppModal open={modal === 'activate'} title="বইঘর সক্রিয় করুন" onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>এখন নয়</Button>{activationStep > 0 && <Button variant="secondary" onClick={() => setActivationStep((step) => step - 1)}>পেছনে</Button>}<Button disabled={busy} onClick={() => activationStep < 2 ? setActivationStep((step) => step + 1) : void submitActivation()}>{activationStep < 2 ? 'পরের ধাপ' : busy ? 'সংরক্ষণ হচ্ছে...' : 'সক্রিয় করুন'}</Button></>}>
        <div className="space-y-4">{activationStep === 0 && <><p className="text-sm text-muted">আপনার অবস্থান ও পরিচয় দিয়ে বইঘর সক্রিয় করুন।</p><Input value={activationForm.village} onChange={(event) => setActivationForm({ ...activationForm, village: event.target.value })} placeholder="গ্রাম / এলাকা" /><Input type="number" value={activationForm.wardNo || ''} onChange={(event) => setActivationForm({ ...activationForm, wardNo: Number(event.target.value) })} placeholder="ওয়ার্ড নম্বর" /><Input value={activationForm.fatherName} onChange={(event) => setActivationForm({ ...activationForm, fatherName: event.target.value })} placeholder="বাবার নাম" /></>}{activationStep === 1 && <div className="grid grid-cols-3 gap-2">{(['student', 'working', 'business'] as const).map((type) => <button key={type} type="button" onClick={() => setActivationForm({ ...activationForm, occupationType: type })} className={activationForm.occupationType === type ? 'rounded-lg border border-brand bg-brand-light p-4 font-bold text-brand' : 'rounded-lg border border-border p-4 text-sm'}>{type === 'student' ? 'শিক্ষার্থী' : type === 'working' ? 'চাকরি' : 'ব্যবসা'}</button>)}</div>}{activationStep === 2 && (activationForm.occupationType === 'student' ? <><Input value={activationForm.institutionName} onChange={(event) => setActivationForm({ ...activationForm, institutionName: event.target.value })} placeholder="স্কুল / কলেজ / বিশ্ববিদ্যালয়" /><select value={activationForm.educationLevel} onChange={(event) => setActivationForm({ ...activationForm, educationLevel: event.target.value })} className="h-10 w-full rounded-lg border border-border px-3 text-sm"><option value="">শ্রেণি নির্বাচন করুন</option>{educationLevels.map((level) => <option key={level}>{level}</option>)}</select>{activationForm.educationLevel === 'Below SSC' && <Input value={activationForm.educationDetail} onChange={(event) => setActivationForm({ ...activationForm, educationDetail: event.target.value })} placeholder="কোন শ্রেণি? যেমন: Class 8" />}</> : <Input value={activationForm.professionDetail} onChange={(event) => setActivationForm({ ...activationForm, professionDetail: event.target.value })} placeholder={activationForm.occupationType === 'business' ? 'ব্যবসার ধরন' : 'পেশা'} />)}</div>
      </AppModal>

      <AppModal open={modal === 'request'} title="বই ধার নিন" onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>বাতিল</Button><Button disabled={busy} onClick={() => void submitRequest()}><Send className="h-4 w-4" />অনুরোধ পাঠান</Button></>}><p className="font-bold">{selectedBook?.title}</p><p className="mt-2 text-sm text-muted">মালিক অনুরোধ গ্রহণ করলে ব্যক্তিগতভাবে যোগাযোগ করতে পারবেন। সময় শেষ হলে আবার বর্ধিত সময় চাইতে হবে।</p><select value={requestDays} onChange={(event) => setRequestDays(Number(event.target.value))} className="mt-4 h-10 w-full rounded-lg border border-border px-3 text-sm">{[3, 7, 10, 15, 30].map((days) => <option key={days} value={days}>{days} দিন</option>)}</select></AppModal>

      <AppModal open={modal === 'add'} title="বই যোগ করুন" onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>বাতিল</Button><Button disabled={busy} onClick={() => void submitBook()}><Check className="h-4 w-4" />বই যোগ করুন</Button></>}><div className="space-y-3"><div className="flex gap-2"><Input value={bookForm.title} onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })} placeholder="বইয়ের নাম" /><Button variant="secondary" disabled={busy} onClick={() => void findMetadata()}><Search className="h-4 w-4" />খুঁজুন</Button></div>{metadata.length > 0 && <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border p-2">{metadata.map((item) => <button type="button" key={`${item.source}-${item.id}`} onClick={() => setBookForm({ ...bookForm, title: item.title, authorName: item.authorName, coverUrl: item.coverUrl || '', externalSource: item.source, externalVolumeId: item.id })} className="flex w-full items-center gap-2 rounded p-1 text-left hover:bg-surface-2">{item.coverUrl && <Image src={item.coverUrl} alt="" width={28} height={40} className="h-10 w-7 object-cover" unoptimized />}<span className="text-sm"><strong>{item.title}</strong><br />{item.authorName}</span></button>)}</div>}<Input value={bookForm.authorName} onChange={(event) => setBookForm({ ...bookForm, authorName: event.target.value })} placeholder="লেখকের নাম" /><Input type="number" value={bookForm.bookPriceMinor} onChange={(event) => setBookForm({ ...bookForm, bookPriceMinor: event.target.value })} placeholder="বইয়ের মূল্য (হারালে প্রযোজ্য)" /><select value={bookForm.categoryId} onChange={(event) => setBookForm({ ...bookForm, categoryId: event.target.value })} className="h-10 w-full rounded-lg border border-border px-3 text-sm"><option value="">বিভাগ নির্বাচন করুন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category_name}</option>)}</select><div className="flex gap-2"><Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="নতুন বিভাগ" /><Button variant="secondary" onClick={() => void createCategoryInline()}><Plus className="h-4 w-4" /></Button></div><label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm"><ImagePlus className="h-4 w-4" />কভার আপলোড<input className="hidden" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { const upload = await uploadBookCover(file); setBookForm({ ...bookForm, ...upload, externalSource: '' }); showToast('WebP কভার আপলোড হয়েছে'); } catch (error) { showToast(error instanceof Error ? error.message : 'আপলোড হয়নি'); } finally { setBusy(false); } }} /></label>{bookForm.coverUrl && <Image src={bookForm.coverUrl} alt="কভার" width={80} height={110} className="h-28 w-20 object-cover" unoptimized />}<textarea value={bookForm.description} onChange={(event) => setBookForm({ ...bookForm, description: event.target.value })} className="h-20 w-full rounded-lg border border-border p-3 text-sm" placeholder="সংক্ষিপ্ত বিবরণ" /></div></AppModal>
      <AppToast message={toast} />
    </main>
  );
}
