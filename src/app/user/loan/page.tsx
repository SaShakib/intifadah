'use client';

import { useState } from 'react';

const BENGALI_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const BENGALI_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

function toBengaliNum(n: number | string) {
  return String(n).replace(/[0-9]/g, d => BENGALI_DIGITS[parseInt(d)]);
}

function formatBengaliDate(date: Date) {
  const d = toBengaliNum(date.getDate());
  const m = BENGALI_MONTHS[date.getMonth()];
  const y = toBengaliNum(date.getFullYear());
  return `${d} ${m} ${y}`;
}

export default function LoanPage() {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(2000);
  const [selectedAmountEl, setSelectedAmountEl] = useState<'next' | 'full' | null>('next');
  const [customPayAmount, setCustomPayAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bKash');
  const [warnBannerVisible, setWarnBannerVisible] = useState(true);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanCategory, setLoanCategory] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanMonths, setLoanMonths] = useState('');
  const [loanEndDate, setLoanEndDate] = useState('');
  const [loanGuarantor, setLoanGuarantor] = useState('');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string; icon: string }[]>([]);

  const showToast = (message: string, type = 'info', icon = 'ℹ️') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg: message, type, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleMonthsChange = (val: string) => {
    setLoanMonths(val);
    const months = parseInt(val, 10);
    if (!months) { setLoanEndDate(''); return; }
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth() + months, today.getDate());
    setLoanEndDate(formatBengaliDate(end));
  };

  const handleSelectAmount = (which: 'next' | 'full', amount: number) => {
    setSelectedAmountEl(which);
    setSelectedAmount(amount);
    setCustomPayAmount('');
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomPayAmount(val);
    setSelectedAmountEl(null);
    const v = parseInt(val, 10);
    if (!isNaN(v)) setSelectedAmount(v);
  };

  const handleSelectMethod = (method: string) => setSelectedMethod(method);

  const submitPayment = () => {
    const amt = customPayAmount ? parseInt(customPayAmount, 10) : selectedAmount;
    if (!amt || amt < 500) { showToast('ন্যূনতম ৳৫০০ পরিশোধ করতে হবে', 'error', '❌'); return; }
    if (amt > 8000) { showToast('সর্বোচ্চ ৳৮,০০০ পরিশোধ করা যাবে', 'error', '❌'); return; }
    setPayModalOpen(false);
    const amtBn = '৳' + toBengaliNum(amt.toLocaleString('en'));
    showToast(`${amtBn} সফলভাবে পরিশোধ হয়েছে (${selectedMethod})`, 'success', '✅');
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('আবেদন পাঠানো হয়েছে, অনুমোদনের জন্য অপেক্ষা করুন', 'info', '📨');
  };

  return (
    <>
      <style>{`
        .hero-header { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 60%, oklch(38% 0.22 354) 100%); border-radius: var(--r-lg); padding: 28px 32px; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: var(--sh-lg); }
        .hero-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: oklch(100% 0 0 / 0.06); pointer-events: none; }
        .hero-header::after { content: ''; position: absolute; bottom: -40px; left: 40%; width: 180px; height: 180px; border-radius: 50%; background: oklch(100% 0 0 / 0.04); pointer-events: none; }
        .hero-arabic { font-size: 11px; color: oklch(100% 0 0 / 0.50); letter-spacing: 0.06em; margin-bottom: 12px; direction: rtl; text-align: left; }
        .hero-row { display: flex; align-items: center; gap: 16px; position: relative; z-index: 1; }
        .hero-icon { width: 56px; height: 56px; border-radius: 50%; background: oklch(100% 0 0 / 0.15); border: 2px solid oklch(100% 0 0 / 0.25); font-size: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hero-text { flex: 1; }
        .hero-title { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1.2; }
        .hero-sub { font-size: 13px; color: oklch(100% 0 0 / 0.70); margin-top: 5px; }

        .status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { border-radius: var(--r); padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; }
        .stat-card-danger { background: var(--danger-bg); border: 1px solid oklch(88% 0.07 25); }
        .stat-card-warning { background: var(--warning-bg); border: 1px solid oklch(88% 0.09 80); }
        .stat-card-info { background: var(--info-bg); border: 1px solid oklch(88% 0.07 240); }
        .stat-icon { font-size: 20px; margin-bottom: 2px; }
        .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-card-danger .stat-label { color: var(--danger); }
        .stat-card-warning .stat-label { color: var(--warning); }
        .stat-card-info .stat-label { color: var(--info); }
        .stat-value { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
        .stat-card-danger .stat-value { color: var(--danger); }
        .stat-card-warning .stat-value { color: var(--warning); }
        .stat-card-info .stat-value { color: var(--info); }
        .stat-meta { font-size: 12px; color: var(--fg-2); margin-top: 2px; }
        .stat-progress { height: 5px; background: oklch(88% 0.07 240); border-radius: 99px; margin-top: 6px; overflow: hidden; }
        .stat-progress-bar { height: 100%; background: var(--info); border-radius: 99px; width: 33%; }

        .section { margin-bottom: 28px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-title { font-size: 16px; font-weight: 700; color: var(--fg); letter-spacing: -0.01em; }
        .section-subtitle { font-size: 12px; color: var(--muted); font-weight: 400; margin-top: 1px; }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .glass-card { background: oklch(100% 0 0 / 0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid oklch(100% 0 0 / 0.35); border-radius: var(--r-lg); box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.12), inset 0 1px 0 oklch(100% 0 0 / 0.5); }

        .active-loan-card { padding: 24px; margin-bottom: 24px; }
        .loan-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
        .loan-card-title { font-size: 15px; font-weight: 700; color: var(--fg); display: flex; align-items: center; gap: 8px; }
        .loan-card-title-icon { width: 32px; height: 32px; border-radius: var(--r-sm); background: var(--danger-bg); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .loan-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; margin-bottom: 20px; padding: 16px; background: var(--surface-2); border-radius: var(--r-sm); border: 1px solid var(--border); }
        .loan-meta-label { font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; }
        .loan-meta-value { font-size: 14px; font-weight: 600; color: var(--fg); }
        .loan-meta-value.highlight { color: var(--danger); font-size: 16px; font-weight: 700; }

        .loan-progress-wrap { margin-bottom: 20px; }
        .loan-progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .loan-progress-label { font-size: 12.5px; font-weight: 600; color: var(--fg-2); }
        .loan-progress-pct { font-size: 13px; font-weight: 700; color: var(--danger); }
        .loan-progress-track { height: 10px; background: var(--danger-bg); border-radius: 99px; overflow: hidden; border: 1px solid oklch(88% 0.07 25); }
        .loan-progress-fill { height: 100%; background: linear-gradient(90deg, var(--danger) 0%, oklch(58% 0.18 15) 100%); border-radius: 99px; width: 33%; transition: width 0.6s var(--ease-out); }
        .loan-progress-sub { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; color: var(--muted); }

        .schedule-title { font-size: 13px; font-weight: 700; color: var(--fg); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .table-wrap { border-radius: var(--r-sm); overflow: hidden; border: 1px solid var(--border); margin-bottom: 20px; overflow-x: auto; }
        .loan-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 480px; }
        .loan-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; background: var(--surface-2); border-bottom: 1px solid var(--border); }
        .loan-table td { padding: 11px 14px; color: var(--fg); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .loan-table tr:last-child td { border-bottom: none; }
        .loan-table tbody tr { transition: background var(--dur-fast); }
        .loan-table tbody tr:hover { background: var(--surface-2); }
        .loan-card-footer { display: flex; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border); }

        .badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: 0.01em; }
        .badge-success { background: var(--success-bg); color: var(--success); }
        .badge-warning { background: var(--warning-bg); color: var(--warning); }
        .badge-danger { background: var(--danger-bg); color: var(--danger); }
        .badge-muted { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }
        .badge-info { background: var(--info-bg); color: var(--info); }

        .warning-banner { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: oklch(96% 0.07 70); border: 1px solid oklch(86% 0.10 70); border-radius: var(--r-sm); margin-bottom: 20px; }
        .warning-banner-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .warning-banner-text { flex: 1; font-size: 13px; color: oklch(38% 0.12 65); font-weight: 500; line-height: 1.5; }
        .warning-banner-close { background: none; border: none; cursor: pointer; color: oklch(55% 0.10 70); font-size: 16px; line-height: 1; padding: 2px; flex-shrink: 0; transition: color var(--dur-fast); }
        .warning-banner-close:hover { color: oklch(38% 0.12 65); }

        .form-card { padding: 24px; margin-bottom: 24px; }
        .form-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .form-card-icon { width: 36px; height: 36px; border-radius: var(--r-sm); background: var(--brand-light); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .form-card-title { font-size: 15px; font-weight: 700; color: var(--fg); }
        .form-card-subtitle { font-size: 12px; color: var(--muted); margin-top: 1px; }
        .form-overlay { position: relative; }
        .form-overlay-mask { position: absolute; inset: -8px; background: oklch(100% 0 0 / 0.70); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); border-radius: var(--r-sm); z-index: 10; display: flex; align-items: center; justify-content: center; }
        .form-overlay-message { text-align: center; padding: 24px; }
        .form-overlay-icon { font-size: 36px; margin-bottom: 10px; }
        .form-overlay-text { font-size: 14px; font-weight: 600; color: var(--fg); margin-bottom: 4px; }
        .form-overlay-sub { font-size: 12.5px; color: var(--muted); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-field.full { grid-column: 1 / -1; }
        .form-label { font-size: 12.5px; font-weight: 600; color: var(--fg-2); }
        .form-hint { font-size: 11.5px; color: var(--muted); margin-top: 3px; }
        .form-footer { display: flex; justify-content: flex-end; padding-top: 16px; margin-top: 4px; border-top: 1px solid var(--border); position: relative; }
        .input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; color: var(--fg); background: var(--surface); outline: none; transition: border-color var(--dur-fast), box-shadow var(--dur-fast); appearance: none; }
        .input:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .input:disabled { background: var(--surface-2); color: var(--muted); cursor: not-allowed; }
        .input-with-prefix { display: flex; align-items: stretch; }
        .input-prefix { padding: 0 12px; background: var(--surface-2); border: 1px solid var(--border); border-right: none; border-radius: var(--r-sm) 0 0 var(--r-sm); display: flex; align-items: center; font-size: 14px; font-weight: 700; color: var(--muted); flex-shrink: 0; }
        .input-with-prefix .input { border-radius: 0 var(--r-sm) var(--r-sm) 0; }
        .select-custom { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; color: var(--fg); background: var(--surface); outline: none; transition: border-color var(--dur-fast), box-shadow var(--dur-fast); appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23888' d='M4 6l4 4 4-4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 36px; cursor: pointer; }
        .select-custom:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .select-custom:disabled { background-color: var(--surface-2); color: var(--muted); cursor: not-allowed; }
        .textarea-custom { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; color: var(--fg); background: var(--surface); outline: none; transition: border-color var(--dur-fast), box-shadow var(--dur-fast); resize: vertical; min-height: 90px; line-height: 1.6; }
        .textarea-custom:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .textarea-custom:disabled { background: var(--surface-2); color: var(--muted); cursor: not-allowed; }
        .tooltip-wrap { position: relative; display: inline-flex; }
        .tooltip-wrap .tooltip-text { position: absolute; bottom: calc(100% + 8px); right: 0; background: var(--fg); color: #fff; font-size: 12px; padding: 6px 10px; border-radius: var(--r-sm); white-space: nowrap; pointer-events: none; opacity: 0; transform: translateY(4px); transition: all var(--dur-fast); z-index: 50; }
        .tooltip-wrap:hover .tooltip-text { opacity: 1; transform: translateY(0); }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 18px; border-radius: var(--r-sm); font-family: var(--font); font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; transition: all var(--dur-fast) var(--ease-out); text-decoration: none; white-space: nowrap; line-height: 1; }
        .btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .btn:active:not(:disabled) { transform: scale(0.97); }
        .btn-primary { background: var(--brand); color: #fff; box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.35); }
        .btn-primary:hover:not(:disabled) { background: var(--brand-mid); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); }
        .btn-primary:disabled { background: oklch(75% 0.08 354); box-shadow: none; cursor: not-allowed; opacity: 0.65; }
        .btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .btn-ghost:hover { background: var(--surface-2); color: var(--fg); }
        .btn-sm { padding: 7px 14px; font-size: 12.5px; }
        .btn-full { width: 100%; }

        .modal-backdrop { display: none; position: fixed; inset: 0; background: oklch(0% 0 0 / 0.55); z-index: 500; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); align-items: center; justify-content: center; padding: 20px; }
        .modal-backdrop.open { display: flex; }
        .modal { background: var(--surface); border-radius: var(--r-lg); box-shadow: 0 24px 60px oklch(0% 0 0 / 0.30); width: 100%; max-width: 480px; animation: modal-in var(--dur-normal) cubic-bezier(0.34, 1.56, 0.64, 1); overflow: hidden; }
        @keyframes modal-in { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%); }
        .modal-title { font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
        .modal-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: oklch(100% 0 0 / 0.15); color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--dur-fast); }
        .modal-close:hover { background: oklch(100% 0 0 / 0.25); }
        .modal-body { padding: 24px; }
        .modal-amount-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .amount-option { border: 2px solid var(--border); border-radius: var(--r-sm); padding: 14px 12px; cursor: pointer; transition: all var(--dur-fast); text-align: center; background: var(--surface); }
        .amount-option:hover { border-color: var(--brand); }
        .amount-option.selected { border-color: var(--brand); background: var(--brand-light); }
        .amount-option-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
        .amount-option.selected .amount-option-label { color: var(--brand); }
        .amount-option-value { font-size: 18px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; }
        .amount-option.selected .amount-option-value { color: var(--brand-mid); }
        .modal-method-label { font-size: 12.5px; font-weight: 600; color: var(--fg-2); margin-bottom: 10px; }
        .modal-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px; }
        .method-btn { border: 2px solid var(--border); border-radius: var(--r-sm); padding: 12px 8px; cursor: pointer; transition: all var(--dur-fast); text-align: center; background: var(--surface); font-family: var(--font); }
        .method-btn:hover { border-color: var(--brand); }
        .method-btn.selected { border-color: var(--brand); background: var(--brand-light); }
        .method-icon { font-size: 22px; margin-bottom: 4px; }
        .method-name { font-size: 11.5px; font-weight: 600; color: var(--fg-2); }
        .method-btn.selected .method-name { color: var(--brand-mid); }
        .modal-footer { padding: 16px 24px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }
        .modal-info-block { background: var(--surface-2); border-radius: var(--r-sm); border: 1px solid var(--border); padding: 12px 14px; margin-bottom: 20px; }
        .modal-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .modal-info-row:last-child { border-bottom: none; }
        .modal-info-label { color: var(--muted); }
        .modal-info-value { font-weight: 600; color: var(--fg); }

        .history-card { padding: 24px; margin-bottom: 24px; }

        .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 1000; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { background: var(--fg); color: #fff; padding: 13px 18px; border-radius: var(--r); font-size: 13.5px; font-weight: 500; box-shadow: 0 8px 28px oklch(0% 0 0 / 0.25); display: flex; align-items: center; gap: 10px; max-width: 360px; pointer-events: all; animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes toast-in { from { opacity: 0; transform: translateX(30px) scale(0.9); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .toast-icon { font-size: 18px; flex-shrink: 0; }
        .toast-success { background: oklch(35% 0.12 145); }
        .toast-error { background: oklch(40% 0.16 25); }
        .toast-info { background: oklch(38% 0.14 240); }

        @media (max-width: 768px) {
          .status-grid { grid-template-columns: 1fr; gap: 10px; }
          .stat-card { flex-direction: row; align-items: center; padding: 14px 16px; gap: 12px; }
          .stat-icon { font-size: 24px; margin-bottom: 0; }
          .stat-value { font-size: 22px; }
          .stat-progress { display: none; }
          .loan-meta-grid { grid-template-columns: 1fr 1fr; }
          .form-grid { grid-template-columns: 1fr; }
          .modal-amount-choice { grid-template-columns: 1fr; }
          .hero-title { font-size: 20px; }
          .toast-container { bottom: calc(var(--bottomnav-h) + 12px); right: 16px; left: 16px; }
          .toast { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .loan-meta-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Toast */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{t.icon}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* HERO HEADER */}
      <div className="hero-header">
        <div className="hero-arabic">قَرْضٌ حَسَنٌ</div>
        <div className="hero-row">
          <div className="hero-icon">💸</div>
          <div className="hero-text">
            <div className="hero-title">ঋণ অনুরোধ</div>
            <div className="hero-sub">কর্যে হাসানাঃ — সুদমুক্ত ঋণ আপনার পাশে</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ background: 'oklch(100% 0 0 / 0.15)', border: '1px solid oklch(100% 0 0 / 0.20)', color: '#fff', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>সক্রিয় ঋণ</span>
          </div>
        </div>
      </div>

      {/* STATUS SUMMARY */}
      <section className="section">
        <div className="status-grid">
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">🚨</div>
            <div className="stat-label">বর্তমান ঋণ</div>
            <div className="stat-value">৳৮,০০০</div>
            <div className="stat-meta">বাকি পরিমাণ</div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⏰</div>
            <div className="stat-label">পরবর্তী কিস্তি</div>
            <div className="stat-value">৳২,০০০</div>
            <div className="stat-meta">দেয় তারিখ: ১ জুলাই</div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">✅</div>
            <div className="stat-label">মোট পরিশোধ</div>
            <div className="stat-value">৳৪,০০০</div>
            <div className="stat-meta">৳১২,০০০ এর মধ্যে (৩৩%)</div>
            <div className="stat-progress"><div className="stat-progress-bar"></div></div>
          </div>
        </div>
      </section>

      {/* ACTIVE LOAN PANEL */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">সক্রিয় ঋণ</div>
            <div className="section-subtitle">বর্তমানে চলমান ঋণের বিবরণ ও কিস্তির তফসিল</div>
          </div>
          <span className="badge badge-danger">সক্রিয়</span>
        </div>
        <div className="glass-card active-loan-card">
          <div className="loan-card-header">
            <div className="loan-card-title">
              <div className="loan-card-title-icon">🏥</div>
              চিকিৎসা ব্যয় — ঋণ #আর-২০২৬-০০৩
            </div>
            <span className="badge badge-danger">পরিশোধ চলছে</span>
          </div>
          <div className="loan-meta-grid">
            <div><div className="loan-meta-label">ঋণের উদ্দেশ্য</div><div className="loan-meta-value">চিকিৎসা ব্যয়</div></div>
            <div><div className="loan-meta-label">মোট ঋণ</div><div className="loan-meta-value">৳১২,০০০</div></div>
            <div><div className="loan-meta-label">গ্রহণের তারিখ</div><div className="loan-meta-value">১৫ মার্চ ২০২৬</div></div>
            <div><div className="loan-meta-label">ফেরতের শেষ তারিখ</div><div className="loan-meta-value" style={{ color: 'var(--warning)' }}>১৫ সেপ্টেম্বর ২০২৬</div></div>
            <div><div className="loan-meta-label">পরিশোধিত</div><div className="loan-meta-value" style={{ color: 'var(--success)' }}>৳৪,০০০ (৩৩%)</div></div>
            <div><div className="loan-meta-label">বাকি পরিমাণ</div><div className="loan-meta-value highlight">৳৮,০০০</div></div>
          </div>
          <div className="loan-progress-wrap">
            <div className="loan-progress-header">
              <span className="loan-progress-label">পরিশোধের অগ্রগতি</span>
              <span className="loan-progress-pct">৩৩%</span>
            </div>
            <div className="loan-progress-track"><div className="loan-progress-fill"></div></div>
            <div className="loan-progress-sub"><span>পরিশোধ: ৳৪,০০০</span><span>মোট: ৳১২,০০০</span></div>
          </div>
          <div className="schedule-title">📅 কিস্তির তফসিল</div>
          <div className="table-wrap">
            <table className="loan-table">
              <thead>
                <tr>
                  <th>কিস্তি</th><th>পরিমাণ</th><th>তারিখ</th><th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ fontWeight: 600, color: 'var(--muted)' }}>১ম</td><td style={{ fontWeight: 700 }}>৳২,০০০</td><td>১৫ এপ্রিল ২০২৬</td><td><span className="badge badge-success">✓ পরিশোধিত</span></td></tr>
                <tr><td style={{ fontWeight: 600, color: 'var(--muted)' }}>২য়</td><td style={{ fontWeight: 700 }}>৳২,০০০</td><td>১৫ মে ২০২৬</td><td><span className="badge badge-success">✓ পরিশোধিত</span></td></tr>
                <tr><td style={{ fontWeight: 600, color: 'var(--muted)' }}>৩য়</td><td style={{ fontWeight: 700 }}>৳২,০০০</td><td>১৫ জুন ২০২৬</td><td><span className="badge badge-success">✓ পরিশোধিত</span></td></tr>
                <tr style={{ background: 'oklch(96% 0.06 80 / 0.4)' }}>
                  <td style={{ fontWeight: 700, color: 'var(--warning)' }}>৪র্থ</td>
                  <td style={{ fontWeight: 700, color: 'var(--warning)' }}>৳২,০০০</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 600 }}>১ জুলাই ২০২৬ ⚡</td>
                  <td><span className="badge badge-warning">বাকি</span></td>
                </tr>
                <tr><td style={{ fontWeight: 600, color: 'var(--muted)' }}>৫ম</td><td style={{ fontWeight: 700 }}>৳২,০০০</td><td>১৫ আগস্ট ২০২৬</td><td><span className="badge badge-muted">বাকি</span></td></tr>
                <tr><td style={{ fontWeight: 600, color: 'var(--muted)' }}>৬ষ্ঠ</td><td style={{ fontWeight: 700 }}>৳২,০০০</td><td>১৫ সেপ্টেম্বর ২০২৬</td><td><span className="badge badge-muted">বাকি</span></td></tr>
              </tbody>
            </table>
          </div>
          <div className="loan-card-footer">
            <button className="btn btn-primary" onClick={() => setPayModalOpen(true)}>পরিশোধ করুন →</button>
          </div>
        </div>
      </section>

      {/* NEW LOAN APPLICATION FORM */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">নতুন ঋণের আবেদন</div>
            <div className="section-subtitle">কর্যে হাসানাঃ — সুদমুক্ত ঋণের জন্য আবেদন করুন</div>
          </div>
        </div>
        <div className="glass-card form-card">
          <div className="form-card-header">
            <div className="form-card-icon">📝</div>
            <div>
              <div className="form-card-title">ঋণ আবেদন ফর্ম</div>
              <div className="form-card-subtitle">সকল তথ্য সঠিকভাবে পূরণ করুন</div>
            </div>
          </div>
          {warnBannerVisible && (
            <div className="warning-banner" id="warnBanner">
              <span className="warning-banner-icon">⚠️</span>
              <span className="warning-banner-text">বিদ্যমান ঋণ পরিশোধ না হলে নতুন আবেদন করা যাবে না। আগের ঋণ সম্পূর্ণ পরিশোধের পরে নতুন ঋণের আবেদন করতে পারবেন।</span>
              <button className="warning-banner-close" onClick={() => setWarnBannerVisible(false)} aria-label="বন্ধ করুন">×</button>
            </div>
          )}
          <div className="form-overlay">
            <div className="form-overlay-mask">
              <div className="form-overlay-message">
                <div className="form-overlay-icon">🔒</div>
                <div className="form-overlay-text">নতুন ঋণের আবেদন করতে আগের ঋণ পরিশোধ করুন</div>
                <div className="form-overlay-sub">বর্তমান বাকি: ৳৮,০০০</div>
              </div>
            </div>
            <form id="loanForm" onSubmit={handleLoanSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label" htmlFor="loanAmount">ঋণের পরিমাণ (৳) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">৳</span>
                    <input type="number" id="loanAmount" className="input" placeholder="যেমন: ১০০০০" min="1000" max="50000" disabled value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
                  </div>
                  <div className="form-hint">সর্বনিম্ন ৳১,০০০ — সর্বোচ্চ ৳৫০,০০০</div>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="loanCategory">খাত <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select id="loanCategory" className="select-custom" disabled value={loanCategory} onChange={e => setLoanCategory(e.target.value)}>
                    <option value="">— খাত বেছে নিন —</option>
                    <option value="medical">🏥 চিকিৎসা</option>
                    <option value="education">🎓 শিক্ষা</option>
                    <option value="business">💼 ব্যবসা</option>
                    <option value="family">👨‍👩‍👧 পারিবারিক জরুরি</option>
                    <option value="other">📌 অন্যান্য</option>
                  </select>
                </div>
                <div className="form-field full">
                  <label className="form-label" htmlFor="loanPurpose">ঋণের উদ্দেশ্য <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea id="loanPurpose" className="textarea-custom" placeholder="ঋণের কারণ ও ব্যবহার সম্পর্কে বিস্তারিত লিখুন..." disabled value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)}></textarea>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="loanMonths">পরিশোধের মেয়াদ <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select id="loanMonths" className="select-custom" disabled value={loanMonths} onChange={e => handleMonthsChange(e.target.value)}>
                    <option value="">— মেয়াদ বেছে নিন —</option>
                    <option value="3">৩ মাস</option>
                    <option value="6">৬ মাস</option>
                    <option value="9">৯ মাস</option>
                    <option value="12">১২ মাস</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="loanEndDate">আনুমানিক পরিশোধ শেষ</label>
                  <input type="text" id="loanEndDate" className="input" placeholder="মেয়াদ বেছে নিলে স্বয়ংক্রিয়ভাবে হিসাব হবে" readOnly disabled value={loanEndDate} />
                  <div className="form-hint">মেয়াদ নির্বাচন করুন — স্বয়ংক্রিয় হিসাব</div>
                </div>
                <div className="form-field full">
                  <label className="form-label" htmlFor="loanGuarantor">জামিনদারের নাম <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(ঐচ্ছিক)</span></label>
                  <input type="text" id="loanGuarantor" className="input" placeholder="জামিনদারের পূর্ণ নাম লিখুন" disabled value={loanGuarantor} onChange={e => setLoanGuarantor(e.target.value)} />
                  <div className="form-hint">বড় ঋণের ক্ষেত্রে জামিনদার থাকলে অনুমোদন সহজ হয়</div>
                </div>
              </div>
              <div className="form-footer">
                <div className="tooltip-wrap">
                  <button type="submit" className="btn btn-primary" disabled>আবেদন পাঠান →</button>
                  <span className="tooltip-text">আগের ঋণ (৳৮,০০০) পরিশোধ করুন</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* LOAN HISTORY */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">ঋণের ইতিহাস</div>
            <div className="section-subtitle">পূর্ববর্তী ঋণের বিবরণ</div>
          </div>
        </div>
        <div className="card history-card">
          <div className="table-wrap">
            <table className="loan-table">
              <thead>
                <tr><th>তারিখ</th><th>পরিমাণ</th><th>উদ্দেশ্য</th><th>মেয়াদ</th><th>স্ট্যাটাস</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--muted)', fontSize: '13px' }}>১৫ জুলাই ২০২৫</td>
                  <td style={{ fontWeight: 700 }}>৳৫,০০০</td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>💼</span> ব্যবসা</span></td>
                  <td>৬ মাস</td>
                  <td>
                    <span className="badge badge-success">✓ পরিশোধিত</span>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>১৫ জানুয়ারি ২০২৬</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 0 0', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
            মোট ১টি পূর্ববর্তী ঋণ · সব পরিশোধিত
          </div>
        </div>
      </section>

      {/* PAYMENT MODAL */}
      <div className={`modal-backdrop${payModalOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setPayModalOpen(false); }}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div className="modal-header">
            <div className="modal-title" id="modalTitle"><span>💳</span> কিস্তি পরিশোধ</div>
            <button className="modal-close" onClick={() => setPayModalOpen(false)} aria-label="বন্ধ করুন">×</button>
          </div>
          <div className="modal-body">
            <div className="modal-info-block">
              <div className="modal-info-row"><span className="modal-info-label">ঋণের উদ্দেশ্য</span><span className="modal-info-value">চিকিৎসা ব্যয়</span></div>
              <div className="modal-info-row"><span className="modal-info-label">মোট বাকি</span><span className="modal-info-value" style={{ color: 'var(--danger)' }}>৳৮,০০০</span></div>
              <div className="modal-info-row"><span className="modal-info-label">পরবর্তী কিস্তি</span><span className="modal-info-value" style={{ color: 'var(--warning)' }}>৳২,০০০ (১ জুলাই)</span></div>
            </div>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fg-2)', marginBottom: '10px' }}>পরিশোধের পরিমাণ</p>
            <div className="modal-amount-choice">
              <div className={`amount-option${selectedAmountEl === 'next' ? ' selected' : ''}`} onClick={() => handleSelectAmount('next', 2000)}>
                <div className="amount-option-label">পরবর্তী কিস্তি</div>
                <div className="amount-option-value">৳২,০০০</div>
              </div>
              <div className={`amount-option${selectedAmountEl === 'full' ? ' selected' : ''}`} onClick={() => handleSelectAmount('full', 8000)}>
                <div className="amount-option-label">সম্পূর্ণ পরিশোধ</div>
                <div className="amount-option-value">৳৮,০০০</div>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: '6px' }}>অথবা নিজে পরিমাণ লিখুন</label>
              <div className="input-with-prefix">
                <span className="input-prefix">৳</span>
                <input type="number" id="customPayAmount" className="input" placeholder="পরিমাণ লিখুন..." min="500" max="8000" value={customPayAmount} onChange={e => handleCustomAmountChange(e.target.value)} style={{ borderRadius: '0 var(--r-sm) var(--r-sm) 0' }} />
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>সর্বনিম্ন ৳৫০০ — সর্বোচ্চ ৳৮,০০০</div>
            </div>
            <p className="modal-method-label">পরিশোধের মাধ্যম</p>
            <div className="modal-methods">
              {[{ name: 'bKash', icon: '💗' }, { name: 'নগদ', icon: '🟠' }, { name: 'সরাসরি', icon: '💵' }].map(m => (
                <button key={m.name} className={`method-btn${selectedMethod === m.name ? ' selected' : ''}`} onClick={() => handleSelectMethod(m.name)} type="button">
                  <div className="method-icon">{m.icon}</div>
                  <div className="method-name">{m.name}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setPayModalOpen(false)}>বাতিল</button>
            <button className="btn btn-primary" onClick={submitPayment}>পরিশোধ নিশ্চিত করুন →</button>
          </div>
        </div>
      </div>
    </>
  );
}
