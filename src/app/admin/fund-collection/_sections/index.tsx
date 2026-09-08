'use client';

import { useState } from 'react';
import { Pencil, Plus, Save } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { FUND_COLLECTION_ROWS, FUND_METRICS, FUND_TYPE_SUMMARY } from './constants';
import { createAdminCollection, getErrorMessage, receiveAdminSavingsDue, updateAdminCollection } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { FundMetric } from './types';
import type { CollectionInput } from '@/lib/api';
import type { Category, Member, Transaction } from '@/types';

const TYPE_LABEL: Record<string, string> = {
  collection: 'কালেকশন',
  donation: 'দান',
  savings: 'সঞ্চয়',
};

const STATUS_LABEL: Record<Transaction['status'], string> = {
  pending: 'অপেক্ষমাণ',
  completed: 'সম্পন্ন',
  rejected: 'বাতিল',
  overdue: 'বকেয়া',
};

function transactionTypeLabel(item: Transaction) {
  if (item.type === 'savings' && /penalty/i.test(item.categoryName ?? '')) {
    return 'পেনাল্টি বকেয়া';
  }
  return TYPE_LABEL[item.type] ?? item.type;
}

interface FundCollectionTopSectionProps {
  metrics?: FundMetric[];
}

interface FundCollectionMiddleSectionProps {
  rows?: typeof FUND_COLLECTION_ROWS;
  members?: Member[];
  categories?: Category[];
  onMutationSuccess?: () => void | Promise<void>;
}

interface FundCollectionBottomSectionProps {
  summary?: typeof FUND_TYPE_SUMMARY;
}

export function FundCollectionTopSection({ metrics = FUND_METRICS }: FundCollectionTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ফান্ড সংগ্রহ সারাংশ" subtitle="বর্তমান সংগ্রহের অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const TX_TYPE_VALUE: Record<string, number> = {
  collection: 1,
  donation: 2,
  savings: 3,
};

const DEFAULT_COLLECTION_FORM: CollectionInput = {
  subjectUserId: 0,
  txType: 1,
  status: 1,
  categoryId: null,
  amountMinor: 0,
  occurredOn: new Date().toISOString().slice(0, 10),
  note: '',
};

export function FundCollectionMiddleSection({ rows: items = FUND_COLLECTION_ROWS, members = [], categories = [], onMutationSuccess }: FundCollectionMiddleSectionProps) {
  const { roleKey } = useAuth();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [form, setForm] = useState<CollectionInput>(DEFAULT_COLLECTION_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const updateForm = <K extends keyof CollectionInput>(key: K, value: CollectionInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const openCreateModal = () => {
    setForm(DEFAULT_COLLECTION_FORM);
    setEditingItem(null);
    setModalMode('create');
  };
  const openEditModal = (item: Transaction) => {
    const status = item.status === 'completed' ? 1 : item.status === 'rejected' ? 2 : 0;
    const txType = TX_TYPE_VALUE[item.type] ?? 1;
    setEditingItem(item);
    setForm({
      subjectUserId: Number(item.memberId),
      txType,
      status,
      categoryId: item.categoryId ? Number(item.categoryId) : null,
      amountMinor: item.amount,
      occurredOn: item.occurredOn ?? new Date().toISOString().slice(0, 10),
      note: item.note ?? '',
    });
    setModalMode('edit');
  };
  const saveCollection = async () => {
    setSaving(true);
    try {
      if (modalMode === 'edit' && editingItem) {
        const input = roleKey === 'super_admin'
          ? { ...form, categoryId: form.categoryId || null, note: form.note?.trim() || '' }
          : { status: form.status };
        await updateAdminCollection(editingItem.id, input);
        showToast(roleKey === 'super_admin' ? 'এন্ট্রি হালনাগাদ করা হয়েছে' : 'স্ট্যাটাস হালনাগাদ করা হয়েছে');
      } else {
        await createAdminCollection({
          ...form,
          categoryId: form.categoryId || null,
          note: form.note?.trim() || undefined,
        });
        showToast('কালেকশন সংরক্ষণ করা হয়েছে');
      }
      setModalMode(null);
      setEditingItem(null);
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const canUpdateStatus = roleKey === 'super_admin' || roleKey === 'admin' || roleKey === 'manager';
  const canEditEverything = roleKey === 'super_admin';
  const rows = items.map((item) => ({
    id: item.id,
    tabValue: item.status,
    filterValues: { type: item.type, status: item.status },
    searchText: `${item.memberName} ${item.actorName ?? ''} ${transactionTypeLabel(item)} ${item.categoryName ?? ''} ${item.date}`,
    sortValues: [item.memberName, transactionTypeLabel(item), item.categoryName ?? '', item.actorName ?? '', item.amount, item.date, item.status],
    cells: [
      item.memberName,
      transactionTypeLabel(item),
      item.categoryName ?? '-',
      item.actorName ?? '-',
      <span key={`${item.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(item.amount)}</span>,
      item.date,
      <div key={`${item.id}-status`} className="flex flex-wrap items-center gap-2">
        <Badge variant={item.status === 'pending' ? 'warning' : item.status === 'rejected' ? 'danger' : 'success'}>
          {STATUS_LABEL[item.status]}
        </Badge>
        {canUpdateStatus && (
          <Button size="sm" variant="secondary" disabled={saving} onClick={() => openEditModal(item)}>
            <Pencil className="h-3.5 w-3.5" />সম্পাদনা
          </Button>
        )}
        {item.type === 'savings' && item.status === 'pending' && (
          <Button
            size="sm"
            variant="secondary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await receiveAdminSavingsDue(item.id);
                showToast('সঞ্চয়ের বকেয়া গ্রহণ করা হয়েছে');
                await onMutationSuccess?.();
              } catch (error) {
                showToast(getErrorMessage(error));
              } finally {
                setSaving(false);
              }
            }}
          >গ্রহণ করুন</Button>
        )}
      </div>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader
          title="সাম্প্রতিক সংগ্রহ"
          subtitle="প্রতিটি জমার অবস্থা"
          action={<Button onClick={openCreateModal}><Plus className="h-4 w-4" />নতুন কালেকশন</Button>}
        />
        <DataTable
          headers={['সদস্য', 'ধরণ', 'খাত', { header: 'রেকর্ড করেছেন', hideOnMobile: true }, 'পরিমাণ', 'তারিখ', 'স্ট্যাটাস']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'completed', label: 'সম্পন্ন' },
            { value: 'pending', label: 'অপেক্ষমাণ' },
          ]}
          filters={[
            {
              id: 'type',
              label: 'সব ধরণ',
              options: Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
          searchPlaceholder="সদস্য, খাত বা তারিখ..."
        />
      </Card>
      <AppModal
        open={modalMode !== null}
        title={modalMode === 'create' ? 'নতুন কালেকশন যোগ করুন' : canEditEverything ? 'এন্ট্রি সম্পাদনা করুন' : 'এন্ট্রির স্ট্যাটাস হালনাগাদ করুন'}
        onClose={() => { setModalMode(null); setEditingItem(null); }}
        footer={(
          <>
            <Button variant="secondary" onClick={() => { setModalMode(null); setEditingItem(null); }} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveCollection()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : modalMode === 'edit' ? 'হালনাগাদ করুন' : 'সংরক্ষণ'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(modalMode === 'create' || canEditEverything) && <>
            <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">সদস্য</span><select value={form.subjectUserId || ''} onChange={(event) => updateForm('subjectUserId', event.target.value ? Number(event.target.value) : 0)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">সদস্য নির্বাচন করুন</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name} ({member.phone})</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">খাত</span><select value={form.categoryId ?? ''} onChange={(event) => updateForm('categoryId', event.target.value ? Number(event.target.value) : null)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">খাত নির্বাচন করুন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ধরণ</span><select value={form.txType} onChange={(event) => updateForm('txType', Number(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">{Object.entries(TYPE_LABEL).map(([value, label]) => <option key={value} value={TX_TYPE_VALUE[value]}>{label}</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পরিমাণ</span><Input type="number" value={form.amountMinor || ''} onChange={(event) => updateForm('amountMinor', Number(event.target.value))} placeholder="৳" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={form.occurredOn ?? ''} onChange={(event) => updateForm('occurredOn', event.target.value)} /></label>
          </>}
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">স্ট্যাটাস</span><select value={form.status} onChange={(event) => updateForm('status', Number(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="1">সম্পন্ন</option><option value="0">অপেক্ষমাণ</option><option value="2">বাতিল</option></select></label>
          {(modalMode === 'create' || canEditEverything) && <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">নোট</span><textarea value={form.note ?? ''} onChange={(event) => updateForm('note', event.target.value)} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="প্রয়োজনে নোট লিখুন..." /></label>}
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function FundCollectionBottomSection({ summary = FUND_TYPE_SUMMARY }: FundCollectionBottomSectionProps) {
  const rows = summary.map((item) => [TYPE_LABEL[item.type] ?? item.type, formatCurrencyBn(item.amount)]);

  return (
    <section>
      <Card>
        <SectionHeader title="ধরণভিত্তিক সংগ্রহ" subtitle="কোন ধরণ থেকে কত ফান্ড এসেছে" />
        <DataTable headers={['ধরণ', 'মোট পরিমাণ']} rows={rows} />
      </Card>
    </section>
  );
}
