'use client';

import { useState } from 'react';
import { LOANS } from '@/lib/data/loans';
import type { Loan, LoanStatus } from '@/types';

const TABS: { key: string; label: string }[] = [
  { key: 'all',              label: 'সব' },
  { key: 'pending_approval', label: 'অনুমোদন বাকি' },
  { key: 'active',           label: 'সক্রিয়' },
  { key: 'overdue',          label: 'মেয়াদোত্তীর্ণ' },
];

const STATUS_BADGE: Record<LoanStatus, string> = {
  pending_approval: 'badge-warning',
  active:           'badge-brand',
  overdue:          'badge-danger',
  repaid:           'badge-success',
};

const STATUS_LABEL: Record<LoanStatus, string> = {
  pending_approval: 'অনুমোদন বাকি',
  active:           'সক্রিয়',
  overdue:          'মেয়াদোত্তীর্ণ',
  repaid:           'পরিশোধিত',
};

export default function LoansPage() {
  const [tab, setTab] = useState('all');

  const filtered = tab === 'all' ? LOANS : LOANS.filter(l => l.status === tab);

  const totalActive  = LOANS.filter(l => l.status === 'active').length;
  const totalOverdue = LOANS.filter(l => l.status === 'overdue').length;
  const totalPending = LOANS.filter(l => l.status === 'pending_approval').length;
  const totalAmount  = LOANS.reduce((s, l) => s + l.amount, 0);

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>ঋণ ব্যবস্থাপনা</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>সকল ঋণের বিস্তারিত তালিকা</p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon /> নতুন ঋণ
        </button>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <SummaryCard label="মোট ঋণ বিতরণ" value={`৳${totalAmount.toLocaleString('bn-BD')}`} color="var(--brand)" />
        <SummaryCard label="সক্রিয় ঋণ" value={`${totalActive}টি`} color="var(--info)" />
        <SummaryCard label="মেয়াদোত্তীর্ণ" value={`${totalOverdue}টি`} color="var(--danger)" />
        <SummaryCard label="অনুমোদন বাকি" value={`${totalPending}টি`} color="var(--warning)" />
      </div>

      {/* Table card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px 0' }}>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>গ্রহীতা</th>
                <th>পরিমাণ</th>
                <th>উদ্দেশ্য</th>
                <th>বিতরণ তারিখ</th>
                <th>মেয়াদ</th>
                <th>পরিশোধিত</th>
                <th>বাকি</th>
                <th>অবস্থা</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                    কোনো ঋণ নেই
                  </td>
                </tr>
              )}
              {filtered.map(loan => (
                <LoanRow key={loan.id} loan={loan} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LoanRow({ loan }: { loan: Loan }) {
  const hue = (loan.borrowerName.charCodeAt(0) * 23) % 360;
  const outstanding = loan.amount - loan.totalRepaid;

  return (
    <tr style={loan.status === 'overdue' ? { background: 'var(--danger-bg)' } : {}}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="avatar"
            style={{ background: `oklch(92% 0.04 ${hue})`, color: `oklch(38% 0.12 ${hue})` }}
          >
            {loan.borrowerInitials}
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{loan.borrowerName}</span>
        </div>
      </td>
      <td className="money" style={{ fontWeight: 700 }}>৳{loan.amount.toLocaleString('bn-BD')}</td>
      <td style={{ color: 'var(--fg-2)', maxWidth: 160 }}>{loan.purpose}</td>
      <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{loan.issueDate}</td>
      <td style={{ color: loan.status === 'overdue' ? 'var(--danger)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
        {loan.dueDate}
      </td>
      <td className="money" style={{ color: 'var(--success)' }}>
        {loan.totalRepaid > 0 ? `৳${loan.totalRepaid.toLocaleString('bn-BD')}` : '—'}
      </td>
      <td className="money" style={{ fontWeight: 600, color: outstanding > 0 ? 'var(--danger)' : 'var(--success)' }}>
        {outstanding > 0 ? `৳${outstanding.toLocaleString('bn-BD')}` : '—'}
      </td>
      <td>
        <span className={`badge ${STATUS_BADGE[loan.status]}`}>{STATUS_LABEL[loan.status]}</span>
      </td>
      <td>
        {loan.status === 'pending_approval' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-success-sm">অনুমোদন</button>
            <button className="btn-danger-sm">বাতিল</button>
          </div>
        )}
        {loan.status !== 'pending_approval' && (
          <a href="#" style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 500 }}>বিস্তারিত</a>
        )}
      </td>
    </tr>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value money" style={{ color, fontSize: 20 }}>{value}</div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
