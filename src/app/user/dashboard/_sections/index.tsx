'use client';

import { useState } from 'react';
import { HandCoins, HeartHandshake, Plus, Save, WalletCards } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { USER_DASHBOARD_ALERTS, USER_DASHBOARD_METRICS, USER_DASHBOARD_TRANSACTIONS } from './constants';
import { createUserLoan, createUserLoanRepayment, createUserTransaction, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { UserDashboardMetric } from './types';
import type { Category } from '@/types';

interface UserDashboardTopSectionProps {
  metrics?: UserDashboardMetric[];
}

interface UserDashboardMiddleSectionProps {
  alerts?: string[];
  categories?: Category[];
  onMutationSuccess?: () => void | Promise<void>;
}

interface UserDashboardBottomSectionProps {
  transactions?: typeof USER_DASHBOARD_TRANSACTIONS;
}

export function UserDashboardTopSection({ metrics = USER_DASHBOARD_METRICS }: UserDashboardTopSectionProps) {
  return (
    <section>
      <SectionHeader title="আর্থিক সারাংশ" subtitle="আপনার অ্যাকাউন্টের দ্রুত অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_ACTION_FORM = {
  categoryId: '',
  loanId: '',
  amountMinor: '',
  occurredOn: new Date().toISOString().slice(0, 10),
  dueOn: new Date().toISOString().slice(0, 10),
  termDays: '90',
  note: '',
};

export function UserDashboardMiddleSection({ alerts = USER_DASHBOARD_ALERTS, categories = [], onMutationSuccess }: UserDashboardMiddleSectionProps) {
  const [modal, setModal] = useState<'donate' | 'savings' | 'loan' | 'pay' | null>(null);
  const [form, setForm] = useState(DEFAULT_ACTION_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setModal(null);
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const openAction = (nextModal: typeof modal) => {
    setForm(DEFAULT_ACTION_FORM);
    setModal(nextModal);
  };
  const saveAction = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const amountMinor = Number(form.amountMinor);
      const categoryId = form.categoryId ? Number(form.categoryId) : null;
      if (modal === 'loan') {
        await createUserLoan({
          categoryId: Number(form.categoryId),
          principalMinor: amountMinor,
          purpose: form.note.trim() || 'ঋণের আবেদন',
          requestedOn: form.occurredOn,
          dueOn: form.dueOn,
          termDays: form.termDays ? Number(form.termDays) : null,
        });
      } else if (modal === 'pay') {
        await createUserLoanRepayment(form.loanId, {
          amountMinor,
          paidOn: form.occurredOn,
          note: form.note.trim() || undefined,
        });
      } else {
        await createUserTransaction({
          txType: modal === 'donate' ? 2 : 3,
          categoryId,
          amountMinor,
          occurredOn: form.occurredOn,
          note: form.note.trim() || undefined,
        });
      }
      showToast('রিকোয়েস্ট সফলভাবে জমা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const categoryOptions = categories.filter((category) => {
    if (modal === 'donate') return category.type === 'donation';
    if (modal === 'savings') return category.type === 'savings';
    if (modal === 'loan') return category.type === 'loan';
    return true;
  });

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={() => openAction('donate')} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <HeartHandshake className="h-6 w-6 text-brand" />
          <span><strong className="block text-sm text-fg">দান করুন</strong><span className="text-xs text-muted">খাত নির্বাচন করে দান</span></span>
        </button>
        <button type="button" onClick={() => openAction('savings')} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <WalletCards className="h-6 w-6 text-success" />
          <span><strong className="block text-sm text-fg">সঞ্চয় করুন</strong><span className="text-xs text-muted">মাসিক বা বিশেষ সঞ্চয়</span></span>
        </button>
        <button type="button" onClick={() => openAction('loan')} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <HandCoins className="h-6 w-6 text-info" />
          <span><strong className="block text-sm text-fg">ঋণ চাই</strong><span className="text-xs text-muted">কর্যে হাসানাঃ আবেদন</span></span>
        </button>
        <button type="button" onClick={() => openAction('pay')} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Plus className="h-6 w-6 text-warning" />
          <span><strong className="block text-sm text-fg">ঋণ পরিশোধ</strong><span className="text-xs text-muted">কিস্তি বা আংশিক ফেরত</span></span>
        </button>
      </div>

      <Card>
        <SectionHeader title="স্মরণ করিয়ে দেওয়া" subtitle="এই সপ্তাহের গুরুত্বপূর্ণ তথ্য" />
        <ul className="space-y-2 text-sm text-fg-2">
          {alerts.map((alert) => (
            <li key={alert} className="rounded-xl border border-border bg-surface-2 px-3 py-2">
              {alert}
            </li>
          ))}
        </ul>
      </Card>
      <AppModal
        open={modal !== null}
        title={modal === 'donate' ? 'দান করুন' : modal === 'savings' ? 'সঞ্চয় করুন' : modal === 'loan' ? 'ঋণের আবেদন' : 'ঋণ পরিশোধ'}
        onClose={() => setModal(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModal(null)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveAction()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'জমা হচ্ছে...' : 'জমা দিন'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {modal === 'pay' && <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">ঋণ আইডি</span><Input value={form.loanId} onChange={(event) => setForm((current) => ({ ...current, loanId: event.target.value }))} placeholder="ঋণ আইডি" /></label>}
          {modal !== 'pay' && <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">খাত</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">খাত নির্বাচন করুন</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পরিমাণ</span><Input type="number" value={form.amountMinor} onChange={(event) => setForm((current) => ({ ...current, amountMinor: event.target.value }))} placeholder="৳" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={form.occurredOn} onChange={(event) => setForm((current) => ({ ...current, occurredOn: event.target.value }))} /></label>
          {modal === 'loan' && <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ফেরতের তারিখ</span><Input type="date" value={form.dueOn} onChange={(event) => setForm((current) => ({ ...current, dueOn: event.target.value }))} /></label>}
          {modal === 'loan' && <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">মেয়াদ (দিন)</span><Input type="number" value={form.termDays} onChange={(event) => setForm((current) => ({ ...current, termDays: event.target.value }))} placeholder="90" /></label>}
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">নোট</span><textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="প্রয়োজনে বিস্তারিত লিখুন..." /></label>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function UserDashboardBottomSection({ transactions = USER_DASHBOARD_TRANSACTIONS }: UserDashboardBottomSectionProps) {
  const rows = transactions.map((transaction) => ({
    id: transaction.id,
    tabValue: transaction.status,
    searchText: `${transaction.date} ${transaction.categoryName ?? ''}`,
    sortValues: [transaction.date, transaction.categoryName ?? '', transaction.amount, transaction.status],
    cells: [
      transaction.date,
      transaction.categoryName ?? '-',
      <span key={`${transaction.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(transaction.amount)}</span>,
      <Badge key={transaction.id} variant={transaction.status === 'pending' ? 'warning' : 'success'}>
        {transaction.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}
      </Badge>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক লেনদেন" subtitle="আপনার সর্বশেষ ট্রানজেকশন" />
        <DataTable
          headers={['তারিখ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'completed', label: 'সম্পন্ন' },
            { value: 'pending', label: 'অপেক্ষমাণ' },
          ]}
          searchPlaceholder="খাত বা তারিখ..."
        />
      </Card>
    </section>
  );
}
