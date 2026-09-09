'use client';

import { useState } from 'react';
import { Pencil, Plus, Save, Trash2, UsersRound } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { CATEGORY_METRICS, CATEGORY_ROWS, CATEGORY_TYPE_SUMMARY } from './constants';
import { createAdminCategory, deleteAdminCategory, getAdminCategorySubscribers, getErrorMessage, updateAdminCategory, updateAdminCategorySubscribers, type ApiCategorySubscriberRow } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { CategoryMetric } from './types';
import type { Category, CategoryType, RecurrenceType } from '@/types';
import type { CategoryInput } from '@/lib/api';

const TYPE_LABEL: Record<string, string> = {
  donation: 'দান',
  savings: 'সঞ্চয়',
  loan: 'ঋণ',
  expense: 'ব্যয়',
};

const RECUR_LABEL: Record<string, string> = {
  daily: 'দৈনিক',
  weekly: 'সাপ্তাহিক',
  monthly: 'মাসিক',
  yearly: 'বার্ষিক',
  one_time: 'এককালীন',
};

interface CategoriesTopSectionProps {
  metrics?: CategoryMetric[];
}

interface CategoriesMiddleSectionProps {
  categories?: typeof CATEGORY_ROWS;
  onMutationSuccess?: () => void | Promise<void>;
}

interface CategoriesBottomSectionProps {
  summary?: typeof CATEGORY_TYPE_SUMMARY;
}

export function CategoriesTopSection({ metrics = CATEGORY_METRICS }: CategoriesTopSectionProps) {
  return (
    <section>
      <SectionHeader title="খাত সারাংশ" subtitle="খাতের সংখ্যা এবং সক্রিয়তা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const CATEGORY_TYPE_VALUE: Record<CategoryType, number> = {
  donation: 1,
  savings: 2,
  loan: 3,
  expense: 4,
};

const RECURRENCE_VALUE: Record<RecurrenceType, number> = {
  daily: 1,
  weekly: 2,
  monthly: 3,
  yearly: 4,
  one_time: 0,
};

const DEFAULT_CATEGORY_FORM: CategoryInput = {
  categoryName: '',
  categoryType: 1,
  recurrenceType: 0,
  amountFixed: null,
  isAmountVariable: true,
  description: '',
  isActive: true,
};

function categoryToForm(category: Category): CategoryInput {
  return {
    categoryName: category.name,
    categoryType: CATEGORY_TYPE_VALUE[category.type],
    recurrenceType: RECURRENCE_VALUE[category.recurrence],
    amountFixed: category.amount ?? null,
    isAmountVariable: category.isVariable,
    description: category.description ?? '',
    isActive: category.isActive,
  };
}

export function CategoriesMiddleSection({ categories = CATEGORY_ROWS, onMutationSuccess }: CategoriesMiddleSectionProps) {
  const { roleKey } = useAuth();
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(DEFAULT_CATEGORY_FORM);
  const [activeType, setActiveType] = useState<'all' | CategoryType>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [subscriberCategory, setSubscriberCategory] = useState<Category | null>(null);
  const [subscribers, setSubscribers] = useState<ApiCategorySubscriberRow[]>([]);
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<Set<number>>(new Set());
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [savingSubscribers, setSavingSubscribers] = useState(false);
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const showToast = (message: string) => {
    setModal(null);
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const updateForm = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const openCreateModal = () => {
    setSelectedCategory(null);
    setForm(DEFAULT_CATEGORY_FORM);
    setModal('new');
  };
  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setForm(categoryToForm(category));
    setModal('edit');
  };
  const canManageSubscribers = roleKey === 'super_admin';
  const canSubscribeMembers = (category: Category) => (
    canManageSubscribers
    && (category.type === 'savings' || category.type === 'donation')
    && (category.isVariable || Boolean(category.amount))
  );
  const openSubscribers = async (category: Category) => {
    setSubscriberCategory(category);
    setSubscriberSearch('');
    setSubscriptionAmount('');
    setSelectedSubscriberIds(new Set());
    setLoadingSubscribers(true);
    try {
      setSubscribers(await getAdminCategorySubscribers(category.id));
    } catch (error) {
      setSubscriberCategory(null);
      setToast(getErrorMessage(error));
    } finally {
      setLoadingSubscribers(false);
    }
  };
  const toggleSubscriber = (userId: number) => {
    setSelectedSubscriberIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };
  const applySubscribers = async (isActive: boolean) => {
    if (!subscriberCategory || !selectedSubscriberIds.size) {
      setToast('অন্তত একজন সদস্য নির্বাচন করুন।');
      return;
    }
    setSavingSubscribers(true);
    try {
      const result = await updateAdminCategorySubscribers(subscriberCategory.id, [...selectedSubscriberIds], isActive, isActive && subscriberCategory.isVariable ? Number(subscriptionAmount) : undefined);
      setSubscribers((current) => current.map((member) => selectedSubscriberIds.has(member.user_id) ? { ...member, is_active: isActive } : member));
      setSelectedSubscriberIds(new Set());
      setToast(isActive ? `${result.updated} জন সদস্য সাবস্ক্রাইব হয়েছেন। ${result.created}টি আলাদা বকেয়া তৈরি হয়েছে।` : `${result.updated} জনের সাবস্ক্রিপশন বন্ধ হয়েছে।`);
      await onMutationSuccess?.();
    } catch (error) {
      setToast(getErrorMessage(error));
    } finally {
      setSavingSubscribers(false);
    }
  };
  const saveCategory = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        amountFixed: form.isAmountVariable ? null : form.amountFixed,
        description: form.description?.trim() || undefined,
      };
      if (modal === 'edit' && selectedCategory) {
        await updateAdminCategory(selectedCategory.id, payload);
        showToast('খাত আপডেট করা হয়েছে');
      } else {
        await createAdminCategory(payload);
        showToast('নতুন খাত তৈরি হয়েছে');
      }
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const removeCategory = async () => {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      await deleteAdminCategory(selectedCategory.id);
      showToast('খাত নিষ্ক্রিয় করা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const visibleCategories = categories.filter((category) => {
    const typeMatches = activeType === 'all' || category.type === activeType;
    const statusMatches = activeStatus === 'all' || (activeStatus === 'active' ? category.isActive : !category.isActive);
    return typeMatches && statusMatches;
  });

  return (
    <section>
      <Card>
        <SectionHeader
          title="খাত তালিকা"
          subtitle="প্রতি খাতের ধরন, পুনরাবৃত্তি ও স্ট্যাটাস"
          action={<Button onClick={openCreateModal}><Plus className="h-4 w-4" />নতুন খাত</Button>}
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'donation', 'savings', 'loan', 'expense'] as const).map((type) => (
            <button key={type} type="button" onClick={() => setActiveType(type)} className={activeType === type ? 'rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white' : 'rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-fg-2 hover:border-brand hover:text-brand'}>
              {type === 'all' ? 'সব ধরণ' : TYPE_LABEL[type]}
            </button>
          ))}
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button key={status} type="button" onClick={() => setActiveStatus(status)} className={activeStatus === status ? 'rounded-full border border-brand bg-brand-light px-4 py-2 text-sm font-semibold text-brand' : 'rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-fg-2 hover:border-brand hover:text-brand'}>
              {status === 'all' ? 'সব স্ট্যাটাস' : status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category) => (
            <article key={category.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md">
              <div className="border-b border-border p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-fg">{category.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">{category.description ?? 'বিবরণ নেই'}</p>
                  </div>
                  <Badge variant={category.type === 'donation' ? 'brand' : category.type === 'savings' ? 'success' : category.type === 'loan' ? 'info' : 'warning'}>{TYPE_LABEL[category.type]}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 text-sm">
                <div>
                  <p className="text-[11px] font-bold uppercase text-muted">পুনরাবৃত্তি</p>
                  <p className="mt-1 font-bold text-fg">{RECUR_LABEL[category.recurrence]}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-muted">পরিমাণ</p>
                  <p className="mt-1 font-bold text-brand">{category.isVariable ? 'পরিবর্তনশীল' : category.amount ? `৳${category.amount}` : '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border bg-surface-2 px-4 py-3">
                <span className={category.isActive ? 'h-2 w-2 rounded-full bg-success shadow-[0_0_0_3px_var(--success-bg)]' : 'h-2 w-2 rounded-full bg-muted'} />
                <span className="text-xs font-semibold text-fg-2">{category.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                <span className="flex-1" />
                {canSubscribeMembers(category) && <Button size="sm" variant="secondary" onClick={() => void openSubscribers(category)}><UsersRound className="h-3.5 w-3.5" />সদস্য যোগ</Button>}
                <Button size="sm" variant="secondary" onClick={() => openEditModal(category)}><Pencil className="h-3.5 w-3.5" />সম্পাদনা</Button>
              </div>
            </article>
          ))}
        </div>
      </Card>
      <AppModal
        open={modal !== null}
        title={modal === 'edit' ? 'খাত সম্পাদনা' : 'নতুন খাত তৈরি করুন'}
        onClose={() => setModal(null)}
        footer={(
          <>
            {modal === 'edit' && <Button variant="danger" onClick={() => void removeCategory()} disabled={saving}><Trash2 className="h-4 w-4" />নিষ্ক্রিয়</Button>}
            <Button variant="secondary" onClick={() => setModal(null)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveCategory()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">খাতের নাম</span><Input value={form.categoryName} onChange={(event) => updateForm('categoryName', event.target.value)} placeholder="যেমন: যাকাত ফান্ড" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ধরণ</span><select value={form.categoryType} onChange={(event) => updateForm('categoryType', Number(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">{Object.entries(TYPE_LABEL).map(([value, label]) => <option key={value} value={CATEGORY_TYPE_VALUE[value as CategoryType]}>{label}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পুনরাবৃত্তি</span><select value={form.recurrenceType} onChange={(event) => updateForm('recurrenceType', Number(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">{Object.entries(RECUR_LABEL).map(([value, label]) => <option key={value} value={RECURRENCE_VALUE[value as RecurrenceType]}>{label}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পরিমাণ</span><Input type="number" value={form.amountFixed ?? ''} onChange={(event) => updateForm('amountFixed', event.target.value ? Number(event.target.value) : null)} placeholder="পরিমাণ" /></label>
          <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-fg-2"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(event) => updateForm('isActive', event.target.checked)} className="h-4 w-4 accent-[var(--brand)]" /> সক্রিয়</label>
          <label className="flex items-center gap-2 text-sm font-semibold text-fg-2"><input type="checkbox" checked={Boolean(form.isAmountVariable)} onChange={(event) => updateForm('isAmountVariable', event.target.checked)} className="h-4 w-4 accent-[var(--brand)]" /> পরিবর্তনশীল পরিমাণ</label>
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">বিবরণ</span><textarea value={form.description ?? ''} onChange={(event) => updateForm('description', event.target.value)} className="h-24 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="খাতের বিবরণ লিখুন..." /></label>
        </div>
      </AppModal>
      <AppModal
        open={Boolean(subscriberCategory)}
        title={subscriberCategory ? `${subscriberCategory.name}: সদস্য সাবস্ক্রিপশন` : 'সদস্য সাবস্ক্রিপশন'}
        onClose={() => setSubscriberCategory(null)}
        className="max-w-2xl"
        footer={<><Button variant="secondary" disabled={savingSubscribers} onClick={() => setSubscriberCategory(null)}>মডাল বন্ধ করুন</Button><Button variant="secondary" disabled={savingSubscribers || !selectedSubscriberIds.size} onClick={() => void applySubscribers(false)}>সাবস্ক্রিপশন বন্ধ করুন</Button><Button disabled={savingSubscribers || !selectedSubscriberIds.size || (subscriberCategory?.isVariable && (!Number(subscriptionAmount) || Number(subscriptionAmount) < 1))} onClick={() => void applySubscribers(true)}>{savingSubscribers ? 'সংরক্ষণ হচ্ছে...' : 'নির্বাচিতদের সাবস্ক্রাইব করুন'}</Button></>}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-fg-2">শুধু সক্রিয় ইনতিফাদাহ সদস্যদের নির্বাচন করুন। প্রত্যেকের জন্য আলাদা বকেয়া, ইন-অ্যাপ নোটিফিকেশন এবং ইমেইল তৈরি হবে।</p>
          {subscriberCategory?.isVariable && <label className="block text-sm font-semibold text-fg">নির্বাচিত প্রত্যেক সদস্যের পরিমাণ <Input className="mt-1" type="number" min="1" value={subscriptionAmount} onChange={(event) => setSubscriptionAmount(event.target.value)} placeholder="যেমন: ৫০" /></label>}
          <Input value={subscriberSearch} onChange={(event) => setSubscriberSearch(event.target.value)} placeholder="নাম বা মোবাইল দিয়ে সদস্য খুঁজুন" />
          {loadingSubscribers ? <p className="py-8 text-center text-sm text-muted">সদস্য লোড হচ্ছে...</p> : <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            {subscribers.filter((member) => `${member.full_name} ${member.mobile}`.toLowerCase().includes(subscriberSearch.toLowerCase())).map((member) => <label key={member.user_id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-white p-3">
              <input type="checkbox" checked={selectedSubscriberIds.has(member.user_id)} onChange={() => toggleSubscriber(member.user_id)} className="h-4 w-4 accent-[var(--brand)]" />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-fg">{member.full_name}</span><span className="block text-xs text-muted">{member.mobile}{member.email ? ` · ${member.email}` : ''}</span></span>
              <Badge variant={member.is_active ? 'success' : 'muted'}>{member.is_active ? 'সাবস্ক্রাইবড' : 'সাবস্ক্রাইবড নয়'}</Badge>
            </label>)}
          </div>}
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function CategoriesBottomSection({ summary = CATEGORY_TYPE_SUMMARY }: CategoriesBottomSectionProps) {
  const rows = summary.map((item) => [TYPE_LABEL[item.type] ?? item.type, String(item.count)]);

  return (
    <section>
      <Card>
        <SectionHeader title="ধরণভিত্তিক খাত" subtitle="প্রতি ধরণে মোট খাত সংখ্যা" />
        <DataTable headers={['ধরণ', 'খাত সংখ্যা']} rows={rows} />
      </Card>
    </section>
  );
}
