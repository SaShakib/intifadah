'use client';

import { useState } from 'react';
import { USER_TRANSACTIONS } from '@/lib/data/transactions';
import { CATEGORIES } from '@/lib/data/categories';

const fmt = (n: number) => '৳' + n.toLocaleString('en-IN');

const DONATION_TXS = USER_TRANSACTIONS.filter(tx => tx.type === 'donation');
const DONATION_CATS = CATEGORIES.filter(c => c.type === 'donation' && c.isActive);

const TOTAL_DONATIONS = DONATION_TXS.reduce((s, tx) => s + tx.amount, 0);

const CAT_BREAKDOWN = DONATION_CATS.map(cat => ({
  name: cat.name,
  amount: DONATION_TXS.filter(tx => tx.categoryName === cat.name).reduce((s, tx) => s + tx.amount, 0),
  color: cat.name === 'সাপ্তাহিক চাঁদা' ? 'var(--success)' : 'var(--brand)',
}));

export default function DonationsPage() {
  const [selectedCat, setSelectedCat] = useState(DONATION_CATS[0]?.id ?? '');
  const [amount, setAmount]           = useState('');
  const [note, setNote]               = useState('');
  const [submitted, setSubmitted]     = useState(false);

  function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setAmount('');
    setNote('');
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ borderRadius: 'var(--r-lg)', background: 'linear-gradient(135deg, var(--success) 0%, oklch(38% 0.14 145) 100%)', padding: '20px', color: '#fff' }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>মোট দান</div>
        <div className="money" style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{fmt(TOTAL_DONATIONS)}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>{DONATION_TXS.length}টি দানের লেনদেন</div>
      </div>

      {/* Quick donate form */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>দান করুন</div>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--success)', fontWeight: 600 }}>
            ✓ আপনার দান গৃহীত হয়েছে। জাযাকাল্লাহু খাইরান!
          </div>
        ) : (
          <form onSubmit={handleDonate}>
            <div className="form-group">
              <label className="form-label">দানের খাত</label>
              <select className="input" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
                {DONATION_CATS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">পরিমাণ (৳)</label>
              <input className="input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="০" required />
            </div>
            <div className="form-group">
              <label className="form-label">নোট (ঐচ্ছিক)</label>
              <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="কোনো বার্তা..." />
            </div>
            <button type="submit" className="btn btn-primary btn-full">
              🤲 দান পাঠান
            </button>
          </form>
        )}
      </div>

      {/* Category breakdown */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>খাত ওয়ারি দান</div>
        {CAT_BREAKDOWN.map(cat => {
          const pct = TOTAL_DONATIONS > 0 ? Math.round((cat.amount / TOTAL_DONATIONS) * 100) : 0;
          return (
            <div key={cat.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>{cat.name}</span>
                <span className="money" style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{fmt(cat.amount)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: cat.color, borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{pct}%</div>
            </div>
          );
        })}
      </div>

      {/* Donation history */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>দানের ইতিহাস</div>
        {DONATION_TXS.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>এখনো কোনো দান করা হয়নি</div>
        ) : (
          DONATION_TXS.map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  🤲
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{tx.categoryName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tx.date}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="money" style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>+{fmt(tx.amount)}</div>
                <span className={`badge ${tx.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                  {tx.status === 'completed' ? 'সম্পন্ন' : 'অপেক্ষমান'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
