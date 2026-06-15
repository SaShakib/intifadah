'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ADMIN_STATS, MONTHLY_CHART_DATA } from '@/lib/data/stats';
import { TRANSACTIONS } from '@/lib/data/transactions';

const PENDING = [
  { id: 'p1', name: 'ইব্রাহিম শেখ', meta: 'ঋণ — ৳২০,০০০', hue: 50 },
  { id: 'p2', name: 'আমির হোসেন',   meta: 'ঋণ — ৳১৫,০০০', hue: 30 },
  { id: 'p3', name: 'রফিক আহমেদ',   meta: 'নতুন সদস্য',   hue: 180 },
];

export default function AdminDashboardPage() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [alertVisible, setAlertVisible] = useState(true);

  const pending = PENDING.filter(p => !dismissed.includes(p.id));
  const filtered = filter === 'all' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === filter);

  const typeLabel: Record<string, string> = {
    collection: 'কালেকশন', loan: 'ঋণ গ্রহণ', repayment: 'ঋণ ফেরত',
    savings: 'সঞ্চয়', donation: 'দান', expense: 'খরচ',
  };
  const typeBadge: Record<string, string> = {
    collection: 'badge-info', loan: 'badge-warning', repayment: 'badge-info',
    savings: 'badge-muted', donation: 'badge-success', expense: 'badge-danger',
  };

  const maxBarValue = Math.max(...MONTHLY_CHART_DATA.map(d => d.value));

  return (
    <>
      {/* Alert banner */}
      {alertVisible && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid oklch(75% 0.12 75)', borderRadius: 'var(--r)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ color: 'var(--warning)' }}>২টি ঋণ মেয়াদোত্তীর্ণ!</strong>
            <span style={{ color: 'var(--fg-2)', fontSize: 13, marginLeft: 8 }}>মো. করিম (৳৮,০০০) এবং সালমা বেগম (৳১২,০০০) — অবিলম্বে যোগাযোগ করুন</span>
          </div>
          <button onClick={() => setAlertVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: '2px 4px', flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>ড্যাশবোর্ড</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>আজকের সারাংশ — ১৫ জুন ২০২৬</p>
        </div>
        <Link href="/admin/fund-collection" className="btn btn-primary">
          <PlusIcon /> নতুন এন্ট্রি
        </Link>
      </div>

      {/* Stats grid */}
      <div className="stat-grid">
        <StatCard icon={<MembersIcon />} label="মোট সদস্য" value="১৪২" delta="+৩ এই মাসে" up />
        <StatCard icon={<FundIcon />} label="মোট ফান্ড" value="৳৮,৪৫,৫০০" delta="+৳২২,০০০ এই মাসে" up />
        <StatCard icon={<CollectIcon />} label="মোট কালেকশন" value="৳১২,৩০,০০০" delta="এই বছরে মোট" />
        <StatCard icon={<LoanIcon />} label="ঋণ বিতরণ" value="৳৩,৭৫,০০০" delta="সক্রিয়: ১৮টি" />
        <StatCard icon={<BalanceIcon />} label="বর্তমান ব্যালেন্স" value="৳৪,৭০,৫০০" delta="হাতে আছে" highlight />
      </div>

      {/* Two-column grid */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 36%', gap: 18 }}>

        {/* Recent transactions */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>সাম্প্রতিক লেনদেন</span>
            <Link href="/admin/reports" style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500 }}>সব দেখুন →</Link>
          </div>

          <div style={{ padding: '0 18px' }}>
            <div className="tabs" style={{ marginTop: 12 }}>
              {[
                { key: 'all', label: 'সব' }, { key: 'collection', label: 'কালেকশন' },
                { key: 'loan', label: 'ঋণ' }, { key: 'savings', label: 'সঞ্চয়' },
                { key: 'donation', label: 'দান' },
              ].map(tab => (
                <button key={tab.key} className={`tab ${filter === tab.key ? 'active' : ''}`} onClick={() => setFilter(tab.key)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>সদস্য</th>
                  <th>ধরন</th>
                  <th>পরিমাণ</th>
                  <th>তারিখ</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `oklch(92% 0.04 ${(tx.memberName.charCodeAt(0) * 23) % 360})`, color: `oklch(40% 0.12 ${(tx.memberName.charCodeAt(0) * 23) % 360})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
                          {tx.memberInitials}
                        </div>
                        <span style={{ fontWeight: 500 }}>{tx.memberName}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${typeBadge[tx.type] ?? 'badge-muted'}`} style={{ fontSize: 11 }}>{typeLabel[tx.type] ?? tx.type}</span></td>
                    <td className="money" style={{ fontWeight: 600 }}>৳{tx.amount.toLocaleString('bn-BD')}</td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                    <td><span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 11 }}>{tx.status === 'completed' ? 'সম্পন্ন' : tx.status === 'pending' ? 'অনুমোদন প্রয়োজন' : 'প্রত্যাখ্যাত'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Pending approvals */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>পেন্ডিং অনুমোদন</span>
              <span className="badge badge-warning">{pending.length}টি</span>
            </div>

            {pending.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
                  <circle cx="18" cy="18" r="16" stroke="var(--success)" strokeWidth="1.8"/>
                  <path d="M11 18.5l5 5 9-10" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                সব অনুরোধ সম্পন্ন হয়েছে
              </div>
            ) : pending.map(item => (
              <div key={item.id} className="pending-row">
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `oklch(92% 0.04 ${item.hue})`, color: `oklch(40% 0.12 ${item.hue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {item.name[0]}
                </div>
                <div className="pending-info">
                  <div className="pending-name">{item.name}</div>
                  <div className="pending-meta money">{item.meta}</div>
                </div>
                <div className="pending-actions">
                  <button className="btn-success-sm" onClick={() => setDismissed(prev => [...prev, item.id])}>✓</button>
                  <button className="btn-danger-sm" onClick={() => setDismissed(prev => [...prev, item.id])}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly chart */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>মাসিক কালেকশন</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>২০২৬</span>
            </div>

            <svg viewBox="0 0 260 155" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 155 }}>
              {/* Grid lines */}
              {[8, 34, 60, 86, 112].map(y => (
                <line key={y} x1="24" y1={y} x2="254" y2={y} stroke="var(--border)" strokeWidth="0.8"/>
              ))}
              <line x1="24" y1="120" x2="254" y2="120" stroke="var(--border)" strokeWidth="1.2"/>

              {/* Y labels */}
              {[['১০৫', 11], ['৮০', 37], ['৫৫', 63], ['৩০', 89], ['৫', 115]].map(([label, y]) => (
                <text key={label as string} x="20" y={y as number} textAnchor="end" fontSize="8.5" fill="var(--muted)" fontFamily="inherit">{label}</text>
              ))}

              {/* Bars */}
              {MONTHLY_CHART_DATA.map((d, i) => {
                const x = 32 + i * 34;
                const h = (d.value / maxBarValue) * 112;
                const y = 120 - h;
                const isCurrent = d.isCurrent;
                return (
                  <g key={d.month}>
                    <rect x={x} y={y} width="22" height={h} rx="4" fill={isCurrent ? 'var(--accent-light)' : i === 4 ? 'var(--brand)' : 'var(--brand-light)'} stroke={isCurrent ? 'var(--brand-light)' : 'none'} strokeWidth="1.5"/>
                    <text x={x + 11} y={y - 4} textAnchor="middle" fontSize="8" fill={i === 4 ? 'var(--brand)' : isCurrent ? 'var(--accent)' : 'var(--muted)'} fontFamily="inherit" fontWeight={i === 4 ? 700 : 400}>{d.value}</text>
                    <text x={x + 11} y="133" textAnchor="middle" fontSize="8.5" fill={i === 4 ? 'var(--brand)' : isCurrent ? 'var(--accent)' : 'var(--muted)'} fontFamily="inherit" fontWeight={i === 4 ? 600 : 400}>{d.month}</text>
                  </g>
                );
              })}
            </svg>
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>পরিমাণ হাজার টাকায় (৳)</p>
          </div>

        </div>
      </div>
    </>
  );
}

/* ── Inline sub-components ────────────────────────────────── */
function StatCard({ label, value, delta, up, highlight, icon }: {
  label: string; value: string; delta?: string; up?: boolean; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="card stat-card" style={highlight ? { background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)', border: 'none', boxShadow: '0 4px 16px oklch(50% 0.26 354 / 0.25)' } : {}}>
      <div className="stat-label" style={highlight ? { color: 'rgba(255,255,255,0.7)' } : {}}>
        {icon}{label}
      </div>
      <div className="stat-value money" style={highlight ? { color: '#fff' } : {}}>{value}</div>
      {delta && (
        <div className={`stat-delta ${up && !highlight ? 'up' : ''}`} style={highlight ? { color: 'rgba(255,255,255,0.65)' } : {}}>
          {up && !highlight && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          {delta}
        </div>
      )}
    </div>
  );
}

function PlusIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function MembersIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="4.5" r="2" stroke="var(--muted)" strokeWidth="1.3"/><path d="M1 12c0-2.485 2.015-4.5 4.5-4.5" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10" cy="4.5" r="1.7" stroke="var(--muted)" strokeWidth="1.2"/><path d="M13 12a3.5 3.5 0 00-3.5-3.5" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function FundIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="4" width="11" height="8" rx="1.5" stroke="var(--muted)" strokeWidth="1.3"/><path d="M4.5 4V3a2.5 2.5 0 015 0v1" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round"/><path d="M4 8h6" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CollectIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 10.5L4 3.5h6l2.5 7h-11z" stroke="var(--muted)" strokeWidth="1.3" strokeLinejoin="round"/><path d="M1 10.5h12" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function LoanIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8.5 4l3 3-3 3" stroke="var(--muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function BalanceIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8.5" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3"/><path d="M1.5 6.5h11" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3"/><rect x="3.5" y="8" width="2.5" height="1.5" rx="0.5" fill="rgba(255,255,255,0.7)"/></svg>; }
