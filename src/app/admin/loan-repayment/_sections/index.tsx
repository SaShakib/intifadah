'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Save } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { REPAYMENT_METRICS, REPAYMENT_ROWS } from './constants';
import { createAdminLoanRepayment, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { RepaymentMetric } from './types';
import type { LoanRepaymentInput } from '@/lib/api';

interface LoanRepaymentTopSectionProps {
  metrics?: RepaymentMetric[];
}

interface LoanRepaymentMiddleSectionProps {
  rows?: typeof REPAYMENT_ROWS;
  onMutationSuccess?: () => void | Promise<void>;
}

export function LoanRepaymentTopSection({ metrics = REPAYMENT_METRICS }: LoanRepaymentTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ঋণ ফেরত সারাংশ" subtitle="ফেরত, বকেয়া এবং কিস্তির অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_REPAYMENT_FORM: LoanRepaymentInput & { loanId: string } = {
  loanId: '',
  amountMinor: 0,
  paidOn: new Date().toISOString().slice(0, 10),
  note: '',
};

export function LoanRepaymentMiddleSection({ rows: repayments = REPAYMENT_ROWS, onMutationSuccess }: LoanRepaymentMiddleSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_REPAYMENT_FORM);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const updateForm = <K extends keyof typeof DEFAULT_REPAYMENT_FORM>(key: K, value: (typeof DEFAULT_REPAYMENT_FORM)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const openRepaymentModal = (loanId?: string) => {
    setForm({ ...DEFAULT_REPAYMENT_FORM, loanId: loanId ?? '' });
    setModalOpen(true);
  };
  const saveRepayment = async () => {
    setSaving(true);
    try {
      await createAdminLoanRepayment(form.loanId, {
        amountMinor: form.amountMinor,
        paidOn: form.paidOn,
        note: form.note?.trim() || undefined,
      });
      setModalOpen(false);
      showToast('ঋণ ফেরত এন্ট্রি সংরক্ষণ করা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const rows = repayments.map((loan) => {
    const outstanding = loan.amount - loan.totalRepaid;
    return {
      id: loan.id,
      tabValue: loan.status === 'overdue' ? 'overdue' : 'active',
      filterValues: { status: loan.status === 'overdue' ? 'overdue' : 'active' },
      searchText: `${loan.borrowerName} ${loan.purpose} ${loan.dueDate}`,
      sortValues: [loan.borrowerName, loan.amount, loan.totalRepaid, outstanding, loan.installmentAmount ?? 0, loan.status, ''],
      cells: [
        loan.borrowerName,
        <span key={`${loan.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(loan.amount)}</span>,
        <span key={`${loan.id}-repaid`} className="font-semibold tabular-nums text-success">{formatCurrencyBn(loan.totalRepaid)}</span>,
        <span key={`${loan.id}-outstanding`} className="font-semibold tabular-nums text-warning">{formatCurrencyBn(outstanding)}</span>,
        formatCurrencyBn(loan.installmentAmount ?? 0),
        loan.status === 'overdue' ? <Badge key={loan.id} variant="danger">ওভারডিউ</Badge> : <Badge key={loan.id} variant="info">চলমান</Badge>,
        <div key={`${loan.id}-actions`} className="flex justify-end gap-1">
          <Button size="sm" variant="secondary" onClick={() => showToast('SMS পাঠানো হয়েছে')}><MessageSquare className="h-3.5 w-3.5" />SMS</Button>
          <Button size="sm" variant={loan.status === 'overdue' ? 'danger' : 'primary'} onClick={() => openRepaymentModal(loan.id)}>ফেরত নিন</Button>
        </div>,
      ],
    };
  });

  return (
    <section>
      <Card>
        <SectionHeader
          title="কিস্তি ট্র্যাকার"
          subtitle="সদস্যভিত্তিক ফেরত অগ্রগতি"
          action={<Button onClick={() => openRepaymentModal()}><Plus className="h-4 w-4" />নতুন ফেরত</Button>}
        />
        <DataTable
          headers={[
            'সদস্য',
            'মোট ঋণ',
            'ফেরত',
            'বকেয়া',
            'মাসিক কিস্তি',
            'স্ট্যাটাস',
            { header: 'কার্যক্রম', align: 'right', sortable: false },
          ]}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'active', label: 'চলমান' },
            { value: 'overdue', label: 'ওভারডিউ', tone: 'danger' },
          ]}
          searchPlaceholder="সদস্য, উদ্দেশ্য বা তারিখ..."
        />
      </Card>
      <AppModal
        open={modalOpen}
        title="ঋণ ফেরত গ্রহণ"
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveRepayment()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">ঋণ</span>
            <select value={form.loanId} onChange={(event) => updateForm('loanId', event.target.value)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">
              <option value="">ঋণ নির্বাচন করুন</option>
              {repayments.map((loan) => (
                <option key={loan.id} value={loan.id}>{loan.borrowerName} - {loan.purpose} ({formatCurrencyBn(loan.amount - loan.totalRepaid)} বাকি)</option>
              ))}
            </select>
          </label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ফেরত পরিমাণ</span><Input type="number" value={form.amountMinor || ''} onChange={(event) => updateForm('amountMinor', Number(event.target.value))} placeholder="৳" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={form.paidOn ?? ''} onChange={(event) => updateForm('paidOn', event.target.value)} /></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">নোট</span><textarea value={form.note ?? ''} onChange={(event) => updateForm('note', event.target.value)} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="ফেরত সংক্রান্ত নোট..." /></label>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function LoanRepaymentBottomSection() {
  return (
    <section>
      <Card>
        <SectionHeader title="ফলোআপ নির্দেশনা" subtitle="টিম অপারেশনের জন্য প্রস্তাবিত ধাপ" />
        <ul className="space-y-2 text-sm text-fg-2">
          <li>১. ওভারডিউ ঋণের জন্য ৭ দিনের মধ্যে রিমাইন্ডার পাঠান।</li>
          <li>২. কিস্তি ভেঙে দেওয়ার অনুরোধগুলো সাপ্তাহিক সভায় অনুমোদন করুন।</li>
          <li>৩. ফেরত সংগ্রহের সারাংশ মাস শেষে রিপোর্টে যুক্ত করুন।</li>
        </ul>
      </Card>
    </section>
  );
}
