'use client';

import Link from 'next/link';
import { USER_STATS } from '@/lib/data/stats';
import { USER_TRANSACTIONS } from '@/lib/data/transactions';
import { CURRENT_USER } from '@/lib/data/members';

const fmt = (n: number) => '৳' + n.toLocaleString('en-IN');

const TYPE_LABEL: Record<string, string> = {
  savings: 'সঞ্চয়', donation: 'দান', collection: 'চাঁদা',
  loan: 'ঋণ', repayment: 'পরিশোধ', expense: 'খরচ',
};
const TYPE_COLOR: Record<string, string> = {
  savings: 'badge-info', donation: 'badge-success', collection: 'badge-brand',
  loan: 'badge-warning', repayment: 'badge-purple', expense: 'badge-danger',
};

const STATS = [
  { label: 'মোট সঞ্চয়', value: fmt(USER_STATS.totalSavings), color: 'var(--info)', icon: '💰' },
  { label: 'মোট দান', value: fmt(USER_STATS.totalDonations), color: 'var(--success)', icon: '🤲' },
  { label: 'সক্রিয় ঋণ', value: USER_STATS.activeLoan ? fmt(USER_STATS.activeLoan) : 'নেই', color: 'var(--warning)', icon: '📋' },
  { label: 'মোট অবদান', value: fmt(USER_STATS.totalContributions), color: 'var(--brand)', icon: '📊' },
];

const QUICK_ACTIONS = [
  { label: 'দান করুন', href: '/user/donations', icon: '🤲', color: 'var(--success-bg)', border: 'var(--success)' },
  { label: 'সঞ্চয়', href: '/user/savings', icon: '💰', color: 'var(--info-bg)', border: 'var(--info)' },
  { label: 'ঋণ', href: '/user/loan', icon: '📋', color: 'var(--warning-bg)', border: 'var(--warning)' },
  { label: 'খরচ', href: '/user/expenses', icon: '📝', color: 'var(--danger-bg)', border: 'var(--danger)' },
];

const PROGRESS_ITEMS = [
  { label: 'সাপ্তাহিক চাঁদা', paid: 800, target: 1000 },
  { label: 'মাসিক সঞ্চয়', paid: USER_STATS.monthlyPaid, target: USER_STATS.monthlyTarget },
  { label: 'দান তহবিল', paid: 500, target: 1000 },
];

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="card" style={{ padding: '16px', borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div className="money" style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)' }}>{value}</div>
    </div>
  );
}

function TxRow({ tx }: { tx: typeof USER_TRANSACTIONS[0] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
        {tx.memberInitials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{tx.categoryName}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tx.date}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="money" style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>{fmt(tx.amount)}</div>
        <span className={`badge ${TYPE_COLOR[tx.type] ?? 'badge-muted'}`} style={{ marginTop: 4 }}>
          {TYPE_LABEL[tx.type] ?? tx.type}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const recent = USER_TRANSACTIONS.slice(0, 5);
  const monthPct = Math.round((USER_STATS.monthlyPaid / USER_STATS.monthlyTarget) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome banner */}
      <div style={{
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
        padding: '24px 20px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>আস-সালামু আলাইকুম</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{CURRENT_USER.name}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>সদস্য আইডি: {CURRENT_USER.memberId}</div>
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, opacity: 0.8 }}>এই মাসের অগ্রগতি</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}>
              <div style={{ width: `${monthPct}%`, height: '100%', background: '#fff', borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{monthPct}%</span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
            {fmt(USER_STATS.monthlyPaid)} / {fmt(USER_STATS.monthlyTarget)} পরিশোধ
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick actions */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>দ্রুত কাজ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.href} href={a.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 8px', borderRadius: 'var(--r)', textDecoration: 'none',
              background: a.color, border: `1px solid ${a.border}20`,
            }}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', textAlign: 'center' }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>সাম্প্রতিক লেনদেন</div>
          <Link href="/user/transactions" style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 600 }}>সব দেখুন →</Link>
        </div>
        {recent.map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>

      {/* Category progress */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>খাত ওয়ারি অগ্রগতি</div>
        {PROGRESS_ITEMS.map(item => {
          const pct = Math.min(100, Math.round((item.paid / item.target) * 100));
          return (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{item.label}</span>
                <span className="money" style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {fmt(item.paid)} / {fmt(item.target)}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--success)' : 'var(--brand)', borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{pct}% সম্পন্ন</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
