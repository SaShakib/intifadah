'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Modal state
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  // Donate modal state
  const [donateCat, setDonateCat] = useState('');
  const [donateAmt, setDonateAmt] = useState('');
  const [donateNote, setDonateNote] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);

  // Savings modal state
  const [savingsCat, setSavingsCat] = useState('');
  const [savingsAmt, setSavingsAmt] = useState('');
  const [savingsDate, setSavingsDate] = useState('');
  const [savingsNote, setSavingsNote] = useState('');
  const [savingsSuccess, setSavingsSuccess] = useState(false);

  // Loan modal state
  const [loanCat, setLoanCat] = useState('');
  const [loanAmt, setLoanAmt] = useState('');
  const [loanMonths, setLoanMonths] = useState('');
  const [loanRepayDate, setLoanRepayDate] = useState('');
  const [loanReason, setLoanReason] = useState('');
  const [loanSuccess, setLoanSuccess] = useState(false);

  // Pay modal state
  const [payMethod, setPayMethod] = useState('');
  const [payRef, setPayRef] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const toastRef = useRef(0);

  useEffect(() => {
    const today = new Date();
    setSavingsDate(today.toISOString().slice(0, 10));
    const t = setTimeout(() => showToast('আস-সালামু আলাইকুম, রহিম ভাই! 👋', 'success'), 700);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(msg: string, type = 'success') {
    const id = ++toastRef.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3700);
  }

  function handleOpenModal(id: string) {
    setOpenModal(id);
    if (id === 'donateModal') { setDonateSuccess(false); setDonateCat(''); setDonateAmt(''); setDonateNote(''); }
    if (id === 'savingsModal') { setSavingsSuccess(false); setSavingsCat(''); setSavingsAmt(''); setSavingsNote(''); }
    if (id === 'loanModal') { setLoanSuccess(false); setLoanCat(''); setLoanAmt(''); setLoanMonths(''); setLoanRepayDate(''); setLoanReason(''); }
    if (id === 'payModal') { setPaySuccess(false); setPayMethod(''); setPayRef(''); }
  }

  function handleCloseModal() {
    setOpenModal(null);
  }

  function toBengaliNum(n: number | string) {
    const d = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(n).split('').map(c => d[parseInt(c)] ?? c).join('');
  }

  function calcRepayDate(months: string) {
    setLoanMonths(months);
    const m = parseInt(months);
    if (!m) { setLoanRepayDate(''); return; }
    const date = new Date();
    date.setMonth(date.getMonth() + m);
    const bnMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
    setLoanRepayDate(`${bnMonths[date.getMonth()]} ${toBengaliNum(date.getFullYear())}`);
  }

  function submitDonate() {
    if (!donateCat || !donateAmt) { showToast('অনুগ্রহ করে সব তথ্য পূরণ করুন', 'warning'); return; }
    setDonateSuccess(true);
    showToast('দান গ্রহণ করা হয়েছে — জাযাকাল্লাহ ✓', 'success');
  }

  function submitSavings() {
    if (!savingsCat || !savingsAmt) { showToast('অনুগ্রহ করে সব তথ্য পূরণ করুন', 'warning'); return; }
    setSavingsSuccess(true);
    showToast('সঞ্চয় অনুরোধ পাঠানো হয়েছে ✓', 'success');
  }

  function submitLoan() {
    if (!loanCat || !loanAmt || !loanReason) { showToast('অনুগ্রহ করে সব তথ্য পূরণ করুন', 'warning'); return; }
    setLoanSuccess(true);
    showToast('ঋণের আবেদন পাঠানো হয়েছে ✓', 'success');
  }

  function submitPay() {
    if (!payMethod) { showToast('পরিশোধের পদ্ধতি বেছে নিন', 'warning'); return; }
    setPaySuccess(true);
    showToast('কিস্তি পরিশোধের তথ্য পাঠানো হয়েছে ✓', 'success');
  }

  // Bar chart data
  const chartData = [
    { label: 'জান', value: 1500, current: false },
    { label: 'ফেব', value: 2000, current: false },
    { label: 'মার', value: 1000, current: false },
    { label: 'এপ্রি', value: 2500, current: false },
    { label: 'মে',  value: 1500, current: false },
    { label: 'জুন', value: 1500, current: true  },
  ];
  const maxVal = Math.max(...chartData.map(d => d.value));

  return (
    <>
      <style>{`
        /* ══════════════════════════════
           WELCOME HEADER
        ══════════════════════════════ */
        .welcome-header {
          background: linear-gradient(135deg, oklch(50% 0.26 354) 0%, oklch(42% 0.24 354) 60%, oklch(38% 0.22 354) 100%);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.20);
        }
        .welcome-header::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: oklch(100% 0 0 / 0.06);
          pointer-events: none;
        }
        .welcome-header::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 40%;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: oklch(100% 0 0 / 0.04);
          pointer-events: none;
        }
        .welcome-arabic {
          font-size: 11px;
          color: oklch(100% 0 0 / 0.50);
          letter-spacing: 0.06em;
          margin-bottom: 14px;
          direction: rtl;
          text-align: left;
        }
        .welcome-row {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }
        .welcome-avatar {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: oklch(100% 0 0 / 0.18);
          border: 2.5px solid oklch(100% 0 0 / 0.30);
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .welcome-text { flex: 1; }
        .welcome-greeting {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .welcome-sub {
          font-size: 13px;
          color: oklch(100% 0 0 / 0.70);
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .welcome-badge {
          background: oklch(100% 0 0 / 0.15);
          border: 1px solid oklch(100% 0 0 / 0.20);
          color: #fff;
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
        }
        .welcome-date {
          font-size: 12px;
          color: oklch(100% 0 0 / 0.55);
          margin-top: 4px;
        }

        /* ══════════════════════════════
           BALANCE CARDS GRID
        ══════════════════════════════ */
        .db-balance-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .db-balance-card {
          border-radius: 20px;
          padding: 22px 22px 20px;
          position: relative;
          overflow: hidden;
        }
        .db-balance-card-hero {
          background: linear-gradient(135deg, oklch(50% 0.26 354) 0%, oklch(42% 0.24 354) 100%);
          box-shadow: 0 8px 28px oklch(50% 0.26 354 / 0.35);
        }
        .db-balance-card-hero::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 130px; height: 130px;
          border-radius: 50%;
          background: oklch(100% 0 0 / 0.08);
        }
        .db-balance-card-savings {
          background: #ffffff;
          border: 1px solid oklch(91% 0.005 354);
          box-shadow: 0 1px 6px oklch(50% 0.26 354 / 0.10);
        }
        .db-balance-card-loan {
          background: #ffffff;
          border: 1px solid oklch(91% 0.005 354);
          box-shadow: 0 1px 6px oklch(50% 0.26 354 / 0.10);
        }
        .db-bal-icon {
          width: 40px; height: 40px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          margin-bottom: 16px;
        }
        .db-balance-card-hero .db-bal-icon { background: oklch(100% 0 0 / 0.15); }
        .db-balance-card-savings .db-bal-icon { background: oklch(95% 0.05 145); }
        .db-balance-card-loan .db-bal-icon { background: oklch(96% 0.05 25); }
        .db-bal-label {
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .db-balance-card-hero .db-bal-label { color: oklch(100% 0 0 / 0.65); }
        .db-balance-card-savings .db-bal-label,
        .db-balance-card-loan .db-bal-label { color: oklch(55% 0.01 300); }
        .db-bal-amount {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          margin-bottom: 10px;
        }
        .db-balance-card-hero .db-bal-amount { color: #fff; }
        .db-balance-card-savings .db-bal-amount,
        .db-balance-card-loan .db-bal-amount { color: oklch(12% 0.01 300); }
        .db-bal-meta {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .db-balance-card-hero .db-bal-meta { color: oklch(100% 0 0 / 0.60); }
        .db-balance-card-savings .db-bal-meta,
        .db-balance-card-loan .db-bal-meta { color: oklch(55% 0.01 300); }

        /* ══════════════════════════════
           QUICK ACTIONS
        ══════════════════════════════ */
        .db-quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }
        .db-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 18px 12px;
          background: #ffffff;
          border: 1px solid oklch(91% 0.005 354);
          border-radius: 12px;
          box-shadow: 0 1px 6px oklch(50% 0.26 354 / 0.10);
          cursor: pointer;
          transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
          text-decoration: none;
          user-select: none;
          font-family: inherit;
        }
        .db-action-card:hover {
          box-shadow: 0 4px 16px oklch(50% 0.26 354 / 0.15);
          transform: translateY(-3px);
          border-color: oklch(84% 0.01 354);
        }
        .db-action-card:active { transform: translateY(-1px) scale(0.98); }
        .db-action-icon {
          width: 48px; height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .db-action-label {
          font-size: 12px;
          font-weight: 600;
          color: oklch(12% 0.01 300);
          text-align: center;
          line-height: 1.3;
        }

        /* ══════════════════════════════
           CONTENT GRID
        ══════════════════════════════ */
        .db-content-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .db-content-main { min-width: 0; }
        .db-content-side { min-width: 0; }

        /* ══════════════════════════════
           ALERTS
        ══════════════════════════════ */
        .db-alerts-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }
        .db-alert {
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          border: 1px solid;
        }
        .db-alert-danger  { background: oklch(96% 0.05 25);  border-color: oklch(88% 0.07 25); }
        .db-alert-warning { background: oklch(96% 0.06 80); border-color: oklch(88% 0.09 80); }
        .db-alert-icon-wrap { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .db-alert-body { flex: 1; min-width: 0; }
        .db-alert-text { font-size: 13px; line-height: 1.6; color: oklch(12% 0.01 300); }
        .db-alert-text strong { font-weight: 700; }
        .db-alert-actions { display: flex; gap: 8px; margin-top: 10px; }

        /* ══════════════════════════════
           SECTION
        ══════════════════════════════ */
        .db-section { margin-bottom: 28px; }
        .db-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .db-section-title {
          font-size: 16px;
          font-weight: 700;
          color: oklch(12% 0.01 300);
          letter-spacing: -0.01em;
        }
        .db-section-subtitle {
          font-size: 12px;
          color: oklch(55% 0.01 300);
          font-weight: 400;
          margin-top: 1px;
        }
        .db-section-link {
          font-size: 13px;
          color: oklch(50% 0.26 354);
          text-decoration: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: gap 150ms;
        }
        .db-section-link:hover { gap: 7px; }

        /* ══════════════════════════════
           TRANSACTIONS TABLE
        ══════════════════════════════ */
        .db-txn-table-wrap {
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid oklch(91% 0.005 354);
          box-shadow: 0 1px 6px oklch(50% 0.26 354 / 0.10);
        }
        .db-txn-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .db-txn-table th {
          text-align: left;
          padding: 11px 16px;
          font-size: 11px;
          font-weight: 700;
          color: oklch(55% 0.01 300);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: oklch(99% 0.003 354);
          border-bottom: 1px solid oklch(91% 0.005 354);
        }
        .db-txn-table td {
          padding: 12px 16px;
          border-bottom: 1px solid oklch(91% 0.005 354);
          vertical-align: middle;
        }
        .db-txn-table tr:last-child td { border-bottom: none; }
        .db-txn-table tbody tr { transition: background 150ms; }
        .db-txn-table tbody tr:hover { background: oklch(99% 0.003 354); }
        .db-txn-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 99px;
        }
        .db-txn-donate  { background: oklch(95% 0.04 354); color: oklch(50% 0.26 354); }
        .db-txn-save    { background: oklch(95% 0.05 145); color: oklch(44% 0.14 145); }
        .db-txn-loan    { background: oklch(95% 0.05 240); color: oklch(55% 0.15 240); }
        .db-txn-payment { background: oklch(96% 0.06 80); color: oklch(55% 0.14 75); }
        .db-txn-amount {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          font-size: 14px;
        }
        .db-txn-amount.positive { color: oklch(44% 0.14 145); }
        .db-txn-amount.negative { color: oklch(52% 0.18 25); }
        .db-txn-table-footer {
          padding: 12px 16px;
          background: oklch(99% 0.003 354);
          border-top: 1px solid oklch(91% 0.005 354);
          display: flex;
          justify-content: flex-end;
        }

        /* ══════════════════════════════
           SIDE CARDS
        ══════════════════════════════ */
        .db-side-card {
          background: #ffffff;
          border: 1px solid oklch(91% 0.005 354);
          border-radius: 12px;
          box-shadow: 0 1px 6px oklch(50% 0.26 354 / 0.10);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .db-side-card-header {
          padding: 14px 18px 12px;
          border-bottom: 1px solid oklch(91% 0.005 354);
          background: oklch(99% 0.003 354);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-side-card-title { font-size: 13.5px; font-weight: 700; color: oklch(12% 0.01 300); }
        .db-side-card-body { padding: 16px 18px; }

        .db-category-list { list-style: none; padding: 0; margin: 0; }
        .db-category-item {
          padding: 12px 0;
          border-bottom: 1px solid oklch(91% 0.005 354);
        }
        .db-category-item:last-child { border-bottom: none; }
        .db-category-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .db-category-item-name {
          font-size: 13px;
          font-weight: 600;
          color: oklch(12% 0.01 300);
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .db-category-item-amount {
          font-size: 14px;
          font-weight: 700;
          color: oklch(12% 0.01 300);
          font-variant-numeric: tabular-nums;
        }
        .db-category-item-sub {
          font-size: 11.5px;
          color: oklch(55% 0.01 300);
          margin-top: 2px;
        }

        /* Loan status card */
        .db-loan-status-card {
          background: linear-gradient(135deg, oklch(97% 0.04 354) 0%, oklch(96% 0.04 354) 100%);
          border: 1px solid oklch(90% 0.07 354);
          border-radius: 12px;
          padding: 16px 18px;
          margin-bottom: 16px;
        }
        .db-loan-status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .db-loan-status-title { font-size: 13px; font-weight: 700; color: oklch(12% 0.01 300); }
        .db-loan-amount-big {
          font-size: 32px;
          font-weight: 800;
          color: oklch(12% 0.01 300);
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          margin-bottom: 4px;
        }
        .db-loan-remaining { font-size: 12px; color: oklch(55% 0.01 300); margin-bottom: 14px; }
        .db-loan-remaining strong { color: oklch(52% 0.18 25); font-variant-numeric: tabular-nums; }
        .db-progress-bar-bg {
          height: 7px;
          background: oklch(91% 0.005 354);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .db-progress-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, oklch(50% 0.26 354), oklch(42% 0.24 354));
        }
        .db-loan-installment-box {
          background: oklch(96% 0.06 80);
          border: 1px solid oklch(88% 0.09 80);
          border-radius: 8px;
          padding: 12px 14px;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .db-loan-inst-label { font-size: 10.5px; font-weight: 700; color: oklch(55% 0.14 75); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; }
        .db-loan-inst-amount { font-size: 18px; font-weight: 800; color: oklch(55% 0.14 75); font-variant-numeric: tabular-nums; }
        .db-loan-inst-date { font-size: 11px; color: oklch(55% 0.01 300); margin-top: 2px; }

        /* Bar chart */
        .db-bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 80px;
          padding-top: 8px;
        }
        .db-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .db-bar-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          background: oklch(97% 0.04 354);
        }
        .db-bar-fill.current { background: linear-gradient(180deg, oklch(50% 0.26 354) 0%, oklch(42% 0.24 354) 100%); }
        .db-bar-label { font-size: 10px; color: oklch(55% 0.01 300); font-weight: 500; }

        /* Badges */
        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 9px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .db-badge-success { background: oklch(95% 0.05 145); color: oklch(44% 0.14 145); }
        .db-badge-warning { background: oklch(96% 0.06 80); color: oklch(55% 0.14 75); }
        .db-badge-danger  { background: oklch(96% 0.05 25); color: oklch(52% 0.18 25); }
        .db-badge-brand   { background: oklch(97% 0.04 354); color: oklch(50% 0.26 354); }

        /* Buttons */
        .db-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
          text-decoration: none;
          white-space: nowrap;
          line-height: 1;
        }
        .db-btn:active { transform: scale(0.97); }
        .db-btn-primary {
          background: oklch(50% 0.26 354);
          color: #fff;
          box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.35);
        }
        .db-btn-primary:hover { background: oklch(42% 0.24 354); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); }
        .db-btn-ghost { background: transparent; color: oklch(35% 0.015 300); border: 1px solid oklch(91% 0.005 354); }
        .db-btn-ghost:hover { background: oklch(99% 0.003 354); color: oklch(12% 0.01 300); }
        .db-btn-danger-soft { background: oklch(96% 0.05 25); color: oklch(52% 0.18 25); border: 1px solid oklch(88% 0.07 25); }
        .db-btn-danger-soft:hover { background: oklch(93% 0.07 25); }
        .db-btn-warning-soft { background: oklch(96% 0.06 80); color: oklch(55% 0.14 75); border: 1px solid oklch(88% 0.09 80); }
        .db-btn-warning-soft:hover { background: oklch(93% 0.09 80); }
        .db-btn-sm { padding: 7px 14px; font-size: 12.5px; }
        .db-btn-full { width: 100%; }

        /* Input */
        .db-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid oklch(91% 0.005 354);
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          color: oklch(12% 0.01 300);
          background: #ffffff;
          outline: none;
          transition: border-color 150ms, box-shadow 150ms;
          appearance: none;
        }
        .db-input:focus { border-color: oklch(42% 0.24 354); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }

        /* Form */
        .db-form-group { margin-bottom: 16px; }
        .db-form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: oklch(35% 0.015 300);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .db-form-hint { font-size: 11px; color: oklch(55% 0.01 300); margin-top: 4px; }

        /* Modal */
        .db-modal-backdrop {
          position: fixed;
          inset: 0;
          background: oklch(0% 0 0 / 0.50);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 400;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 250ms cubic-bezier(0, 0, 0.2, 1);
        }
        .db-modal-backdrop.open {
          opacity: 1;
          pointer-events: all;
        }
        .db-modal-sheet {
          background: #ffffff;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-width: 520px;
          max-height: 92vh;
          overflow-y: auto;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.34, 1.1, 0.64, 1);
          padding-bottom: 16px;
        }
        .db-modal-backdrop.open .db-modal-sheet { transform: translateY(0); }
        .db-modal-handle {
          width: 36px; height: 4px;
          background: oklch(91% 0.005 354);
          border-radius: 99px;
          margin: 12px auto 0;
        }
        .db-modal-header {
          padding: 16px 20px 14px;
          border-bottom: 1px solid oklch(91% 0.005 354);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-modal-title { font-size: 16px; font-weight: 700; color: oklch(12% 0.01 300); }
        .db-modal-close {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: none;
          background: oklch(99% 0.003 354);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: oklch(35% 0.015 300);
          transition: all 150ms;
        }
        .db-modal-close:hover { background: oklch(96% 0.05 25); color: oklch(52% 0.18 25); }
        .db-modal-body { padding: 20px; }
        .db-modal-success {
          text-align: center;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .db-success-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: oklch(95% 0.05 145);
          color: oklch(44% 0.14 145);
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: dbSuccessPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes dbSuccessPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .db-success-title { font-size: 16px; font-weight: 700; color: oklch(44% 0.14 145); }
        .db-success-text { font-size: 13px; color: oklch(55% 0.01 300); line-height: 1.6; max-width: 280px; }

        /* Toast */
        .db-toast-container {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 600;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
          width: 90%;
          max-width: 380px;
        }
        .db-toast {
          color: #fff;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.20);
          display: flex;
          align-items: center;
          gap: 10px;
          animation: dbToastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          pointer-events: all;
        }
        .db-toast.success { background: oklch(44% 0.14 145); }
        .db-toast.warning { background: oklch(55% 0.14 75); }
        .db-toast.info    { background: oklch(55% 0.15 240); }
        .db-toast.danger  { background: oklch(52% 0.18 25); }
        @keyframes dbToastIn {
          from { opacity: 0; transform: translateY(-14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* utilities */
        .db-text-muted   { color: oklch(55% 0.01 300); }
        .db-text-success { color: oklch(44% 0.14 145); }
        .db-text-warning { color: oklch(55% 0.14 75); }
        .db-text-danger  { color: oklch(52% 0.18 25); }
        .db-text-brand   { color: oklch(50% 0.26 354); }
        .db-text-sm  { font-size: 12px; }
        .db-text-xs  { font-size: 11px; }
        .db-fw-600   { font-weight: 600; }
        .db-fw-700   { font-weight: 700; }
        .db-tabular  { font-variant-numeric: tabular-nums; }
        .db-mt-12    { margin-top: 12px; }
        .db-mb-8     { margin-bottom: 8px; }
        .db-d-flex   { display: flex; }
        .db-align-center { align-items: center; }
        .db-gap-8    { gap: 8px; }

        /* Responsive */
        @media (max-width: 919px) {
          .db-balance-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .db-bal-amount { font-size: 22px; }
          .db-quick-actions-grid { grid-template-columns: repeat(3, 1fr); }
          .db-content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 599px) {
          .db-balance-grid { grid-template-columns: 1fr; gap: 10px; }
          .db-balance-card { padding: 18px 18px 16px; }
          .db-bal-amount { font-size: 26px; }
          .db-quick-actions-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .db-action-card { padding: 14px 8px; }
          .db-action-icon { width: 42px; height: 42px; font-size: 18px; }
          .db-action-label { font-size: 11px; }
          .welcome-greeting { font-size: 18px; }
          .welcome-avatar { width: 50px; height: 50px; font-size: 16px; }
        }
        @media (min-width: 1200px) {
          .db-quick-actions-grid { gap: 14px; }
        }
      `}</style>

      {/* Toast Container */}
      <div className="db-toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`db-toast ${t.type}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠' : t.type === 'danger' ? '✕' : 'ℹ'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Welcome Header */}
      <div className="welcome-header" aria-label="স্বাগত বার্তা">
        <div className="welcome-arabic" aria-label="বিসমিল্লাহির রাহমানির রাহিম">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div className="welcome-row">
          <div className="welcome-avatar" aria-hidden="true">র.উ</div>
          <div className="welcome-text">
            <div className="welcome-greeting">আস-সালামু আলাইকুম, রহিম ভাই 👋</div>
            <div className="welcome-sub">
              <span className="welcome-badge">সাধারণ সদস্য</span>
              <span>সদস্য # ০০৫ · যোগদান: মার্চ ২০২৩</span>
            </div>
            <div className="welcome-date">১৫ জুন ২০২৬, রবিবার</div>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <section className="db-section" aria-label="ব্যালেন্স সারাংশ">
        <div className="db-balance-grid">
          <div className="db-balance-card db-balance-card-hero">
            <div className="db-bal-icon">💰</div>
            <div className="db-bal-label">আমার মোট সঞ্চয়</div>
            <div className="db-bal-amount db-tabular">৳১২,৫০০</div>
            <div className="db-bal-meta">
              <span className="db-badge" style={{ background: 'oklch(100% 0 0 / 0.18)', color: '#fff', border: '1px solid oklch(100% 0 0 / 0.20)' }}>সক্রিয়</span>
              <span>ব্যক্তিগত সঞ্চয়</span>
            </div>
          </div>
          <div className="db-balance-card db-balance-card-savings">
            <div className="db-bal-icon">💝</div>
            <div className="db-bal-label">মোট দান</div>
            <div className="db-bal-amount db-tabular">৳৮,৪০০</div>
            <div className="db-bal-meta">
              <span>আজীবন মোট দান</span>
            </div>
          </div>
          <div className="db-balance-card db-balance-card-loan">
            <div className="db-bal-icon">🏦</div>
            <div className="db-bal-label">বর্তমান ঋণ</div>
            <div className="db-bal-amount db-tabular">৳১৫,০০০</div>
            <div className="db-bal-meta">
              <span className="db-badge db-badge-warning">পরিশোধের বাকি</span>
              <span>৩০ সেপ্টে. ২০২৬</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="db-section" aria-label="দ্রুত কার্যক্রম">
        <div className="db-section-header">
          <div>
            <div className="db-section-title">দ্রুত কার্যক্রম</div>
          </div>
        </div>
        <div className="db-quick-actions-grid" role="list">
          <button className="db-action-card" role="listitem" onClick={() => handleOpenModal('donateModal')} aria-label="দান করুন">
            <div className="db-action-icon" style={{ background: 'oklch(97% 0.04 354)' }}>💝</div>
            <div className="db-action-label">দান করুন</div>
          </button>
          <button className="db-action-card" role="listitem" onClick={() => handleOpenModal('savingsModal')} aria-label="সঞ্চয় করুন">
            <div className="db-action-icon" style={{ background: 'oklch(95% 0.05 145)' }}>💰</div>
            <div className="db-action-label">সঞ্চয় করুন</div>
          </button>
          <button className="db-action-card" role="listitem" onClick={() => handleOpenModal('loanModal')} aria-label="ঋণ চাই">
            <div className="db-action-icon" style={{ background: 'oklch(95% 0.05 240)' }}>🏦</div>
            <div className="db-action-label">ঋণ চাই</div>
          </button>
          <button className="db-action-card" role="listitem" onClick={() => handleOpenModal('payModal')} aria-label="ঋণ পরিশোধ">
            <div className="db-action-icon" style={{ background: 'oklch(96% 0.06 80)' }}>💳</div>
            <div className="db-action-label">ঋণ পরিশোধ</div>
          </button>
          <button className="db-action-card" role="listitem" onClick={() => showToast('খরচ যোগ ফিচার শীঘ্রই আসছে', 'info')} aria-label="খরচ যোগ">
            <div className="db-action-icon" style={{ background: 'oklch(95% 0.05 290)' }}>📝</div>
            <div className="db-action-label">খরচ যোগ</div>
          </button>
          <button className="db-action-card" role="listitem" onClick={() => showToast('মন্তব্য পাঠানো হয়েছে ✓', 'success')} aria-label="মন্তব্য করুন">
            <div className="db-action-icon" style={{ background: 'oklch(95% 0.04 220)' }}>💬</div>
            <div className="db-action-label">মন্তব্য করুন</div>
          </button>
        </div>
      </section>

      {/* Two-column content grid */}
      <div className="db-content-grid">
        {/* Left: Main content */}
        <div className="db-content-main">

          {/* Alerts */}
          <section className="db-section" aria-label="সতর্কতা ও বকেয়া">
            <div className="db-section-header">
              <div>
                <div className="db-section-title">⚠️ বকেয়া ও সতর্কতা</div>
              </div>
            </div>
            <div className="db-alerts-stack">
              <div className="db-alert db-alert-danger" role="alert">
                <div className="db-alert-icon-wrap">🔴</div>
                <div className="db-alert-body">
                  <div className="db-alert-text">
                    <strong>ঋণের কিস্তি বাকি:</strong> ৳২,০০০ — পরিশোধের তারিখ: <strong>৩০ জুন ২০২৬</strong>
                  </div>
                  <div className="db-alert-actions">
                    <button className="db-btn db-btn-danger-soft db-btn-sm" onClick={() => handleOpenModal('payModal')}>পরিশোধ করুন</button>
                  </div>
                </div>
              </div>
              <div className="db-alert db-alert-warning" role="alert">
                <div className="db-alert-icon-wrap">🟡</div>
                <div className="db-alert-body">
                  <div className="db-alert-text">
                    <strong>মাসিক দানের ডিউ (জুন ২০২৬):</strong> ৳৫০০ এখনো দেওয়া হয়নি
                  </div>
                  <div className="db-alert-actions">
                    <button className="db-btn db-btn-warning-soft db-btn-sm" onClick={() => handleOpenModal('donateModal')}>দান করুন</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="db-section" aria-label="সাম্প্রতিক লেনদেন">
            <div className="db-section-header">
              <div>
                <div className="db-section-title">সাম্প্রতিক লেনদেন</div>
                <div className="db-section-subtitle">আপনার সর্বশেষ আর্থিক কার্যক্রম</div>
              </div>
              <Link href="/user/transactions" className="db-section-link">সব দেখুন →</Link>
            </div>
            <div className="db-txn-table-wrap" role="region" aria-label="লেনদেনের তালিকা">
              <table className="db-txn-table">
                <thead>
                  <tr>
                    <th>তারিখ</th>
                    <th>ধরন</th>
                    <th>খাত</th>
                    <th style={{ textAlign: 'right' }}>পরিমাণ</th>
                    <th>অবস্থা</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="db-text-muted db-text-sm">১৫ জুন</td>
                    <td><span className="db-txn-type-badge db-txn-donate">💝 দান</span></td>
                    <td className="db-text-sm">মাসিক দান</td>
                    <td style={{ textAlign: 'right' }}><span className="db-txn-amount positive">+৳৫০০</span></td>
                    <td><span className="db-badge db-badge-success">✓ সম্পন্ন</span></td>
                  </tr>
                  <tr>
                    <td className="db-text-muted db-text-sm">১০ জুন</td>
                    <td><span className="db-txn-type-badge db-txn-payment">💳 কিস্তি</span></td>
                    <td className="db-text-sm">সদস্য ঋণ</td>
                    <td style={{ textAlign: 'right' }}><span className="db-txn-amount negative">−৳২,০০০</span></td>
                    <td><span className="db-badge db-badge-success">✓ পরিশোধিত</span></td>
                  </tr>
                  <tr>
                    <td className="db-text-muted db-text-sm">০৫ জুন</td>
                    <td><span className="db-txn-type-badge db-txn-save">💰 সঞ্চয়</span></td>
                    <td className="db-text-sm">ব্যক্তিগত সঞ্চয়</td>
                    <td style={{ textAlign: 'right' }}><span className="db-txn-amount positive">+৳১,০০০</span></td>
                    <td><span className="db-badge db-badge-success">✓ সম্পন্ন</span></td>
                  </tr>
                  <tr>
                    <td className="db-text-muted db-text-sm">০১ জুন</td>
                    <td><span className="db-txn-type-badge db-txn-donate">💝 দান</span></td>
                    <td className="db-text-sm">মাসিক দান</td>
                    <td style={{ textAlign: 'right' }}><span className="db-txn-amount positive">+৳৫০০</span></td>
                    <td><span className="db-badge db-badge-success">✓ সম্পন্ন</span></td>
                  </tr>
                  <tr>
                    <td className="db-text-muted db-text-sm">২৫ মে</td>
                    <td><span className="db-txn-type-badge db-txn-loan">🏦 ঋণ</span></td>
                    <td className="db-text-sm">সদস্য ঋণ</td>
                    <td style={{ textAlign: 'right' }}><span className="db-txn-amount positive">+৳১৫,০০০</span></td>
                    <td><span className="db-badge db-badge-success">✓ অনুমোদিত</span></td>
                  </tr>
                  <tr>
                    <td className="db-text-muted db-text-sm">১৫ মে</td>
                    <td><span className="db-txn-type-badge db-txn-donate">💝 দান</span></td>
                    <td className="db-text-sm">মাসিক দান</td>
                    <td style={{ textAlign: 'right' }}><span className="db-txn-amount positive">+৳৫০০</span></td>
                    <td><span className="db-badge db-badge-success">✓ সম্পন্ন</span></td>
                  </tr>
                  <tr>
                    <td className="db-text-muted db-text-sm">১০ মে</td>
                    <td><span className="db-txn-type-badge db-txn-save">💰 সঞ্চয়</span></td>
                    <td className="db-text-sm">ব্যক্তিগত সঞ্চয়</td>
                    <td style={{ textAlign: 'right' }}><span className="db-txn-amount positive">+৳৫০০</span></td>
                    <td><span className="db-badge db-badge-success">✓ সম্পন্ন</span></td>
                  </tr>
                </tbody>
              </table>
              <div className="db-txn-table-footer">
                <Link href="/user/transactions" className="db-section-link db-text-sm">সব লেনদেন দেখুন →</Link>
              </div>
            </div>
          </section>

          {/* Monthly Chart */}
          <section className="db-section" aria-label="মাসিক সারাংশ চার্ট">
            <div className="db-section-header">
              <div>
                <div className="db-section-title">আমার মাসিক সারাংশ</div>
                <div className="db-section-subtitle">জানুয়ারি – জুন ২০২৬ (সঞ্চয় + দান)</div>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid oklch(91% 0.005 354)', borderRadius: '12px', boxShadow: '0 1px 6px oklch(50% 0.26 354 / 0.10)', padding: '20px 20px 16px' }}>
              <div className="db-bar-chart" aria-label="মাসভিত্তিক অবদান চার্ট">
                {chartData.map((item) => {
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={item.label} className="db-bar-col" role="img" aria-label={`${item.label}: ৳${item.value}`}>
                      <div
                        className={`db-bar-fill${item.current ? ' current' : ''}`}
                        style={{ height: `${pct}%`, flex: 'none', minHeight: '4px' }}
                      />
                      <div className="db-bar-label">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>{/* /db-content-main */}

        {/* Right: Side column */}
        <div className="db-content-side">

          {/* Loan Status Card */}
          <div className="db-loan-status-card" role="region" aria-label="ঋণের অবস্থা">
            <div className="db-loan-status-header">
              <div className="db-loan-status-title">🏦 সক্রিয় ঋণ</div>
              <span className="db-badge db-badge-warning">চলমান</span>
            </div>
            <div className="db-loan-amount-big db-tabular">৳১৫,০০০</div>
            <div className="db-loan-remaining">পরিশোধ হয়েছে ৳২,০০০ — বাকি <strong>৳১৩,০০০</strong></div>
            <div className="db-progress-bar-bg">
              <div className="db-progress-bar-fill" style={{ width: '13%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'oklch(55% 0.01 300)', marginTop: '5px' }}>
              <span>১৩% পরিশোধিত</span>
              <span>মেয়াদ: ৩০ সেপ্টেম্বর ২০২৬</span>
            </div>
            <div className="db-loan-installment-box">
              <div>
                <div className="db-loan-inst-label">পরবর্তী কিস্তি</div>
                <div className="db-loan-inst-amount db-tabular">৳২,০০০</div>
                <div className="db-loan-inst-date">৩০ জুন ২০২৬</div>
              </div>
              <button className="db-btn db-btn-primary db-btn-sm" onClick={() => handleOpenModal('payModal')}>পরিশোধ করুন</button>
            </div>
          </div>

          {/* Category Summary */}
          <div className="db-side-card" role="region" aria-label="খাতভিত্তিক সারাংশ">
            <div className="db-side-card-header">
              <div className="db-side-card-title">📂 খাতভিত্তিক সারাংশ</div>
            </div>
            <div style={{ padding: '0 18px' }}>
              <ul className="db-category-list">
                <li className="db-category-item">
                  <div className="db-category-item-top">
                    <div className="db-category-item-name">💝 মাসিক দান</div>
                    <div className="db-category-item-amount db-tabular db-text-brand">৳৫০০</div>
                  </div>
                  <div className="db-category-item-sub db-d-flex db-align-center db-gap-8">
                    <span className="db-badge db-badge-success">এ মাসে দেওয়া হয়েছে ✓</span>
                  </div>
                </li>
                <li className="db-category-item">
                  <div className="db-category-item-top">
                    <div className="db-category-item-name">🏦 সদস্য ঋণ</div>
                    <div className="db-category-item-amount db-tabular" style={{ color: 'oklch(52% 0.18 25)' }}>৳১৩,০০০</div>
                  </div>
                  <div className="db-category-item-sub">
                    নেওয়া ৳১৫,০০০ — পরিশোধ ৳২,০০০ — বাকি ৳১৩,০০০
                  </div>
                </li>
                <li className="db-category-item">
                  <div className="db-category-item-top">
                    <div className="db-category-item-name">💰 ব্যক্তিগত সঞ্চয়</div>
                    <div className="db-category-item-amount db-tabular db-text-success">৳১২,৫০০</div>
                  </div>
                  <div className="db-category-item-sub">মোট জমা সঞ্চয়</div>
                </li>
              </ul>
            </div>
          </div>

          {/* Profile Card */}
          <div className="db-side-card" role="region" aria-label="প্রোফাইল তথ্য">
            <div className="db-side-card-header">
              <div className="db-side-card-title">👤 আমার প্রোফাইল</div>
              <Link href="/user/profile" className="db-section-link db-text-sm">সম্পাদনা</Link>
            </div>
            <div className="db-side-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="db-text-muted">নাম</span>
                  <span className="db-fw-600">রহিম উদ্দিন</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="db-text-muted">ধরন</span>
                  <span className="db-badge db-badge-brand">সাধারণ সদস্য</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="db-text-muted">সদস্য নং</span>
                  <span className="db-fw-600 db-tabular">#০০৫</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="db-text-muted">যোগদান</span>
                  <span className="db-fw-600">মার্চ ২০২৩</span>
                </div>
              </div>
            </div>
          </div>

        </div>{/* /db-content-side */}
      </div>{/* /db-content-grid */}


      {/* ════ MODALS ════ */}

      {/* Donate Modal */}
      <div
        className={`db-modal-backdrop${openModal === 'donateModal' ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donateTitle"
        onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
      >
        <div className="db-modal-sheet">
          <div className="db-modal-handle" />
          <div className="db-modal-header">
            <h2 className="db-modal-title" id="donateTitle">💝 দান করুন</h2>
            <button className="db-modal-close" onClick={handleCloseModal} aria-label="বন্ধ করুন">✕</button>
          </div>
          {!donateSuccess ? (
            <div className="db-modal-body">
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="donateCat">খাত <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <select className="db-input" id="donateCat" value={donateCat} onChange={e => setDonateCat(e.target.value)}>
                  <option value="">-- খাত নির্বাচন করুন --</option>
                  <option>মাসিক দান</option>
                  <option>সাদাকাহ (সাধারণ দান)</option>
                  <option>যাকাত</option>
                  <option>ফিতরা</option>
                  <option>বিশেষ খাত (ত্রাণ)</option>
                </select>
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="donateAmt">পরিমাণ (৳) <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <input type="number" className="db-input" id="donateAmt" placeholder="০" min={1} value={donateAmt} onChange={e => setDonateAmt(e.target.value)} />
                <div className="db-form-hint">সুপারিশকৃত: মাসিক দান ৳৫০০</div>
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="donateNote">নোট <span className="db-text-muted">(ঐচ্ছিক)</span></label>
                <textarea className="db-input" id="donateNote" rows={2} placeholder="দানের উদ্দেশ্য..." value={donateNote} onChange={e => setDonateNote(e.target.value)} style={{ resize: 'vertical', minHeight: '60px' }} />
              </div>
              <div style={{ background: 'oklch(95% 0.05 145)', border: '1px solid oklch(88% 0.07 145)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: 'oklch(44% 0.14 145)' }}>
                ✓ আপনার দান ইনতিফাদাহ সংগঠনের মাধ্যমে পরিচালিত হবে।
              </div>
              <button className="db-btn db-btn-primary db-btn-full" onClick={submitDonate}>দান করুন →</button>
            </div>
          ) : (
            <div className="db-modal-success" role="status">
              <div className="db-success-icon">🤲</div>
              <div className="db-success-title">জাযাকাল্লাহু খায়রান!</div>
              <div className="db-success-text">আপনার দান গ্রহণ করা হয়েছে। আল্লাহ আপনার দানকে কবুল করুন। আমীন।</div>
              <button className="db-btn db-btn-ghost db-btn-sm db-mt-12" onClick={handleCloseModal}>ঠিক আছে</button>
            </div>
          )}
        </div>
      </div>

      {/* Savings Modal */}
      <div
        className={`db-modal-backdrop${openModal === 'savingsModal' ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="savingsTitle"
        onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
      >
        <div className="db-modal-sheet">
          <div className="db-modal-handle" />
          <div className="db-modal-header">
            <h2 className="db-modal-title" id="savingsTitle">💰 সঞ্চয় করুন</h2>
            <button className="db-modal-close" onClick={handleCloseModal} aria-label="বন্ধ করুন">✕</button>
          </div>
          {!savingsSuccess ? (
            <div className="db-modal-body">
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="savingsCat">খাত <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <select className="db-input" id="savingsCat" value={savingsCat} onChange={e => setSavingsCat(e.target.value)}>
                  <option value="">-- খাত নির্বাচন করুন --</option>
                  <option>ব্যক্তিগত সঞ্চয়</option>
                  <option>ঈদ বোনাস সঞ্চয়</option>
                  <option>জরুরি তহবিল</option>
                </select>
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="savingsAmt">পরিমাণ (৳) <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <input type="number" className="db-input" id="savingsAmt" placeholder="০" min={1} value={savingsAmt} onChange={e => setSavingsAmt(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="savingsDate">তারিখ</label>
                <input type="date" className="db-input" id="savingsDate" value={savingsDate} onChange={e => setSavingsDate(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="savingsNote">নোট <span className="db-text-muted">(ঐচ্ছিক)</span></label>
                <textarea className="db-input" id="savingsNote" rows={2} placeholder="যেকোনো মন্তব্য..." value={savingsNote} onChange={e => setSavingsNote(e.target.value)} style={{ resize: 'vertical', minHeight: '60px' }} />
              </div>
              <div style={{ background: 'oklch(95% 0.05 240)', border: '1px solid oklch(88% 0.06 240)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: 'oklch(55% 0.15 240)' }}>
                ℹ️ এই অনুরোধটি ইনতিফাদাহ সংগঠনের অনুমোদনের পর চূড়ান্ত হবে।
              </div>
              <button className="db-btn db-btn-primary db-btn-full" onClick={submitSavings}>অনুরোধ পাঠান →</button>
            </div>
          ) : (
            <div className="db-modal-success" role="status">
              <div className="db-success-icon">✓</div>
              <div className="db-success-title">পাঠানো হয়েছে!</div>
              <div className="db-success-text">আপনার সঞ্চয় অনুরোধ অনুমোদনের জন্য পাঠানো হয়েছে। ইনতিফাদাহ শীঘ্রই যাচাই করবে।</div>
              <button className="db-btn db-btn-ghost db-btn-sm db-mt-12" onClick={handleCloseModal}>ঠিক আছে</button>
            </div>
          )}
        </div>
      </div>

      {/* Loan Modal */}
      <div
        className={`db-modal-backdrop${openModal === 'loanModal' ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loanTitle"
        onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
      >
        <div className="db-modal-sheet">
          <div className="db-modal-handle" />
          <div className="db-modal-header">
            <h2 className="db-modal-title" id="loanTitle">💸 ঋণের আবেদন</h2>
            <button className="db-modal-close" onClick={handleCloseModal} aria-label="বন্ধ করুন">✕</button>
          </div>
          {!loanSuccess ? (
            <div className="db-modal-body">
              <div style={{ background: 'oklch(96% 0.06 80)', border: '1px solid oklch(88% 0.09 80)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: 'oklch(55% 0.14 75)' }}>
                ⚠️ আপনার বর্তমানে একটি সক্রিয় ঋণ আছে (৳১৩,০০০ বাকি)। নতুন ঋণ মঞ্জুর না-ও হতে পারে।
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="loanCat">উদ্দেশ্য <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <select className="db-input" id="loanCat" value={loanCat} onChange={e => setLoanCat(e.target.value)}>
                  <option value="">-- উদ্দেশ্য নির্বাচন করুন --</option>
                  <option>চিকিৎসা</option>
                  <option>শিক্ষা</option>
                  <option>ব্যবসায়িক</option>
                  <option>বাড়ি মেরামত</option>
                  <option>অন্যান্য জরুরি</option>
                </select>
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="loanAmt">পরিমাণ (৳) <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <input type="number" className="db-input" id="loanAmt" placeholder="০" min={500} value={loanAmt} onChange={e => setLoanAmt(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="loanMonths">পরিশোধের মেয়াদ <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <select className="db-input" id="loanMonths" value={loanMonths} onChange={e => calcRepayDate(e.target.value)}>
                  <option value="">-- মাস বেছে নিন --</option>
                  <option value="3">৩ মাস</option>
                  <option value="6">৬ মাস</option>
                  <option value="12">১২ মাস</option>
                  <option value="18">১৮ মাস</option>
                  <option value="24">২৪ মাস</option>
                </select>
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="loanRepayDate">আনুমানিক ফেরতের তারিখ</label>
                <input type="text" className="db-input" id="loanRepayDate" readOnly placeholder="মাস বেছে নিলে স্বয়ংক্রিয়ভাবে আসবে" value={loanRepayDate} style={{ background: 'oklch(99% 0.003 354)', color: 'oklch(35% 0.015 300)' }} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="loanReason">কারণ বিস্তারিত <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <textarea className="db-input" id="loanReason" rows={3} placeholder="কেন এই ঋণ প্রয়োজন তা বিস্তারিত লিখুন..." value={loanReason} onChange={e => setLoanReason(e.target.value)} style={{ resize: 'vertical', minHeight: '72px' }} />
              </div>
              <button className="db-btn db-btn-primary db-btn-full" onClick={submitLoan}>আবেদন পাঠান →</button>
            </div>
          ) : (
            <div className="db-modal-success" role="status">
              <div className="db-success-icon">✓</div>
              <div className="db-success-title">আবেদন পাঠানো হয়েছে!</div>
              <div className="db-success-text">আপনার ঋণের আবেদন গ্রহণ করা হয়েছে। ইনতিফাদাহ যাচাই করে সিদ্ধান্ত জানাবে।</div>
              <button className="db-btn db-btn-ghost db-btn-sm db-mt-12" onClick={handleCloseModal}>ঠিক আছে</button>
            </div>
          )}
        </div>
      </div>

      {/* Pay Modal */}
      <div
        className={`db-modal-backdrop${openModal === 'payModal' ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payTitle"
        onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
      >
        <div className="db-modal-sheet">
          <div className="db-modal-handle" />
          <div className="db-modal-header">
            <h2 className="db-modal-title" id="payTitle">💳 ঋণ পরিশোধ</h2>
            <button className="db-modal-close" onClick={handleCloseModal} aria-label="বন্ধ করুন">✕</button>
          </div>
          {!paySuccess ? (
            <div className="db-modal-body">
              <div style={{ background: 'oklch(96% 0.05 25)', border: '1px solid oklch(88% 0.07 25)', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px' }}>
                <div className="db-text-xs db-text-muted db-fw-700 db-mb-8" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>পরবর্তী কিস্তির বিবরণ</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'oklch(52% 0.18 25)', fontVariantNumeric: 'tabular-nums' }}>৳২,০০০</div>
                <div className="db-text-sm db-text-muted" style={{ marginTop: '4px' }}>মেয়াদ: ৩০ জুন ২০২৬ · সদস্য ঋণ</div>
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="payMethod">পরিশোধের পদ্ধতি <span style={{ color: 'oklch(52% 0.18 25)' }}>*</span></label>
                <select className="db-input" id="payMethod" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option value="">-- পদ্ধতি বেছে নিন --</option>
                  <option>নগদ (Cash)</option>
                  <option>বিকাশ</option>
                  <option>নগদ (মোবাইল)</option>
                  <option>ব্যাংক ট্রান্সফার</option>
                </select>
              </div>
              <div className="db-form-group">
                <label className="db-form-label" htmlFor="payRef">রেফারেন্স নং <span className="db-text-muted">(ঐচ্ছিক)</span></label>
                <input type="text" className="db-input" id="payRef" placeholder="বিকাশ/নগদ ট্রানজেকশন নং" value={payRef} onChange={e => setPayRef(e.target.value)} />
              </div>
              <div style={{ background: 'oklch(95% 0.05 240)', border: '1px solid oklch(88% 0.06 240)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: 'oklch(55% 0.15 240)' }}>
                ℹ️ পরিশোধের পর ইনতিফাদাহ সংগঠন যাচাই করে নিশ্চিত করবে।
              </div>
              <button className="db-btn db-btn-primary db-btn-full" onClick={submitPay}>পরিশোধ নিশ্চিত করুন →</button>
            </div>
          ) : (
            <div className="db-modal-success" role="status">
              <div className="db-success-icon">✓</div>
              <div className="db-success-title">পরিশোধ সম্পন্ন!</div>
              <div className="db-success-text">কিস্তি পরিশোধের তথ্য পাঠানো হয়েছে। ইনতিফাদাহ যাচাইয়ের পর নিশ্চিত করবে।</div>
              <button className="db-btn db-btn-ghost db-btn-sm db-mt-12" onClick={handleCloseModal}>ঠিক আছে</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
