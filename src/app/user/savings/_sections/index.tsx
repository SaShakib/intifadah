'use client';

import { useState } from 'react';
import { Save, WalletCards } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { SAVINGS_HISTORY_ROWS, SAVINGS_METRICS, SAVINGS_PLAN_ROWS } from './constants';
import { createUserTransaction, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { SavingsMetric } from './types';
import type { Category } from '@/types';

interface SavingsTopSectionProps {
  metrics?: SavingsMetric[];
}

interface SavingsBottomSectionProps {
  history?: typeof SAVINGS_HISTORY_ROWS;
}

interface SavingsMiddleSectionProps {
  categories?: Category[];
  onMutationSuccess?: () => void | Promise<void>;
}

export function SavingsTopSection({ metrics = SAVINGS_METRICS }: SavingsTopSectionProps) {
  return (
    <section>
      <SectionHeader title="সঞ্চয় সারাংশ" subtitle="আপনার সঞ্চয়ের বর্তমান অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_SAVINGS_FORM = {
  categoryId: '',
  amountMinor: '',
  occurredOn: new Date().toISOString().slice(0, 10),
  note: '',
};

export function SavingsMiddleSection({ categories = [], onMutationSuccess }: SavingsMiddleSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_SAVINGS_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const planRows = categories.length
    ? categories.map((category) => ({
      id: category.id,
      searchText: `${category.name} ${category.description ?? ''}`,
      sortValues: [category.name, category.amount ?? 0, category.recurrence],
      cells: [
        category.name,
        category.isVariable ? 'পরিবর্তনশীল' : category.amount ? formatCurrencyBn(category.amount) : '-',
        category.recurrence,
        <div key={`${category.id}-action`} className="flex justify-end">
          <Button size="sm" onClick={() => {
            setForm({ ...DEFAULT_SAVINGS_FORM, categoryId: category.id });
            setModalOpen(true);
          }}><WalletCards className="h-3.5 w-3.5" />জমা</Button>
        </div>,
      ],
    }))
    : SAVINGS_PLAN_ROWS.map((row, index) => ({
      id: `plan-${index}`,
      cells: [...row, ''],
    }));
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const saveSavings = async () => {
    setSaving(true);
    try {
      await createUserTransaction({
        txType: 3,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        amountMinor: Number(form.amountMinor),
        occurredOn: form.occurredOn,
        note: form.note.trim() || undefined,
      });
      setModalOpen(false);
      showToast('সঞ্চয় রিকোয়েস্ট জমা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <Card>
        <SectionHeader title="সঞ্চয় পরিকল্পনা" subtitle="নির্ধারিত খাতসমূহ" action={<Button onClick={() => {
          setForm(DEFAULT_SAVINGS_FORM);
          setModalOpen(true);
        }}><WalletCards className="h-4 w-4" />সঞ্চয় করুন</Button>} />
        <DataTable headers={['খাত', 'প্রস্তাবিত পরিমাণ', 'সময়সূচি', { header: 'কার্যক্রম', align: 'right', sortable: false }]} rows={planRows} />
      </Card>
      <AppModal
        open={modalOpen}
        title="সঞ্চয় করুন"
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveSavings()} disabled={saving || !form.amountMinor}><Save className="h-4 w-4" />{saving ? 'জমা হচ্ছে...' : 'জমা দিন'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">খাত</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">খাত নির্বাচন করুন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পরিমাণ</span><Input type="number" value={form.amountMinor} onChange={(event) => setForm((current) => ({ ...current, amountMinor: event.target.value }))} placeholder="৳" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={form.occurredOn} onChange={(event) => setForm((current) => ({ ...current, occurredOn: event.target.value }))} /></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">নোট</span><textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="প্রয়োজনে বিস্তারিত লিখুন..." /></label>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function SavingsBottomSection({ history = SAVINGS_HISTORY_ROWS }: SavingsBottomSectionProps) {
  const rows = history.map((transaction) => ({
    id: transaction.id,
    searchText: `${transaction.date} ${transaction.categoryName ?? ''}`,
    sortValues: [transaction.date, transaction.categoryName ?? '', transaction.amount, 'সম্পন্ন'],
    cells: [
      transaction.date,
      transaction.categoryName ?? '-',
      <span key={`${transaction.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(transaction.amount)}</span>,
      'সম্পন্ন',
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="সঞ্চয় ইতিহাস" subtitle="আপনার সম্পন্ন সঞ্চয় জমা" />
        <DataTable headers={['তারিখ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']} rows={rows} searchPlaceholder="খাত বা তারিখ..." />
      </Card>
    </section>
  );
}
