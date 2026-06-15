'use client';

import { useState } from 'react';
import Link from 'next/link';

const HISTORY_ROWS = [
  { khaat: 'সদকা', khaatKey: 'সদকা', month: 'জুন', emoji: '💚', date: '১০ জুন ২০২৬', amount: '৳৫০০', method: 'bKash', methodCls: 'method-bkash', status: 'success', statusLabel: '✓ অনুমোদিত', search: 'সদকা bkash' },
  { khaat: 'যাকাত ফান্ড', khaatKey: 'যাকাত ফান্ড', month: 'মে', emoji: '🌙', date: '২৫ মে ২০২৬', amount: '৳১,০০০', method: 'নগদ', methodCls: 'method-nagad', status: 'success', statusLabel: '✓ অনুমোদিত', search: 'যাকাত ফান্ড nagad নগদ' },
  { khaat: 'শিক্ষা সহায়তা', khaatKey: 'শিক্ষা সহায়তা', month: 'মে', emoji: '📚', date: '১৩ মে ২০২৬', amount: '৳২৫০', method: 'bKash', methodCls: 'method-bkash', status: 'warning', statusLabel: '⏳ মুলতুবি', search: 'শিক্ষা সহায়তা bkash' },
  { khaat: 'এতিম তহবিল', khaatKey: 'এতিম তহবিল', month: 'এপ্রিল', emoji: '🤲', date: '০৫ এপ্রিল ২০২৬', amount: '৳৭৫০', method: 'রকেট', methodCls: 'method-rocket', status: 'success', statusLabel: '✓ অনুমোদিত', search: 'এতিম তহবিল rocket রকেট' },
  { khaat: 'যাকাত ফান্ড', khaatKey: 'যাকাত ফান্ড', month: 'মার্চ', emoji: '🌙', date: '১৮ মার্চ ২০২৬', amount: '৳৭৫০', method: 'ব্যাংক ট্রান্সফার', methodCls: 'method-bank', status: 'success', statusLabel: '✓ অনুমোদিত', search: 'যাকাত ফান্ড bank ব্যাংক' },
];

export default function DonationsPage() {
  const [selectedKhaat, setSelectedKhaat] = useState('');
  const [donateAmount, setDonateAmount] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('bkash');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterKhaat, setFilterKhaat] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const [khaatError, setKhaatError] = useState(false);
  const [amountError, setAmountError] = useState(false);

  const showToast = (message: string, type = 'brand') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg: message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleQuickAmount = (val: string) => {
    setSelectedQuickAmount(val);
    if (val !== 'custom') {
      setDonateAmount(val);
      setAmountError(false);
    } else {
      setDonateAmount('');
    }
  };

  const handleAmountInput = (v: string) => {
    setDonateAmount(v);
    setAmountError(false);
    if (selectedQuickAmount !== 'custom') setSelectedQuickAmount(null);
  };

  const handleKhaatSelectBtn = (khaatKey: string) => {
    setSelectedKhaat(khaatKey);
    setKhaatError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!selectedKhaat) { setKhaatError(true); valid = false; }
    const amt = parseFloat(donateAmount);
    if (!donateAmount || isNaN(amt) || amt < 10) { setAmountError(true); valid = false; }
    if (!valid) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFormSuccess(true);
      showToast('দান গ্রহণ করা হয়েছে — জাযাকাল্লাহ ✓', 'success');
    }, 900);
  };

  const handleDonateAgain = () => {
    setFormSuccess(false);
    setSelectedKhaat('');
    setDonateAmount('');
    setNoteInput('');
    setSelectedPayment('bkash');
    setSelectedQuickAmount(null);
    setKhaatError(false);
    setAmountError(false);
  };

  const visibleRows = HISTORY_ROWS.filter(row => {
    if (filterKhaat && row.khaatKey !== filterKhaat) return false;
    if (filterMonth && row.month !== filterMonth) return false;
    if (filterSearch) {
      const hay = (row.search + ' ' + row.khaat + ' ' + row.method).toLowerCase();
      if (!hay.includes(filterSearch.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <>
      <style>{`
        .donate-hero { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 60%, oklch(38% 0.22 354) 100%); border-radius: var(--r-lg); padding: 30px 32px 28px; margin-bottom: 28px; position: relative; overflow: hidden; box-shadow: var(--sh-lg); }
        .donate-hero::before { content: ''; position: absolute; top: -70px; right: -70px; width: 240px; height: 240px; border-radius: 50%; background: oklch(100% 0 0 / 0.07); pointer-events: none; }
        .donate-hero::after { content: ''; position: absolute; bottom: -50px; left: 35%; width: 200px; height: 200px; border-radius: 50%; background: oklch(100% 0 0 / 0.04); pointer-events: none; }
        .donate-hero-decor { position: absolute; right: 32px; top: 50%; transform: translateY(-50%); font-size: 72px; opacity: 0.12; line-height: 1; user-select: none; pointer-events: none; }
        .donate-hero-inner { position: relative; z-index: 1; }
        .donate-hero-arabic { font-size: 13px; color: oklch(100% 0 0 / 0.60); margin-bottom: 12px; direction: rtl; text-align: left; letter-spacing: 0.04em; font-style: italic; }
        .donate-hero-title { font-size: 30px; font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 8px; }
        .donate-hero-sub { font-size: 14px; color: oklch(100% 0 0 / 0.72); line-height: 1.5; max-width: 480px; }

        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .sum-card { border-radius: var(--r-lg); padding: 22px 22px 20px; position: relative; overflow: hidden; }
        .sum-card-hero { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%); box-shadow: 0 6px 24px oklch(50% 0.26 354 / 0.30); }
        .sum-card-hero::before { content: ''; position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; background: oklch(100% 0 0 / 0.08); }
        .sum-card-surface { background: var(--surface); border: 1px solid var(--border); box-shadow: var(--sh-sm); }
        .sum-icon { width: 38px; height: 38px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; font-size: 17px; margin-bottom: 14px; }
        .sum-card-hero .sum-icon { background: oklch(100% 0 0 / 0.15); }
        .sum-icon-success { background: var(--success-bg); }
        .sum-icon-info { background: var(--info-bg); }
        .sum-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
        .sum-card-hero .sum-label { color: oklch(100% 0 0 / 0.60); }
        .sum-card-surface .sum-label { color: var(--muted); }
        .sum-amount { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1; margin-bottom: 8px; }
        .sum-card-hero .sum-amount { color: #fff; }
        .sum-card-surface .sum-amount { color: var(--fg); }
        .sum-meta { font-size: 11.5px; display: flex; align-items: center; gap: 5px; }
        .sum-card-hero .sum-meta { color: oklch(100% 0 0 / 0.55); }
        .sum-card-surface .sum-meta { color: var(--muted); }

        .donate-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 24px; align-items: start; margin-bottom: 32px; }
        .glass-card { background: oklch(100% 0 0 / 0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid oklch(100% 0 0 / 0.35); border-radius: var(--r-lg); box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.12), inset 0 1px 0 oklch(100% 0 0 / 0.5); }
        .surface-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .donate-form-card { padding: 28px; }
        .donate-form-title { font-size: 18px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; }
        .donate-form-subtitle { font-size: 12.5px; color: var(--muted); margin-top: 3px; }
        .donate-form-header { margin-bottom: 24px; }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 18px; border-radius: var(--r-sm); font-family: var(--font); font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; transition: all var(--dur-fast) var(--ease-out); text-decoration: none; white-space: nowrap; line-height: 1; }
        .btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--brand); color: #fff; box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.35); }
        .btn-primary:hover { background: var(--brand-mid); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .btn-ghost:hover { background: var(--surface-2); color: var(--fg); }
        .btn-sm { padding: 7px 14px; font-size: 12.5px; }
        .btn-full { width: 100%; justify-content: center; }

        .input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; color: var(--fg); background: var(--surface); outline: none; transition: border-color var(--dur-fast), box-shadow var(--dur-fast); appearance: none; -webkit-appearance: none; }
        .input:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .input::placeholder { color: var(--muted); }
        .input.error { border-color: var(--danger); }
        .input.error:focus { box-shadow: 0 0 0 3px oklch(52% 0.18 25 / 0.15); }

        .select-wrap { position: relative; }
        .select-wrap::after { content: '▾'; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; font-size: 12px; }
        .input-select { cursor: pointer; padding-right: 36px; }

        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: var(--fg-2); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
        .form-hint { font-size: 11px; color: var(--muted); margin-top: 4px; }
        .form-error { font-size: 11.5px; color: var(--danger); margin-top: 4px; }

        .quick-amounts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .quick-amount-btn { padding: 7px 14px; border-radius: 99px; border: 1.5px solid var(--border); background: var(--surface); font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--fg-2); cursor: pointer; transition: all var(--dur-fast) var(--ease-out); font-variant-numeric: tabular-nums; }
        .quick-amount-btn:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }
        .quick-amount-btn.selected { border-color: var(--brand); background: var(--brand); color: #fff; box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.30); }

        .amount-input-wrap { position: relative; }
        .amount-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 17px; font-weight: 700; color: var(--brand); pointer-events: none; user-select: none; }
        .amount-input-wrap .input { padding-left: 34px; font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; }

        .payment-methods { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
        .payment-pill { position: relative; }
        .payment-pill input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; }
        .payment-pill label { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--r-sm); background: var(--surface); cursor: pointer; transition: all var(--dur-fast); font-size: 13px; font-weight: 600; color: var(--fg-2); }
        .payment-pill label:hover { border-color: oklch(78% 0.12 354); background: var(--brand-light); color: var(--brand); }
        .payment-pill input[type="radio"]:checked + label { border-color: var(--brand); background: var(--brand-light); color: var(--brand); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .pay-icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }

        .form-success-state { display: none; flex-direction: column; align-items: center; text-align: center; padding: 40px 24px; gap: 14px; }
        .form-success-state.show { display: flex; }
        .form-main-body.hidden { display: none; }
        .success-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--success-bg), oklch(90% 0.06 145)); border: 3px solid var(--success); color: var(--success); font-size: 34px; display: flex; align-items: center; justify-content: center; animation: successPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes successPop { from { transform: scale(0.4) rotate(-20deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
        .success-arabic-big { font-size: 18px; color: var(--accent); font-weight: 700; direction: rtl; letter-spacing: 0.04em; }
        .success-headline { font-size: 22px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; }
        .success-subtext { font-size: 13.5px; color: var(--muted); line-height: 1.65; max-width: 300px; }

        .khaat-card-sidebar { overflow: hidden; }
        .khaat-card-header-s { padding: 18px 20px 14px; border-bottom: 1px solid var(--border); background: var(--surface-2); }
        .khaat-card-title-s { font-size: 14px; font-weight: 800; color: var(--fg); letter-spacing: -0.01em; }
        .khaat-card-subtitle-s { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
        .khaat-list { padding: 8px 0; }
        .khaat-item { padding: 16px 20px; border-bottom: 1px solid var(--border); transition: background var(--dur-fast); }
        .khaat-item:last-child { border-bottom: none; }
        .khaat-item:hover { background: var(--surface-2); }
        .khaat-item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
        .khaat-item-name { font-size: 13.5px; font-weight: 700; color: var(--fg); display: flex; align-items: center; gap: 6px; }
        .khaat-emoji { font-size: 16px; }
        .khaat-collected { font-size: 13px; font-weight: 800; color: var(--brand); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .khaat-desc-s { font-size: 11.5px; color: var(--muted); line-height: 1.5; margin-bottom: 10px; }
        .khaat-progress-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
        .khaat-target { font-size: 11px; color: var(--muted); }
        .khaat-pct { font-size: 11px; font-weight: 700; }
        .progress-bg { height: 7px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1); }
        .progress-brand { background: linear-gradient(90deg, var(--brand), oklch(56% 0.22 354)); }
        .progress-success { background: linear-gradient(90deg, var(--success), oklch(52% 0.16 148)); }
        .progress-accent { background: linear-gradient(90deg, var(--accent), oklch(76% 0.16 55)); }
        .progress-info { background: linear-gradient(90deg, var(--info), oklch(60% 0.14 230)); }
        .khaat-item-btn { margin-top: 10px; width: 100%; padding: 7px 12px; border-radius: var(--r-sm); border: 1.5px solid var(--border); background: var(--surface); font-family: var(--font); font-size: 12px; font-weight: 600; color: var(--brand); cursor: pointer; transition: all var(--dur-fast); text-align: center; }
        .khaat-item-btn:hover { background: var(--brand); color: #fff; border-color: var(--brand); box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.25); }

        .section-title-h { font-size: 17px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; }
        .section-subtitle-h { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .history-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }

        .filter-bar-donate { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .filter-select-donate { padding: 8px 32px 8px 12px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; color: var(--fg-2); background: var(--surface); appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; cursor: pointer; outline: none; transition: border-color var(--dur-fast); }
        .filter-select-donate:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .filter-search-wrap-donate { position: relative; flex: 1; min-width: 160px; }
        .filter-search-icon-donate { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 14px; pointer-events: none; }
        .filter-search-donate { width: 100%; padding: 8px 12px 8px 34px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; color: var(--fg); background: var(--surface); outline: none; transition: border-color var(--dur-fast); }
        .filter-search-donate:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .filter-search-donate::placeholder { color: var(--muted); }

        .table-wrap-donate { overflow: hidden; border-radius: var(--r); border: 1px solid var(--border); box-shadow: var(--sh-sm); overflow-x: auto; }
        .history-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 580px; }
        .history-table th { text-align: left; padding: 11px 16px; font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; background: var(--surface-2); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .history-table td { padding: 13px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .history-table tr:last-child td { border-bottom: none; }
        .history-table tbody tr { transition: background var(--dur-fast); }
        .history-table tbody tr:hover { background: var(--surface-2); }
        .txn-amount { font-weight: 800; font-variant-numeric: tabular-nums; font-size: 14px; color: var(--brand); }
        .txn-date { color: var(--fg-2); font-size: 12.5px; white-space: nowrap; }
        .txn-category { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 600; color: var(--fg); }
        .txn-method { font-size: 12.5px; color: var(--fg-2); display: flex; align-items: center; gap: 5px; }
        .method-dot { width: 8px; height: 8px; border-radius: 50%; }
        .method-bkash { background: oklch(50% 0.26 354); }
        .method-nagad { background: oklch(55% 0.22 40); }
        .method-rocket { background: oklch(42% 0.20 290); }
        .method-bank { background: oklch(55% 0.15 240); }
        .badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; }
        .badge-success { background: var(--success-bg); color: var(--success); }
        .badge-warning { background: var(--warning-bg); color: var(--warning); }
        .table-empty { padding: 40px 20px; text-align: center; color: var(--muted); font-size: 13px; }

        .toast-container { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 600; display: flex; flex-direction: column; gap: 8px; pointer-events: none; width: 90%; max-width: 380px; }
        .toast { background: var(--fg); color: #fff; padding: 12px 16px; border-radius: var(--r); font-size: 13px; font-weight: 500; box-shadow: var(--sh-lg); display: flex; align-items: center; gap: 10px; animation: toastIn 0.30s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; pointer-events: all; }
        .toast.success { background: var(--success); }
        .toast.brand { background: var(--brand); }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-14px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

        @media (max-width: 919px) {
          .summary-grid { grid-template-columns: 1fr; gap: 10px; }
          .donate-grid { grid-template-columns: 1fr; }
          .donate-hero { padding: 22px 20px 20px; }
          .donate-hero-title { font-size: 24px; }
          .donate-hero-decor { display: none; }
        }
        @media (max-width: 699px) {
          .payment-methods { grid-template-columns: 1fr 1fr; }
          .donate-form-card { padding: 20px 18px; }
        }
      `}</style>

      {/* Toast */}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => <div key={t.id} className={`toast${t.type ? ' ' + t.type : ''}`}><span>{t.type === 'success' ? '✓' : '💝'}</span><span>{t.msg}</span></div>)}
      </div>

      {/* HERO BANNER */}
      <section className="donate-hero" aria-label="দান পাতার পরিচিতি">
        <div className="donate-hero-decor" aria-hidden="true">☪</div>
        <div className="donate-hero-inner">
          <div className="donate-hero-arabic" dir="rtl">مَن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً</div>
          <h2 className="donate-hero-title">দান করুন</h2>
          <p className="donate-hero-sub">আপনার দান আল্লাহর পথে ব্যয় হবে — জাযাকাল্লাহ খাইরান। প্রতিটি দান আপনার আখিরাতের পাথেয়।</p>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="summary-grid" aria-label="দানের সারসংক্ষেপ">
        <div className="sum-card sum-card-hero">
          <div className="sum-icon"><span aria-hidden="true">💝</span></div>
          <div className="sum-label">এই মাসে দান</div>
          <div className="sum-amount">৳৫০০</div>
          <div className="sum-meta"><span aria-hidden="true">📅</span> জুন ২০২৬</div>
        </div>
        <div className="sum-card sum-card-surface">
          <div className="sum-icon sum-icon-success"><span aria-hidden="true">✅</span></div>
          <div className="sum-label">মোট দান</div>
          <div className="sum-amount">৳৩,২৫০</div>
          <div className="sum-meta" style={{ color: 'var(--success)', fontWeight: 600 }}><span aria-hidden="true">↑</span> সদস্যপদ থেকে</div>
        </div>
        <div className="sum-card sum-card-surface">
          <div className="sum-icon sum-icon-info"><span aria-hidden="true">🕐</span></div>
          <div className="sum-label">সর্বশেষ দান</div>
          <div className="sum-amount" style={{ fontSize: '18px', lineHeight: '1.4', marginTop: '4px' }}>১০ জুন ২০২৬</div>
          <div className="sum-meta"><span aria-hidden="true">🏦</span> সদকা খাত · bKash</div>
        </div>
      </section>

      {/* DONATE FORM + KHAAT SIDEBAR */}
      <section className="donate-grid" aria-label="দান ফর্ম ও খাতসমূহ">

        {/* LEFT: DONATE FORM */}
        <div className="glass-card donate-form-card">
          <div className="donate-form-header">
            <h3 className="donate-form-title">নতুন দান করুন</h3>
            <p className="donate-form-subtitle">নিচের তথ্য পূরণ করে আপনার দান সম্পন্ন করুন</p>
          </div>

          <div className={`form-main-body${formSuccess ? ' hidden' : ''}`}>
            <form id="donateForm" noValidate onSubmit={handleSubmit}>

              {/* খাত */}
              <div className="form-group">
                <label className="form-label" htmlFor="khaatSelect">খাত বেছে নিন <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="select-wrap">
                  <select className={`input input-select${khaatError ? ' error' : ''}`} id="khaatSelect" name="khaat" required aria-required="true" value={selectedKhaat} onChange={e => { setSelectedKhaat(e.target.value); setKhaatError(false); }}>
                    <option value="">— খাত নির্বাচন করুন —</option>
                    <option value="zakat">যাকাত ফান্ড</option>
                    <option value="sadaka">সদকা</option>
                    <option value="yatim">এতিম তহবিল</option>
                    <option value="education">শিক্ষা সহায়তা</option>
                  </select>
                </div>
                {khaatError && <div className="form-error">অনুগ্রহ করে একটি খাত নির্বাচন করুন।</div>}
              </div>

              {/* পরিমাণ */}
              <div className="form-group">
                <label className="form-label" htmlFor="amountInput">পরিমাণ (৳) <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="amount-input-wrap" style={{ marginBottom: '8px' }}>
                  <span className="amount-prefix" aria-hidden="true">৳</span>
                  <input type="number" className={`input${amountError ? ' error' : ''}`} id="amountInput" placeholder="০" min="10" step="1" required aria-required="true" value={donateAmount} onChange={e => handleAmountInput(e.target.value)} />
                </div>
                <div className="quick-amounts" role="group" aria-label="দ্রুত পরিমাণ বেছে নিন">
                  {[{ val: '100', label: '৳১০০' }, { val: '250', label: '৳২৫০' }, { val: '500', label: '৳৫০০' }, { val: '1000', label: '৳১০০০' }].map(q => (
                    <button key={q.val} type="button" className={`quick-amount-btn${selectedQuickAmount === q.val ? ' selected' : ''}`} onClick={() => handleQuickAmount(q.val)}>{q.label}</button>
                  ))}
                  <button type="button" className={`quick-amount-btn${selectedQuickAmount === 'custom' ? ' selected' : ''}`} onClick={() => handleQuickAmount('custom')}>৳ অন্য পরিমাণ</button>
                </div>
                <div className="form-hint" id="amountHint">সর্বনিম্ন ৳১০ থেকে দান করা যাবে।</div>
                {amountError && <div className="form-error">সঠিক পরিমাণ লিখুন (ন্যূনতম ৳১০)।</div>}
              </div>

              {/* নোট */}
              <div className="form-group">
                <label className="form-label" htmlFor="noteInput">নোট / বার্তা <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(ঐচ্ছিক)</span></label>
                <textarea className="input" id="noteInput" rows={3} placeholder="আপনার দান সম্পর্কে কিছু লিখতে পারেন…" style={{ resize: 'vertical', minHeight: '80px' }} value={noteInput} onChange={e => setNoteInput(e.target.value)}></textarea>
              </div>

              {/* পেমেন্ট পদ্ধতি */}
              <div className="form-group">
                <div className="form-label" id="paymentMethodLabel">পেমেন্ট পদ্ধতি <span style={{ color: 'var(--danger)' }}>*</span></div>
                <div className="payment-methods" role="radiogroup" aria-labelledby="paymentMethodLabel">
                  <div className="payment-pill">
                    <input type="radio" name="payment" id="pay-bkash" value="bkash" checked={selectedPayment === 'bkash'} onChange={() => setSelectedPayment('bkash')} />
                    <label htmlFor="pay-bkash"><span className="pay-icon" style={{ background: 'oklch(95% 0.04 354)' }}>💳</span> bKash</label>
                  </div>
                  <div className="payment-pill">
                    <input type="radio" name="payment" id="pay-nagad" value="nagad" checked={selectedPayment === 'nagad'} onChange={() => setSelectedPayment('nagad')} />
                    <label htmlFor="pay-nagad"><span className="pay-icon" style={{ background: 'oklch(96% 0.06 65)' }}>📱</span> নগদ</label>
                  </div>
                  <div className="payment-pill">
                    <input type="radio" name="payment" id="pay-rocket" value="rocket" checked={selectedPayment === 'rocket'} onChange={() => setSelectedPayment('rocket')} />
                    <label htmlFor="pay-rocket"><span className="pay-icon" style={{ background: 'oklch(95% 0.05 290)' }}>🚀</span> রকেট</label>
                  </div>
                  <div className="payment-pill">
                    <input type="radio" name="payment" id="pay-bank" value="bank" checked={selectedPayment === 'bank'} onChange={() => setSelectedPayment('bank')} />
                    <label htmlFor="pay-bank"><span className="pay-icon" style={{ background: 'oklch(95% 0.04 240)' }}>🏛️</span> ব্যাংক ট্রান্সফার</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px 24px', fontSize: '15px', borderRadius: 'var(--r)', marginTop: '4px' }} disabled={submitting}>
                {submitting ? 'প্রক্রিয়াকরণ হচ্ছে…' : 'দান করুন →'}
              </button>
            </form>
          </div>

          {/* SUCCESS STATE */}
          <div className={`form-success-state${formSuccess ? ' show' : ''}`} role="status" aria-live="polite">
            <div className="success-circle" aria-hidden="true">✓</div>
            <div className="success-arabic-big" dir="rtl">جَزَاكَ اللَّهُ خَيْرًا</div>
            <div className="success-headline">জাযাকাল্লাহ খাইরান!</div>
            <p className="success-subtext">আপনার দান সফলভাবে গ্রহণ করা হয়েছে।<br />আল্লাহ আপনার এই সদকা কবুল করুন এবং বহুগুণে পুরস্কৃত করুন।</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleDonateAgain}>আবার দান করুন</button>
              <Link href="/user/transactions" className="btn btn-ghost btn-sm">লেনদেন দেখুন</Link>
            </div>
          </div>
        </div>

        {/* RIGHT: KHAAT INFO SIDEBAR */}
        <aside className="surface-card khaat-card-sidebar" aria-label="খাতসমূহের বিবরণ">
          <div className="khaat-card-header-s">
            <div className="khaat-card-title-s">সক্রিয় খাতসমূহ</div>
            <div className="khaat-card-subtitle-s">লক্ষ্যমাত্রা ও অগ্রগতি</div>
          </div>
          <ul className="khaat-list" role="list">
            <li className="khaat-item" data-khaat="zakat">
              <div className="khaat-item-top">
                <div className="khaat-item-name"><span className="khaat-emoji" aria-hidden="true">🌙</span> যাকাত ফান্ড</div>
                <div className="khaat-collected">৳১৮,৫০০</div>
              </div>
              <div className="khaat-desc-s">বার্ষিক যাকাত সংগ্রহ ও বিতরণ। দরিদ্র সদস্যদের মধ্যে সমবণ্টন করা হয়।</div>
              <div className="khaat-progress-row"><span className="khaat-target">লক্ষ্য: ৳২৫,০০০</span><span className="khaat-pct" style={{ color: 'var(--brand)' }}>৭৪%</span></div>
              <div className="progress-bg"><div className="progress-fill progress-brand" style={{ width: '74%' }} role="progressbar" aria-valuenow={74} aria-valuemin={0} aria-valuemax={100}></div></div>
              <button type="button" className="khaat-item-btn" onClick={() => handleKhaatSelectBtn('zakat')}>এই খাতে দান করুন →</button>
            </li>
            <li className="khaat-item" data-khaat="sadaka">
              <div className="khaat-item-top">
                <div className="khaat-item-name"><span className="khaat-emoji" aria-hidden="true">💚</span> সদকা</div>
                <div className="khaat-collected">খোলা</div>
              </div>
              <div className="khaat-desc-s">যেকোনো পরিমাণে স্বেচ্ছা দান। কোনো নির্ধারিত লক্ষ্য নেই — আল্লাহর সন্তুষ্টির জন্য।</div>
              <div className="khaat-progress-row"><span className="khaat-target" style={{ fontStyle: 'italic', color: 'var(--success)' }}>ওপেন-এন্ডেড · সর্বদা গ্রহণযোগ্য</span></div>
              <div className="progress-bg"><div className="progress-fill progress-success" style={{ width: '100%' }} role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}></div></div>
              <button type="button" className="khaat-item-btn" onClick={() => handleKhaatSelectBtn('sadaka')}>এই খাতে দান করুন →</button>
            </li>
            <li className="khaat-item" data-khaat="yatim">
              <div className="khaat-item-top">
                <div className="khaat-item-name"><span className="khaat-emoji" aria-hidden="true">🤲</span> এতিম তহবিল</div>
                <div className="khaat-collected">৳৯,২০০</div>
              </div>
              <div className="khaat-desc-s">এতিম ও অনাথ শিশুদের ভরণপোষণ ও শিক্ষার ব্যবস্থায় সহায়তা।</div>
              <div className="khaat-progress-row"><span className="khaat-target">লক্ষ্য: ৳১৫,০০০</span><span className="khaat-pct" style={{ color: 'oklch(55% 0.15 240)' }}>৬১%</span></div>
              <div className="progress-bg"><div className="progress-fill progress-info" style={{ width: '61%' }} role="progressbar" aria-valuenow={61} aria-valuemin={0} aria-valuemax={100}></div></div>
              <button type="button" className="khaat-item-btn" onClick={() => handleKhaatSelectBtn('yatim')}>এই খাতে দান করুন →</button>
            </li>
            <li className="khaat-item" data-khaat="education">
              <div className="khaat-item-top">
                <div className="khaat-item-name"><span className="khaat-emoji" aria-hidden="true">📚</span> শিক্ষা সহায়তা</div>
                <div className="khaat-collected">৳৬,৪০০</div>
              </div>
              <div className="khaat-desc-s">মেধাবী কিন্তু অসচ্ছল শিক্ষার্থীদের বৃত্তি ও শিক্ষা উপকরণ সহায়তা।</div>
              <div className="khaat-progress-row"><span className="khaat-target">লক্ষ্য: ৳৮,০০০</span><span className="khaat-pct" style={{ color: 'var(--accent)' }}>৮০%</span></div>
              <div className="progress-bg"><div className="progress-fill progress-accent" style={{ width: '80%' }} role="progressbar" aria-valuenow={80} aria-valuemin={0} aria-valuemax={100}></div></div>
              <button type="button" className="khaat-item-btn" onClick={() => handleKhaatSelectBtn('education')}>এই খাতে দান করুন →</button>
            </li>
          </ul>
        </aside>
      </section>

      {/* DONATION HISTORY TABLE */}
      <section aria-label="দানের ইতিহাস">
        <div className="history-section-header">
          <div>
            <h3 className="section-title-h">দানের ইতিহাস</h3>
            <p className="section-subtitle-h">আপনার সকল দানের রেকর্ড</p>
          </div>
        </div>
        <div className="filter-bar-donate" role="search" aria-label="দান ফিল্টার">
          <select className="filter-select-donate" aria-label="খাত অনুযায়ী ফিল্টার" value={filterKhaat} onChange={e => setFilterKhaat(e.target.value)}>
            <option value="">সব খাত</option>
            <option value="যাকাত ফান্ড">যাকাত ফান্ড</option>
            <option value="সদকা">সদকা</option>
            <option value="এতিম তহবিল">এতিম তহবিল</option>
            <option value="শিক্ষা সহায়তা">শিক্ষা সহায়তা</option>
          </select>
          <select className="filter-select-donate" aria-label="মাস অনুযায়ী ফিল্টার" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">সব মাস</option>
            <option value="জুন">জুন ২০২৬</option>
            <option value="মে">মে ২০২৬</option>
            <option value="এপ্রিল">এপ্রিল ২০২৬</option>
            <option value="মার্চ">মার্চ ২০২৬</option>
          </select>
          <div className="filter-search-wrap-donate">
            <span className="filter-search-icon-donate" aria-hidden="true">🔍</span>
            <input type="search" className="filter-search-donate" placeholder="খাত বা পদ্ধতি খুঁজুন…" aria-label="দান সার্চ করুন" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrap-donate">
          <table className="history-table" aria-label="দানের তালিকা">
            <thead>
              <tr>
                <th scope="col">তারিখ</th>
                <th scope="col">খাত</th>
                <th scope="col">পরিমাণ</th>
                <th scope="col">পদ্ধতি</th>
                <th scope="col">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <tr key={i}>
                  <td className="txn-date">{row.date}</td>
                  <td><span className="txn-category"><span aria-hidden="true">{row.emoji}</span> {row.khaat}</span></td>
                  <td className="txn-amount">{row.amount}</td>
                  <td><div className="txn-method"><span className={`method-dot ${row.methodCls}`}></span>{row.method}</div></td>
                  <td><span className={`badge badge-${row.status}`}>{row.statusLabel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleRows.length === 0 && (
            <div className="table-empty" aria-live="polite">
              <div style={{ fontSize: '32px', marginBottom: '8px' }} aria-hidden="true">🔍</div>
              কোনো দানের তথ্য পাওয়া যায়নি।
            </div>
          )}
        </div>
      </section>
    </>
  );
}
