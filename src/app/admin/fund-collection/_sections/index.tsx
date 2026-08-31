'use client';

import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { FUND_COLLECTION_ROWS, FUND_METRICS, FUND_TYPE_SUMMARY } from './constants';
import { createAdminCollection, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { FundMetric } from './types';
import type { CollectionInput } from '@/lib/api';
import type { Category, Member } from '@/types';

const TYPE_LABEL: Record<string, string> = {
  collection: 'কালেকশন',
  donation: 'দান',
  savings: 'সঞ্চয়',
};

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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
  };
  const saveCollection = async () => {
    setSaving(true);
    try {
      await createAdminCollection({
        ...form,
        categoryId: form.categoryId || null,
        note: form.note?.trim() || undefined,
      });
      setModalOpen(false);
      showToast('কালেকশন সংরক্ষণ করা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const rows = items.map((item) => ({
    id: item.id,
    tabValue: item.status,
    filterValues: { type: item.type, status: item.status },
    searchText: `${item.memberName} ${TYPE_LABEL[item.type] ?? item.type} ${item.categoryName ?? ''} ${item.date}`,
    sortValues: [item.memberName, TYPE_LABEL[item.type] ?? item.type, item.categoryName ?? '', item.amount, item.date, item.status],
    cells: [
      item.memberName,
      TYPE_LABEL[item.type] ?? item.type,
      item.categoryName ?? '-',
      <span key={`${item.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(item.amount)}</span>,
      item.date,
      <Badge key={item.id} variant={item.status === 'pending' ? 'warning' : 'success'}>
        {item.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}
      </Badge>,
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
          headers={['সদস্য', 'ধরণ', 'খাত', 'পরিমাণ', 'তারিখ', 'স্ট্যাটাস']}
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
        open={modalOpen}
        title="নতুন কালেকশন যোগ করুন"
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveCollection()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">সদস্য</span><select value={form.subjectUserId || ''} onChange={(event) => updateForm('subjectUserId', event.target.value ? Number(event.target.value) : 0)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">সদস্য নির্বাচন করুন</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name} ({member.phone})</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">খাত</span><select value={form.categoryId ?? ''} onChange={(event) => updateForm('categoryId', event.target.value ? Number(event.target.value) : null)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">খাত নির্বাচন করুন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ধরণ</span><select value={form.txType} onChange={(event) => updateForm('txType', Number(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">{Object.entries(TYPE_LABEL).map(([value, label]) => <option key={value} value={TX_TYPE_VALUE[value]}>{label}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পরিমাণ</span><Input type="number" value={form.amountMinor || ''} onChange={(event) => updateForm('amountMinor', Number(event.target.value))} placeholder="৳" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={form.occurredOn ?? ''} onChange={(event) => updateForm('occurredOn', event.target.value)} /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">স্ট্যাটাস</span><select value={form.status} onChange={(event) => updateForm('status', Number(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="1">সম্পন্ন</option><option value="0">অপেক্ষমাণ</option></select></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">নোট</span><textarea value={form.note ?? ''} onChange={(event) => updateForm('note', event.target.value)} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="প্রয়োজনে নোট লিখুন..." /></label>
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
