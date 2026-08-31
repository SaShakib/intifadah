'use client';

import { useState } from 'react';
import { HeartHandshake, Save } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { DONATION_CATEGORY_ROWS, DONATION_HISTORY_ROWS, DONATION_METRICS } from './constants';
import { createUserTransaction, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { DonationMetric } from './types';
import type { Category } from '@/types';

interface DonationsTopSectionProps {
  metrics?: DonationMetric[];
}

interface DonationsMiddleSectionProps {
  categories?: Category[];
  onMutationSuccess?: () => void | Promise<void>;
}

interface DonationsBottomSectionProps {
  history?: typeof DONATION_HISTORY_ROWS;
}

export function DonationsTopSection({ metrics = DONATION_METRICS }: DonationsTopSectionProps) {
  return (
    <section>
      <SectionHeader title="দান সারাংশ" subtitle="আপনার দানের অগ্রগতি" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_DONATION_FORM = {
  categoryId: '',
  amountMinor: '',
  occurredOn: new Date().toISOString().slice(0, 10),
  note: '',
};

export function DonationsMiddleSection({ categories = DONATION_CATEGORY_ROWS, onMutationSuccess }: DonationsMiddleSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_DONATION_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const openDonation = (categoryId = '') => {
    setForm({ ...DEFAULT_DONATION_FORM, categoryId });
    setModalOpen(true);
  };
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const saveDonation = async () => {
    setSaving(true);
    try {
      await createUserTransaction({
        txType: 2,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        amountMinor: Number(form.amountMinor),
        occurredOn: form.occurredOn,
        note: form.note.trim() || undefined,
      });
      setModalOpen(false);
      showToast('দান রিকোয়েস্ট জমা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const rows = categories.map((category) => ({
    id: category.id,
    searchText: `${category.name} ${category.description ?? ''}`,
    sortValues: [category.name, category.description ?? '', category.amount ?? 0],
    cells: [
      category.name,
      category.description ?? '-',
      category.isVariable ? 'পরিবর্তনশীল' : category.amount ? formatCurrencyBn(category.amount) : '-',
      <div key={`${category.id}-action`} className="flex justify-end">
        <Button size="sm" onClick={() => openDonation(category.id)}><HeartHandshake className="h-3.5 w-3.5" />দান</Button>
      </div>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="দান খাতসমূহ" subtitle="যেসব খাতে আপনি দান করতে পারবেন" action={<Button onClick={() => openDonation()}><HeartHandshake className="h-4 w-4" />দান করুন</Button>} />
        <DataTable headers={['খাত', 'বিবরণ', 'প্রস্তাবিত পরিমাণ', { header: 'কার্যক্রম', align: 'right', sortable: false }]} rows={rows} searchPlaceholder="খাত বা বিবরণ..." />
      </Card>
      <AppModal
        open={modalOpen}
        title="দান করুন"
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveDonation()} disabled={saving || !form.amountMinor}><Save className="h-4 w-4" />{saving ? 'জমা হচ্ছে...' : 'জমা দিন'}</Button>
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

export function DonationsBottomSection({ history = DONATION_HISTORY_ROWS }: DonationsBottomSectionProps) {
  const rows = history.map((item) => ({
    id: item.id,
    searchText: `${item.date} ${item.categoryName ?? ''}`,
    sortValues: [item.date, item.categoryName ?? '', item.amount, 'সম্পন্ন'],
    cells: [item.date, item.categoryName ?? '-', <span key={`${item.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(item.amount)}</span>, 'সম্পন্ন'],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="দান ইতিহাস" subtitle="আপনার সম্পন্ন দানসমূহ" />
        <DataTable headers={['তারিখ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']} rows={rows} searchPlaceholder="খাত বা তারিখ..." />
      </Card>
    </section>
  );
}
