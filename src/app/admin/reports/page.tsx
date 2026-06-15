'use client';

import { useState } from 'react';
import { TRANSACTIONS } from '@/lib/data/transactions';
import { MEMBERS } from '@/lib/data/members';

const PERIODS = [
  { key: 'weekly',  label: 'সাপ্তাহিক' },
  { key: 'monthly', label: 'মাসিক' },
  { key: 'yearly',  label: 'বার্ষিক' },
];

const TYPE_LABEL: Record<string, string> = {
  collection: 'কালেকশন', loan: 'ঋণ গ্রহণ',
  repayment: 'ঋণ ফেরত', savings: 'সঞ্চয়',
  donation: 'দান', expense: 'খরচ',
};

const TYPE_BADGE: Record<string, string> = {
  collection: 'badge-info', loan: 'badge-warning',
  repayment: 'badge-success', savings: 'badge-muted',
  donation: 'badge-brand', expense: 'badge-danger',
};

const STATUS_LABEL: Record<string, string> = {
  completed: 'সম্পন্ন', pending: 'অনুমোদন বাকি',
  rejected: 'প্রত্যাখ্যাত', overdue: 'মেয়াদোত্তীর্ণ',
};

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly');

  const totalCollection = TRANSACTIONS.filter(t => t.type === 'collection').reduce((s, t) => s + t.amount, 0);
  const totalSavings    = TRANSACTIONS.filter(t => t.type === 'savings').reduce((s, t) => s + t.amount, 0);
  const totalLoans      = TRANSACTIONS.filter(t => t.type === 'loan').reduce((s, t) => s + t.amount, 0);
  const totalRepaid     = TRANSACTIONS.filter(t => t.type === 'repayment').reduce((s, t) => s + t.amount, 0);
  const totalDonation   = TRANSACTIONS.filter(t => t.type === 'donation').reduce((s, t) => s + t.amount, 0);

  const memberSummary = MEMBERS.slice(0, 6).map(m => ({
    ...m,
    txCount: TRANSACTIONS.filter(t => t.memberId === m.id).length,
    totalAmount: TRANSACTIONS.filter(t => t.memberId === m.id).reduce((s, t) => s + t.amount, 0),
  }));

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>প্রতিবেদন</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>আর্থিক লেনদেনের বিস্তারিত সারাংশ</p>
        </div>
        <button className="btn btn-ghost">
          <DownloadIcon /> রিপোর্ট ডাউনলোড
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }} className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">মোট সংগ্রহ</div>
          <div className="stat-value money" style={{ color: 'var(--info)', fontSize: 18 }}>৳{totalCollection.toLocaleString('bn-BD')}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">সঞ্চয়</div>
          <div className="stat-value money" style={{ color: 'var(--muted)', fontSize: 18 }}>৳{totalSavings.toLocaleString('bn-BD')}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">ঋণ বিতরণ</div>
          <div className="stat-value money" style={{ color: 'var(--warning)', fontSize: 18 }}>৳{totalLoans.toLocaleString('bn-BD')}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">ঋণ ফেরত</div>
          <div className="stat-value money" style={{ color: 'var(--success)', fontSize: 18 }}>৳{totalRepaid.toLocaleString('bn-BD')}</div>
        </div>
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)', border: 'none' }}>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>মোট দান</div>
          <div className="stat-value money" style={{ color: '#fff', fontSize: 18 }}>৳{totalDonation.toLocaleString('bn-BD')}</div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>লেনদেনের তালিকা</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>সময়কাল:</span>
            <div className="tabs" style={{ marginBottom: 0, border: 'none' }}>
              {PERIODS.map(p => (
                <button key={p.key} className={`tab ${period === p.key ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setPeriod(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 18px 0' }}>
          <div style={{ height: 1, background: 'var(--border)', marginTop: 10 }} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>সদস্য</th>
                <th>ধরন</th>
                <th>খাত</th>
                <th>পরিমাণ</th>
                <th>তারিখ</th>
                <th>অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{tx.memberInitials}</div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{tx.memberName}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${TYPE_BADGE[tx.type] ?? 'badge-muted'}`}>{TYPE_LABEL[tx.type] ?? tx.type}</span></td>
                  <td style={{ color: 'var(--fg-2)', fontSize: 12 }}>{tx.categoryName ?? '—'}</td>
                  <td className="money" style={{ fontWeight: 700 }}>৳{tx.amount.toLocaleString('bn-BD')}</td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                  <td>
                    <span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {STATUS_LABEL[tx.status] ?? tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member-wise summary */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>সদস্যভিত্তিক সারাংশ</span>
          <button className="btn btn-ghost btn-sm">
            <DownloadIcon /> এক্সেল
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>সদস্য</th>
                <th>আইডি</th>
                <th>মোট সঞ্চয়</th>
                <th>মোট দান</th>
                <th>সক্রিয় ঋণ</th>
                <th>লেনদেন</th>
                <th>অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {memberSummary.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{m.initials}</div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 12 }}>{m.memberId}</td>
                  <td className="money" style={{ fontWeight: 600 }}>৳{m.totalSavings.toLocaleString('bn-BD')}</td>
                  <td className="money">৳{m.totalDonations.toLocaleString('bn-BD')}</td>
                  <td>
                    {m.activeLoan
                      ? <span className="badge badge-warning money">৳{m.activeLoan.toLocaleString('bn-BD')}</span>
                      : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--fg-2)' }}>{m.txCount}টি</td>
                  <td>
                    <span className={`badge ${m.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {m.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 2v7M3.5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.5 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
