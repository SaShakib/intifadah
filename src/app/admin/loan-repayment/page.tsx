'use client';

import { useState } from 'react';
import { LOANS } from '@/lib/data/loans';
import { TRANSACTIONS } from '@/lib/data/transactions';
import type { Loan } from '@/types';

const repayments = TRANSACTIONS.filter(t => t.type === 'repayment');
const activeLoans = LOANS.filter(l => l.status === 'active' || l.status === 'overdue');

export default function LoanRepaymentPage() {
  const [form, setForm] = useState({ loanId: '', amount: '', date: '', note: '' });
  const [submitted, setSubmitted] = useState(false);

  const selectedLoan = LOANS.find(l => l.id === form.loanId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
    setForm({ loanId: '', amount: '', date: '', note: '' });
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>ঋণ পরিশোধ</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>ঋণ পরিশোধের তথ্য রেকর্ড করুন</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }} className="main-grid">

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 18 }}>নতুন পরিশোধ রেকর্ড</h2>

            {submitted && (
              <div style={{ background: 'var(--success-bg)', border: '1px solid oklch(44% 0.14 145 / 0.3)', borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: 16, color: 'var(--success)', fontSize: 13, fontWeight: 500 }}>
                পরিশোধ সফলভাবে রেকর্ড হয়েছে!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">ঋণ নির্বাচন করুন</label>
                <select
                  className="input"
                  value={form.loanId}
                  onChange={e => setForm(p => ({ ...p, loanId: e.target.value }))}
                  required
                >
                  <option value="">— ঋণ নির্বাচন করুন —</option>
                  {activeLoans.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.borrowerName} — ৳{l.amount.toLocaleString()} ({l.status === 'overdue' ? 'মেয়াদোত্তীর্ণ' : 'সক্রিয়'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedLoan && <LoanSummaryBadge loan={selectedLoan} />}

              <div className="form-group">
                <label className="form-label">পরিশোধের পরিমাণ (৳)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="যেমন: ৩৫০০"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  required min={1}
                />
                {selectedLoan && (
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
                    কিস্তির পরিমাণ: ৳{selectedLoan.installmentAmount?.toLocaleString('bn-BD') ?? '—'}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">তারিখ</label>
                <input
                  className="input" type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">নোট (ঐচ্ছিক)</label>
                <textarea
                  className="input" rows={2}
                  placeholder="প্রয়োজনে বিস্তারিত লিখুন…"
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button className="btn btn-primary btn-full" type="submit">পরিশোধ রেকর্ড করুন</button>
            </form>
          </div>

          {/* Active loans list */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>সক্রিয় ঋণসমূহ</h3>
            {activeLoans.map(l => (
              <ActiveLoanItem key={l.id} loan={l} />
            ))}
          </div>
        </div>

        {/* Repayment history */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>পরিশোধের ইতিহাস</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>সদস্য</th>
                  <th>পরিমাণ</th>
                  <th>তারিখ</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {repayments.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                      কোনো রেকর্ড নেই
                    </td>
                  </tr>
                )}
                {repayments.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{tx.memberInitials}</div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{tx.memberName}</span>
                      </div>
                    </td>
                    <td className="money" style={{ fontWeight: 700, color: 'var(--success)' }}>
                      ৳{tx.amount.toLocaleString('bn-BD')}
                    </td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                    <td>
                      <span className={`badge ${tx.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {tx.status === 'completed' ? 'সম্পন্ন' : 'অনুমোদন বাকি'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function LoanSummaryBadge({ loan }: { loan: Loan }) {
  const outstanding = loan.amount - loan.totalRepaid;
  return (
    <div style={{
      background: loan.status === 'overdue' ? 'var(--danger-bg)' : 'var(--brand-light)',
      border: `1px solid ${loan.status === 'overdue' ? 'oklch(52% 0.18 25 / 0.25)' : 'oklch(50% 0.26 354 / 0.2)'}`,
      borderRadius: 'var(--r-sm)',
      padding: '10px 14px',
      marginBottom: 16,
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <Stat label="মোট ঋণ" value={`৳${loan.amount.toLocaleString('bn-BD')}`} />
      <Stat label="পরিশোধিত" value={`৳${loan.totalRepaid.toLocaleString('bn-BD')}`} />
      <Stat label="বাকি" value={`৳${outstanding.toLocaleString('bn-BD')}`} danger={loan.status === 'overdue'} />
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div className="money" style={{ fontSize: 14, fontWeight: 700, color: danger ? 'var(--danger)' : 'var(--fg)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function ActiveLoanItem({ loan }: { loan: Loan }) {
  const outstanding = loan.amount - loan.totalRepaid;
  const pct = Math.round((loan.totalRepaid / loan.amount) * 100);
  return (
    <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{loan.borrowerName}</span>
        <span className={`badge ${loan.status === 'overdue' ? 'badge-danger' : 'badge-brand'}`}>
          {loan.status === 'overdue' ? 'মেয়াদোত্তীর্ণ' : 'সক্রিয়'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 7 }}>
        <span className="money">মূল: ৳{loan.amount.toLocaleString('bn-BD')}</span>
        <span className="money" style={{ color: 'var(--danger)' }}>বাকি: ৳{outstanding.toLocaleString('bn-BD')}</span>
      </div>
      <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--success)', borderRadius: 99 }} />
      </div>
      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{pct}% পরিশোধিত</p>
    </div>
  );
}
