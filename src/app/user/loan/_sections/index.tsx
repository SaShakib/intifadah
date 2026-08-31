'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { USER_LOAN_HISTORY_ROWS, USER_LOAN_METRICS, USER_LOAN_SCHEDULE_ROWS } from './constants';
import { createUserLoanRepayment, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { UserLoanMetric } from './types';
import type { Loan } from '@/types';

function historyStatusBadge(status: string) {
  if (status === 'active') return <Badge variant="info">সক্রিয়</Badge>;
  if (status === 'pending_approval') return <Badge variant="warning">অপেক্ষমাণ</Badge>;
  if (status === 'overdue') return <Badge variant="danger">ওভারডিউ</Badge>;
  return <Badge variant="success">পরিশোধিত</Badge>;
}

interface LoanTopSectionProps {
  metrics?: UserLoanMetric[];
}

interface LoanMiddleSectionProps {
  scheduleRows?: typeof USER_LOAN_SCHEDULE_ROWS;
  activeLoans?: Loan[];
  onMutationSuccess?: () => void | Promise<void>;
}

interface LoanBottomSectionProps {
  loanHistory?: typeof USER_LOAN_HISTORY_ROWS;
}

export function LoanTopSection({ metrics = USER_LOAN_METRICS }: LoanTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ঋণ সারাংশ" subtitle="আপনার বর্তমান ঋণ ও কিস্তির অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_REPAYMENT_FORM = {
  loanId: '',
  amountMinor: '',
  paidOn: new Date().toISOString().slice(0, 10),
  note: '',
};

export function LoanMiddleSection({ scheduleRows = USER_LOAN_SCHEDULE_ROWS, activeLoans = [], onMutationSuccess }: LoanMiddleSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_REPAYMENT_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const openRepaymentModal = (loanId = '') => {
    setForm({ ...DEFAULT_REPAYMENT_FORM, loanId });
    setModalOpen(true);
  };
  const saveRepayment = async () => {
    setSaving(true);
    try {
      await createUserLoanRepayment(form.loanId, {
        amountMinor: Number(form.amountMinor),
        paidOn: form.paidOn,
        note: form.note.trim() || undefined,
      });
      setModalOpen(false);
      showToast('পরিশোধের তথ্য জমা হয়েছে');
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
        <SectionHeader
          title="কিস্তির সময়সূচি"
          subtitle="পরবর্তী কিস্তি তালিকা"
          action={<Button onClick={() => openRepaymentModal()}>পরিশোধ করুন</Button>}
        />
        <DataTable
          headers={['তারিখ', 'পরিমাণ', 'স্ট্যাটাস', { header: 'কার্যক্রম', align: 'right', sortable: false }]}
          rows={scheduleRows.map((row, index) => ({
            id: activeLoans[index]?.id ?? `schedule-${index}`,
            cells: [
              row[0],
              row[1],
              row[2],
              <div key={`repay-${index}`} className="flex justify-end"><Button size="sm" variant="secondary" onClick={() => openRepaymentModal(activeLoans[index]?.id ?? '')}>পরিশোধ</Button></div>,
            ],
          }))}
        />
      </Card>
      <AppModal
        open={modalOpen}
        title="ঋণ পরিশোধ করুন"
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveRepayment()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'জমা হচ্ছে...' : 'জমা দিন'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">ঋণ</span>
            <select value={form.loanId} onChange={(event) => setForm((current) => ({ ...current, loanId: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">
              <option value="">ঋণ নির্বাচন করুন</option>
              {activeLoans.map((loan) => (
                <option key={loan.id} value={loan.id}>{loan.purpose} - {formatCurrencyBn(Math.max(0, loan.amount - loan.totalRepaid))} বাকি</option>
              ))}
            </select>
          </label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পরিমাণ</span><Input type="number" value={form.amountMinor} onChange={(event) => setForm((current) => ({ ...current, amountMinor: event.target.value }))} placeholder="৳" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={form.paidOn} onChange={(event) => setForm((current) => ({ ...current, paidOn: event.target.value }))} /></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">নোট</span><textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="পরিশোধের বিবরণ..." /></label>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function LoanBottomSection({ loanHistory = USER_LOAN_HISTORY_ROWS }: LoanBottomSectionProps) {
  const rows = loanHistory.map((loan) => ({
    id: `${loan.purpose}-${loan.dueDate}`,
    tabValue: loan.status,
    filterValues: { status: loan.status },
    searchText: `${loan.purpose} ${loan.dueDate}`,
    sortValues: [loan.purpose, loan.amount, loan.repaid, loan.dueDate, loan.status],
    cells: [
      loan.purpose,
      <span key={`${loan.purpose}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(loan.amount)}</span>,
      <span key={`${loan.purpose}-repaid`} className="font-semibold tabular-nums text-success">{formatCurrencyBn(loan.repaid)}</span>,
      loan.dueDate,
      historyStatusBadge(loan.status),
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="ঋণ ইতিহাস" subtitle="পূর্ববর্তী ও চলমান ঋণসমূহ" />
        <DataTable
          headers={['উদ্দেশ্য', 'ঋণের পরিমাণ', 'পরিশোধ', 'শেষ তারিখ', 'স্ট্যাটাস']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'active', label: 'সক্রিয়' },
            { value: 'pending_approval', label: 'অপেক্ষমাণ' },
            { value: 'overdue', label: 'ওভারডিউ', tone: 'danger' },
            { value: 'repaid', label: 'পরিশোধিত' },
          ]}
          searchPlaceholder="উদ্দেশ্য বা তারিখ..."
        />
      </Card>
    </section>
  );
}
