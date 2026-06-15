'use client';

import { useState } from 'react';
import { TRANSACTIONS } from '@/lib/data/transactions';
import { MEMBERS } from '@/lib/data/members';

const collections = TRANSACTIONS.filter(t => t.type === 'collection');

const todayTotal  = collections.filter(t => t.date.includes('১৫ জুন')).reduce((s, t) => s + t.amount, 0);
const weekTotal   = collections.reduce((s, t) => s + t.amount, 0);
const monthTotal  = collections.reduce((s, t) => s + t.amount, 0);

const CATEGORIES = ['সাপ্তাহিক চাঁদা', 'বার্ষিক চাঁদা', 'দান তহবিল', 'অন্যান্য'];

export default function FundCollectionPage() {
  const [form, setForm] = useState({
    memberId: '', amount: '', category: '', date: '', note: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
    setForm({ memberId: '', amount: '', category: '', date: '', note: '' });
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>ফান্ড সংগ্রহ</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>নতুন কালেকশন রেকর্ড করুন</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-label">আজকের সংগ্রহ</div>
          <div className="stat-value money" style={{ color: 'var(--brand)' }}>
            ৳{todayTotal.toLocaleString('bn-BD')}
          </div>
          <div className="stat-delta">১৫ জুন ২০২৬</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">এই সপ্তাহ</div>
          <div className="stat-value money">৳{weekTotal.toLocaleString('bn-BD')}</div>
          <div className="stat-delta">{collections.length}টি এন্ট্রি</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">এই মাস</div>
          <div className="stat-value money">৳{monthTotal.toLocaleString('bn-BD')}</div>
          <div className="stat-delta up">↑ জুন ২০২৬</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }} className="main-grid">

        {/* Form */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 18 }}>নতুন কালেকশন</h2>

          {submitted && (
            <div style={{ background: 'var(--success-bg)', border: '1px solid oklch(44% 0.14 145 / 0.3)', borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: 16, color: 'var(--success)', fontSize: 13, fontWeight: 500 }}>
              সফলভাবে রেকর্ড করা হয়েছে!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">সদস্য বাছাই করুন</label>
              <select
                className="input"
                value={form.memberId}
                onChange={e => setForm(p => ({ ...p, memberId: e.target.value }))}
                required
              >
                <option value="">— সদস্য নির্বাচন করুন —</option>
                {MEMBERS.filter(m => m.isActive).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.memberId})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">পরিমাণ (৳)</label>
              <input
                className="input"
                type="number"
                placeholder="যেমন: ৫০০"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                required
                min={1}
              />
            </div>

            <div className="form-group">
              <label className="form-label">খাত</label>
              <select
                className="input"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                required
              >
                <option value="">— খাত নির্বাচন করুন —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">তারিখ</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">নোট (ঐচ্ছিক)</label>
              <textarea
                className="input"
                rows={2}
                placeholder="প্রয়োজনে বিস্তারিত লিখুন…"
                value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button className="btn btn-primary btn-full" type="submit">
              <SaveIcon /> কালেকশন সংরক্ষণ করুন
            </button>
          </form>
        </div>

        {/* Recent collections table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>সাম্প্রতিক সংগ্রহ</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>সদস্য</th>
                  <th>খাত</th>
                  <th>পরিমাণ</th>
                  <th>তারিখ</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {collections.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="avatar" style={{ fontSize: 12, width: 30, height: 30 }}>
                          {tx.memberInitials}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{tx.memberName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--fg-2)' }}>{tx.categoryName}</td>
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

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 12V4.5L4.5 2h7.5v10H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <rect x="4" y="8" width="6" height="4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="4" y="2" width="4" height="3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}
