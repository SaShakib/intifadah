'use client';

import { useState, useCallback } from 'react';

export default function ReportsPage() {
  const [activeRange, setActiveRange] = useState('month');
  const [activePeriodTab, setActivePeriodTab] = useState('weekly');
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  }, []);

  const rangeLabels: Record<string, string> = { week: 'এই সপ্তাহের', month: 'এই মাসের', year: 'এই বছরের', custom: 'কাস্টম' };

  const Sparkline = ({ bars }: { bars: number[] }) => (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 20 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 4, height: `${h}%`, borderRadius: '2px 2px 0 0', background: 'var(--brand)', opacity: 0.6 }}></div>
      ))}
    </div>
  );

  return (
    <>
      <style>{`
        .rp-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .rp-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: var(--r-sm); font-family: var(--font); font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; text-decoration: none; line-height: 1.3; }
        .rp-btn-primary { background: var(--brand); color: #fff; }
        .rp-btn-primary:hover { background: var(--brand-mid); transform: translateY(-1px); box-shadow: 0 4px 12px oklch(50% 0.26 354 / 0.3); }
        .rp-btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .rp-btn-ghost:hover { background: var(--surface-2); color: var(--fg); }
        .rp-btn-sm { padding: 7px 13px; font-size: 13px; }
        .rp-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .rp-badge-success { background: var(--success-bg); color: var(--success); }
        .rp-badge-warning { background: var(--warning-bg); color: var(--warning); }
        .rp-badge-danger  { background: var(--danger-bg);  color: var(--danger); }
        .rp-badge-info    { background: var(--info-bg);    color: var(--info); }
        .rp-badge-muted   { background: var(--surface-2);  color: var(--muted); border: 1px solid var(--border); }
        .rp-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 20px; }
        .rp-tab { padding: 9px 18px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; border-bottom: 2.5px solid transparent; margin-bottom: -2px; transition: all 0.13s; white-space: nowrap; user-select: none; font-family: var(--font); background: none; border-top: none; border-left: none; border-right: none; }
        .rp-tab.active { color: var(--brand); border-bottom-color: var(--brand); }
        .rp-tab:hover:not(.active) { color: var(--fg-2); }
        .rp-stat-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 24px; }
        .rp-stat-card { padding: 16px 18px; transition: box-shadow 0.15s, transform 0.15s; }
        .rp-stat-card:hover { box-shadow: var(--sh); transform: translateY(-1px); }
        .rp-stat-icon { width: 34px; height: 34px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .rp-stat-label { font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
        .rp-stat-value { font-size: 19px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
        .rp-stat-delta { font-size: 11.5px; margin-top: 4px; color: var(--muted); }
        .rp-bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 180px; padding: 0 4px 0; }
        .rp-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .rp-bar-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; flex: 1; }
        .rp-bar { width: 100%; max-width: 48px; background: linear-gradient(180deg, var(--brand) 0%, oklch(42% 0.24 354) 100%); border-radius: 5px 5px 0 0; transition: height 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s; min-height: 4px; cursor: pointer; position: relative; }
        .rp-bar:hover { opacity: 0.82; }
        .rp-bar.partial { background: linear-gradient(180deg, var(--accent) 0%, oklch(55% 0.18 55) 100%); }
        .rp-bar-label { font-size: 11px; color: var(--muted); font-weight: 500; text-align: center; margin-top: 6px; }
        .rp-bar-amt { font-size: 10px; color: var(--brand-mid); font-weight: 600; text-align: center; }
        .rp-chart-yaxis { display: flex; flex-direction: column; justify-content: space-between; height: 180px; padding: 4px 0; align-items: flex-end; width: 60px; flex-shrink: 0; }
        .rp-chart-yaxis span { font-size: 10px; color: var(--muted); font-variant-numeric: tabular-nums; text-align: right; }
        .rp-chart-container { display: flex; gap: 10px; align-items: flex-end; width: 100%; }
        .rp-chart-grid { flex: 1; position: relative; }
        .rp-chart-grid-lines { position: absolute; inset: 0 0 28px 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
        .rp-chart-grid-line { border-top: 1px dashed oklch(88% 0.005 354); width: 100%; }
        .rp-table-wrap { overflow-x: auto; border-radius: var(--r); border: 1px solid var(--border); }
        .rp-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 680px; }
        .rp-table th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--border); background: var(--surface-2); white-space: nowrap; cursor: pointer; user-select: none; }
        .rp-table th:hover { color: var(--brand); }
        .rp-table td { padding: 11px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .rp-table tr:last-child td { border-bottom: none; }
        .rp-table tr:hover td { background: var(--brand-light); }
        .rp-money { font-variant-numeric: tabular-nums; font-weight: 600; }
        .rp-money-pos { color: var(--success); }
        .rp-money-neg { color: var(--danger); }
        .rp-money-neutral { color: var(--info); }
        .rp-hbar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .rp-hbar-label { width: 90px; font-size: 12.5px; color: var(--fg-2); flex-shrink: 0; text-align: right; }
        .rp-hbar-track { flex: 1; background: var(--surface-2); border-radius: 4px; height: 10px; overflow: hidden; border: 1px solid var(--border); }
        .rp-hbar-fill { height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .rp-hbar-val { width: 80px; font-size: 12px; font-variant-numeric: tabular-nums; font-weight: 600; color: var(--fg-2); flex-shrink: 0; }
        .rp-hbar-legend { display: flex; gap: 16px; margin-bottom: 12px; }
        .rp-hbar-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .rp-range-btn { padding: 7px 14px; font-size: 12.5px; font-weight: 500; border: 1.5px solid var(--border); border-radius: 99px; background: var(--surface); color: var(--fg-2); cursor: pointer; transition: all 0.13s; font-family: var(--font); }
        .rp-range-btn:hover { border-color: var(--brand); color: var(--brand); }
        .rp-range-btn.active { background: var(--brand); color: #fff; border-color: var(--brand); box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.25); }
        .rp-section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
        .rp-section-title { font-size: 16px; font-weight: 700; color: var(--fg); }
        .rp-section-sub { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
        .rp-sec { margin-bottom: 24px; }
        .rp-legend-list { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 160px; }
        .rp-legend-item { display: flex; align-items: center; gap: 10px; }
        .rp-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .rp-legend-name { font-size: 13px; color: var(--fg-2); flex: 1; }
        .rp-legend-val { font-size: 13px; font-weight: 700; color: var(--fg); font-variant-numeric: tabular-nums; }
        .rp-legend-pct { font-size: 11px; color: var(--muted); width: 36px; text-align: right; }
        .rp-avatar { width: 30px; height: 30px; border-radius: 50%; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rp-toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--fg); color: #fff; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 500; z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.22s, transform 0.22s; white-space: nowrap; box-shadow: var(--sh); }
        .rp-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        @media (max-width: 1100px) { .rp-stat-grid-5 { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .rp-stat-grid-5 { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
      `}</style>

      {/* Page Header + Date Range */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.2 }}>প্রতিবেদন ও বিশ্লেষণ</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>আর্থিক কার্যক্রমের সামগ্রিক চিত্র</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { key: 'week', label: 'এই সপ্তাহ' },
            { key: 'month', label: 'এই মাস' },
            { key: 'year', label: 'এই বছর' },
            { key: 'custom', label: 'কাস্টম' },
          ].map(r => (
            <button key={r.key} className={`rp-range-btn${activeRange === r.key ? ' active' : ''}`} onClick={() => { setActiveRange(r.key); showToast((rangeLabels[r.key] || '') + ' প্রতিবেদন লোড হচ্ছে...'); }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 STAT CARDS */}
      <div className="rp-stat-grid-5">
        <div className="rp-card rp-stat-card">
          <div className="rp-stat-icon" style={{ background: 'var(--success-bg)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M4 6l4-4 4 4" stroke="oklch(44% 0.14 145)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="rp-stat-label">মোট জমা</div>
          <div className="rp-stat-value" style={{ color: 'var(--success)' }}>৳১২,৩০,০০০</div>
          <div className="rp-stat-delta" style={{ color: 'var(--success)' }}>↑ ২২% এই বছর</div>
        </div>
        <div className="rp-card rp-stat-card">
          <div className="rp-stat-icon" style={{ background: 'var(--info-bg)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 4l4 4-4 4" stroke="oklch(55% 0.15 240)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="rp-stat-label">ঋণ বিতরণ</div>
          <div className="rp-stat-value" style={{ color: 'var(--info)' }}>৳৩,৭৫,০০০</div>
          <div className="rp-stat-delta">১৮টি সক্রিয় ঋণ</div>
        </div>
        <div className="rp-card rp-stat-card">
          <div className="rp-stat-icon" style={{ background: 'var(--accent-light)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 8H2M6 12l-4-4 4-4" stroke="oklch(70% 0.18 55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="rp-stat-label">ঋণ ফেরত</div>
          <div className="rp-stat-value" style={{ color: 'var(--accent)' }}>৳১,৩০,০০০</div>
          <div className="rp-stat-delta">৩৪.৭% ফেরত হয়েছে</div>
        </div>
        <div className="rp-card rp-stat-card">
          <div className="rp-stat-icon" style={{ background: 'var(--brand-light)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="oklch(50% 0.26 354)" strokeWidth="1.6"/><path d="M8 5v3.5l2.5 1.5" stroke="oklch(50% 0.26 354)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="rp-stat-label">বর্তমান ব্যালেন্স</div>
          <div className="rp-stat-value" style={{ color: 'var(--brand)' }}>৳৪,৭০,৫০০</div>
          <div className="rp-stat-delta">ব্যবহারযোগ্য তহবিল</div>
        </div>
        <div className="rp-card rp-stat-card">
          <div className="rp-stat-icon" style={{ background: 'oklch(95% 0.04 280)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2.5" stroke="oklch(52% 0.14 280)" strokeWidth="1.5"/><path d="M1.5 13.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="oklch(52% 0.14 280)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="5.5" r="2" stroke="oklch(52% 0.14 280)" strokeWidth="1.3"/><path d="M14 13.5a3 3 0 00-3-3" stroke="oklch(52% 0.14 280)" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </div>
          <div className="rp-stat-label">মোট সদস্য</div>
          <div className="rp-stat-value" style={{ color: 'oklch(45% 0.14 280)' }}>১৪২</div>
          <div className="rp-stat-delta" style={{ color: 'var(--success)' }}>↑ ৮ এই মাসে</div>
        </div>
      </div>

      {/* SECTION 1: BAR CHART */}
      <div className="rp-card rp-sec" style={{ padding: '22px 24px' }}>
        <div className="rp-section-hd">
          <div>
            <div className="rp-section-title">মাসভিত্তিক কালেকশন</div>
            <div className="rp-section-sub">জানুয়ারি — জুন ২০২৬</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--brand)' }}></div> সম্পূর্ণ
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)' }}></div> চলমান
            </div>
          </div>
        </div>

        <div className="rp-chart-container">
          <div className="rp-chart-yaxis">
            <span>১,২০,০০০</span>
            <span>৯০,০০০</span>
            <span>৬০,০০০</span>
            <span>৩০,০০০</span>
            <span>০</span>
          </div>
          <div className="rp-chart-grid">
            <div className="rp-chart-grid-lines">
              <div className="rp-chart-grid-line"></div>
              <div className="rp-chart-grid-line"></div>
              <div className="rp-chart-grid-line"></div>
              <div className="rp-chart-grid-line"></div>
              <div className="rp-chart-grid-line" style={{ borderColor: 'var(--border)', opacity: 0.7 }}></div>
            </div>
            <div className="rp-bar-chart">
              {[
                { label: 'জানু', amt: '৳৮৫,০০০', height: '70.8%', partial: false },
                { label: 'ফেব্রু', amt: '৳৯২,০০০', height: '76.7%', partial: false },
                { label: 'মার্চ', amt: '৳৭৮,০০০', height: '65%', partial: false },
                { label: 'এপ্রিল', amt: '৳১,১৫,০০০', height: '95.8%', partial: false },
                { label: 'মে', amt: '৳৯৮,০০০', height: '81.7%', partial: false },
                { label: 'জুন', amt: '৳৬২,৫০০', height: '52.1%', partial: true },
              ].map((b, i) => (
                <div key={i} className="rp-bar-col">
                  <div className="rp-bar-wrap">
                    <div className={`rp-bar${b.partial ? ' partial' : ''}`} style={{ height: b.height }}></div>
                  </div>
                  <div className="rp-bar-label">{b.label}</div>
                  <div className="rp-bar-amt" style={b.partial ? { color: 'var(--accent)' } : {}}>{b.amt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TABS */}
      <div className="rp-card rp-sec" style={{ padding: '22px 24px' }}>
        <div className="rp-section-hd">
          <div>
            <div className="rp-section-title">কালেকশন সারাংশ</div>
            <div className="rp-section-sub">সময়কাল অনুযায়ী বিশ্লেষণ</div>
          </div>
        </div>

        <div className="rp-tabs">
          {[
            { key: 'weekly', label: 'সাপ্তাহিক' },
            { key: 'monthly', label: 'মাসিক' },
            { key: 'yearly', label: 'বার্ষিক' },
          ].map(t => (
            <button key={t.key} className={`rp-tab${activePeriodTab === t.key ? ' active' : ''}`} onClick={() => setActivePeriodTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Weekly Panel */}
        {activePeriodTab === 'weekly' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>এই সপ্তাহে সংগ্রহ</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>৳১৮,৫০০</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>গত সপ্তাহ: ৳১৬,২০০</div>
              </div>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>এই সপ্তাহে লেনদেন</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--info)' }}>২৩টি</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>গত সপ্তাহ: ১৯টি</div>
              </div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)', marginBottom: 10 }}>শীর্ষ ১০ জমাকারী (এই সপ্তাহ)</div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead><tr><th>#</th><th>সদস্যের নাম</th><th>জমার পরিমাণ</th><th>খাত</th><th>প্রবণতা</th><th>অবস্থা</th></tr></thead>
                <tbody>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>১</td><td><div style={{ fontWeight: 600 }}>মো. রফিকুল ইসলাম</div></td><td className="rp-money rp-money-pos">৳৩,৫০০</td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>মাসিক দান</span></td><td><Sparkline bars={[30,60,50,80,100]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>২</td><td><div style={{ fontWeight: 600 }}>সালেহা বেগম</div></td><td className="rp-money rp-money-pos">৳২,৮০০</td><td><span className="rp-badge rp-badge-info" style={{ fontSize: 11 }}>সঞ্চয়</span></td><td><Sparkline bars={[60,45,70,55,90]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>৩</td><td><div style={{ fontWeight: 600 }}>আবদুল কাদের</div></td><td className="rp-money rp-money-pos">৳২,৫০০</td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>মাসিক দান</span></td><td><Sparkline bars={[90,70,85,95,75]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>৪</td><td><div style={{ fontWeight: 600 }}>নুরুল হক</div></td><td className="rp-money rp-money-pos">৳২,২০০</td><td><span className="rp-badge rp-badge-info" style={{ fontSize: 11 }}>সঞ্চয়</span></td><td><Sparkline bars={[40,65,50,70,80]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>৫</td><td><div style={{ fontWeight: 600 }}>ফাতেমা খানম</div></td><td className="rp-money rp-money-pos">৳১,৮০০</td><td><span className="rp-badge rp-badge-warning" style={{ fontSize: 11 }}>যাকাত</span></td><td><Sparkline bars={[70,80,60,90,65]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly Panel */}
        {activePeriodTab === 'monthly' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>জুন ২০২৬ — সংগ্রহ</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>৳৬২,৫০০</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>মে ২০২৬: ৳৯৮,০০০</div>
              </div>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>মাসিক লেনদেন</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--info)' }}>৮৭টি</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>মে মাস: ১০৪টি</div>
              </div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)', marginBottom: 10 }}>শীর্ষ ১০ জমাকারী (এই মাস)</div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead><tr><th>#</th><th>সদস্যের নাম</th><th>জমার পরিমাণ</th><th>খাত</th><th>প্রবণতা</th><th>অবস্থা</th></tr></thead>
                <tbody>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>১</td><td><div style={{ fontWeight: 600 }}>মো. রফিকুল ইসলাম</div></td><td className="rp-money rp-money-pos">৳১২,৫০০</td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>মাসিক দান</span></td><td><Sparkline bars={[50,70,60,90,100]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>২</td><td><div style={{ fontWeight: 600 }}>জয়নাব আক্তার</div></td><td className="rp-money rp-money-pos">৳১০,০০০</td><td><span className="rp-badge rp-badge-info" style={{ fontSize: 11 }}>সঞ্চয়</span></td><td><Sparkline bars={[80,65,75,85,90]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>৩</td><td><div style={{ fontWeight: 600 }}>কামাল হোসেন</div></td><td className="rp-money rp-money-pos">৳৮,৫০০</td><td><span className="rp-badge rp-badge-warning" style={{ fontSize: 11 }}>যাকাত</span></td><td><Sparkline bars={[60,55,65,70,75]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>সম্পূর্ণ</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Yearly Panel */}
        {activePeriodTab === 'yearly' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>২০২৬ সালে মোট</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>৳৫,৩১,০০০</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>২০২৫ সাল: ৳৪,৩৮,০০০</div>
              </div>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>বার্ষিক প্রবৃদ্ধি</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>+২১.২%</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>টার্গেট: +২৫%</div>
              </div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)', marginBottom: 10 }}>শীর্ষ ১০ জমাকারী (এই বছর)</div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead><tr><th>#</th><th>সদস্যের নাম</th><th>জমার পরিমাণ</th><th>খাত</th><th>প্রবণতা</th><th>অবস্থা</th></tr></thead>
                <tbody>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>১</td><td><div style={{ fontWeight: 600 }}>মো. রফিকুল ইসলাম</div></td><td className="rp-money rp-money-pos">৳৬৮,৫০০</td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>মাসিক দান</span></td><td><Sparkline bars={[70,75,80,85,100]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>নিয়মিত</span></td></tr>
                  <tr><td style={{ color: 'var(--muted)', fontWeight: 700 }}>২</td><td><div style={{ fontWeight: 600 }}>ড. মাহফুজুর রহমান</div></td><td className="rp-money rp-money-pos">৳৫৫,০০০</td><td><span className="rp-badge rp-badge-warning" style={{ fontSize: 11 }}>যাকাত</span></td><td><Sparkline bars={[90,85,95,80,100]}/></td><td><span className="rp-badge rp-badge-success" style={{ fontSize: 11 }}>নিয়মিত</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: সদস্যভিত্তিক হিসাব */}
      <div className="rp-card rp-sec" style={{ padding: '22px 24px' }}>
        <div className="rp-section-hd">
          <div>
            <div className="rp-section-title">সদস্যভিত্তিক হিসাব</div>
            <div className="rp-section-sub">প্রতিটি সদস্যের আর্থিক সারাংশ</div>
          </div>
          <button className="rp-btn rp-btn-ghost rp-btn-sm" onClick={() => showToast('CSV ডাউনলোড হচ্ছে...')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v8M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            CSV ডাউনলোড
          </button>
        </div>
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th onClick={() => showToast('তালিকা সাজানো হচ্ছে...')}>সদস্য <span style={{ marginLeft: 4, opacity: 0.5 }}>↕</span></th>
                <th onClick={() => showToast('তালিকা সাজানো হচ্ছে...')}>মোট জমা <span style={{ marginLeft: 4, opacity: 0.5 }}>↕</span></th>
                <th onClick={() => showToast('তালিকা সাজানো হচ্ছে...')}>ঋণ <span style={{ marginLeft: 4, opacity: 0.5 }}>↕</span></th>
                <th onClick={() => showToast('তালিকা সাজানো হচ্ছে...')}>ফেরত <span style={{ marginLeft: 4, opacity: 0.5 }}>↕</span></th>
                <th onClick={() => showToast('তালিকা সাজানো হচ্ছে...')}>বকেয়া <span style={{ marginLeft: 4, opacity: 0.5 }}>↕</span></th>
                <th>অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {[
                { init: 'র', bg: 'oklch(90% 0.06 354)', color: 'var(--brand)', name: 'মো. রফিকুল ইসলাম', num: '০০৩', total: '৳৬৮,৫০০', loan: '৳২০,০০০', repaid: '৳১৫,০০০', due: '৳৫,০০০', dueColor: 'rp-money-neg', status: 'নিয়মিত', statusClass: 'rp-badge-success' },
                { init: 'স', bg: 'oklch(93% 0.05 145)', color: 'var(--success)', name: 'সালেহা বেগম', num: '০০৭', total: '৳৪৫,২০০', loan: '৳০', repaid: '৳০', due: '—', dueColor: '', status: 'নিয়মিত', statusClass: 'rp-badge-success' },
                { init: 'ক', bg: 'oklch(93% 0.05 240)', color: 'var(--info)', name: 'কামাল হোসেন', num: '০১২', total: '৳৩৮,০০০', loan: '৳৩০,০০০', repaid: '৳১২,০০০', due: '৳১৮,০০০', dueColor: 'rp-money-neg', status: 'কিস্তি বাকি', statusClass: 'rp-badge-warning' },
                { init: 'ন', bg: 'oklch(93% 0.06 80)', color: 'var(--warning)', name: 'নুরুল হক', num: '০১৫', total: '৳৩২,৫০০', loan: '৳৫০,০০০', repaid: '৳৫,০০০', due: '৳৪৫,০০০', dueColor: 'rp-money-neg', status: 'বকেয়া', statusClass: 'rp-badge-danger' },
                { init: 'ফ', bg: 'oklch(90% 0.06 354)', color: 'var(--brand)', name: 'ফাতেমা খানম', num: '০১৮', total: '৳২৮,০০০', loan: '৳০', repaid: '৳০', due: '—', dueColor: '', status: 'নিয়মিত', statusClass: 'rp-badge-success' },
                { init: 'জ', bg: 'oklch(93% 0.05 145)', color: 'var(--success)', name: 'জয়নাব আক্তার', num: '০২১', total: '৳২৫,৫০০', loan: '৳১৫,০০০', repaid: '৳১৫,০০০', due: '৳০', dueColor: 'rp-money-pos', status: 'সম্পূর্ণ', statusClass: 'rp-badge-success' },
                { init: 'আ', bg: 'oklch(93% 0.05 240)', color: 'var(--info)', name: 'আবদুল কাদের', num: '০২৪', total: '৳২২,০০০', loan: '৳২৫,০০০', repaid: '৳১০,০০০', due: '৳১৫,০০০', dueColor: 'rp-money-neg', status: 'কিস্তি বাকি', statusClass: 'rp-badge-warning' },
                { init: 'র', bg: 'oklch(93% 0.06 80)', color: 'var(--warning)', name: 'রহিমা বেগম', num: '০২৯', total: '৳১৮,৫০০', loan: '৳০', repaid: '৳০', due: '—', dueColor: '', status: 'নিয়মিত', statusClass: 'rp-badge-success' },
                { init: 'ম', bg: 'oklch(90% 0.06 354)', color: 'var(--brand)', name: 'মনির উদ্দিন', num: '০৩৩', total: '৳১৫,০০০', loan: '৳৪০,০০০', repaid: '৳২০,০০০', due: '৳২০,০০০', dueColor: 'rp-money-neg', status: 'কিস্তি বাকি', statusClass: 'rp-badge-warning' },
                { init: 'শ', bg: 'oklch(93% 0.05 145)', color: 'var(--success)', name: 'শাহেদা পারভিন', num: '০৩৮', total: '৳১২,০০০', loan: '৳০', repaid: '৳০', due: '—', dueColor: '', status: 'নতুন', statusClass: 'rp-badge-muted' },
              ].map((row, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="rp-avatar" style={{ background: row.bg, color: row.color }}>{row.init}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{row.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>সদস্য #{row.num}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`rp-money rp-money-pos`}>{row.total}</td>
                  <td className={`rp-money rp-money-neutral`}>{row.loan}</td>
                  <td className={`rp-money rp-money-pos`}>{row.repaid}</td>
                  <td className={`rp-money ${row.dueColor}`}>{row.due}</td>
                  <td><span className={`rp-badge ${row.statusClass}`} style={{ fontSize: 11 }}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>মোট ১৪২ সদস্য — প্রথম ১০ দেখাচ্ছে</span>
          <button className="rp-btn rp-btn-ghost rp-btn-sm" onClick={() => showToast('সকল সদস্যের তালিকা লোড হচ্ছে...')}>সব দেখুন →</button>
        </div>
      </div>

      {/* SECTION 4: ঋণ ও ফেরত গ্রাফ */}
      <div className="rp-card rp-sec" style={{ padding: '22px 24px' }}>
        <div className="rp-section-hd">
          <div>
            <div className="rp-section-title">ঋণ ও ফেরত তুলনা</div>
            <div className="rp-section-sub">খাতভিত্তিক বিতরণ ও ফেরতের তুলনামূলক চিত্র</div>
          </div>
          <div className="rp-hbar-legend">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <div className="rp-hbar-dot" style={{ background: 'var(--info)' }}></div> ঋণ বিতরণ
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <div className="rp-hbar-dot" style={{ background: 'var(--success)' }}></div> ফেরত প্রাপ্ত
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 8 }}>সদস্য ঋণ</div>
          <div className="rp-hbar-row"><div className="rp-hbar-label" style={{ fontSize: 11, color: 'var(--muted)' }}>বিতরণ</div><div className="rp-hbar-track"><div className="rp-hbar-fill" style={{ width: '100%', background: 'var(--info)' }}></div></div><div className="rp-hbar-val" style={{ color: 'var(--info)' }}>৳৩,৭৫,০০০</div></div>
          <div className="rp-hbar-row"><div className="rp-hbar-label" style={{ fontSize: 11, color: 'var(--muted)' }}>ফেরত</div><div className="rp-hbar-track"><div className="rp-hbar-fill" style={{ width: '34.7%', background: 'var(--success)' }}></div></div><div className="rp-hbar-val" style={{ color: 'var(--success)' }}>৳১,৩০,০০০</div></div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 8 }}>শিক্ষা সহায়তা</div>
          <div className="rp-hbar-row"><div className="rp-hbar-label" style={{ fontSize: 11, color: 'var(--muted)' }}>বিতরণ</div><div className="rp-hbar-track"><div className="rp-hbar-fill" style={{ width: '45%', background: 'var(--info)' }}></div></div><div className="rp-hbar-val" style={{ color: 'var(--info)' }}>৳৪৫,০০০</div></div>
          <div className="rp-hbar-row"><div className="rp-hbar-label" style={{ fontSize: 11, color: 'var(--muted)' }}>ফেরত</div><div className="rp-hbar-track"><div className="rp-hbar-fill" style={{ width: '28%', background: 'var(--success)' }}></div></div><div className="rp-hbar-val" style={{ color: 'var(--success)' }}>৳২৮,০০০</div></div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 8 }}>বিবাহ সহায়তা</div>
          <div className="rp-hbar-row"><div className="rp-hbar-label" style={{ fontSize: 11, color: 'var(--muted)' }}>বিতরণ</div><div className="rp-hbar-track"><div className="rp-hbar-fill" style={{ width: '30%', background: 'var(--info)' }}></div></div><div className="rp-hbar-val" style={{ color: 'var(--info)' }}>৳৩০,০০০</div></div>
          <div className="rp-hbar-row"><div className="rp-hbar-label" style={{ fontSize: 11, color: 'var(--muted)' }}>ফেরত</div><div className="rp-hbar-track"><div className="rp-hbar-fill" style={{ width: '16.7%', background: 'oklch(45% 0.14 25)' }}></div></div><div className="rp-hbar-val" style={{ color: 'oklch(45% 0.14 25)' }}>৳৫,০০০</div></div>
        </div>
      </div>

      {/* SECTION 5: খাতভিত্তিক সংগ্রহ — Donut Chart */}
      <div className="rp-card rp-sec" style={{ padding: '22px 24px' }}>
        <div className="rp-section-hd">
          <div>
            <div className="rp-section-title">খাতভিত্তিক সংগ্রহ</div>
            <div className="rp-section-sub">মোট সংগ্রহের খাত বিভাজন</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
            <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'conic-gradient(oklch(48% 0.24 354) 0deg 115deg, oklch(44% 0.14 145) 115deg 202deg, oklch(55% 0.15 240) 202deg 260deg, oklch(55% 0.14 75) 260deg 295deg, oklch(70% 0.18 55) 295deg 360deg)', boxShadow: '0 4px 20px oklch(50% 0.26 354 / 0.2)' }}></div>
            <div style={{ position: 'absolute', inset: 36, borderRadius: '50%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', lineHeight: 1 }}>৳১৫.৮ লক্ষ</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>মোট</div>
            </div>
          </div>

          <div className="rp-legend-list">
            {[
              { dot: 'oklch(48% 0.24 354)', name: 'দান (মাসিক + যাকাত + অন্যান্য)', val: '৳৩,৯৯,০০০', pct: '৩২%' },
              { dot: 'oklch(44% 0.14 145)', name: 'সঞ্চয়', val: '৳৩,৭৮,০০০', pct: '২৪%' },
              { dot: 'oklch(55% 0.15 240)', name: 'ঋণ ফেরত', val: '৳১,৩০,০০০', pct: '১৬%' },
              { dot: 'oklch(55% 0.14 75)', name: 'যাকাত', val: '৳২,৪০,০০০', pct: '১০%' },
              { dot: 'oklch(70% 0.18 55)', name: 'সংগঠন ফান্ড', val: '৳১,২০,০০০', pct: '১৮%' },
            ].map((item, i) => (
              <div key={i} className="rp-legend-item">
                <div className="rp-legend-dot" style={{ background: item.dot }}></div>
                <div className="rp-legend-name">{item.name}</div>
                <div className="rp-legend-val">{item.val}</div>
                <div className="rp-legend-pct">{item.pct}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--r)', border: '1px solid var(--border)', minWidth: 160 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>সর্বোচ্চ খাত</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>দান</div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>প্রবৃদ্ধি</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>+১৮%</div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>সক্রিয় খাত</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>৬টি</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Export Row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--sh-sm)' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>প্রতিবেদন রপ্তানি করুন:</span>
        <button className="rp-btn rp-btn-ghost" onClick={() => showToast('PDF ডাউনলোড হচ্ছে...')}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11.5 10.5V13H3.5V2H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 2l3.5 3.5H8V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 7.5h4M5.5 9.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          PDF ডাউনলোড
        </button>
        <button className="rp-btn rp-btn-ghost" onClick={() => showToast('Excel ডাউনলোড হচ্ছে...')}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 5.5L9.5 9.5M9.5 5.5L5.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          Excel ডাউনলোড
        </button>
        <button className="rp-btn rp-btn-primary" onClick={() => showToast('প্রিন্ট ডায়ালগ খুলছে...')}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3.5 5.5V2.5h8v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="1.5" y="5.5" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3.5 11.5v1h8v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          প্রিন্ট করুন
        </button>
      </div>

      {/* Toast */}
      <div className={`rp-toast${toast ? ' show' : ''}`}>{toast}</div>
    </>
  );
}
