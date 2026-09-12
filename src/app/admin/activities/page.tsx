'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { CalendarHeart, Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { EmptyState } from '@/components/custom/EmptyState';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { Card } from '@/components/semibase/Card';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { createActivity, deleteActivity, getAdminActivities, toBanglaDate, updateActivity, uploadActivityImage, type ActivityRow } from '@/lib/api';

const EMPTY_FORM = { title: '', description: '', imageUrl: '', imagePublicId: '' };

export default function AdminActivitiesPage() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };

  const load = useCallback(async () => {
    try {
      setRows((await getAdminActivities()).rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কার্জক্রম আনা যায়নি');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (activity: ActivityRow) => {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      description: activity.description,
      imageUrl: activity.image_url ?? '',
      imagePublicId: activity.image_public_id ?? '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showToast('শিরোনাম ও বিবরণ লিখুন');
      return;
    }
    setBusy(true);
    try {
      const input = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || null,
        imagePublicId: form.imagePublicId.trim() || null,
      };
      if (editingId === null) {
        await createActivity(input);
        showToast('নতুন কার্জক্রম যোগ হয়েছে');
      } else {
        await updateActivity(editingId, input);
        showToast('কার্জক্রম আপডেট হয়েছে');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'সংরক্ষণ হয়নি');
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (activity: ActivityRow) => {
    setBusy(true);
    try {
      await updateActivity(activity.id, {
        title: activity.title,
        description: activity.description,
        imageUrl: activity.image_url,
        imagePublicId: activity.image_public_id,
        isPublished: !activity.is_published,
      });
      await load();
      showToast(activity.is_published ? 'প্রকাশনা বন্ধ করা হয়েছে' : 'প্রকাশিত হয়েছে');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'আপডেট হয়নি');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (confirmDeleteId === null) return;
    setBusy(true);
    try {
      await deleteActivity(confirmDeleteId);
      setConfirmDeleteId(null);
      await load();
      showToast('কার্জক্রমটি মুছে ফেলা হয়েছে');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'মুছে ফেলা যায়নি');
    } finally {
      setBusy(false);
    }
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadActivityImage(file);
      setForm((prev) => ({ ...prev, ...uploaded }));
      showToast('ছবি আপলোড হয়েছে');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'আপলোড হয়নি');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void load()} />}

      <SectionHeader
        title="কার্জক্রম পরিচালনা"
        subtitle="সংগঠনের কার্যক্রম যোগ করুন, সম্পাদনা করুন ও প্রকাশ নিয়ন্ত্রণ করুন"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" />নতুন কার্জক্রম</Button>}
      />

      {rows.length === 0 ? (
        <EmptyState title="কোনো কার্জক্রম নেই" description="সবার প্রথম কার্যক্রম যোগ করতে উপরের 'নতুন কার্জক্রম' বাটনে চাপুন।" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((activity) => (
            <Card key={activity.id} className="flex flex-col overflow-hidden p-0">
              <div className="relative aspect-[16/9] bg-surface-2">
                {activity.image_url
                  ? <Image src={activity.image_url} alt={activity.title} fill className="object-cover" unoptimized />
                  : <div className="grid h-full place-items-center text-muted"><CalendarHeart className="h-10 w-10" /></div>}
                {!activity.is_published && <span className="absolute left-3 top-3 rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">অপ্রকাশিত</span>}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-bold text-fg">{activity.title}</h3>
                <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-fg-2">{activity.description}</p>
                <div className="mt-3 text-xs text-muted">যিনি যোগ করেছেন: {activity.created_by_name} · {toBanglaDate(activity.created_at)}</div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => openEdit(activity)}><Pencil className="h-3.5 w-3.5" />সম্পাদনা</Button>
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => void togglePublished(activity)}>
                    {activity.is_published ? <><EyeOff className="h-3.5 w-3.5" />অপ্রকাশিত করুন</> : <><Eye className="h-3.5 w-3.5" />প্রকাশ করুন</>}
                  </Button>
                  <Button size="sm" variant="danger" disabled={busy} onClick={() => setConfirmDeleteId(activity.id)}><Trash2 className="h-3.5 w-3.5" />মুছুন</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AppModal
        open={confirmDeleteId !== null}
        title="কার্জক্রম মুছবেন?"
        onClose={() => setConfirmDeleteId(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)} disabled={busy}>বাতিল</Button>
            <Button variant="danger" disabled={busy} onClick={() => void remove()}>{busy ? 'মুছে ফেলা হচ্ছে...' : 'মুছে ফেলুন'}</Button>
          </>
        )}
      >
        <p className="text-sm leading-6 text-fg-2">এই কার্জক্রমটি স্থায়ীভাবে মুছে যাবে এবং সকল ব্যবহারকারীর কাছ থেকে পাওয়া যাবে না। আপনি কি নিশ্চিত?</p>
      </AppModal>

      <AppModal
        open={modalOpen}
        title={editingId === null ? 'নতুন কার্জক্রম' : 'কার্জক্রম সম্পাদনা'}
        onClose={() => setModalOpen(false)}
        loading={uploading}
        loadingLabel="ছবি আপলোড হচ্ছে..."
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={busy}>বাতিল</Button>
            <Button disabled={busy || uploading} onClick={() => void save()}>{busy ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-fg">
            শিরোনাম <span className="text-danger">*</span>
            <Input className="mt-1" value={form.title} maxLength={180} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="যেমন: শীতবস্ত্র বিতরণ" />
          </label>
          <label className="block text-sm font-semibold text-fg">
            বিবরণ <span className="text-danger">*</span>
            <textarea
              className="mt-1 min-h-[120px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-light"
              value={form.description}
              maxLength={5000}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="কার্যক্রমের বিস্তারিত বিবরণ দিন"
            />
          </label>
          <div className="block text-sm font-semibold text-fg">
            ছবি <span className="font-normal text-muted">(ঐচ্ছিক)</span>
            <div className="mt-2 space-y-3">
              {form.imageUrl && (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <Image src={form.imageUrl} alt="কার্জক্রমের ছবি" width={640} height={360} className="h-auto w-full object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: '', imagePublicId: '' })}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white transition hover:bg-black/80"
                    aria-label="ছবি সরান"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm font-semibold text-fg-2 transition hover:border-brand/40 hover:text-brand">
                <ImagePlus className="h-4 w-4" />{form.imageUrl ? 'অন্য ছবি আপলোড করুন' : 'ছবি আপলোড করুন'}
                <input className="hidden" type="file" accept="image/*" onChange={(event) => void handleImageUpload(event.target.files?.[0])} />
              </label>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted">ছবি স্বয়ংক্রিয়ভাবে WebP ফরম্যাটে সংরক্ষিত হবে।</p>
            {form.imageUrl && (
              <label className="mt-3 block">
                <span className="text-xs font-semibold text-fg">সরাসরি ছবির URL <span className="font-normal text-muted">(ঐচ্ছিক)</span></span>
                <Input className="mt-1 text-xs" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value, imagePublicId: '' })} placeholder="https://..." />
              </label>
            )}
          </div>
        </div>
      </AppModal>

      <AppToast message={toast} />
    </PageStack>
  );
}