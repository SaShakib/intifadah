'use client';

import { useState } from 'react';
import { USER_TRANSACTIONS } from '@/lib/data/transactions';
import { USER_STATS } from '@/lib/data/stats';

const fmt = (n: number) => '৳' + n.toLocaleString('en-IN');

const SAVINGS_TXS = USER_TRANSACTIONS.filter(tx => tx.type === 'savings');

const MONTHLY_DATA = [
  { month: 'জানু', amount: 5000 },
  { month: 'ফেব্রু', amount: 3000 },
  { month: 'মার্চ', amount: 4000 },
  { month: 'এপ্রিল', amount: 2500 },
  { month: 'মে', amount: 6000 },
  { month: 'জুন', amount: 3000 },
];

const CATEGORY_BREAKDOWN = [
  { name: 'ব্যক্তিগত সঞ্চয়', amount: 28000, color: 'var(--info)' },
  { name: 'দীর্ঘমেয়াদি সঞ্চয়', amount: 4000, color: 'var(--brand)' },
];

const MAX_MONTHLY = Math.max(...MONTHLY_DATA.map(d => d.amount));
const TARGET = 50000;
const PCT = Math.min(100, Math.round((USER_STATS.totalSavings / TARGET) * 100));

function BarChart() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, padding: '0 4px' }}>
      {MONTHLY_DATA.map((d, i) => {
        const h = Math.round((d.amount / MAX_MONTHLY) * 70);
        const isCurrent = i === MONTHLY_DATA.length - 1;
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: isCurrent ? 'var(--brand)' : 'var(--info)', opacity: isCurrent ? 1 : 0.6 }} />
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{d.month}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function SavingsPage() {
  const [showForm, setShowForm]   = useState(false);
  const [amount, setAmount]       = useState('');
  const [category, setCategory]   = useState('ব্যক্তিগত সঞ্চয়');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setAmount('');
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary card */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>মোট সঞ্চয়</div>
            <div className="money" style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg)' }}>{fmt(USER_STATS.totalSavings)}</div>
          </div>
          <span className="badge badge-info">{PCT}% অর্জিত</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
            <span>লক্ষ্য: {fmt(TARGET)}</span>
            <span>{fmt(TARGET - USER_STATS.totalSavings)} বাকি</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ width: `${PCT}%`, height: '100%', background: 'var(--info)', borderRadius: 99 }} />
          </div>
        </div>
        <button className="btn btn-primary btn-full btn-sm" onClick={() => setShowForm(v => !v)} style={{ marginTop: 12 }}>
          {showForm ? '✕ বন্ধ করুন' : '+ সঞ্চয় জমা দিন'}
        </button>
      </div>

      {/* Inline deposit form */}
      {showForm && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>সঞ্চয় জমা</div>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--success)', fontWeight: 600 }}>
              ✓ আপনার আবেদন পাঠানো হয়েছে
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">খাত</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORY_BREAKDOWN.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">পরিমাণ (৳)</label>
                <input className="input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="০" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full">জমা দিন</button>
            </form>
          )}
        </div>
      )}

      {/* Monthly chart */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>মাসিক সঞ্চয়</div>
        <BarChart />
      </div>

      {/* Category breakdown */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>খাত ওয়ারি বিভাজন</div>
        {CATEGORY_BREAKDOWN.map(cat => {
          const pct2 = Math.round((cat.amount / USER_STATS.totalSavings) * 100);
          return (
            <div key={cat.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>{cat.name}</span>
                <span className="money" style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{fmt(cat.amount)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                <div style={{ width: `${pct2}%`, height: '100%', background: cat.color, borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{pct2}%</div>
            </div>
          );
        })}
      </div>

      {/* Savings history */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>সঞ্চয়ের ইতিহাস</div>
        {SAVINGS_TXS.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>কোনো সঞ্চয় পাওয়া যায়নি</div>
        ) : (
          SAVINGS_TXS.map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{tx.categoryName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tx.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="money" style={{ fontSize: 14, fontWeight: 700, color: 'var(--info)' }}>+{fmt(tx.amount)}</div>
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
