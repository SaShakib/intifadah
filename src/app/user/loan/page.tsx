'use client';

import { useState } from 'react';
import { LOANS } from '@/lib/data/loans';
import { CURRENT_USER } from '@/lib/data/members';

const fmt = (n: number) => '৳' + n.toLocaleString('en-IN');

const USER_LOANS = LOANS.filter(l => l.borrowerId === CURRENT_USER.id);
const ACTIVE_LOAN = USER_LOANS.find(l => l.status === 'active' || l.status === 'overdue' || l.status === 'pending_approval');

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-success', repaid: 'badge-muted', overdue: 'badge-danger', pending_approval: 'badge-warning',
};
const STATUS_LABEL: Record<string, string> = {
  active: 'সক্রিয়', repaid: 'পরিশোধিত', overdue: 'মেয়াদোত্তীর্ণ', pending_approval: 'অনুমোদন অপেক্ষায়',
};

const PURPOSES = ['ব্যবসায়িক মূলধন', 'চিকিৎসা ব্যয়', 'শিক্ষা ব্যয়', 'গৃহ সংস্কার', 'অন্যান্য'];

function InstallmentRow({ month, amount, paid }: { month: string; amount: number; paid: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{month}</div>
        <span className={`badge ${paid ? 'badge-success' : 'badge-warning'}`}>{paid ? 'পরিশোধিত' : 'অপেক্ষমান'}</span>
      </div>
      <div className="money" style={{ fontSize: 14, fontWeight: 700, color: paid ? 'var(--success)' : 'var(--fg)' }}>{fmt(amount)}</div>
    </div>
  );
}

export default function LoanPage() {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount]     = useState('');
  const [purpose, setPurpose]   = useState(PURPOSES[0]);
  const [note, setNote]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); setAmount(''); setNote(''); }, 2500);
  }

  const outstanding = ACTIVE_LOAN ? ACTIVE_LOAN.amount - ACTIVE_LOAN.totalRepaid : 0;
  const repaidPct   = ACTIVE_LOAN && ACTIVE_LOAN.amount > 0 ? Math.round((ACTIVE_LOAN.totalRepaid / ACTIVE_LOAN.amount) * 100) : 0;

  const INSTALLMENTS = [
    { month: 'জুলাই ২০২৬', amount: ACTIVE_LOAN?.installmentAmount ?? 1800, paid: false },
    { month: 'আগস্ট ২০২৬', amount: ACTIVE_LOAN?.installmentAmount ?? 1800, paid: false },
    { month: 'সেপ্টেম্বর ২০২৬', amount: ACTIVE_LOAN?.installmentAmount ?? 1800, paid: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!ACTIVE_LOAN ? (
        /* No active loan state */
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>কোনো সক্রিয় ঋণ নেই</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
            আপনার বর্তমানে কোনো ঋণ নেই। প্রয়োজনে আবেদন করুন।
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ঋণের আবেদন করুন
          </button>
        </div>
      ) : (
        /* Active loan details */
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>সক্রিয় ঋণ</div>
            <span className={`badge ${STATUS_BADGE[ACTIVE_LOAN.status]}`}>{STATUS_LABEL[ACTIVE_LOAN.status]}</span>
          </div>

          <div className="money" style={{ fontSize: 32, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>{fmt(ACTIVE_LOAN.amount)}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{ACTIVE_LOAN.purpose}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              ['ইস্যু তারিখ', ACTIVE_LOAN.issueDate],
              ['শেষ তারিখ', ACTIVE_LOAN.dueDate],
              ['পরিশোধিত', fmt(ACTIVE_LOAN.totalRepaid)],
              ['বাকি', fmt(outstanding)],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 'var(--r-sm)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
                <div className="money" style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              <span>পরিশোধের অগ্রগতি</span>
              <span>{repaidPct}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 99 }}>
              <div style={{ width: `${repaidPct}%`, height: '100%', background: 'var(--success)', borderRadius: 99 }} />
            </div>
          </div>

          {ACTIVE_LOAN.installmentAmount && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-2)', background: 'var(--brand-light)', padding: '10px 14px', borderRadius: 'var(--r-sm)' }}>
              মাসিক কিস্তি: <strong className="money">{fmt(ACTIVE_LOAN.installmentAmount)}</strong>
            </div>
          )}
        </div>
      )}

      {/* Application form */}
      {(showForm || !ACTIVE_LOAN) && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>ঋণের আবেদন</div>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--success)', fontWeight: 600 }}>
              ✓ আপনার আবেদন পাঠানো হয়েছে। অ্যাডমিন পর্যালোচনা করবেন।
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">প্রয়োজনীয় পরিমাণ (৳)</label>
                <input className="input" type="number" min="1000" value={amount} onChange={e => setAmount(e.target.value)} placeholder="০" required />
              </div>
              <div className="form-group">
                <label className="form-label">ঋণের উদ্দেশ্য</label>
                <select className="input" value={purpose} onChange={e => setPurpose(e.target.value)}>
                  {PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">বিস্তারিত (ঐচ্ছিক)</label>
                <textarea className="input" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="আরও বিস্তারিত লিখুন..." style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>আবেদন পাঠান</button>
                {ACTIVE_LOAN && <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>বাতিল</button>}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Repayment schedule */}
      {ACTIVE_LOAN && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>পরিশোধের সময়সূচি</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>আসন্ন কিস্তি</div>
          {INSTALLMENTS.map(inst => <InstallmentRow key={inst.month} {...inst} />)}
        </div>
      )}

      {/* Loan history */}
      {USER_LOANS.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>ঋণের ইতিহাস</div>
          {USER_LOANS.map(loan => (
            <div key={loan.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{loan.purpose}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{loan.issueDate}</div>
                <span className={`badge ${STATUS_BADGE[loan.status]}`} style={{ marginTop: 4 }}>{STATUS_LABEL[loan.status]}</span>
              </div>
              <div className="money" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', textAlign: 'right' }}>
                {fmt(loan.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply button when loan exists */}
      {ACTIVE_LOAN && !showForm && (
        <button className="btn btn-ghost btn-full" onClick={() => setShowForm(true)}>
          নতুন ঋণের আবেদন করুন
        </button>
      )}
    </div>
  );
}
