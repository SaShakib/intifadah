'use client';

import { useState, useMemo } from 'react';

const ALL_TRANSACTIONS = [
  { id: 1, date: '১৫ জুন ২০২৬', dateSort: 20260615, type: 'দান', khaat: 'যাকাত ফান্ড', desc: 'মাসিক যাকাত', amount: 500, amountDisplay: '+৳৫০০', positive: true, method: 'bKash', status: 'approved', month: 'জুন ২০২৬' },
  { id: 2, date: '১০ জুন ২০২৬', dateSort: 20260610, type: 'সঞ্চয়', khaat: 'মাসিক সঞ্চয়', desc: 'জুন কিস্তি', amount: 1000, amountDisplay: '+৳১,০০০', positive: true, method: 'নগদ', status: 'approved', month: 'জুন ২০২৬' },
  { id: 3, date: '০৫ জুন ২০২৬', dateSort: 20260605, type: 'পরিশোধ', khaat: 'চিকিৎসা ঋণ', desc: 'ঋণের ২য় কিস্তি', amount: -2000, amountDisplay: '-৳২,০০০', positive: false, method: 'bKash', status: 'done', month: 'জুন ২০২৬' },
  { id: 4, date: '০১ মে ২০২৬', dateSort: 20260501, type: 'সঞ্চয়', khaat: 'মাসিক সঞ্চয়', desc: 'মে কিস্তি', amount: 1000, amountDisplay: '+৳১,০০০', positive: true, method: 'নগদ', status: 'approved', month: 'মে ২০২৬' },
  { id: 5, date: '২৫ এপ্রিল ২০২৬', dateSort: 20260425, type: 'দান', khaat: 'এতিম তহবিল', desc: 'বিশেষ দান', amount: 300, amountDisplay: '+৳৩০০', positive: true, method: 'রকেট', status: 'approved', month: 'এপ্রিল ২০২৬' },
  { id: 6, date: '২০ এপ্রিল ২০২৬', dateSort: 20260420, type: 'পরিশোধ', khaat: 'চিকিৎসা ঋণ', desc: 'ঋণের ১ম কিস্তি', amount: -2000, amountDisplay: '-৳২,০০০', positive: false, method: 'bKash', status: 'done', month: 'এপ্রিল ২০২৬' },
  { id: 7, date: '১৫ এপ্রিল ২০২৬', dateSort: 20260415, type: 'দান', khaat: 'সদকা', desc: 'শুক্রবারের সদকা', amount: 100, amountDisplay: '+৳১০০', positive: true, method: 'নগদ', status: 'approved', month: 'এপ্রিল ২০২৬' },
  { id: 8, date: '০১ এপ্রিল ২০২৬', dateSort: 20260401, type: 'সঞ্চয়', khaat: 'মাসিক সঞ্চয়', desc: 'এপ্রিল কিস্তি', amount: 1000, amountDisplay: '+৳১,০০০', positive: true, method: 'নগদ', status: 'approved', month: 'এপ্রিল ২০২৬' },
  { id: 9, date: '১৫ মার্চ ২০২৬', dateSort: 20260315, type: 'ঋণ', khaat: 'চিকিৎসা ঋণ', desc: 'ঋণ গ্রহণ', amount: -12000, amountDisplay: '-৳১২,০০০', positive: false, method: 'ব্যাংক', status: 'approved', month: 'মার্চ ২০২৬' },
  { id: 10, date: '০১ মার্চ ২০২৬', dateSort: 20260301, type: 'সঞ্চয়', khaat: 'মাসিক সঞ্চয়', desc: 'মার্চ কিস্তি', amount: 1000, amountDisplay: '+৳১,০০০', positive: true, method: 'নগদ', status: 'approved', month: 'মার্চ ২০২৬' },
  { id: 11, date: '২৮ ফেব্রুয়ারি ২০২৬', dateSort: 20260228, type: 'দান', khaat: 'শিক্ষা সহায়তা', desc: 'শিক্ষা সহায়তা', amount: 250, amountDisplay: '+৳২৫০', positive: true, method: 'bKash', status: 'approved', month: 'ফেব্রুয়ারি ২০২৬' },
  { id: 12, date: '০১ ফেব্রুয়ারি ২০২৬', dateSort: 20260201, type: 'সঞ্চয়', khaat: 'মাসিক সঞ্চয়', desc: 'ফেব্রুয়ারি কিস্তি', amount: 1000, amountDisplay: '+৳১,০০০', positive: true, method: 'নগদ', status: 'approved', month: 'ফেব্রুয়ারি ২০২৬' },
  { id: 13, date: '২০ জানুয়ারি ২০২৬', dateSort: 20260120, type: 'দান', khaat: 'যাকাত ফান্ড', desc: 'বার্ষিক যাকাত', amount: 1000, amountDisplay: '+৳১,০০০', positive: true, method: 'ব্যাংক', status: 'approved', month: 'জানুয়ারি ২০২৬' },
  { id: 14, date: '১৫ জানুয়ারি ২০২৬', dateSort: 20260115, type: 'সঞ্চয়', khaat: 'বিশেষ সঞ্চয়', desc: 'বোনাস জমা', amount: 500, amountDisplay: '+৳৫০০', positive: true, method: 'নগদ', status: 'approved', month: 'জানুয়ারি ২০২৬' },
  { id: 15, date: '০১ জানুয়ারি ২০২৬', dateSort: 20260101, type: 'সঞ্চয়', khaat: 'মাসিক সঞ্চয়', desc: 'জানুয়ারি কিস্তি', amount: 1000, amountDisplay: '+৳১,০০০', positive: true, method: 'নগদ', status: 'approved', month: 'জানুয়ারি ২০২৬' },
];

function toBengaliNum(n: number | string) {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(n).replace(/\d/g, (d) => bn[parseInt(d)]);
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = { 'দান': 'badge-dan', 'সঞ্চয়': 'badge-shonchoy', 'ঋণ': 'badge-rin', 'পরিশোধ': 'badge-porishod', 'ট্রান্সফার': 'badge-transfer' };
  return <span className={`badge ${map[type] || 'badge-dan'}`}>{type}</span>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    approved: { cls: 'status-approved', label: 'অনুমোদিত' },
    done: { cls: 'status-done', label: 'সম্পন্ন' },
    pending: { cls: 'status-pending', label: 'অপেক্ষমাণ' },
  };
  const s = map[status] || map.approved;
  return <span className={`status-pill ${s.cls}`}><span className="status-dot"></span>{s.label}</span>;
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [khaatFilter, setKhaatFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('date-desc');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('');
  const [drawerKhaat, setDrawerKhaat] = useState('');
  const [drawerMonth, setDrawerMonth] = useState('');
  const [drawerSort, setDrawerSort] = useState('date-desc');
  const [toasts, setToasts] = useState<{ id: number; msg: string; icon: string }[]>([]);

  const showToast = (msg: string, icon = '✓') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const filtered = useMemo(() => {
    let data = ALL_TRANSACTIONS.filter(tx => {
      if (typeFilter && tx.type !== typeFilter) return false;
      if (khaatFilter && tx.khaat !== khaatFilter) return false;
      if (monthFilter && tx.month !== monthFilter) return false;
      if (search) {
        const hay = (tx.desc + ' ' + tx.amountDisplay + ' ' + tx.khaat + ' ' + tx.method).toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
    if (sortFilter === 'date-desc') data.sort((a, b) => b.dateSort - a.dateSort);
    else if (sortFilter === 'date-asc') data.sort((a, b) => a.dateSort - b.dateSort);
    else if (sortFilter === 'amount-desc') data.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    else if (sortFilter === 'amount-asc') data.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    return data;
  }, [search, typeFilter, khaatFilter, monthFilter, sortFilter]);

  const sumPos = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const sumNeg = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const activeFilterCount = [typeFilter, khaatFilter, monthFilter, search].filter(Boolean).length;

  const clearFilters = () => {
    setSearch(''); setTypeFilter(''); setKhaatFilter(''); setMonthFilter(''); setSortFilter('date-desc');
    setDrawerType(''); setDrawerKhaat(''); setDrawerMonth(''); setDrawerSort('date-desc');
    showToast('ফিল্টার পরিষ্কার করা হয়েছে', '✓');
  };

  const applyDrawer = () => {
    setTypeFilter(drawerType); setKhaatFilter(drawerKhaat); setMonthFilter(drawerMonth); setSortFilter(drawerSort);
    setFilterDrawerOpen(false);
    showToast('ফিল্টার প্রয়োগ হয়েছে', '✓');
  };

  return (
    <>
      <style>{`
        .page-hero { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
        .page-title { font-size: 26px; font-weight: 800; color: var(--fg); letter-spacing: -0.03em; line-height: 1.1; }
        .page-title span { color: var(--brand); }
        .page-subtitle { font-size: 13px; color: var(--muted); margin-top: 4px; font-weight: 400; }
        .hero-export-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: var(--r-sm); border: 1px solid oklch(87% 0.008 354); background: var(--surface); color: var(--fg-2); font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; transition: all var(--dur-fast); box-shadow: var(--sh-sm); flex-shrink: 0; }
        .hero-export-btn:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }

        .summary-strip { background: oklch(100% 0 0 / 0.78); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid oklch(100% 0 0 / 0.4); border-radius: var(--r); box-shadow: var(--sh-sm), inset 0 1px 0 oklch(100% 0 0 / 0.6); display: flex; align-items: stretch; margin-bottom: 20px; overflow: hidden; }
        .summary-stat { flex: 1; display: flex; align-items: center; gap: 12px; padding: 16px 20px; position: relative; }
        .summary-stat + .summary-stat::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 1px; height: 48px; background: var(--border); }
        .summary-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .summary-icon.pink { background: var(--brand-light); }
        .summary-icon.green { background: var(--success-bg); }
        .summary-icon.blue { background: var(--info-bg); }
        .summary-icon.amber { background: var(--warning-bg); }
        .summary-label { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: 0.01em; }
        .summary-value { font-size: 18px; font-weight: 800; color: var(--brand); letter-spacing: -0.02em; line-height: 1.2; margin-top: 1px; }
        .summary-value.green { color: var(--success); }
        .summary-value.blue { color: var(--info); }
        .summary-value.amber { color: var(--warning); }

        .filter-bar-sticky { position: sticky; top: var(--topbar-h); z-index: 80; margin: 0 -28px 20px; padding: 0 28px; }
        .filter-bar-inner { background: oklch(100% 0 0 / 0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); border-top: 1px solid var(--border); padding: 12px 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .filter-search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 260px; }
        .filter-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 14px; pointer-events: none; }
        .filter-input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); font-family: var(--font); font-size: 13px; color: var(--fg); outline: none; transition: border-color var(--dur-fast), box-shadow var(--dur-fast); }
        .filter-input::placeholder { color: var(--muted); }
        .filter-input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .filter-select { padding: 8px 28px 8px 10px; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); font-family: var(--font); font-size: 13px; color: var(--fg); outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; transition: border-color var(--dur-fast); min-width: 0; }
        .filter-select:focus { border-color: var(--brand); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .filter-clear-btn { padding: 8px 13px; border: 1px dashed oklch(87% 0.008 354); border-radius: var(--r-sm); background: transparent; font-family: var(--font); font-size: 12px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all var(--dur-fast); white-space: nowrap; }
        .filter-clear-btn:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }
        .filter-mobile-toggle { display: none; align-items: center; gap: 8px; padding: 9px 16px; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--fg-2); cursor: pointer; transition: all var(--dur-fast); }
        .filter-mobile-toggle:hover { border-color: var(--brand); color: var(--brand); }
        .filter-badge-count { width: 18px; height: 18px; border-radius: 50%; background: var(--brand); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

        .table-card { background: oklch(100% 0 0 / 0.80); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid oklch(100% 0 0 / 0.4); border-radius: var(--r); box-shadow: var(--sh), inset 0 1px 0 oklch(100% 0 0 / 0.6); overflow: hidden; }
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .txn-table { width: 100%; border-collapse: collapse; min-width: 820px; }
        .txn-table thead { background: oklch(98% 0.006 354); border-bottom: 2px solid var(--border); }
        .txn-table thead th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--fg-2); letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; user-select: none; }
        .txn-table thead th.col-amount { text-align: right; }
        .txn-table thead th:last-child { text-align: center; }
        .txn-table tbody tr { border-bottom: 1px solid var(--border); transition: background var(--dur-fast); animation: fadeRow 0.2s ease-out both; }
        @keyframes fadeRow { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .txn-table tbody tr:last-child { border-bottom: none; }
        .txn-table tbody tr:hover { background: oklch(50% 0.26 354 / 0.035); }
        .txn-table td { padding: 13px 14px; font-size: 13.5px; color: var(--fg); vertical-align: middle; }
        .txn-table td.col-date { white-space: nowrap; color: var(--fg-2); font-size: 12.5px; }
        .txn-table td.col-amount { text-align: right; font-size: 14px; font-weight: 700; white-space: nowrap; }
        .txn-table td.col-amount.positive { color: var(--success); }
        .txn-table td.col-amount.negative { color: var(--danger); }
        .txn-table td.col-method { font-size: 12.5px; color: var(--fg-2); }
        .txn-table td.col-status { text-align: center; }
        .txn-table td.col-desc { max-width: 180px; }

        .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 99px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
        .badge-dan { background: oklch(97% 0.04 354); color: var(--brand); border: 1px solid oklch(90% 0.08 354); }
        .badge-shonchoy { background: var(--success-bg); color: var(--success); border: 1px solid oklch(88% 0.08 145); }
        .badge-rin { background: var(--info-bg); color: var(--info); border: 1px solid oklch(88% 0.08 240); }
        .badge-porishod { background: var(--warning-bg); color: var(--warning); border: 1px solid oklch(88% 0.10 80); }
        .badge-transfer { background: oklch(95% 0.05 290); color: oklch(50% 0.18 290); border: 1px solid oklch(88% 0.08 290); }
        .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .status-approved { background: var(--success-bg); color: var(--success); }
        .status-approved .status-dot { background: var(--success); }
        .status-done { background: oklch(95% 0.04 240); color: oklch(45% 0.14 240); }
        .status-done .status-dot { background: oklch(55% 0.15 240); }
        .status-pending { background: var(--warning-bg); color: var(--warning); }
        .status-pending .status-dot { background: var(--warning); }

        .table-footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1px solid var(--border); background: oklch(98% 0.006 354); flex-wrap: wrap; gap: 10px; }
        .table-footer-info { font-size: 12.5px; color: var(--muted); }
        .table-footer-info strong { color: var(--fg-2); font-weight: 600; }
        .table-footer-sum { font-size: 12px; color: var(--muted); text-align: center; }
        .table-footer-sum .pos { color: var(--success); font-weight: 700; }
        .table-footer-sum .neg { color: var(--danger); font-weight: 700; }
        .empty-state { padding: 64px 24px; text-align: center; }
        .empty-state-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
        .empty-state-title { font-size: 16px; font-weight: 700; color: var(--fg-2); margin-bottom: 6px; }
        .empty-state-subtitle { font-size: 13px; color: var(--muted); }

        .filter-drawer-backdrop { display: none; position: fixed; inset: 0; background: oklch(0% 0 0 / 0.50); z-index: 300; backdrop-filter: blur(2px); }
        .filter-drawer-backdrop.open { display: block; }
        .filter-drawer { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-radius: var(--r-lg) var(--r-lg) 0 0; z-index: 310; padding: 20px 20px 32px; transform: translateY(100%); transition: transform var(--dur-normal) var(--ease-out); box-shadow: 0 -8px 40px oklch(0% 0 0 / 0.15); }
        .filter-drawer.open { transform: translateY(0); }
        .filter-drawer-handle { width: 40px; height: 4px; background: oklch(87% 0.008 354); border-radius: 99px; margin: 0 auto 20px; }
        .filter-drawer-title { font-size: 16px; font-weight: 700; color: var(--fg); margin-bottom: 16px; }
        .filter-drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .filter-drawer-field { display: flex; flex-direction: column; gap: 5px; }
        .filter-drawer-field.full { grid-column: 1 / -1; }
        .filter-drawer-label { font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 0.04em; text-transform: uppercase; }
        .filter-drawer-field .filter-select { width: 100%; }
        .drawer-apply-btn { width: 100%; padding: 13px; border-radius: var(--r-sm); border: none; background: var(--brand); color: #fff; font-family: var(--font); font-size: 15px; font-weight: 700; cursor: pointer; transition: background var(--dur-fast); box-shadow: 0 4px 12px oklch(50% 0.26 354 / 0.35); }
        .drawer-apply-btn:hover { background: var(--brand-mid); }

        .toast-container { position: fixed; bottom: 90px; right: 20px; z-index: 500; display: flex; flex-direction: column-reverse; gap: 8px; }
        .toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: oklch(10% 0.01 55); color: #fff; border-radius: var(--r); font-size: 13px; font-weight: 500; box-shadow: 0 8px 24px oklch(0% 0 0 / 0.30); min-width: 220px; max-width: 340px; animation: toastIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(24px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }

        @media (max-width: 1023px) {
          .filter-bar-sticky { margin: 0 -16px 16px; padding: 0 16px; }
          .page-title { font-size: 21px; }
          .hero-export-btn { display: none; }
        }
        @media (max-width: 767px) {
          .summary-strip { flex-direction: column; }
          .summary-stat + .summary-stat::before { top: 0; left: 16px; right: 16px; width: auto; height: 1px; transform: none; }
          .summary-stat { padding: 12px 16px; }
          .summary-value { font-size: 16px; }
          .filter-bar-inner { display: none; }
          .filter-mobile-toggle { display: flex; }
          .table-footer { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
        @media (max-width: 479px) {
          .summary-strip { border-radius: var(--r-sm); }
        }
      `}</style>

      {/* Toast */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => <div key={t.id} className="toast"><span>{t.icon}</span><span>{t.msg}</span></div>)}
      </div>

      {/* Filter Drawer Backdrop */}
      <div className={`filter-drawer-backdrop${filterDrawerOpen ? ' open' : ''}`} onClick={() => setFilterDrawerOpen(false)}></div>
      <div className={`filter-drawer${filterDrawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="ফিল্টার অপশন">
        <div className="filter-drawer-handle"></div>
        <div className="filter-drawer-title">ফিল্টার করুন</div>
        <div className="filter-drawer-grid">
          <div className="filter-drawer-field full">
            <div className="filter-drawer-label">ধরন</div>
            <select className="filter-select" value={drawerType} onChange={e => setDrawerType(e.target.value)} style={{ width: '100%' }}>
              <option value="">সব ধরন</option>
              <option value="দান">দান</option>
              <option value="সঞ্চয়">সঞ্চয়</option>
              <option value="ঋণ">ঋণ</option>
              <option value="পরিশোধ">পরিশোধ</option>
              <option value="ট্রান্সফার">ট্রান্সফার</option>
            </select>
          </div>
          <div className="filter-drawer-field">
            <div className="filter-drawer-label">খাত</div>
            <select className="filter-select" value={drawerKhaat} onChange={e => setDrawerKhaat(e.target.value)} style={{ width: '100%' }}>
              <option value="">সব খাত</option>
              <option value="যাকাত ফান্ড">যাকাত ফান্ড</option>
              <option value="সদকা">সদকা</option>
              <option value="মাসিক সঞ্চয়">মাসিক সঞ্চয়</option>
              <option value="চিকিৎসা ঋণ">চিকিৎসা ঋণ</option>
              <option value="এতিম তহবিল">এতিম তহবিল</option>
              <option value="বিশেষ সঞ্চয়">বিশেষ সঞ্চয়</option>
              <option value="শিক্ষা সহায়তা">শিক্ষা সহায়তা</option>
            </select>
          </div>
          <div className="filter-drawer-field">
            <div className="filter-drawer-label">মাস</div>
            <select className="filter-select" value={drawerMonth} onChange={e => setDrawerMonth(e.target.value)} style={{ width: '100%' }}>
              <option value="">সব মাস</option>
              <option value="জুন ২০২৬">জুন ২০২৬</option>
              <option value="মে ২০২৬">মে ২০২৬</option>
              <option value="এপ্রিল ২০২৬">এপ্রিল ২০২৬</option>
              <option value="মার্চ ২০২৬">মার্চ ২০২৬</option>
              <option value="ফেব্রুয়ারি ২০২৬">ফেব্রুয়ারি ২০২৬</option>
              <option value="জানুয়ারি ২০২৬">জানুয়ারি ২০২৬</option>
            </select>
          </div>
          <div className="filter-drawer-field full">
            <div className="filter-drawer-label">সর্ট</div>
            <select className="filter-select" value={drawerSort} onChange={e => setDrawerSort(e.target.value)} style={{ width: '100%' }}>
              <option value="date-desc">তারিখ (নতুন প্রথম)</option>
              <option value="date-asc">তারিখ (পুরনো প্রথম)</option>
              <option value="amount-desc">পরিমাণ (বেশি)</option>
              <option value="amount-asc">পরিমাণ (কম)</option>
            </select>
          </div>
        </div>
        <button className="drawer-apply-btn" onClick={applyDrawer}>ফিল্টার প্রয়োগ করুন</button>
      </div>

      {/* PAGE HERO */}
      <div className="page-hero">
        <div>
          <h1 className="page-title">আমার <span>লেনদেন</span></h1>
          <p className="page-subtitle">সম্পূর্ণ হিসাবের ইতিহাস</p>
        </div>
        <button className="hero-export-btn" onClick={() => showToast('এক্সপোর্ট শুরু হচ্ছে…', '📥')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          এক্সপোর্ট করুন
        </button>
      </div>

      {/* SUMMARY STRIP */}
      <div className="summary-strip" role="region" aria-label="সারসংক্ষেপ">
        <div className="summary-stat"><div className="summary-icon pink">💝</div><div><div className="summary-label">মোট দান</div><div className="summary-value">৳৩,২৫০</div></div></div>
        <div className="summary-stat"><div className="summary-icon green">🏦</div><div><div className="summary-label">মোট সঞ্চয়</div><div className="summary-value green">৳১২,৫০০</div></div></div>
        <div className="summary-stat"><div className="summary-icon blue">💸</div><div><div className="summary-label">মোট ঋণ</div><div className="summary-value blue">৳১২,০০০</div></div></div>
        <div className="summary-stat"><div className="summary-icon amber">✅</div><div><div className="summary-label">মোট পরিশোধ</div><div className="summary-value amber">৳৪,০০০</div></div></div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar-sticky" role="search" aria-label="লেনদেন ফিল্টার">
        <div className="filter-bar-inner">
          <div className="filter-search-wrap">
            <span className="filter-search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="filter-input" type="search" placeholder="বিবরণ বা পরিমাণ খুঁজুন…" aria-label="লেনদেন খুঁজুন" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" aria-label="ধরন ফিল্টার" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">সব ধরন</option>
            <option value="দান">দান</option>
            <option value="সঞ্চয়">সঞ্চয়</option>
            <option value="ঋণ">ঋণ</option>
            <option value="পরিশোধ">পরিশোধ</option>
            <option value="ট্রান্সফার">ট্রান্সফার</option>
          </select>
          <select className="filter-select" aria-label="খাত ফিল্টার" value={khaatFilter} onChange={e => setKhaatFilter(e.target.value)}>
            <option value="">সব খাত</option>
            <option value="যাকাত ফান্ড">যাকাত ফান্ড</option>
            <option value="সদকা">সদকা</option>
            <option value="মাসিক সঞ্চয়">মাসিক সঞ্চয়</option>
            <option value="চিকিৎসা ঋণ">চিকিৎসা ঋণ</option>
            <option value="এতিম তহবিল">এতিম তহবিল</option>
            <option value="বিশেষ সঞ্চয়">বিশেষ সঞ্চয়</option>
            <option value="শিক্ষা সহায়তা">শিক্ষা সহায়তা</option>
          </select>
          <select className="filter-select" aria-label="মাস ফিল্টার" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
            <option value="">সব মাস</option>
            <option value="জুন ২০২৬">জুন ২০২৬</option>
            <option value="মে ২০২৬">মে ২০২৬</option>
            <option value="এপ্রিল ২০২৬">এপ্রিল ২০২৬</option>
            <option value="মার্চ ২০২৬">মার্চ ২০২৬</option>
            <option value="ফেব্রুয়ারি ২০২৬">ফেব্রুয়ারি ২০২৬</option>
            <option value="জানুয়ারি ২০২৬">জানুয়ারি ২০২৬</option>
          </select>
          <select className="filter-select" aria-label="সর্ট অর্ডার" value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
            <option value="date-desc">তারিখ (নতুন প্রথম)</option>
            <option value="date-asc">তারিখ (পুরনো প্রথম)</option>
            <option value="amount-desc">পরিমাণ (বেশি)</option>
            <option value="amount-asc">পরিমাণ (কম)</option>
          </select>
          <button className="filter-clear-btn" onClick={clearFilters}>✕ ফিল্টার পরিষ্কার করুন</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
          <button className="filter-mobile-toggle" onClick={() => setFilterDrawerOpen(true)} aria-label="ফিল্টার খুলুন">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            ফিল্টার করুন
            {activeFilterCount > 0 && <span className="filter-badge-count">{toBengaliNum(activeFilterCount)}</span>}
          </button>
          <div className="filter-search-wrap" style={{ maxWidth: '100%', flex: '1' }}>
            <span className="filter-search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="filter-input" type="search" placeholder="খুঁজুন…" aria-label="লেনদেন খুঁজুন (মোবাইল)" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card" role="region" aria-label="লেনদেনের তালিকা">
        <div className="table-wrap">
          <table className="txn-table" aria-label="লেনদেন টেবিল">
            <thead>
              <tr>
                <th scope="col">তারিখ</th>
                <th scope="col">ধরন</th>
                <th scope="col">খাত</th>
                <th scope="col">বিবরণ</th>
                <th scope="col" className="col-amount">পরিমাণ</th>
                <th scope="col">পদ্ধতি</th>
                <th scope="col">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <tr key={tx.id} style={{ animationDelay: `${i * 20}ms` }}>
                  <td className="col-date">{tx.date}</td>
                  <td><TypeBadge type={tx.type} /></td>
                  <td>{tx.khaat}</td>
                  <td className="col-desc">{tx.desc}</td>
                  <td className={`col-amount${tx.positive ? ' positive' : ' negative'}`}>{tx.amountDisplay}</td>
                  <td className="col-method">{tx.method}</td>
                  <td className="col-status"><StatusPill status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state" role="status" aria-live="polite">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">কোনো লেনদেন পাওয়া যায়নি</div>
              <div className="empty-state-subtitle">ফিল্টার পরিষ্কার করে আবার চেষ্টা করুন</div>
            </div>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="table-footer">
            <div className="table-footer-info">মোট দেখানো: <strong>{toBengaliNum(filtered.length)}</strong>টি লেনদেন</div>
            <div className="table-footer-sum">
              ফিল্টার করা যোগফল:&nbsp;
              <span className="pos">+৳{toBengaliNum(sumPos)} জমা</span>
              &nbsp;/&nbsp;
              <span className="neg">-৳{toBengaliNum(sumNeg)} খরচ</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
