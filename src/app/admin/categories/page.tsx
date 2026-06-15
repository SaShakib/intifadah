'use client';

import { useState, useCallback } from 'react';

type Category = {
  id: string;
  name: string;
  desc: string;
  type: 'don' | 'san' | 'rin' | 'org';
  typeName: string;
  active: boolean;
  frequency: string;
  amountLabel: string;
  members: string;
  total: string;
  totalColor?: string;
  isSpecial?: boolean;
};

const initialCategories: Category[] = [
  { id: 'c1', name: 'মাসিক দান', desc: 'প্রতি মাসে নির্ধারিত পরিমাণে স্বেচ্ছামূলক দান সংগ্রহ', type: 'don', typeName: 'দান', active: true, frequency: 'মাসিক', amountLabel: '৳৫০০ (ফিক্সড)', members: '১৪ জন', total: '৳৮৪,০০০' },
  { id: 'c2', name: 'বার্ষিক যাকাত', desc: 'বার্ষিক যাকাত সংগ্রহ ও বিতরণ। পরিমাণ সম্পদ অনুযায়ী পরিবর্তনশীল', type: 'don', typeName: 'দান', active: true, frequency: 'বার্ষিক', amountLabel: 'পরিবর্তনশীল', members: '৩২ জন', total: '৳২,৪০,০০০' },
  { id: 'c3', name: 'ব্যক্তিগত সঞ্চয়', desc: 'সদস্যদের নিজস্ব সঞ্চয় জমা। যেকোনো পরিমাণে যেকোনো সময় জমা দেওয়া যাবে', type: 'san', typeName: 'সঞ্চয়', active: true, frequency: 'যেকোনো সময়', amountLabel: 'পরিবর্তনশীল', members: '৪৫ জন', total: '৳৩,৬০,০০০' },
  { id: 'c4', name: 'সদস্য ঋণ', desc: 'কর্যে হাসানাঃ — সুদমুক্ত সদস্য ঋণ। সর্বোচ্চ ৳৫০,০০০ পর্যন্ত', type: 'rin', typeName: 'ঋণ', active: true, frequency: 'কিস্তি', amountLabel: '৳৫০,০০০ (সর্বোচ্চ)', members: '১৮টি', total: '৳৩,৭৫,০০০' },
  { id: 'c5', name: 'সংগঠন ফান্ড', desc: 'সংগঠনের প্রশাসনিক ও পরিচালন ব্যয়ের জন্য নির্ধারিত ফান্ড', type: 'org', typeName: 'সংগঠন', active: true, frequency: 'প্রাতিষ্ঠানিক', amountLabel: 'পরিবর্তনশীল', members: '—', total: '৳১,২০,০০০' },
  { id: 'c6', name: 'শিক্ষা সহায়তা', desc: 'শিক্ষার্থীদের জন্য একবারের শিক্ষা সহায়তা অনুদান', type: 'don', typeName: 'দান', active: true, frequency: 'একবার', amountLabel: 'পরিবর্তনশীল', members: '৮ জন', total: '৳৪৫,০০০' },
  { id: 'c7', name: 'বিবাহ সহায়তা', desc: 'সদস্য পরিবারের বিবাহ অনুষ্ঠানে একবারের বিশেষ সহায়তা অনুদান', type: 'don', typeName: 'দান', active: true, frequency: 'একবার', amountLabel: 'পরিবর্তনশীল', members: '৬ জন', total: '৳৩০,০০০' },
  { id: 'c8', name: 'জরুরী সঞ্চয়', desc: 'মাসিক ফিক্সড সঞ্চয়। জরুরী প্রয়োজনে ব্যবহারের জন্য সংরক্ষিত', type: 'san', typeName: 'সঞ্চয়', active: false, frequency: 'মাসিক', amountLabel: '৳২০০ (ফিক্সড)', members: '—', total: '৳১৮,০০০', totalColor: 'var(--muted)' },
];

export default function CategoriesPage() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [toast, setToast] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // New category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('don');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newAmtType, setNewAmtType] = useState('variable');
  const [newFixedAmt, setNewFixedAmt] = useState('');
  const [newFreq, setNewFreq] = useState('মাসিক');
  const [newMembership, setNewMembership] = useState('all');
  const [newFlexToggle, setNewFlexToggle] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  }, []);

  const filteredCats = categories.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.desc.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const typeColors: Record<string, { bg: string; color: string }> = {
    don: { bg: 'oklch(96% 0.04 354)', color: 'oklch(48% 0.24 354)' },
    san: { bg: 'oklch(95% 0.05 145)', color: 'oklch(40% 0.14 145)' },
    rin: { bg: 'oklch(95% 0.05 240)', color: 'oklch(50% 0.15 240)' },
    org: { bg: 'oklch(96% 0.06 80)', color: 'oklch(50% 0.18 70)' },
  };

  return (
    <>
      <style>{`
        .cat-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s; display: flex; flex-direction: column; overflow: hidden; }
        .cat-card:hover { box-shadow: var(--sh); transform: translateY(-2px); border-color: oklch(50% 0.26 354 / 0.25); }
        .cat-card.inactive { opacity: 0.65; }
        .cat-card-header { padding: 16px 18px 12px; border-bottom: 1px solid var(--border); }
        .cat-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
        .cat-name { font-size: 16px; font-weight: 700; color: var(--fg); line-height: 1.25; }
        .cat-desc { font-size: 12.5px; color: var(--muted); line-height: 1.5; margin-top: 4px; }
        .cat-card-body { padding: 14px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex: 1; }
        .cat-stat-label { font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .cat-stat-value { font-size: 14px; font-weight: 700; color: var(--fg); font-variant-numeric: tabular-nums; }
        .cat-stat-value.money { color: var(--brand-mid); }
        .cat-card-footer { padding: 12px 18px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px; background: var(--surface-2); }
        .cat-card-footer .spacer { flex: 1; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .status-dot.active { background: var(--success); box-shadow: 0 0 0 3px oklch(44% 0.14 145 / 0.2); }
        .status-dot.inactive { background: var(--muted); }
        .cat-btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.13s; text-decoration: none; }
        .cat-btn-ghost:hover { background: var(--surface-2); color: var(--fg); }
        .cat-btn-icon { background: transparent; border: 1px solid var(--border); border-radius: var(--r-sm); padding: 6px 7px; cursor: pointer; display: inline-flex; align-items: center; color: var(--muted); transition: all 0.13s; font-family: var(--font); }
        .cat-btn-icon:hover { background: var(--danger-bg); color: var(--danger); border-color: oklch(52% 0.18 25 / 0.3); }
        .cat-badge-inactive { background: oklch(93% 0.005 300); color: var(--muted); border: 1px solid var(--border); display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .filter-tab { padding: 7px 16px; font-size: 13px; font-weight: 500; color: var(--fg-2); cursor: pointer; border: 1.5px solid var(--border); border-radius: 99px; transition: all 0.13s; background: var(--surface); user-select: none; font-family: var(--font); }
        .filter-tab:hover { border-color: var(--brand); color: var(--brand); }
        .filter-tab.active { background: var(--brand); color: #fff; border-color: var(--brand); box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.25); }
        .cat-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .cat-scard { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); padding: 18px 20px; transition: box-shadow 0.15s, transform 0.15s; }
        .cat-scard:hover { box-shadow: var(--sh); transform: translateY(-1px); }
        .cat-scard-icon { width: 38px; height: 38px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .cat-scard-label { font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
        .cat-scard-value { font-size: 22px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
        .cat-scard-delta { font-size: 12px; margin-top: 5px; color: var(--muted); }
        .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
        .cat-input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; color: var(--fg); background: var(--surface); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .cat-input:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.18); }
        .cat-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer; }
        .cat-label { font-size: 13px; font-weight: 600; color: var(--fg-2); margin-bottom: 6px; display: block; }
        .cat-form-group { margin-bottom: 18px; }
        .cat-radio-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .cat-radio-btn { display: flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1.5px solid var(--border); border-radius: var(--r-sm); cursor: pointer; font-size: 13.5px; transition: all 0.13s; user-select: none; }
        .cat-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--border); }
        .cat-toggle { position: relative; display: inline-block; width: 40px; height: 22px; }
        .cat-toggle input { opacity: 0; width: 0; height: 0; }
        .cat-toggle-slider { position: absolute; inset: 0; background: var(--border); border-radius: 22px; cursor: pointer; transition: background 0.2s; }
        .cat-toggle-slider::before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .cat-toggle input:checked + .cat-toggle-slider { background: var(--brand); }
        .cat-toggle input:checked + .cat-toggle-slider::before { transform: translateX(18px); }
        .cat-modal-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 500; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 20px; }
        .cat-modal-backdrop.show { display: flex; }
        .cat-modal { background: var(--surface); border-radius: var(--r-lg); box-shadow: var(--sh-lg); width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; animation: catModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes catModalIn { from { opacity:0; transform: scale(0.94) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .cat-modal-header { padding: 20px 24px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .cat-modal-title { font-size: 17px; font-weight: 700; color: var(--fg); }
        .cat-modal-close { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all 0.13s; flex-shrink: 0; }
        .cat-modal-close:hover { background: var(--danger-bg); color: var(--danger); border-color: oklch(52% 0.18 25 / 0.35); }
        .cat-modal-body { padding: 22px 24px; overflow-y: auto; flex: 1; }
        .cat-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; background: var(--surface-2); }
        .cat-btn-primary { background: var(--brand); color: #fff; display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; }
        .cat-btn-primary:hover { background: var(--brand-mid); transform: translateY(-1px); box-shadow: 0 4px 12px oklch(50% 0.26 354 / 0.3); }
        .cat-btn-sm { padding: 7px 13px; font-size: 13px; }
        .cat-toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--fg); color: #fff; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 500; z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.22s, transform 0.22s; white-space: nowrap; box-shadow: var(--sh); }
        .cat-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        @media (max-width: 1100px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } .cat-stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .cat-grid { grid-template-columns: 1fr; } .cat-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.2 }}>খাত পরিচালনা</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>ফান্ড ও সংগ্রহের ধরন নির্ধারণ করুন</p>
        </div>
        <button className="cat-btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => setShowNewModal(true)}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          নতুন খাত তৈরি
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="cat-stat-grid">
        <div className="cat-scard">
          <div className="cat-scard-icon" style={{ background: 'var(--brand-light)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h14M2 9h10M2 13h7" stroke="oklch(50% 0.26 354)" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </div>
          <div className="cat-scard-label">মোট খাত</div>
          <div className="cat-scard-value" style={{ color: 'var(--fg)' }}>৮টি</div>
          <div className="cat-scard-delta">সকল ধরন মিলিয়ে</div>
        </div>
        <div className="cat-scard">
          <div className="cat-scard-icon" style={{ background: 'var(--success-bg)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="oklch(44% 0.14 145)" strokeWidth="1.7"/><path d="M5.5 9l2.5 2.5L13 6" stroke="oklch(44% 0.14 145)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="cat-scard-label">সক্রিয় খাত</div>
          <div className="cat-scard-value" style={{ color: 'var(--success)' }}>৬টি</div>
          <div className="cat-scard-delta">২টি নিষ্ক্রিয়</div>
        </div>
        <div className="cat-scard">
          <div className="cat-scard-icon" style={{ background: 'var(--accent-light)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M5 7h8M4 12h10" stroke="oklch(70% 0.18 55)" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </div>
          <div className="cat-scard-label">মোট সংগ্রহ</div>
          <div className="cat-scard-value" style={{ color: 'var(--brand)' }}>৳১৫,৮০,০০০</div>
          <div className="cat-scard-delta" style={{ color: 'var(--success)' }}>↑ ১৮% এই বছর</div>
        </div>
        <div className="cat-scard">
          <div className="cat-scard-icon" style={{ background: 'var(--info-bg)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="11" rx="2" stroke="oklch(55% 0.15 240)" strokeWidth="1.6"/><path d="M6 4V3a1 1 0 012 0v1M10 4V3a1 1 0 012 0v1" stroke="oklch(55% 0.15 240)" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 9h8M5 12h5" stroke="oklch(55% 0.15 240)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="cat-scard-label">এই মাসে</div>
          <div className="cat-scard-value" style={{ color: 'var(--info)' }}>৳৬২,৫০০</div>
          <div className="cat-scard-delta">জুন ২০২৬</div>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'সব' },
            { key: 'don', label: 'দান' },
            { key: 'san', label: 'সঞ্চয়' },
            { key: 'rin', label: 'ঋণ' },
            { key: 'org', label: 'সংগঠন' },
          ].map(f => (
            <button key={f.key} className={`filter-tab${filterType === f.key ? ' active' : ''}`} onClick={() => setFilterType(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <input type="search" className="cat-input" placeholder="খাত খুঁজুন..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: 220, padding: '9px 12px 9px 32px', fontSize: 13 }} />
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="cat-grid">
        {filteredCats.map(cat => {
          const tc = typeColors[cat.type];
          const isSan = cat.type === 'san';
          const statLabel = cat.type === 'rin' ? 'সর্বোচ্চ পরিমাণ' : 'পরিমাণ';
          const membersLabel = cat.type === 'rin' ? 'সক্রিয় ঋণ' : 'সদস্য';
          const totalLabel = cat.type === 'rin' ? 'মোট বিতরণ' : 'মোট সংগৃহীত';
          return (
            <div key={cat.id} className={`cat-card${!cat.active ? ' inactive' : ''}`}>
              <div className="cat-card-header">
                <div className="cat-card-top">
                  <div>
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-desc">{cat.desc}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: tc.bg, color: tc.color, flexShrink: 0 }}>{cat.typeName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`status-dot${cat.active ? ' active' : ' inactive'}`}></div>
                  <span style={{ fontSize: 12, color: cat.active ? 'var(--success)' : 'var(--muted)', fontWeight: 600 }}>{cat.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                  <span style={{ flex: 1 }}></span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{cat.frequency}</span>
                </div>
              </div>
              <div className="cat-card-body">
                <div>
                  <div className="cat-stat-label">{statLabel}</div>
                  <div className="cat-stat-value">{cat.amountLabel}</div>
                </div>
                <div>
                  <div className="cat-stat-label">{membersLabel}</div>
                  <div className="cat-stat-value">{cat.members}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="cat-stat-label">{totalLabel}</div>
                  <div className="cat-stat-value money" style={cat.totalColor ? { color: cat.totalColor } : {}}>{cat.total}</div>
                </div>
              </div>
              <div className="cat-card-footer">
                {cat.active ? (
                  <>
                    <button className="cat-btn-ghost cat-btn-sm" onClick={() => showToast(`${cat.name} — বিস্তারিত লোড হচ্ছে...`)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      বিস্তারিত
                    </button>
                    <button className="cat-btn-ghost cat-btn-sm" onClick={() => setShowEditModal(true)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2.5l2.5 2.5L4 12.5H1.5V10L9 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                      সম্পাদন
                    </button>
                    <div className="spacer"></div>
                    <button className="cat-btn-icon" title="নিষ্ক্রিয় করুন" onClick={() => showToast('খাতটি নিষ্ক্রিয় করা হয়েছে')}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a6 6 0 100 12A6 6 0 007 1zM4 4l6 6M10 4L4 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="cat-btn-ghost cat-btn-sm" onClick={() => showToast(`${cat.name} — বিস্তারিত লোড হচ্ছে...`)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      বিস্তারিত
                    </button>
                    <button className="cat-btn-ghost cat-btn-sm" onClick={() => showToast(`${cat.name} সক্রিয় করা হয়েছে`)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      সক্রিয় করুন
                    </button>
                    <div className="spacer"></div>
                    <span className="cat-badge-inactive" style={{ fontSize: 11 }}>নিষ্ক্রিয়</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW CATEGORY MODAL */}
      <div className={`cat-modal-backdrop${showNewModal ? ' show' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
        <div className="cat-modal" role="dialog" aria-modal="true">
          <div className="cat-modal-header">
            <div>
              <div className="cat-modal-title">নতুন খাত তৈরি করুন</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>একটি নতুন ফান্ড ক্যাটাগরি তৈরি করুন</div>
            </div>
            <button className="cat-modal-close" onClick={() => setShowNewModal(false)} aria-label="বন্ধ করুন">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="cat-modal-body">
            <div className="cat-form-group">
              <label className="cat-label" htmlFor="catName">খাতের নাম <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="text" id="catName" className="cat-input" placeholder="যেমন: মাসিক দান, সাপ্তাহিক সঞ্চয়..." value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
            </div>

            <div className="cat-form-group">
              <label className="cat-label">ধরন <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="cat-radio-row">
                {[
                  { val: 'don', emoji: '🤲', label: 'দান' },
                  { val: 'san', emoji: '💰', label: 'সঞ্চয়' },
                  { val: 'rin', emoji: '🔄', label: 'ঋণ' },
                  { val: 'org', emoji: '🏛️', label: 'সংগঠন' },
                ].map(opt => (
                  <label key={opt.val} className="cat-radio-btn" style={newCatType === opt.val ? { borderColor: 'var(--brand)', background: 'var(--brand-light)', color: 'var(--brand)' } : {}}>
                    <input type="radio" name="catType" value={opt.val} checked={newCatType === opt.val} onChange={() => setNewCatType(opt.val)} style={{ width: 15, height: 15, accentColor: 'var(--brand)' }} />
                    <span style={{ fontSize: 15 }}>{opt.emoji}</span> {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="cat-form-group">
              <label className="cat-label" htmlFor="catDesc">বিস্তারিত বিবরণ</label>
              <textarea id="catDesc" className="cat-input" rows={3} placeholder="এই খাতটি কীভাবে কাজ করে, কারা অংশগ্রহণ করতে পারে..." value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)}></textarea>
            </div>

            <div className="cat-form-group">
              <label className="cat-label">পরিমাণের ধরন <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="cat-radio-row">
                {[
                  { val: 'fixed', label: 'ফিক্সড পরিমাণ' },
                  { val: 'variable', label: 'পরিবর্তনশীল' },
                ].map(opt => (
                  <label key={opt.val} className="cat-radio-btn" style={newAmtType === opt.val ? { borderColor: 'var(--brand)', background: 'var(--brand-light)', color: 'var(--brand)' } : {}}>
                    <input type="radio" name="amtType" value={opt.val} checked={newAmtType === opt.val} onChange={() => setNewAmtType(opt.val)} style={{ width: 15, height: 15, accentColor: 'var(--brand)' }} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {newAmtType === 'fixed' && (
              <div className="cat-form-group">
                <label className="cat-label" htmlFor="fixedAmt">নির্ধারিত পরিমাণ (৳) <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontWeight: 600 }}>৳</span>
                  <input type="number" id="fixedAmt" className="cat-input" placeholder="০" style={{ paddingLeft: 30 }} value={newFixedAmt} onChange={e => setNewFixedAmt(e.target.value)} />
                </div>
              </div>
            )}

            <div className="cat-form-group">
              <label className="cat-label" htmlFor="catFreq">সময়কাল</label>
              <select id="catFreq" className="cat-input cat-select" value={newFreq} onChange={e => setNewFreq(e.target.value)}>
                <option>একবারের জন্য</option>
                <option>সাপ্তাহিক</option>
                <option>পাক্ষিক</option>
                <option>মাসিক</option>
                <option>বার্ষিক</option>
                <option>যেকোনো সময়</option>
              </select>
            </div>

            <div className="cat-form-group">
              <label className="cat-label">সদস্যপদ</label>
              <div className="cat-radio-row">
                {[
                  { val: 'all', label: 'সবার জন্য উন্মুক্ত' },
                  { val: 'primary', label: 'শুধু ১নং সদস্য' },
                ].map(opt => (
                  <label key={opt.val} className="cat-radio-btn" style={newMembership === opt.val ? { borderColor: 'var(--brand)', background: 'var(--brand-light)', color: 'var(--brand)' } : {}}>
                    <input type="radio" name="membership" value={opt.val} checked={newMembership === opt.val} onChange={() => setNewMembership(opt.val)} style={{ width: 15, height: 15, accentColor: 'var(--brand)' }} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="cat-toggle-row">
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>জমার ভিন্ন পরিমাণ অনুমোদন?</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>ফিক্সড হলেও সদস্য ভিন্ন পরিমাণ দিতে পারবেন</div>
              </div>
              <label className="cat-toggle">
                <input type="checkbox" checked={newFlexToggle} onChange={e => setNewFlexToggle(e.target.checked)} />
                <span className="cat-toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="cat-modal-footer">
            <button className="cat-btn-ghost" onClick={() => setShowNewModal(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--fg-2)', border: '1px solid var(--border)' }}>বাতিল</button>
            <button className="cat-btn-primary" onClick={() => { showToast('নতুন খাত সফলভাবে তৈরি হয়েছে!'); setShowNewModal(false); }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              খাত সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <div className={`cat-modal-backdrop${showEditModal ? ' show' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
        <div className="cat-modal" role="dialog" aria-modal="true">
          <div className="cat-modal-header">
            <div>
              <div className="cat-modal-title">খাত সম্পাদনা করুন</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>বিদ্যমান খাতের তথ্য আপডেট করুন</div>
            </div>
            <button className="cat-modal-close" onClick={() => setShowEditModal(false)} aria-label="বন্ধ করুন">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="cat-modal-body">
            <div className="cat-form-group">
              <label className="cat-label">খাতের নাম</label>
              <input type="text" className="cat-input" defaultValue="মাসিক দান" />
            </div>
            <div className="cat-form-group">
              <label className="cat-label">বিস্তারিত বিবরণ</label>
              <textarea className="cat-input" rows={3} defaultValue="প্রতি মাসে নির্ধারিত পরিমাণে স্বেচ্ছামূলক দান সংগ্রহ"></textarea>
            </div>
            <div className="cat-form-group">
              <label className="cat-label">নির্ধারিত পরিমাণ (৳)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontWeight: 600 }}>৳</span>
                <input type="number" className="cat-input" defaultValue={500} style={{ paddingLeft: 30 }} />
              </div>
            </div>
            <div className="cat-form-group">
              <label className="cat-label">সময়কাল</label>
              <select className="cat-input cat-select" defaultValue="মাসিক">
                <option>মাসিক</option>
                <option>সাপ্তাহিক</option>
                <option>বার্ষিক</option>
                <option>যেকোনো সময়</option>
              </select>
            </div>
            <div className="cat-toggle-row">
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg)' }}>খাত সক্রিয়?</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>নিষ্ক্রিয় করলে নতুন লেনদেন বন্ধ হবে</div>
              </div>
              <label className="cat-toggle">
                <input type="checkbox" defaultChecked />
                <span className="cat-toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="cat-modal-footer">
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--fg-2)', border: '1px solid var(--border)' }} onClick={() => setShowEditModal(false)}>বাতিল</button>
            <button className="cat-btn-primary" onClick={() => { showToast('খাত সফলভাবে আপডেট হয়েছে!'); setShowEditModal(false); }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              আপডেট করুন
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`cat-toast${toast ? ' show' : ''}`}>{toast}</div>
    </>
  );
}
