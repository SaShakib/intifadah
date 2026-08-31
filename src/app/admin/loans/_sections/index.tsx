'use client';

import { useMemo, useState } from 'react';
import { Check, MoreHorizontal, PhoneCall, Plus, Trash2, X } from 'lucide-react';
import { Avatar } from '@/components/base/Avatar';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppDrawer, AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { ALL_LOAN_ROWS, LOAN_METRICS, OVERDUE_LOAN_ROWS } from './constants';
import { approveAdminLoan, createAdminLoan, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Category, Loan, Member } from '@/types';
import type { LoanInput } from '@/lib/api';
import type { LoanMetric } from './types';

function statusLabel(status: string) {
  if (status === 'active') return 'সক্রিয়';
  if (status === 'pending_approval') return 'অনুমোদন প্রয়োজন';
  if (status === 'overdue') return 'মেয়াদোত্তীর্ণ';
  return 'সম্পন্ন';
}

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="info">সক্রিয়</Badge>;
  if (status === 'pending_approval') return <Badge variant="warning">অনুমোদন প্রয়োজন</Badge>;
  if (status === 'overdue') return <Badge variant="danger">মেয়াদোত্তীর্ণ</Badge>;
  return <Badge variant="muted">সম্পন্ন</Badge>;
}

function ProgressCell({ loan }: { loan: Loan }) {
  const percent = Math.min(100, Math.round((loan.totalRepaid / Math.max(1, loan.amount)) * 100));
  const color = loan.status === 'repaid' ? 'bg-success' : loan.status === 'overdue' ? 'bg-danger' : 'bg-brand-mid';

  if (!loan.totalRepaid) {
    return <span className="text-muted">-</span>;
  }

  return (
    <div className="min-w-24 space-y-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-[11px] text-muted">{percent}% পরিশোধিত</span>
    </div>
  );
}

function LoanDrawer({ loan, onClose }: { loan: Loan | null; onClose: () => void }) {
  if (!loan) return null;

  const remaining = Math.max(0, loan.amount - loan.totalRepaid);
  const percent = Math.min(100, Math.round((loan.totalRepaid / Math.max(1, loan.amount)) * 100));

  return (
    <AppDrawer
      open
      title="ঋণের বিস্তারিত"
      onClose={onClose}
      footer={(
        <>
          <Button size="sm"><Plus className="h-4 w-4" />ফেরত এন্ট্রি</Button>
          <Button size="sm" variant="secondary">সম্পাদনা</Button>
          <Button size="sm" variant="danger"><Trash2 className="h-4 w-4" />মুছুন</Button>
        </>
      )}
    >
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-4">
            <Avatar initials={loan.borrowerInitials} size="lg" />
            <div>
              <h3 className="font-bold text-fg">{loan.borrowerName}</h3>
              <p className="mt-1 text-xs text-muted">সদস্য #{loan.borrowerId}</p>
              <div className="mt-2">{statusBadge(loan.status)}</div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-muted">ঋণের তথ্য</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted">মোট পরিমাণ</span>
                <p className="text-lg font-bold text-brand">{formatCurrencyBn(loan.amount)}</p>
              </div>
              <div>
                <span className="text-xs text-muted">বাকি</span>
                <p className="text-lg font-bold text-warning">{remaining ? formatCurrencyBn(remaining) : '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted">উদ্দেশ্য / খাত</span>
                <p className="font-semibold text-fg">{loan.purpose}</p>
              </div>
              <div>
                <span className="text-xs text-muted">কিস্তি</span>
                <p className="font-semibold text-fg">{loan.installmentAmount ? formatCurrencyBn(loan.installmentAmount) : '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted">বিতরণের তারিখ</span>
                <p className="font-semibold text-fg">{loan.issueDate}</p>
              </div>
              <div>
                <span className="text-xs text-muted">ফেরতের তারিখ</span>
                <p className="font-semibold text-fg">{loan.dueDate}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-muted">পরিশোধের অগ্রগতি</p>
            <div className="mb-2 flex justify-between text-xs text-muted">
              <span>পরিশোধিত: <strong className="text-success">{formatCurrencyBn(loan.totalRepaid)}</strong></span>
              <span>বাকি: <strong className="text-warning">{remaining ? formatCurrencyBn(remaining) : '-'}</strong></span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-brand-mid" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1 text-right text-[11px] text-muted">{percent}% সম্পন্ন</p>
          </div>
        </div>
    </AppDrawer>
  );
}

function NewLoanModal({
  form,
  members,
  categories,
  open,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  form: LoanInput;
  members: Member[];
  categories: Category[];
  open: boolean;
  saving: boolean;
  onChange: <K extends keyof LoanInput>(key: K, value: LoanInput[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  return (
    <AppModal
      open
      title="নতুন ঋণ যোগ করুন"
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>বাতিল</Button>
          <Button onClick={onSubmit} disabled={saving}><Plus className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : 'ঋণ যোগ করুন'}</Button>
        </>
      )}
    >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">ঋণগ্রহীতা</span>
            <select value={form.borrowerUserId || ''} onChange={(event) => onChange('borrowerUserId', event.target.value ? Number(event.target.value) : 0)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-fg outline-none focus:border-brand focus:ring-2 focus:ring-brand-light">
              <option value="">সদস্য নির্বাচন করুন</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name} ({member.phone})</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">ঋণের পরিমাণ (৳)</span>
            <Input type="number" value={form.principalMinor || ''} onChange={(event) => onChange('principalMinor', Number(event.target.value))} placeholder="যেমন: 15000" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">খাত</span>
            <select value={form.categoryId || ''} onChange={(event) => onChange('categoryId', event.target.value ? Number(event.target.value) : 0)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-fg outline-none focus:border-brand focus:ring-2 focus:ring-brand-light">
              <option value="">ঋণ খাত নির্বাচন করুন</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">আবেদনের তারিখ</span>
            <Input type="date" value={form.requestedOn ?? ''} onChange={(event) => onChange('requestedOn', event.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">ফেরতের তারিখ</span>
            <Input type="date" value={form.dueOn} onChange={(event) => onChange('dueOn', event.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">মেয়াদ (দিন)</span>
            <Input type="number" value={form.termDays ?? ''} onChange={(event) => onChange('termDays', event.target.value ? Number(event.target.value) : null)} placeholder="যেমন: 90" />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">উদ্দেশ্য / বিবরণ</span>
            <textarea value={form.purpose} onChange={(event) => onChange('purpose', event.target.value)} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="ঋণের উদ্দেশ্য সংক্ষেপে লিখুন..." />
          </label>
        </div>
    </AppModal>
  );
}

interface LoansTopSectionProps {
  metrics?: LoanMetric[];
}

interface LoansMiddleSectionProps {
  loans?: Loan[];
  members?: Member[];
  categories?: Category[];
  onMutationSuccess?: () => void | Promise<void>;
}

interface LoansBottomSectionProps {
  overdueLoans?: Loan[];
}

export function LoansTopSection({ metrics = LOAN_METRICS }: LoansTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ঋণ সারাংশ" subtitle="ঋণ বিতরণ ও ঝুঁকির অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_LOAN_FORM: LoanInput = {
  borrowerUserId: 0,
  categoryId: 0,
  principalMinor: 0,
  purpose: '',
  requestedOn: new Date().toISOString().slice(0, 10),
  dueOn: new Date().toISOString().slice(0, 10),
  termDays: 90,
  status: 0,
};

export function LoansMiddleSection({ loans = ALL_LOAN_ROWS, members = [], categories = [], onMutationSuccess }: LoansMiddleSectionProps) {
  const [approvedLoanIds, setApprovedLoanIds] = useState<string[]>([]);
  const [rejectedLoanIds, setRejectedLoanIds] = useState<string[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loanForm, setLoanForm] = useState<LoanInput>(DEFAULT_LOAN_FORM);
  const [toast, setToast] = useState<string | null>(null);

  const tableLoans = useMemo(
    () =>
      loans
        .filter((loan) => !rejectedLoanIds.includes(loan.id))
        .map((loan) => approvedLoanIds.includes(loan.id) ? { ...loan, status: 'active' as const } : loan),
    [approvedLoanIds, loans, rejectedLoanIds],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const updateLoanForm = <K extends keyof LoanInput>(key: K, value: LoanInput[K]) => {
    setLoanForm((current) => ({ ...current, [key]: value }));
  };

  const openLoanModal = () => {
    setLoanForm(DEFAULT_LOAN_FORM);
    setModalOpen(true);
  };

  const approveLoan = async (loanId: string) => {
    setSaving(true);
    try {
      await approveAdminLoan(loanId, { issuedOn: new Date().toISOString().slice(0, 10) });
      setApprovedLoanIds((current) => current.includes(loanId) ? current : [...current, loanId]);
      showToast('ঋণ সফলভাবে অনুমোদন করা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const rejectLoan = (loanId: string) => {
    setRejectedLoanIds((current) => current.includes(loanId) ? current : [...current, loanId]);
    showToast('ঋণ প্রত্যাখ্যান করা হয়েছে');
  };

  const createLoan = async () => {
    setSaving(true);
    try {
      await createAdminLoan({ ...loanForm, purpose: loanForm.purpose.trim() });
      setModalOpen(false);
      showToast('ঋণ সফলভাবে যোগ করা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const purposeOptions = useMemo(
    () => Array.from(new Set(tableLoans.map((loan) => loan.purpose))).map((purpose) => ({ value: purpose, label: purpose })),
    [tableLoans],
  );
  const statusCounts = useMemo(
    () => ({
      all: tableLoans.length,
      pending_approval: tableLoans.filter((loan) => loan.status === 'pending_approval').length,
      active: tableLoans.filter((loan) => loan.status === 'active').length,
      repaid: tableLoans.filter((loan) => loan.status === 'repaid').length,
      overdue: tableLoans.filter((loan) => loan.status === 'overdue').length,
    }),
    [tableLoans],
  );

  const rows = tableLoans.map((loan) => {
    const remaining = Math.max(0, loan.amount - loan.totalRepaid);

    return {
      id: loan.id,
      tabValue: loan.status,
      filterValues: { purpose: loan.purpose, status: loan.status },
      searchText: `${loan.borrowerName} ${loan.borrowerId} ${loan.purpose} ${statusLabel(loan.status)}`,
      sortValues: [loan.borrowerName, loan.purpose, loan.amount, loan.issueDate, loan.dueDate, loan.totalRepaid, remaining, loan.installmentAmount ?? 0, statusLabel(loan.status), ''],
      className: cn(loan.status === 'overdue' && 'bg-danger-bg/55 hover:bg-danger-bg/80', loan.status === 'repaid' && 'opacity-70'),
      onClick: () => setSelectedLoan(loan),
      cells: [
        <div key={`${loan.id}-borrower`} className="flex items-center gap-3">
          <Avatar initials={loan.borrowerInitials} />
          <div>
            <p className="font-bold text-fg">{loan.borrowerName}</p>
            <p className="text-xs text-muted">#{loan.borrowerId}</p>
          </div>
        </div>,
        <Badge key={`${loan.id}-purpose`} variant="brand" className="rounded-md">{loan.purpose}</Badge>,
        <span key={`${loan.id}-amount`} className="font-bold tabular-nums text-fg">{formatCurrencyBn(loan.amount)}</span>,
        <span key={`${loan.id}-issue`} className="text-xs text-muted">{loan.issueDate}</span>,
        <span key={`${loan.id}-due`} className="text-xs text-muted">{loan.dueDate}</span>,
        <ProgressCell key={`${loan.id}-progress`} loan={loan} />,
        <span key={`${loan.id}-remaining`} className={cn('font-semibold tabular-nums', remaining > 0 ? 'text-warning' : 'text-muted')}>
          {remaining ? formatCurrencyBn(remaining) : '-'}
        </span>,
        <span key={`${loan.id}-installment`} className="text-xs text-fg-2">{loan.installmentAmount ? `মাসিক ${formatCurrencyBn(loan.installmentAmount)}` : '-'}</span>,
        statusBadge(loan.status),
        <div key={`${loan.id}-actions`} className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          {loan.status === 'pending_approval' ? (
            <>
              <Button size="sm" className="bg-success text-white hover:opacity-90" disabled={saving} onClick={() => void approveLoan(loan.id)}>
                <Check className="h-3.5 w-3.5" />অনুমোদন
              </Button>
              <Button size="sm" variant="danger" onClick={() => rejectLoan(loan.id)}>
                <X className="h-3.5 w-3.5" />প্রত্যাখ্যান
              </Button>
            </>
          ) : (
            <button type="button" onClick={() => setSelectedLoan(loan)} className="grid h-8 w-8 place-items-center rounded-md border border-border bg-white text-muted hover:bg-surface-2 hover:text-fg-2" title="বিস্তারিত">
              {loan.status === 'overdue' ? <PhoneCall className="h-4 w-4 text-danger" /> : loan.status === 'repaid' ? <Check className="h-4 w-4 text-success" /> : <MoreHorizontal className="h-4 w-4" />}
            </button>
          )}
        </div>,
      ],
    };
  });

  return (
    <section className="space-y-4">
      {statusCounts.overdue > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/25 bg-warning-bg px-4 py-3">
          <p className="text-sm font-semibold text-warning">
            {statusCounts.overdue}টি ঋণ মেয়াদোত্তীর্ণ হয়েছে। দ্রুত যোগাযোগ বা রিমাইন্ডার পাঠানো দরকার।
          </p>
          <Button size="sm" className="bg-warning text-white hover:opacity-90" onClick={() => showToast('নোটিফিকেশন পাঠানো হয়েছে')}>
            <PhoneCall className="h-4 w-4" />নোটিফিকেশন পাঠান
          </Button>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="p-4 pb-0">
          <SectionHeader
            title="ঋণের তালিকা"
            subtitle="সব ঋণ, অনুমোদন, বকেয়া ও কিস্তি একসাথে দেখুন"
            action={<Button onClick={openLoanModal}><Plus className="h-4 w-4" />নতুন ঋণ</Button>}
          />
        </div>
        <DataTable
          headers={[
            { header: 'ঋণগ্রহীতা' },
            { header: 'উদ্দেশ্য / খাত', hideOnMobile: true },
            { header: 'পরিমাণ' },
            { header: 'গ্রহণের তারিখ', hideOnMobile: true },
            { header: 'ফেরতের তারিখ', hideOnMobile: true },
            { header: 'পরিশোধিত', hideOnMobile: true },
            { header: 'বাকি', hideOnMobile: true },
            { header: 'কিস্তি', hideOnMobile: true },
            { header: 'অবস্থা' },
            { header: 'কার্যক্রম', align: 'right', sortable: false },
          ]}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব', count: statusCounts.all },
            { value: 'pending_approval', label: 'অনুমোদন প্রয়োজন', count: statusCounts.pending_approval },
            { value: 'active', label: 'সক্রিয়', count: statusCounts.active },
            { value: 'repaid', label: 'সম্পন্ন', count: statusCounts.repaid },
            { value: 'overdue', label: 'মেয়াদোত্তীর্ণ', count: statusCounts.overdue, tone: 'danger' },
          ]}
          filters={[
            { id: 'purpose', label: 'সব খাত', options: purposeOptions },
            {
              id: 'status',
              label: 'সকল অবস্থা',
              options: [
                { value: 'pending_approval', label: 'অনুমোদন প্রয়োজন' },
                { value: 'active', label: 'সক্রিয়' },
                { value: 'repaid', label: 'সম্পন্ন' },
                { value: 'overdue', label: 'মেয়াদোত্তীর্ণ' },
              ],
            },
          ]}
          searchPlaceholder="ঋণগ্রহীতার নাম, আইডি বা খাত..."
          emptyMessage="কোনো ঋণ পাওয়া যায়নি"
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>

      <LoanDrawer loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
      <NewLoanModal
        form={loanForm}
        members={members}
        categories={categories}
        open={modalOpen}
        saving={saving}
        onChange={updateLoanForm}
        onClose={() => setModalOpen(false)}
        onSubmit={() => void createLoan()}
      />
      <AppToast message={toast} />
    </section>
  );
}

export function LoansBottomSection({ overdueLoans = OVERDUE_LOAN_ROWS }: LoansBottomSectionProps) {
  const rows = overdueLoans.map((loan) => [
    loan.borrowerName,
    formatCurrencyBn(loan.amount - loan.totalRepaid),
    loan.dueDate,
    formatCurrencyBn(loan.installmentAmount ?? 0),
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="ওভারডিউ ঋণ ফলোআপ" subtitle="যেগুলোতে জরুরি যোগাযোগ দরকার" />
        <DataTable headers={['সদস্য', 'বকেয়া', 'শেষ সময়', 'কিস্তি']} rows={rows} />
      </Card>
    </section>
  );
}
