'use client';

import { useState, useCallback } from 'react';

export default function DashboardPage() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);
  const [pendingItems, setPendingItems] = useState([
    { id: 'pending-1', avatar: 'ই', avatarBg: 'oklch(92% 0.04 50)', avatarColor: 'oklch(40% 0.12 50)', name: 'ইব্রাহিম শেখ', meta: 'ঋণ — ৳২০,০০০', isMoney: true },
    { id: 'pending-2', avatar: 'আ', avatarBg: 'oklch(92% 0.04 30)', avatarColor: 'oklch(40% 0.12 30)', name: 'আমির হোসেন', meta: 'ঋণ — ৳১৫,০০০', isMoney: true },
    { id: 'pending-3', avatar: 'র', avatarBg: 'oklch(92% 0.04 180)', avatarColor: 'oklch(40% 0.12 180)', name: 'রফিক আহমেদ', meta: 'নতুন সদস্য', isMoney: false },
  ]);
  const [allHandled, setAllHandled] = useState(false);
  const [fadingOut, setFadingOut] = useState<string[]>([]);

  const showToast = useCallback((msg: string, type?: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handlePending = useCallback((id: string, action: 'approve' | 'reject') => {
    setFadingOut(prev => [...prev, id]);
    setTimeout(() => {
      setPendingItems(prev => {
        const next = prev.filter(p => p.id !== id);
        if (next.length === 0) setAllHandled(true);
        return next;
      });
      setFadingOut(prev => prev.filter(x => x !== id));
    }, 350);
    if (action === 'approve') showToast('✓ অনুমোদন করা হয়েছে', 'success');
    else showToast('✕ প্রত্যাখ্যান করা হয়েছে', 'danger');
  }, [showToast]);

  const transactions = [
    { type: 'collection', avatar: 'আ', avatarBg: 'oklch(92% 0.04 200)', avatarColor: 'oklch(40% 0.12 200)', name: 'আবদুল রহমান', badge: 'কালেকশন', badgeClass: 'badge-info', amount: '৳৫,০০০', date: '১৫ জুন', statusClass: 'badge-success', status: 'সম্পন্ন' },
    { type: 'savings', avatar: 'র', avatarBg: 'oklch(92% 0.04 280)', avatarColor: 'oklch(40% 0.12 280)', name: 'রহিমা খাতুন', badge: 'সঞ্চয়', badgeClass: 'badge-muted', amount: '৳৩,০০০', date: '১৫ জুন', statusClass: 'badge-success', status: 'সম্পন্ন' },
    { type: 'loan', avatar: 'ই', avatarBg: 'oklch(92% 0.04 50)', avatarColor: 'oklch(40% 0.12 50)', name: 'ইব্রাহিম শেখ', badge: 'ঋণ গ্রহণ', badgeClass: 'badge-warning', amount: '৳২০,০০০', date: '১৪ জুন', statusClass: 'badge-warning', status: 'অনুমোদন প্রয়োজন' },
    { type: 'donation', avatar: 'স', avatarBg: 'oklch(92% 0.04 120)', avatarColor: 'oklch(40% 0.12 120)', name: 'সালেহা বেগম', badge: 'দান', badgeClass: 'badge-success', amount: '৳২,৫০০', date: '১৪ জুন', statusClass: 'badge-success', status: 'সম্পন্ন' },
    { type: 'loan', avatar: 'ম', avatarBg: 'oklch(92% 0.04 155)', avatarColor: 'oklch(40% 0.12 155)', name: 'মো. করিম', badge: 'ঋণ ফেরত', badgeClass: 'badge-info', amount: '৳৩,০০০', date: '১৩ জুন', statusClass: 'badge-success', status: 'সম্পন্ন' },
    { type: 'collection', avatar: 'ন', avatarBg: 'oklch(92% 0.04 320)', avatarColor: 'oklch(40% 0.12 320)', name: 'নাসরিন আক্তার', badge: 'কালেকশন', badgeClass: 'badge-info', amount: '৳৪,০০০', date: '১৩ জুন', statusClass: 'badge-success', status: 'সম্পন্ন' },
    { type: 'loan', avatar: 'আ', avatarBg: 'oklch(92% 0.04 30)', avatarColor: 'oklch(40% 0.12 30)', name: 'আমির হোসেন', badge: 'ঋণ গ্রহণ', badgeClass: 'badge-warning', amount: '৳১৫,০০০', date: '১২ জুন', statusClass: 'badge-warning', status: 'অনুমোদন প্রয়োজন' },
    { type: 'savings', avatar: 'জ', avatarBg: 'oklch(92% 0.04 230)', avatarColor: 'oklch(40% 0.12 230)', name: 'জান্নাতুন নিসা', badge: 'সঞ্চয়', badgeClass: 'badge-muted', amount: '৳৮,০০০', date: '১২ জুন', statusClass: 'badge-success', status: 'সম্পন্ন' },
  ];

  const filteredTx = activeTab === 'all' ? transactions : transactions.filter(t => t.type === activeTab);

  return (
    <>
      <style>{`
        .db-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .db-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; text-decoration: none; }
        .db-btn-primary { background: var(--brand); color: #fff; }
        .db-btn-primary:hover { background: var(--brand-mid); }
        .db-btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .db-btn-ghost:hover { background: var(--surface-2); }
        .db-btn-success-sm { background: var(--success-bg); color: var(--success); border: 1px solid oklch(44% 0.14 145 / 0.25); font-size: 12px; padding: 5px 10px; border-radius: var(--r-sm); font-weight: 600; cursor: pointer; font-family: var(--font); transition: all 0.13s; }
        .db-btn-success-sm:hover { background: oklch(90% 0.07 145); }
        .db-btn-danger-sm { background: var(--danger-bg); color: var(--danger); border: 1px solid oklch(52% 0.18 25 / 0.25); font-size: 12px; padding: 5px 10px; border-radius: var(--r-sm); font-weight: 600; cursor: pointer; font-family: var(--font); transition: all 0.13s; }
        .db-btn-danger-sm:hover { background: oklch(91% 0.07 25); }
        .db-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; }
        .db-badge-success { background: var(--success-bg); color: var(--success); }
        .db-badge-warning { background: var(--warning-bg); color: var(--warning); }
        .db-badge-danger  { background: var(--danger-bg);  color: var(--danger); }
        .db-badge-info    { background: var(--info-bg);    color: var(--info); }
        .db-badge-muted   { background: var(--surface-2);  color: var(--muted); border: 1px solid var(--border); }
        .db-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 16px; }
        .db-tab { padding: 9px 16px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; white-space: nowrap; user-select: none; background: none; border-top: none; border-left: none; border-right: none; font-family: var(--font); }
        .db-tab.active { color: var(--brand); border-bottom-color: var(--brand); }
        .db-tab:hover:not(.active) { color: var(--fg-2); }
        .db-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .db-table th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid var(--border); background: var(--surface-2); }
        .db-table td { padding: 11px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .db-table tr:last-child td { border-bottom: none; }
        .db-table tr:hover td { background: var(--surface-2); }
        .db-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--brand-light); color: var(--brand); font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .db-stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 20px; }
        .db-stat-card { padding: 18px; }
        .db-stat-label { font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em; display: flex; align-items: center; gap: 7px; }
        .db-stat-value { font-size: 22px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; color: var(--fg); }
        .db-stat-delta { font-size: 12px; margin-top: 7px; color: var(--muted); display: flex; align-items: center; gap: 4px; }
        .db-stat-delta.up { color: var(--success); }
        .db-main-grid { display: grid; grid-template-columns: 1fr 36%; gap: 18px; }
        .db-pending-row { display: flex; align-items: center; gap: 10px; padding: 13px 0; border-bottom: 1px solid var(--border); }
        .db-pending-row:last-child { border-bottom: none; padding-bottom: 0; }
        .db-pending-info { flex: 1; min-width: 0; }
        .db-pending-name { font-size: 13px; font-weight: 600; color: var(--fg); }
        .db-pending-meta { font-size: 12px; color: var(--muted); }
        .db-pending-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .db-toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--fg); color: #fff; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 500; z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.2s, transform 0.2s; white-space: nowrap; box-shadow: var(--sh); }
        .db-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .db-toast.success { background: oklch(38% 0.14 145); }
        .db-toast.danger  { background: oklch(42% 0.18 25); }
        .db-money { font-variant-numeric: tabular-nums; }
        @keyframes dbFadeOutRow { from { opacity:1; transform: translateX(0); } to { opacity:0; transform: translateX(-12px); } }
        .db-row-fadeout { animation: dbFadeOutRow 0.35s ease forwards; pointer-events: none; }
        @media (max-width: 768px) {
          .db-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .db-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Alert Banner */}
      {alertVisible && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid oklch(75% 0.12 75)', borderRadius: 'var(--r)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ color: 'var(--warning)' }}>২টি ঋণ মেয়াদোত্তীর্ণ!</strong>
            <span style={{ color: 'var(--fg-2)', fontSize: 13, marginLeft: 8 }}>মো. করিম (৳৮,০০০) এবং সালমা বেগম (৳১২,০০০) — অবিলম্বে যোগাযোগ করুন</span>
          </div>
          <button onClick={() => setAlertVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1, padding: '2px 4px', flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>ড্যাশবোর্ড</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>আজকের সারাংশ — ১৫ জুন ২০২৬</p>
        </div>
        <button className="db-btn db-btn-primary">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          নতুন এন্ট্রি
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="db-stat-grid">
        <div className="db-card db-stat-card">
          <div className="db-stat-label">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="4.5" r="2" stroke="var(--muted)" strokeWidth="1.3"/><path d="M1 12c0-2.485 2.015-4.5 4.5-4.5" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10" cy="4.5" r="1.7" stroke="var(--muted)" strokeWidth="1.2"/><path d="M13 12a3.5 3.5 0 00-3.5-3.5" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            মোট সদস্য
          </div>
          <div className="db-stat-value">১৪২</div>
          <div className="db-stat-delta up">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            +৩ এই মাসে
          </div>
        </div>

        <div className="db-card db-stat-card">
          <div className="db-stat-label">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="4" width="11" height="8" rx="1.5" stroke="var(--muted)" strokeWidth="1.3"/><path d="M4.5 4V3a2.5 2.5 0 015 0v1" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round"/><path d="M4 8h6" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round"/></svg>
            মোট ফান্ড
          </div>
          <div className="db-stat-value db-money">৳৮,৪৫,৫০০</div>
          <div className="db-stat-delta up">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            +৳২২,০০০ এই মাসে
          </div>
        </div>

        <div className="db-card db-stat-card">
          <div className="db-stat-label">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 10.5L4 3.5h6l2.5 7h-11z" stroke="var(--muted)" strokeWidth="1.3" strokeLinejoin="round"/><path d="M1 10.5h12" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round"/></svg>
            মোট কালেকশন
          </div>
          <div className="db-stat-value db-money">৳১২,৩০,০০০</div>
          <div className="db-stat-delta">এই বছরে মোট</div>
        </div>

        <div className="db-card db-stat-card">
          <div className="db-stat-label">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8.5 4l3 3-3 3" stroke="var(--muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ঋণ বিতরণ
          </div>
          <div className="db-stat-value db-money">৳৩,৭৫,০০০</div>
          <div className="db-stat-delta">সক্রিয়: ১৮টি</div>
        </div>

        <div className="db-card db-stat-card" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)', border: 'none', boxShadow: '0 4px 16px oklch(50% 0.26 354 / 0.25)' }}>
          <div className="db-stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8.5" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3"/><path d="M1.5 6.5h11" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3"/><rect x="3.5" y="8" width="2.5" height="1.5" rx="0.5" fill="rgba(255,255,255,0.7)"/></svg>
            বর্তমান ব্যালেন্স
          </div>
          <div className="db-stat-value db-money" style={{ color: '#fff' }}>৳৪,৭০,৫০০</div>
          <div className="db-stat-delta" style={{ color: 'rgba(255,255,255,0.65)' }}>হাতে আছে</div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="db-main-grid">

        {/* LEFT: Recent Transactions */}
        <div className="db-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>সাম্প্রতিক লেনদেন</span>
            <a href="#" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>সব দেখুন →</a>
          </div>

          <div style={{ padding: '0 18px' }}>
            <div className="db-tabs" style={{ marginTop: 12 }}>
              {[
                { key: 'all', label: 'সব' },
                { key: 'collection', label: 'কালেকশন' },
                { key: 'loan', label: 'ঋণ' },
                { key: 'savings', label: 'সঞ্চয়' },
                { key: 'donation', label: 'দান' },
              ].map(t => (
                <button key={t.key} className={`db-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="db-table">
              <thead>
                <tr>
                  <th>সদস্য</th>
                  <th>ধরন</th>
                  <th style={{ fontVariantNumeric: 'tabular-nums' }}>পরিমাণ</th>
                  <th>তারিখ</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="db-avatar" style={{ background: tx.avatarBg, color: tx.avatarColor }}>{tx.avatar}</div>
                        <span style={{ fontWeight: 500 }}>{tx.name}</span>
                      </div>
                    </td>
                    <td><span className={`db-badge db-${tx.badgeClass}`} style={{ fontSize: 11 }}>{tx.badge}</span></td>
                    <td className="db-money" style={{ fontWeight: 600 }}>{tx.amount}</td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                    <td><span className={`db-badge db-${tx.statusClass}`} style={{ fontSize: 11 }}>{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Card A: Pending Approvals */}
          <div className="db-card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>পেন্ডিং অনুমোদন</span>
              <span className="db-badge db-badge-warning">{pendingItems.length}টি</span>
            </div>

            <div>
              {allHandled ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)' }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
                    <circle cx="18" cy="18" r="16" stroke="var(--success)" strokeWidth="1.8"/>
                    <path d="M11 18.5l5 5 9-10" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  সব অনুরোধ সম্পন্ন হয়েছে
                </div>
              ) : (
                pendingItems.map(item => (
                  <div
                    key={item.id}
                    className={`db-pending-row${fadingOut.includes(item.id) ? ' db-row-fadeout' : ''}`}
                  >
                    <div className="db-avatar" style={{ background: item.avatarBg, color: item.avatarColor, flexShrink: 0 }}>{item.avatar}</div>
                    <div className="db-pending-info">
                      <div className="db-pending-name">{item.name}</div>
                      <div className={`db-pending-meta${item.isMoney ? ' db-money' : ''}`}>{item.meta}</div>
                    </div>
                    <div className="db-pending-actions">
                      <button className="db-btn-success-sm" onClick={() => handlePending(item.id, 'approve')}>✓</button>
                      <button className="db-btn-danger-sm" onClick={() => handlePending(item.id, 'reject')}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card B: Monthly Collection Chart */}
          <div className="db-card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>মাসিক কালেকশন</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>২০২৬</span>
            </div>

            <svg viewBox="0 0 260 155" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 155 }}>
              <defs>
                <pattern id="dbStripePattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill="oklch(93% 0.05 155)"/>
                  <line x1="0" y1="0" x2="0" y2="6" stroke="oklch(80% 0.08 155)" strokeWidth="2.5"/>
                </pattern>
              </defs>

              <line x1="24" y1="8" x2="254" y2="8" stroke="var(--border)" strokeWidth="0.8"/>
              <line x1="24" y1="34" x2="254" y2="34" stroke="var(--border)" strokeWidth="0.8"/>
              <line x1="24" y1="60" x2="254" y2="60" stroke="var(--border)" strokeWidth="0.8"/>
              <line x1="24" y1="86" x2="254" y2="86" stroke="var(--border)" strokeWidth="0.8"/>
              <line x1="24" y1="112" x2="254" y2="112" stroke="var(--border)" strokeWidth="0.8"/>

              <text x="20" y="11" textAnchor="end" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">১০৫</text>
              <text x="20" y="37" textAnchor="end" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">৮০</text>
              <text x="20" y="63" textAnchor="end" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">৫৫</text>
              <text x="20" y="89" textAnchor="end" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">৩০</text>
              <text x="20" y="115" textAnchor="end" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">৫</text>

              <line x1="24" y1="120" x2="254" y2="120" stroke="var(--border)" strokeWidth="1.2"/>

              <rect x="32" y="29" width="22" height="91" rx="4" fill="var(--brand-light)"/>
              <text x="43" y="25" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="var(--font)">৮৫</text>

              <rect x="66" y="43" width="22" height="77" rx="4" fill="var(--brand-light)"/>
              <text x="77" y="39" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="var(--font)">৭২</text>

              <rect x="100" y="21" width="22" height="99" rx="4" fill="var(--brand-light)"/>
              <text x="111" y="17" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="var(--font)">৯৩</text>

              <rect x="134" y="26" width="22" height="94" rx="4" fill="var(--brand-light)"/>
              <text x="145" y="22" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="var(--font)">৮৮</text>

              <rect x="168" y="8" width="22" height="112" rx="4" fill="var(--brand)"/>
              <text x="179" y="5" textAnchor="middle" fontSize="8" fill="var(--brand)" fontFamily="var(--font)" fontWeight="700">১০৫</text>

              <rect x="202" y="54" width="22" height="66" rx="4" fill="url(#dbStripePattern)"/>
              <rect x="202" y="54" width="22" height="66" rx="4" fill="none" stroke="var(--brand-light)" strokeWidth="1.5"/>
              <text x="213" y="50" textAnchor="middle" fontSize="8" fill="var(--accent)" fontFamily="var(--font)">৬২</text>

              <text x="43"  y="133" textAnchor="middle" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">জানু</text>
              <text x="77"  y="133" textAnchor="middle" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">ফেব্রু</text>
              <text x="111" y="133" textAnchor="middle" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">মার্চ</text>
              <text x="145" y="133" textAnchor="middle" fontSize="8.5" fill="var(--muted)" fontFamily="var(--font)">এপ্রিল</text>
              <text x="179" y="133" textAnchor="middle" fontSize="8.5" fill="var(--brand)" fontFamily="var(--font)" fontWeight="600">মে</text>
              <text x="213" y="133" textAnchor="middle" fontSize="8.5" fill="var(--accent)" fontFamily="var(--font)">জুন</text>

              <rect x="140" y="145" width="8" height="8" rx="2" fill="var(--brand)"/>
              <text x="151" y="152" fontSize="8" fill="var(--muted)" fontFamily="var(--font)">সম্পন্ন</text>
              <rect x="188" y="145" width="8" height="8" rx="2" fill="url(#dbStripePattern)" stroke="var(--brand-light)" strokeWidth="1"/>
              <text x="199" y="152" fontSize="8" fill="var(--muted)" fontFamily="var(--font)">চলমান</text>
            </svg>

            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>পরিমাণ হাজার টাকায় (৳)</p>
          </div>

        </div>
      </div>

      {/* Toast */}
      <div className={`db-toast${toast ? ' show' : ''}${toast?.type ? ` ${toast.type}` : ''}`}>
        {toast?.msg}
      </div>
    </>
  );
}
