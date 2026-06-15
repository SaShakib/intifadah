'use client';

import { useState, useEffect } from 'react';

export default function SavingsPage() {
  const [depositFormVisible, setDepositFormVisible] = useState(true);
  const [depositSuccessVisible, setDepositSuccessVisible] = useState(false);
  const [selectedKhat, setSelectedKhat] = useState('monthly');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('bkash');
  const [activeQuickBtn, setActiveQuickBtn] = useState<number | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState('monthly');
  const [transferTo, setTransferTo] = useState('special');
  const [transferAmount, setTransferAmount] = useState('');
  const [filterKhat, setFilterKhat] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; type: string; title: string; message: string }[]>([]);
  const [goalBarWidth, setGoalBarWidth] = useState('0%');
  const [summaryBarWidth, setSummaryBarWidth] = useState('0%');

  useEffect(() => {
    const timer = setTimeout(() => {
      setGoalBarWidth('67%');
      setSummaryBarWidth('67%');
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const historyData = [
    { khat: 'monthly', month: 'jun', status: 'approved', search: 'মাসিক সঞ্চয় জুন রহিম', date: '১৫ জুন ২০২৬', khatLabel: '🏦 মাসিক সঞ্চয়', khatCls: 'monthly', amount: '৳১,০০০', statusBadge: 'badge-success', statusLabel: '✓ অনুমোদিত', recorder: 'আব্দুল করিম' },
    { khat: 'special', month: 'jun', status: 'pending', search: 'বিশেষ সঞ্চয় জুন রহিম', date: '১০ জুন ২০২৬', khatLabel: '⭐ বিশেষ সঞ্চয়', khatCls: 'special', amount: '৳৫০০', statusBadge: 'badge-warning', statusLabel: '⏳ অপেক্ষমান', recorder: '—' },
    { khat: 'monthly', month: 'may', status: 'approved', search: 'মাসিক সঞ্চয় মে রহিম করিম', date: '০৫ মে ২০২৬', khatLabel: '🏦 মাসিক সঞ্চয়', khatCls: 'monthly', amount: '৳১,০০০', statusBadge: 'badge-success', statusLabel: '✓ অনুমোদিত', recorder: 'আব্দুল করিম' },
    { khat: 'zakat', month: 'apr', status: 'approved', search: 'যাকাত সঞ্চয় এপ্রিল নাসরিন', date: '২০ এপ্রিল ২০২৬', khatLabel: '🌙 যাকাত সঞ্চয়', khatCls: 'zakat', amount: '৳০', statusBadge: 'badge-success', statusLabel: '✓ অনুমোদিত', recorder: 'নাসরিন বেগম' },
    { khat: 'monthly', month: 'apr', status: 'approved', search: 'মাসিক সঞ্চয় এপ্রিল করিম', date: '০৩ এপ্রিল ২০২৬', khatLabel: '🏦 মাসিক সঞ্চয়', khatCls: 'monthly', amount: '৳১,০০০', statusBadge: 'badge-success', statusLabel: '✓ অনুমোদিত', recorder: 'আব্দুল করিম' },
    { khat: 'monthly', month: 'mar', status: 'approved', search: 'মাসিক সঞ্চয় মার্চ করিম', date: '০১ মার্চ ২০২৬', khatLabel: '🏦 মাসিক সঞ্চয়', khatCls: 'monthly', amount: '৳১,০০০', statusBadge: 'badge-success', statusLabel: '✓ অনুমোদিত', recorder: 'আব্দুল করিম' },
    { khat: 'special', month: 'mar', status: 'rejected', search: 'বিশেষ সঞ্চয় মার্চ নাসরিন', date: '২৫ মার্চ ২০২৬', khatLabel: '⭐ বিশেষ সঞ্চয়', khatCls: 'special', amount: '৳২,০০০', statusBadge: 'badge-danger', statusLabel: '✗ প্রত্যাখ্যাত', recorder: 'নাসরিন বেগম' },
  ];

  const filteredRows = historyData.filter(row => {
    const matchK = !filterKhat || row.khat === filterKhat;
    const matchM = !filterMonth || row.month === filterMonth;
    const matchS = !filterStatus || row.status === filterStatus;
    const matchQ = !filterSearch || row.search.toLowerCase().includes(filterSearch.toLowerCase());
    return matchK && matchM && matchS && matchQ;
  });

  const bnDigits = (n: number) => n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);

  const showToast = (type: string, title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const setQuickAmount = (amount: number) => {
    setDepositAmount(String(amount));
    setActiveQuickBtn(amount);
  };

  const setQuickAmountAndKhat = (amount: number, khatValue: string) => {
    setDepositAmount(String(amount));
    setSelectedKhat(khatValue);
    setActiveQuickBtn(null);
    showToast('info', 'খাত নির্বাচিত', 'মাসিক সঞ্চয় খাতে ৳৫০০ পূর্বনির্ধারণ করা হয়েছে');
  };

  const handleDepositAmountChange = (v: string) => {
    setDepositAmount(v);
    setActiveQuickBtn(null);
  };

  const selectKhat = (khatValue: string) => {
    setSelectedKhat(khatValue);
  };

  const submitDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!depositAmount || amount <= 0) {
      showToast('error', 'ত্রুটি', 'অনুগ্রহ করে একটি বৈধ পরিমাণ প্রবেশ করুন');
      return;
    }
    if (amount < 50) {
      showToast('error', 'ত্রুটি', 'সর্বনিম্ন সঞ্চয়ের পরিমাণ ৳৫০');
      return;
    }
    setSubmitLoading(true);
    const khatLabels: Record<string, string> = { monthly: 'মাসিক সঞ্চয়', special: 'বিশেষ সঞ্চয়', zakat: 'যাকাত সঞ্চয়', edu: 'শিক্ষা তহবিল' };
    const khatText = khatLabels[selectedKhat] || selectedKhat;
    setTimeout(() => {
      setSubmitLoading(false);
      setDepositFormVisible(false);
      setDepositSuccessVisible(true);
      showToast('success', 'সঞ্চয় অনুরোধ পাঠানো হয়েছে ✓', `${khatText} খাতে ৳${amount.toLocaleString('bn-BD')} জমার অনুরোধ পাঠানো হয়েছে`);
    }, 900);
  };

  const resetDepositForm = () => {
    setDepositSuccessVisible(false);
    setDepositFormVisible(true);
    setDepositAmount('');
    setDepositNote('');
    setActiveQuickBtn(null);
    setSubmitLoading(false);
  };

  const submitTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (!transferAmount || amount <= 0) {
      showToast('error', 'ত্রুটি', 'অনুগ্রহ করে ট্রান্সফার পরিমাণ প্রবেশ করুন');
      return;
    }
    if (transferFrom === transferTo) {
      showToast('error', 'ত্রুটি', 'একই খাত থেকে একই খাতে ট্রান্সফার করা সম্ভব নয়');
      return;
    }
    const labels: Record<string, string> = { monthly: 'মাসিক সঞ্চয়', special: 'বিশেষ সঞ্চয়', zakat: 'যাকাত সঞ্চয়' };
    showToast('success', 'ট্রান্সফার সম্পন্ন ✓', `${labels[transferFrom]} থেকে ${labels[transferTo]} খাতে ৳${amount.toLocaleString('bn-BD')} ট্রান্সফার অনুরোধ পাঠানো হয়েছে`);
    setTransferAmount('');
    setTransferOpen(false);
  };

  return (
    <>
      <style>{`
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r);
          box-shadow: var(--sh-sm);
        }

        .glass-card {
          background: oklch(100% 0 0 / 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid oklch(100% 0 0 / 0.35);
          border-radius: var(--r-lg);
          box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.12), inset 0 1px 0 oklch(100% 0 0 / 0.5);
        }

        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 7px; padding: 10px 18px;
          border-radius: var(--r-sm);
          font-family: var(--font); font-size: 13.5px; font-weight: 600;
          cursor: pointer; border: none;
          transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
          text-decoration: none; white-space: nowrap; line-height: 1;
        }
        .btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--brand); color: #fff; box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.35); }
        .btn-primary:hover { background: var(--brand-mid); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .btn-ghost:hover { background: var(--surface-2); color: var(--fg); }
        .btn-sm { padding: 7px 14px; font-size: 12.5px; }
        .btn-full { width: 100%; }

        .badge {
          display: inline-flex; align-items: center; gap: 3px;
          padding: 3px 9px; border-radius: 99px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.01em;
        }
        .badge-success { background: var(--success-bg); color: var(--success); }
        .badge-warning  { background: var(--warning-bg); color: var(--warning); }
        .badge-danger   { background: var(--danger-bg);  color: var(--danger); }
        .badge-muted    { background: var(--surface-2);  color: var(--muted); border: 1px solid var(--border); }

        .input, .select, .textarea {
          width: 100%; padding: 10px 14px;
          border: 1px solid var(--border); border-radius: var(--r-sm);
          font-family: var(--font); font-size: 14px; color: var(--fg);
          background: var(--surface); outline: none;
          transition: border-color 150ms, box-shadow 150ms;
          appearance: none;
        }
        .input:focus, .select:focus, .textarea:focus {
          border-color: var(--brand-mid);
          box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15);
        }
        .select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
          padding-right: 36px; cursor: pointer;
        }
        .textarea { resize: vertical; min-height: 72px; line-height: 1.6; }

        label {
          display: block; font-size: 12.5px; font-weight: 600;
          color: var(--fg-2); margin-bottom: 6px; letter-spacing: 0.01em;
        }
        .form-group { margin-bottom: 16px; }
        .section { margin-bottom: 28px; }

        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title { font-size: 16px; font-weight: 700; color: var(--fg); letter-spacing: -0.01em; }
        .section-subtitle { font-size: 12px; color: var(--muted); font-weight: 400; margin-top: 1px; }

        .hero-banner {
          background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 60%, oklch(38% 0.22 354) 100%);
          border-radius: var(--r-lg); padding: 28px 32px; margin-bottom: 24px;
          position: relative; overflow: hidden; box-shadow: var(--sh-lg);
        }
        .hero-banner::before {
          content: ''; position: absolute; top: -70px; right: -70px;
          width: 230px; height: 230px; border-radius: 50%;
          background: oklch(100% 0 0 / 0.06); pointer-events: none;
        }
        .hero-banner::after {
          content: ''; position: absolute; bottom: -50px; left: 38%;
          width: 190px; height: 190px; border-radius: 50%;
          background: oklch(100% 0 0 / 0.04); pointer-events: none;
        }
        .hero-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
        }
        .hero-left { flex: 1; min-width: 200px; }
        .hero-arabic {
          font-size: 11px; color: oklch(100% 0 0 / 0.50);
          letter-spacing: 0.06em; margin-bottom: 10px; direction: rtl; text-align: left;
        }
        .hero-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 8px; }
        .hero-subtitle { font-size: 13.5px; color: oklch(100% 0 0 / 0.72); line-height: 1.5; }
        .hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .hero-total-label { font-size: 11px; color: oklch(100% 0 0 / 0.55); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
        .hero-total-amount { font-size: 36px; font-weight: 800; color: #fff; letter-spacing: -0.04em; line-height: 1; }
        .hero-badge { background: oklch(100% 0 0 / 0.18); border: 1px solid oklch(100% 0 0 / 0.25); color: #fff; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; }

        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .summary-card { border-radius: var(--r); padding: 18px 20px; position: relative; overflow: hidden; transition: transform 150ms, box-shadow 150ms; }
        .summary-card:hover { transform: translateY(-2px); box-shadow: var(--sh); }
        .summary-card.brand { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%); box-shadow: 0 4px 20px oklch(50% 0.26 354 / 0.35), 0 0 40px oklch(50% 0.26 354 / 0.15); color: #fff; }
        .summary-card.success { background: var(--success-bg); border: 1px solid oklch(88% 0.06 145); }
        .summary-card.info    { background: var(--info-bg);    border: 1px solid oklch(88% 0.06 240); }
        .summary-card.warning { background: var(--warning-bg); border: 1px solid oklch(88% 0.08 80); }

        .sc-icon { width: 36px; height: 36px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; }
        .brand .sc-icon   { background: oklch(100% 0 0 / 0.18); }
        .success .sc-icon { background: oklch(90% 0.07 145); }
        .info .sc-icon    { background: oklch(90% 0.07 240); }
        .warning .sc-icon { background: oklch(92% 0.08 80); }

        .sc-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 4px; opacity: 0.75; }
        .brand .sc-label { color: oklch(100% 0 0 / 0.80); }
        .success .sc-label { color: var(--success); }
        .info .sc-label { color: var(--info); }
        .warning .sc-label { color: var(--warning); }

        .sc-value { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
        .brand .sc-value { color: #fff; }
        .success .sc-value { color: oklch(35% 0.13 145); }
        .info .sc-value    { color: oklch(45% 0.14 240); }
        .warning .sc-value { color: oklch(45% 0.13 75); }

        .sc-sub { font-size: 11px; margin-top: 4px; opacity: 0.70; }
        .brand .sc-sub { color: #fff; }

        .sc-progress { margin-top: 10px; height: 5px; border-radius: 99px; background: oklch(80% 0.07 240 / 0.4); overflow: hidden; }
        .sc-progress-bar { height: 100%; border-radius: 99px; background: var(--info); transition: width 1s cubic-bezier(0, 0, 0.2, 1); }

        .goal-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 20px 24px; margin-bottom: 24px; box-shadow: var(--sh-sm); }
        .goal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
        .goal-title-group { display: flex; align-items: center; gap: 10px; }
        .goal-icon { width: 40px; height: 40px; border-radius: var(--r-sm); background: var(--brand-light); display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .goal-title { font-size: 15px; font-weight: 700; color: var(--fg); }
        .goal-subtitle { font-size: 12px; color: var(--muted); margin-top: 1px; }
        .goal-amounts { display: flex; align-items: baseline; gap: 6px; }
        .goal-current { font-size: 22px; font-weight: 800; color: var(--brand); letter-spacing: -0.03em; }
        .goal-sep { font-size: 14px; color: var(--muted); }
        .goal-target { font-size: 16px; font-weight: 600; color: var(--fg-2); letter-spacing: -0.02em; }
        .goal-pct { font-size: 12px; color: var(--success); font-weight: 600; background: var(--success-bg); padding: 2px 8px; border-radius: 99px; }
        .goal-bar-wrap { height: 14px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--border); overflow: hidden; margin-bottom: 10px; }
        .goal-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--brand) 0%, var(--success) 100%); transition: width 1.2s cubic-bezier(0, 0, 0.2, 1); position: relative; }
        .goal-bar-fill::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 20px; background: oklch(100% 0 0 / 0.25); border-radius: 99px; }
        .goal-milestones { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
        .goal-milestone { font-size: 11px; color: var(--muted); padding: 3px 8px; border-radius: 99px; border: 1px solid var(--border); background: var(--surface-2); }
        .goal-milestone.reached { color: var(--success); background: var(--success-bg); border-color: oklch(88% 0.06 145); }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; align-items: start; }
        .form-card { padding: 24px; }

        .card-title { font-size: 15px; font-weight: 700; color: var(--fg); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .card-title-icon { width: 28px; height: 28px; background: var(--brand-light); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .card-desc { font-size: 12px; color: var(--muted); margin-bottom: 20px; }

        .quick-amounts { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .quick-btn {
          padding: 7px 14px; border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1.5px solid var(--border); background: var(--surface-2); color: var(--fg-2);
          transition: all 150ms; flex: 1; min-width: 60px; text-align: center;
        }
        .quick-btn:hover { border-color: var(--brand); background: var(--brand-light); color: var(--brand); }
        .quick-btn.active { border-color: var(--brand); background: var(--brand-light); color: var(--brand); }

        .payment-methods { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
        .pay-btn {
          padding: 8px 4px; border-radius: var(--r-sm); font-family: var(--font); font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid var(--border); background: var(--surface-2); color: var(--fg-2);
          transition: all 150ms; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .pay-btn:hover { border-color: var(--brand); background: var(--brand-light); color: var(--brand); }
        .pay-btn.active { border-color: var(--brand); background: var(--brand-light); color: var(--brand); box-shadow: 0 0 0 2px oklch(50% 0.26 354 / 0.20); }
        .pay-btn .pay-icon { font-size: 18px; }
        .pay-btn.bkash.active { border-color: oklch(55% 0.27 354); background: oklch(97% 0.04 354); }

        .form-note { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; background: var(--info-bg); border: 1px solid oklch(88% 0.06 240); border-radius: var(--r-sm); font-size: 12px; color: var(--info); margin-top: 14px; line-height: 1.5; }

        .success-state { text-align: center; padding: 32px 20px; animation: popIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
        .success-icon-wrap { width: 72px; height: 72px; border-radius: 50%; background: var(--success-bg); border: 3px solid var(--success); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards; }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
        .success-title { font-size: 18px; font-weight: 700; color: var(--fg); margin-bottom: 6px; }
        .success-sub { font-size: 13px; color: var(--muted); margin-bottom: 20px; }

        .khats-card { padding: 24px; }
        .khat-item { display: flex; align-items: center; gap: 12px; padding: 14px; border: 1.5px solid var(--border); border-radius: var(--r); cursor: pointer; transition: all 150ms; margin-bottom: 10px; }
        .khat-item:last-child { margin-bottom: 0; }
        .khat-item:hover { border-color: var(--brand); background: var(--brand-light); }
        .khat-item.selected { border-color: var(--brand); background: var(--brand-light); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .khat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .khat-dot.pink  { background: var(--brand); }
        .khat-dot.green { background: var(--success); }
        .khat-dot.gold  { background: var(--accent); }
        .khat-dot.blue  { background: var(--info); }
        .khat-info { flex: 1; min-width: 0; }
        .khat-name { font-size: 13.5px; font-weight: 700; color: var(--fg); }
        .khat-desc { font-size: 11.5px; color: var(--muted); margin-top: 1px; }
        .khat-meta { text-align: right; flex-shrink: 0; }
        .khat-balance { font-size: 14px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; }
        .khat-freq    { font-size: 11px; color: var(--muted); margin-top: 1px; }
        .khat-quick-deposit { margin-top: 6px; }

        .table-card { overflow: hidden; }
        .filter-bar { display: flex; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; align-items: center; }
        .filter-bar .select { width: auto; flex: 1; min-width: 120px; font-size: 13px; padding: 8px 32px 8px 12px; }
        .filter-bar .input  { flex: 1.5; min-width: 160px; font-size: 13px; padding: 8px 12px; }
        .table-wrap { overflow-x: auto; }

        table { width: 100%; border-collapse: collapse; }
        thead th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; background: var(--surface-2); border-bottom: 1px solid var(--border); white-space: nowrap; }
        tbody tr { border-bottom: 1px solid var(--border); transition: background 150ms; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: oklch(98% 0.005 354); }
        tbody td { padding: 13px 16px; font-size: 13px; color: var(--fg); vertical-align: middle; white-space: nowrap; }
        td.amount { font-weight: 700; color: var(--brand); letter-spacing: -0.01em; }
        td.date   { color: var(--fg-2); font-size: 12.5px; }
        td.recorder { color: var(--muted); font-size: 12px; }

        .khat-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 600; }
        .khat-pill.monthly  { background: var(--brand-light); color: var(--brand); }
        .khat-pill.special  { background: oklch(95% 0.06 290); color: oklch(50% 0.18 290); }
        .khat-pill.zakat    { background: var(--accent-light); color: oklch(55% 0.17 55); }
        .khat-pill.edu      { background: var(--info-bg); color: var(--info); }

        .table-empty { text-align: center; padding: 40px 20px; }
        .table-empty-icon { font-size: 36px; margin-bottom: 8px; }
        .table-empty-text { font-size: 14px; color: var(--muted); }

        .transfer-card { overflow: hidden; margin-bottom: 28px; }
        .transfer-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; user-select: none; transition: background 150ms; }
        .transfer-header:hover { background: var(--surface-2); }
        .transfer-header-left { display: flex; align-items: center; gap: 10px; }
        .transfer-icon { width: 36px; height: 36px; background: oklch(95% 0.06 290); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .transfer-title { font-size: 14px; font-weight: 700; color: var(--fg); }
        .transfer-desc  { font-size: 12px; color: var(--muted); margin-top: 1px; }
        .transfer-toggle { width: 32px; height: 32px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--muted); transition: transform 250ms cubic-bezier(0, 0, 0.2, 1), background 150ms; flex-shrink: 0; }
        .transfer-body { max-height: 0; overflow: hidden; transition: max-height 250ms cubic-bezier(0, 0, 0.2, 1); }
        .transfer-body.open { max-height: 400px; }
        .transfer-toggle.open { transform: rotate(180deg); background: var(--brand-light); color: var(--brand); border-color: var(--brand-light); }
        .transfer-inner { padding: 0 20px 20px; border-top: 1px solid var(--border); }
        .transfer-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: end; margin-bottom: 16px; padding-top: 16px; }
        .transfer-arrow { width: 36px; height: 36px; background: var(--brand-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--brand); flex-shrink: 0; margin-bottom: 2px; }

        .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { min-width: 280px; max-width: 360px; padding: 14px 18px; border-radius: var(--r); display: flex; align-items: flex-start; gap: 10px; pointer-events: all; animation: toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; box-shadow: 0 8px 30px oklch(0% 0 0 / 0.18); position: relative; overflow: hidden; }
        @keyframes toastIn { 0% { transform: translateX(110%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        .toast-success { background: oklch(32% 0.08 145); color: #fff; }
        .toast-error   { background: oklch(35% 0.12 25); color: #fff; }
        .toast-info    { background: oklch(28% 0.08 240); color: #fff; }
        .toast-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .toast-body { flex: 1; }
        .toast-title { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; }
        .toast-msg   { font-size: 12.5px; opacity: 0.85; line-height: 1.4; }
        .toast-bar { position: absolute; bottom: 0; left: 0; height: 3px; background: oklch(100% 0 0 / 0.35); border-radius: 0 0 var(--r) var(--r); animation: toastBar 4s linear forwards; }
        @keyframes toastBar { from { width: 100%; } to { width: 0%; } }

        .divider { height: 1px; background: var(--border); margin: 16px 0; }

        @media (max-width: 1100px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .page-content { padding: 20px 16px 100px; }
          .hero-title { font-size: 22px; } .hero-total-amount { font-size: 28px; }
          .hero-right { display: none; }
          .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .sc-value { font-size: 18px; }
          .filter-bar { padding: 12px 14px; gap: 8px; }
          .filter-bar .select { min-width: 90px; }
        }
        @media (max-width: 480px) {
          .summary-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .sc-value { font-size: 16px; } .sc-label { font-size: 10.5px; }
          .transfer-row { grid-template-columns: 1fr; }
          .transfer-arrow { transform: rotate(90deg); margin: 0 auto; }
          .payment-methods { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* HERO BANNER */}
      <div className="hero-banner">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="hero-title">আমার সঞ্চয়</div>
            <div className="hero-subtitle">পদ্ধতিগত সঞ্চয় করুন — আপনার ভবিষ্যৎ সুরক্ষিত করুন</div>
          </div>
          <div className="hero-right">
            <div className="hero-total-label">মোট সঞ্চয়</div>
            <div className="hero-total-amount">৳১২,৫০০</div>
            <div className="hero-badge">🏦 সক্রিয় সদস্য</div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="summary-card brand">
          <div className="sc-icon">🏦</div>
          <div className="sc-label">মোট সঞ্চয়</div>
          <div className="sc-value">৳১২,৫০০</div>
          <div className="sc-sub">৩টি খাতে সংরক্ষিত</div>
        </div>
        <div className="summary-card success">
          <div className="sc-icon">📈</div>
          <div className="sc-label">এই মাসে</div>
          <div className="sc-value">৳১,০০০</div>
          <div className="sc-sub" style={{ color: 'var(--success)', opacity: 1 }}>জুন ২০২৬</div>
        </div>
        <div className="summary-card info">
          <div className="sc-icon">🎯</div>
          <div className="sc-label">মাসিক লক্ষ্য</div>
          <div className="sc-value">৳১,৫০০</div>
          <div className="sc-progress">
            <div className="sc-progress-bar" style={{ width: summaryBarWidth }}></div>
          </div>
          <div className="sc-sub" style={{ color: 'var(--info)', opacity: 1, marginTop: '6px' }}>৬৭% পূর্ণ হয়েছে</div>
        </div>
        <div className="summary-card warning">
          <div className="sc-icon">📅</div>
          <div className="sc-label">পরবর্তী কিস্তি</div>
          <div className="sc-value" style={{ fontSize: '17px', letterSpacing: '-0.01em' }}>১ জুলাই ২০২৬</div>
          <div className="sc-sub" style={{ color: 'var(--warning)', opacity: 1 }}>১৬ দিন বাকি</div>
        </div>
      </div>

      {/* GOAL PROGRESS */}
      <section className="section">
        <div className="goal-card">
          <div className="goal-header">
            <div className="goal-title-group">
              <div className="goal-icon">🎯</div>
              <div>
                <div className="goal-title">মাসিক সঞ্চয় লক্ষ্য — জুন ২০২৬</div>
                <div className="goal-subtitle">মাসিক লক্ষ্যমাত্রার বিপরীতে আপনার অগ্রগতি</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="goal-amounts">
                <span className="goal-current">৳১,০০০</span>
                <span className="goal-sep">/</span>
                <span className="goal-target">৳১,৫০০</span>
              </div>
              <span className="goal-pct">৬৭%</span>
            </div>
          </div>
          <div className="goal-bar-wrap">
            <div className="goal-bar-fill" style={{ width: goalBarWidth }}></div>
          </div>
          <div className="goal-milestones">
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginRight: '4px' }}>মাইলস্টোন:</span>
            <span className="goal-milestone reached">২৫% ✓</span>
            <span className="goal-milestone reached">৫০% ✓</span>
            <span className="goal-milestone reached">৬৭% ✓</span>
            <span className="goal-milestone">৭৫%</span>
            <span className="goal-milestone">১০০%</span>
          </div>
        </div>
      </section>

      {/* 2-COL: FORM + KHATS */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">সঞ্চয় জমা করুন</div>
            <div className="section-subtitle">নিচে আপনার পছন্দের খাতে সঞ্চয় অনুরোধ পাঠান</div>
          </div>
        </div>

        <div className="two-col">
          {/* DEPOSIT FORM */}
          <div className="glass-card form-card">
            {depositFormVisible && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div className="card-title-icon">💰</div>
                  <div>
                    <div className="card-title">সঞ্চয় অনুরোধ</div>
                    <div className="card-desc" style={{ marginBottom: 0 }}>নতুন সঞ্চয় জমার অনুরোধ পাঠান</div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="khatSelect">খাত বেছে নিন</label>
                  <select className="select" id="khatSelect" value={selectedKhat} onChange={e => selectKhat(e.target.value)}>
                    <option value="monthly">মাসিক সঞ্চয়</option>
                    <option value="special">বিশেষ সঞ্চয়</option>
                    <option value="zakat">যাকাত সঞ্চয়</option>
                    <option value="edu">শিক্ষা তহবিল</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="depositAmount">পরিমাণ (৳)</label>
                  <input type="number" className="input" id="depositAmount" placeholder="০.০০" min={50} step={50} value={depositAmount} onChange={e => handleDepositAmountChange(e.target.value)} />
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label>দ্রুত পরিমাণ</label>
                  <div className="quick-amounts">
                    {([500, 1000, 2000, 5000] as number[]).map(amt => (
                      <button key={amt} className={`quick-btn${activeQuickBtn === amt ? ' active' : ''}`} onClick={() => setQuickAmount(amt)}>
                        ৳{amt === 500 ? '৫০০' : amt === 1000 ? '১,০০০' : amt === 2000 ? '২,০০০' : '৫,০০০'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>পেমেন্ট পদ্ধতি</label>
                  <div className="payment-methods">
                    {[
                      { id: 'bkash', icon: '📱', label: 'bKash', extra: 'bkash' },
                      { id: 'nagad', icon: '💳', label: 'নগদ', extra: '' },
                      { id: 'rocket', icon: '🚀', label: 'রকেট', extra: '' },
                      { id: 'bank', icon: '🏛️', label: 'ব্যাংক', extra: '' },
                    ].map(pm => (
                      <button key={pm.id} className={`pay-btn${pm.extra ? ` ${pm.extra}` : ''}${selectedPayment === pm.id ? ' active' : ''}`} onClick={() => setSelectedPayment(pm.id)}>
                        <span className="pay-icon">{pm.icon}</span>
                        <span>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '4px' }}>
                  <label htmlFor="depositNote">নোট (ঐচ্ছিক)</label>
                  <textarea className="textarea" id="depositNote" placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..." value={depositNote} onChange={e => setDepositNote(e.target.value)} />
                </div>

                <div className="form-note">
                  <span>ℹ️</span>
                  <span>সঞ্চয় অনুমোদনের পর আপনার একাউন্টে যোগ হবে। সাধারণত ২৪ ঘণ্টার মধ্যে প্রক্রিয়া সম্পন্ন হয়।</span>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary btn-full" onClick={submitDeposit} disabled={submitLoading}>
                    {submitLoading ? 'পাঠানো হচ্ছে...' : 'সঞ্চয় অনুরোধ পাঠান →'}
                  </button>
                </div>
              </div>
            )}

            {depositSuccessVisible && (
              <div className="success-state">
                <div className="success-icon-wrap">✓</div>
                <div className="success-title">অনুরোধ পাঠানো হয়েছে!</div>
                <div className="success-sub">আপনার সঞ্চয় অনুরোধ সফলভাবে পাঠানো হয়েছে। অনুমোদনের পর একাউন্টে যোগ হবে।</div>
                <button className="btn btn-ghost" onClick={resetDepositForm}>আরেকটি অনুরোধ করুন</button>
              </div>
            )}
          </div>

          {/* SAVINGS KHATS */}
          <div className="card khats-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div className="card-title-icon" style={{ background: 'oklch(95% 0.06 145)' }}>📂</div>
              <div>
                <div className="card-title">সক্রিয় খাতসমূহ</div>
                <div className="card-desc" style={{ marginBottom: 0 }}>একটি খাতে ক্লিক করলে ফর্মে স্বয়ংক্রিয়ভাবে নির্বাচিত হবে</div>
              </div>
            </div>

            {[
              { id: 'monthly', dot: 'pink', name: 'মাসিক সঞ্চয়', desc: 'প্রতি মাসে ৳১,০০০ — নিয়মিত সঞ্চয়', balance: '৳১২,০০০', freq: 'মাসিক', showQuick: true },
              { id: 'special', dot: 'green', name: 'বিশেষ সঞ্চয়', desc: 'পরিবর্তনযোগ্য পরিমাণ — যেকোনো সময়', balance: '৳৫০০', freq: 'নমনীয়', showQuick: false },
              { id: 'zakat', dot: 'gold', name: 'যাকাত সঞ্চয়', desc: 'বার্ষিক উদ্দেশ্যে — ইসলামিক বিধান অনুযায়ী', balance: '৳০', freq: 'বার্ষিক', showQuick: false },
            ].map(khat => (
              <div key={khat.id} className={`khat-item${selectedKhat === khat.id ? ' selected' : ''}`} onClick={() => selectKhat(khat.id)}>
                <div className={`khat-dot ${khat.dot}`}></div>
                <div className="khat-info">
                  <div className="khat-name">{khat.name}</div>
                  <div className="khat-desc">{khat.desc}</div>
                </div>
                <div className="khat-meta">
                  <div className="khat-balance">{khat.balance}</div>
                  <div className="khat-freq">{khat.freq}</div>
                  {khat.showQuick && (
                    <div className="khat-quick-deposit">
                      <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); setQuickAmountAndKhat(500, 'monthly'); }} title="দ্রুত ৳৫০০ জমা">
                        + ৳৫০০
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>মোট সক্রিয় খাত</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)' }}>৩টি খাত</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>সর্বমোট ব্যালেন্স</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.02em' }}>৳১২,৫০০</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUND TRANSFER */}
      <section className="section">
        <div className="card transfer-card">
          <div className="transfer-header" onClick={() => setTransferOpen(o => !o)} role="button" aria-expanded={transferOpen}>
            <div className="transfer-header-left">
              <div className="transfer-icon">🔄</div>
              <div>
                <div className="transfer-title">খাতের মধ্যে ট্রান্সফার</div>
                <div className="transfer-desc">এক খাত থেকে অন্য খাতে ট্রান্সফার করুন</div>
              </div>
            </div>
            <div className={`transfer-toggle${transferOpen ? ' open' : ''}`}>▼</div>
          </div>

          <div className={`transfer-body${transferOpen ? ' open' : ''}`}>
            <div className="transfer-inner">
              <div className="transfer-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="transferFrom">থেকে (From)</label>
                  <select className="select" id="transferFrom" value={transferFrom} onChange={e => setTransferFrom(e.target.value)}>
                    <option value="monthly">মাসিক সঞ্চয় — ৳১২,০০০</option>
                    <option value="special">বিশেষ সঞ্চয় — ৳৫০০</option>
                    <option value="zakat">যাকাত সঞ্চয় — ৳০</option>
                  </select>
                </div>
                <div className="transfer-arrow">→</div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="transferTo">তে (To)</label>
                  <select className="select" id="transferTo" value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                    <option value="special">বিশেষ সঞ্চয় — ৳৫০০</option>
                    <option value="zakat">যাকাত সঞ্চয় — ৳০</option>
                    <option value="monthly">মাসিক সঞ্চয় — ৳১২,০০০</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="transferAmount">ট্রান্সফার পরিমাণ (৳)</label>
                <input type="number" className="input" id="transferAmount" placeholder="০.০০" min={10} step={10} value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setTransferOpen(false)}>বাতিল</button>
                <button className="btn btn-primary btn-sm" onClick={submitTransfer}>ট্রান্সফার নিশ্চিত করুন →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAVINGS HISTORY TABLE */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">সঞ্চয়ের ইতিহাস</div>
            <div className="section-subtitle">আপনার সকল সঞ্চয় লেনদেনের রেকর্ড</div>
          </div>
          <span className="badge badge-muted">{bnDigits(filteredRows.length)}টি রেকর্ড</span>
        </div>

        <div className="card table-card">
          <div className="filter-bar">
            <select className="select" value={filterKhat} onChange={e => setFilterKhat(e.target.value)}>
              <option value="">সকল খাত</option>
              <option value="monthly">মাসিক সঞ্চয়</option>
              <option value="special">বিশেষ সঞ্চয়</option>
              <option value="zakat">যাকাত সঞ্চয়</option>
              <option value="edu">শিক্ষা তহবিল</option>
            </select>
            <select className="select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="">সকল মাস</option>
              <option value="jun">জুন ২০২৬</option>
              <option value="may">মে ২০২৬</option>
              <option value="apr">এপ্রিল ২০২৬</option>
              <option value="mar">মার্চ ২০২৬</option>
            </select>
            <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">সকল স্ট্যাটাস</option>
              <option value="approved">অনুমোদিত</option>
              <option value="pending">অপেক্ষমান</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
            </select>
            <input type="text" className="input" placeholder="🔍 সার্চ করুন..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>খাত</th>
                  <th>পরিমাণ</th>
                  <th>স্ট্যাটাস</th>
                  <th>রেকর্ডকারী</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <tr key={i}>
                    <td className="date">{row.date}</td>
                    <td><span className={`khat-pill ${row.khatCls}`}>{row.khatLabel}</span></td>
                    <td className="amount">{row.amount}</td>
                    <td><span className={`badge ${row.statusBadge}`}>{row.statusLabel}</span></td>
                    <td className="recorder">{row.recorder}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRows.length === 0 && (
              <div className="table-empty">
                <div className="table-empty-icon">🔍</div>
                <div className="table-empty-text">কোনো ফলাফল পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TOAST CONTAINER */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-msg">{t.message}</div>}
            </div>
            <div className="toast-bar"></div>
          </div>
        ))}
      </div>
    </>
  );
}
