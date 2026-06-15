'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [currentFilter, setCurrentFilter] = useState('সব');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKhaat, setModalKhaat] = useState({ name: '', icon: '', type: '', redirect: '' });
  const [modalAmount, setModalAmount] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const showToast = (msg: string, type = '') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3400);
  };

  const toggleDetail = (id: string) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openModal = (name: string, icon: string, type: string, redirect: string) => {
    setModalKhaat({ name, icon, type, redirect });
    setModalAmount('');
    setModalNote('');
    setModalSuccess(false);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submitModal = () => {
    const amount = parseFloat(modalAmount);
    if (!amount || amount < 1) {
      showToast('⚠️ সঠিক পরিমাণ লিখুন', 'warning');
      return;
    }
    setSuccessText(`"${modalKhaat.name}" খাতে ৳${amount.toLocaleString('bn-BD')} সফলভাবে রেকর্ড করা হয়েছে।`);
    setModalSuccess(true);
    setTimeout(() => {
      closeModal();
      showToast(`✅ ৳${amount.toLocaleString('bn-BD')} "${modalKhaat.name}" খাতে জমা হয়েছে`, 'success');
    }, 1800);
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { 'দান': '💝 দান খাত', 'সঞ্চয়': '🏦 সঞ্চয় খাত', 'ঋণ': '💸 ঋণ খাত' };
    return map[type] || type;
  };
  const actionLabel = (type: string) => {
    if (type === 'সঞ্চয়') return 'এই খাতে সঞ্চয় করুন';
    if (type === 'ঋণ') return 'ঋণ অনুরোধ করুন';
    return 'এই খাতে দান করুন';
  };
  const getModalSubmitStyle = () => {
    if (modalKhaat.type === 'সঞ্চয়') return { background: 'var(--success)', boxShadow: '0 2px 8px oklch(44% 0.14 145 / 0.35)' };
    if (modalKhaat.type === 'ঋণ') return { background: 'var(--info)', boxShadow: '0 2px 8px oklch(55% 0.15 240 / 0.35)' };
    return {};
  };

  const isHidden = (type: string) => currentFilter !== 'সব' && currentFilter !== type;

  const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
    <span style={{ display: 'inline-block', transform: rotated ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M2 4.5L6.5 9 11 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

  const CommentIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M12 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2v2l3-2h5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .page-header {
          background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 60%, oklch(38% 0.22 354) 100%);
          border-radius: var(--r-lg);
          padding: 26px 32px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--sh-lg);
        }
        .page-header::before { content: ''; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; border-radius: 50%; background: oklch(100% 0 0 / 0.06); pointer-events: none; }
        .page-header::after { content: ''; position: absolute; bottom: -40px; left: 40%; width: 160px; height: 160px; border-radius: 50%; background: oklch(100% 0 0 / 0.04); pointer-events: none; }
        .page-header-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 16px; }
        .page-header-icon { width: 52px; height: 52px; border-radius: 14px; background: oklch(100% 0 0 / 0.15); border: 1.5px solid oklch(100% 0 0 / 0.22); font-size: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .page-header-text { flex: 1; }
        .page-header-title { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.025em; line-height: 1.2; }
        .page-header-sub { font-size: 13px; color: oklch(100% 0 0 / 0.68); margin-top: 4px; }
        .page-header-stats { display: flex; gap: 20px; flex-shrink: 0; }
        .page-header-stat { text-align: right; }
        .page-header-stat-val { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; line-height: 1; }
        .page-header-stat-lbl { font-size: 11px; color: oklch(100% 0 0 / 0.55); margin-top: 3px; }
        .page-header-divider { width: 1px; background: oklch(100% 0 0 / 0.18); align-self: stretch; }

        .filter-bar-cats { position: sticky; top: var(--topbar-h); z-index: 90; background: oklch(100% 0 0 / 0.80); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); padding: 12px 28px; margin-bottom: 24px; margin-left: -28px; margin-right: -28px; }
        .filter-tabs { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .filter-tabs::-webkit-scrollbar { display: none; }
        .filter-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 99px; font-family: var(--font); font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); color: var(--fg-2); white-space: nowrap; transition: all var(--dur-fast) var(--ease-out); flex-shrink: 0; }
        .filter-tab:hover { border-color: oklch(80% 0.12 354); color: var(--brand); background: var(--brand-light); }
        .filter-tab.active { background: var(--brand); border-color: var(--brand); color: #fff; box-shadow: 0 2px 10px oklch(50% 0.26 354 / 0.35); }
        .filter-tab .tab-count { background: oklch(100% 0 0 / 0.22); border-radius: 99px; padding: 1px 7px; font-size: 11px; font-weight: 700; }
        .filter-tab:not(.active) .tab-count { background: var(--surface-2); color: var(--muted); }

        .khaat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .khaat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--sh-sm); overflow: hidden; transition: box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast); display: flex; flex-direction: column; }
        .khaat-card:hover { box-shadow: var(--sh); transform: translateY(-2px); border-color: oklch(85% 0.04 354); }
        .khaat-card.hidden { display: none; }
        .khaat-card.type-dan { border-top: 3px solid var(--brand); }
        .khaat-card.type-shonchoy { border-top: 3px solid var(--success); }
        .khaat-card.type-rin { border-top: 3px solid var(--info); }
        .khaat-card.type-songothon { border-top: 3px solid var(--accent); }
        .khaat-card-main { padding: 20px 20px 0; flex: 1; }
        .khaat-card-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
        .khaat-icon-wrap { width: 50px; height: 50px; border-radius: var(--r); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .type-dan .khaat-icon-wrap { background: var(--brand-light); }
        .type-shonchoy .khaat-icon-wrap { background: var(--success-bg); }
        .type-rin .khaat-icon-wrap { background: var(--info-bg); }
        .type-songothon .khaat-icon-wrap { background: var(--accent-light); }
        .khaat-card-title-block { flex: 1; min-width: 0; }
        .khaat-card-name { font-size: 16px; font-weight: 800; color: var(--fg); letter-spacing: -0.015em; line-height: 1.2; margin-bottom: 6px; }
        .khaat-badges { display: flex; flex-wrap: wrap; gap: 6px; }
        .khaat-type-badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: 0.01em; }
        .type-dan .khaat-type-badge { background: var(--brand-light); color: var(--brand); }
        .type-shonchoy .khaat-type-badge { background: var(--success-bg); color: var(--success); }
        .type-rin .khaat-type-badge { background: var(--info-bg); color: var(--info); }
        .type-songothon .khaat-type-badge { background: var(--accent-light); color: oklch(52% 0.16 55); }
        .khaat-freq-badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }
        .khaat-desc { font-size: 13px; color: var(--fg-2); line-height: 1.65; margin-bottom: 14px; }
        .khaat-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .khaat-amount-chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: var(--r-sm); font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .khaat-amount-fixed { background: oklch(95% 0.04 354); color: var(--brand-mid); border: 1px solid oklch(90% 0.06 354); }
        .khaat-amount-var { background: var(--surface-2); color: var(--fg-2); border: 1px solid var(--border); }
        .khaat-amount-sudomukt { background: var(--success-bg); color: var(--success); border: 1px solid oklch(88% 0.07 145); }
        .khaat-progress-wrap { margin-bottom: 14px; }
        .khaat-progress-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
        .khaat-progress-label { font-size: 11.5px; color: var(--muted); font-weight: 500; }
        .khaat-progress-frac { font-size: 12px; font-weight: 700; color: var(--fg-2); font-variant-numeric: tabular-nums; }
        .khaat-progress-frac em { color: var(--brand); font-style: normal; }
        .progress-bar-bg { height: 7px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .type-dan .progress-bar-fill { background: linear-gradient(90deg, var(--brand), var(--brand-mid)); }
        .type-shonchoy .progress-bar-fill { background: linear-gradient(90deg, var(--success), oklch(52% 0.16 148)); }
        .type-rin .progress-bar-fill { background: linear-gradient(90deg, var(--info), oklch(62% 0.16 240)); }
        .khaat-contrib { display: inline-flex; align-items: center; gap: 6px; background: oklch(97% 0.03 354); border: 1px solid oklch(91% 0.06 354); border-radius: var(--r-sm); padding: 7px 12px; margin-bottom: 16px; font-size: 12px; }
        .khaat-contrib-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand); flex-shrink: 0; }
        .khaat-contrib-label { color: var(--muted); font-weight: 500; }
        .khaat-contrib-amount { font-weight: 800; color: var(--brand); font-variant-numeric: tabular-nums; }
        .khaat-contrib.contrib-savings { background: oklch(96% 0.04 145); border-color: oklch(90% 0.06 145); }
        .khaat-contrib.contrib-savings .khaat-contrib-dot { background: var(--success); }
        .khaat-contrib.contrib-savings .khaat-contrib-amount { color: var(--success); }
        .khaat-contrib.contrib-loan { background: oklch(95% 0.04 240); border-color: oklch(90% 0.06 240); }
        .khaat-contrib.contrib-loan .khaat-contrib-dot { background: var(--info); }
        .khaat-contrib.contrib-loan .khaat-contrib-amount { color: var(--info); }
        .khaat-card-actions { display: flex; gap: 8px; padding: 14px 20px 18px; border-top: 1px solid var(--border); background: var(--surface-2); margin-top: auto; }
        .khaat-detail-wrap { overflow: hidden; max-height: 0; transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease; opacity: 0; padding: 0 20px; }
        .khaat-detail-wrap.open { max-height: 600px; opacity: 1; padding: 0 20px 18px; }
        .khaat-detail-inner { border-top: 1px dashed var(--border); padding-top: 16px; }
        .khaat-detail-section { margin-bottom: 14px; }
        .khaat-detail-heading { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .khaat-detail-text { font-size: 13px; color: var(--fg-2); line-height: 1.7; }
        .khaat-detail-list { list-style: none; display: flex; flex-direction: column; gap: 5px; }
        .khaat-detail-list li { font-size: 12.5px; color: var(--fg-2); display: flex; gap: 8px; align-items: flex-start; }
        .khaat-detail-list li::before { content: '◆'; font-size: 7px; color: var(--brand); margin-top: 5px; flex-shrink: 0; }
        .khaat-comment-link { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--brand); text-decoration: none; padding: 5px 0; border-radius: 4px; transition: opacity var(--dur-fast); }
        .khaat-comment-link:hover { opacity: 0.75; }
        .btn-expand-active { background: var(--brand-light) !important; color: var(--brand) !important; border-color: oklch(88% 0.08 354) !important; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 16px; border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all var(--dur-fast) var(--ease-out); text-decoration: none; white-space: nowrap; line-height: 1; }
        .btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--brand); color: #fff; box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.35); flex: 1; }
        .btn-primary:hover { background: var(--brand-mid); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); }
        .btn-ghost { background: transparent; color: var(--fg-2); border: 1.5px solid var(--border); }
        .btn-ghost:hover { background: var(--brand-light); color: var(--brand); border-color: oklch(88% 0.08 354); }
        .btn-sm { padding: 7px 14px; font-size: 12.5px; }
        .badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: 0.01em; }
        .badge-gold { background: var(--accent-light); color: oklch(45% 0.16 55); }

        .modal-backdrop { position: fixed; inset: 0; background: oklch(0% 0 0 / 0.50); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 400; display: flex; align-items: flex-end; justify-content: center; opacity: 0; pointer-events: none; transition: opacity var(--dur-normal) var(--ease-out); }
        .modal-backdrop.open { opacity: 1; pointer-events: all; }
        .modal-sheet { background: var(--surface); border-radius: var(--r-lg) var(--r-lg) 0 0; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.34, 1.1, 0.64, 1); padding-bottom: env(safe-area-inset-bottom, 16px); }
        .modal-backdrop.open .modal-sheet { transform: translateY(0); }
        .modal-handle { width: 36px; height: 4px; background: var(--border); border-radius: 99px; margin: 12px auto 0; }
        .modal-header { padding: 16px 20px 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .modal-title { font-size: 16px; font-weight: 700; color: var(--fg); }
        .modal-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--surface-2); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--fg-2); transition: all var(--dur-fast); }
        .modal-close:hover { background: var(--danger-bg); color: var(--danger); }
        .modal-body { padding: 20px; }
        .modal-khaat-preview { display: flex; align-items: center; gap: 12px; background: var(--brand-light); border: 1px solid oklch(90% 0.08 354); border-radius: var(--r); padding: 12px 16px; margin-bottom: 20px; }
        .modal-khaat-icon { font-size: 24px; }
        .modal-khaat-name { font-size: 15px; font-weight: 700; color: var(--fg); }
        .modal-khaat-type { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 11.5px; font-weight: 700; color: var(--fg-2); margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.04em; }
        .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--fg); background: var(--surface); outline: none; transition: border-color var(--dur-fast), box-shadow var(--dur-fast); appearance: none; }
        .form-input:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .form-hint { font-size: 11.5px; color: var(--muted); margin-top: 5px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .modal-actions .btn { flex: 1; padding: 12px; font-size: 14px; }
        .modal-success { display: none; text-align: center; padding: 32px 20px; flex-direction: column; align-items: center; gap: 12px; }
        .modal-success.show { display: flex; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--success-bg); color: var(--success); font-size: 28px; display: flex; align-items: center; justify-content: center; animation: successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes successPop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .success-title { font-size: 16px; font-weight: 700; color: var(--success); }
        .success-text { font-size: 13px; color: var(--muted); line-height: 1.6; max-width: 280px; }

        .toast-container { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 600; display: flex; flex-direction: column; gap: 8px; pointer-events: none; width: 90%; max-width: 380px; }
        .toast { background: var(--fg); color: #fff; padding: 12px 16px; border-radius: var(--r); font-size: 13px; font-weight: 500; box-shadow: var(--sh-lg); display: flex; align-items: center; gap: 10px; animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; pointer-events: all; }
        .toast.success { background: var(--success); }
        .toast.warning { background: var(--warning); }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-14px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cardAppear { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 919px) {
          .page-header-stats { display: none; }
          .filter-bar-cats { margin-left: -16px; margin-right: -16px; padding-left: 16px; padding-right: 16px; }
          .khaat-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 599px) {
          .page-header { padding: 20px; }
          .page-header-title { font-size: 20px; }
          .page-header-icon { width: 44px; height: 44px; font-size: 20px; }
          .filter-bar-cats { margin-left: -12px; margin-right: -12px; padding-left: 12px; padding-right: 12px; }
        }
      `}</style>

      {/* Toast Container */}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast${t.type ? ' ' + t.type : ''}`}>{t.msg}</div>
        ))}
      </div>

      {/* PAGE HEADER */}
      <div className="page-header" role="region" aria-label="পৃষ্ঠা শিরোনাম">
        <div className="page-header-inner">
          <div className="page-header-icon" aria-hidden="true">📂</div>
          <div className="page-header-text">
            <h1 className="page-header-title">খাতসমূহ</h1>
            <p className="page-header-sub">সকল সক্রিয় খাতের তথ্য ও আপনার অবদান</p>
          </div>
          <div className="page-header-stats">
            <div className="page-header-stat">
              <div className="page-header-stat-val">৮</div>
              <div className="page-header-stat-lbl">মোট সক্রিয় খাত</div>
            </div>
            <div className="page-header-divider" aria-hidden="true"></div>
            <div className="page-header-stat">
              <div className="page-header-stat-val">৪টি</div>
              <div className="page-header-stat-lbl">আমার সক্রিয় অবদান</div>
            </div>
            <div className="page-header-divider" aria-hidden="true"></div>
            <div className="page-header-stat">
              <div className="page-header-stat-val">৳২,৯৫০</div>
              <div className="page-header-stat-lbl">মোট দানের পরিমাণ</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="filter-bar-cats" role="region" aria-label="খাত ফিল্টার">
        <div className="filter-tabs" role="tablist">
          {[
            { key: 'সব', label: 'সব', count: '৮' },
            { key: 'দান', label: '💝 দান', count: '৪' },
            { key: 'সঞ্চয়', label: '🏦 সঞ্চয়', count: '২' },
            { key: 'ঋণ', label: '💸 ঋণ', count: '১' },
            { key: 'সংগঠন', label: '🏢 সংগঠন', count: '১' },
          ].map(tab => (
            <button key={tab.key} className={`filter-tab${currentFilter === tab.key ? ' active' : ''}`} role="tab" aria-selected={currentFilter === tab.key} onClick={() => setCurrentFilter(tab.key)}>
              {tab.label} <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CARDS GRID */}
      <section className="khaat-grid" aria-label="খাতসমূহের তালিকা">

        {/* 1. যাকাত ফান্ড */}
        <article className={`khaat-card type-dan${isHidden('দান') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">🕌</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">যাকাত ফান্ড</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">💝 দান</span>
                  <span className="khaat-freq-badge">🗓 বার্ষিক</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">ইসলামী নিসাব অনুযায়ী বার্ষিক যাকাত পরিশোধ করুন। এই খাতে সংগৃহীত অর্থ সমাজের দরিদ্র ও অসহায় মানুষের মাঝে বিতরণ করা হয়। যাকাত ইসলামের পাঁচটি স্তম্ভের একটি।</p>
            <div className="khaat-meta"><span className="khaat-amount-chip khaat-amount-var">⚖ পরিবর্তনযোগ্য পরিমাণ</span></div>
            <div className="khaat-progress-wrap">
              <div className="khaat-progress-top">
                <span className="khaat-progress-label">এ বছরের সংগ্রহ</span>
                <span className="khaat-progress-frac"><em>৳১৮,৫০০</em> / ৳২৫,০০০</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '74%' }}></div></div>
            </div>
            <div className="khaat-contrib" role="status">
              <span className="khaat-contrib-dot"></span>
              <span className="khaat-contrib-label">আমার অবদান (এ বছর):</span>
              <span className="khaat-contrib-amount">৳১,৫০০</span>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['zakat'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">যাকাত ইসলামের ফরজ ইবাদত। নিসাব পরিমাণ সম্পদের মালিক হলে বার্ষিক ২.৫% যাকাত আদায় করা আবশ্যক। এই ফান্ডে দেওয়া যাকাত স্থানীয় ফকির, মিসকিন, ঋণগ্রস্ত ও মুসাফিরদের মধ্যে বিতরণ করা হয়।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>নিসাব পরিমাণ সম্পদের মালিক হওয়া আবশ্যক (৫২.৫ তোলা রুপা বা সমপরিমাণ)</li>
                    <li>হিজরি বছর পূর্ণ হওয়ার পর যাকাত হিসাব করতে হবে</li>
                    <li>অর্গানাইজেশন যাকাতের হিসাব যাচাই করতে সাহায্য করে</li>
                    <li>স্বেচ্ছায় নির্ধারিত পরিমাণের বেশি দিতে পারবেন</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions">
            <button className={`btn btn-ghost btn-sm${expandedDetails['zakat'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('zakat')} aria-expanded={!!expandedDetails['zakat']}>
              <ChevronIcon rotated={!!expandedDetails['zakat']} /> বিস্তারিত
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('যাকাত ফান্ড', '🕌', 'দান', 'donate')}>এই খাতে দান করুন</button>
          </div>
        </article>

        {/* 2. সদকা */}
        <article className={`khaat-card type-dan${isHidden('দান') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">💝</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">সদকা</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">💝 দান</span>
                  <span className="khaat-freq-badge">⚡ এককালীন</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">যেকোনো সময় যেকোনো পরিমাণ সদকা দিন। ছোট বড় সকল সদকাই আল্লাহর কাছে কবুল হয়। জরুরি মানবিক সহায়তায় এই খাতটি দ্রুত সাড়া দেয়।</p>
            <div className="khaat-meta">
              <span className="khaat-amount-chip khaat-amount-var">⚖ পরিবর্তনযোগ্য পরিমাণ</span>
              <span className="khaat-freq-badge">যেকোনো সময়</span>
            </div>
            <div className="khaat-contrib" role="status">
              <span className="khaat-contrib-dot"></span>
              <span className="khaat-contrib-label">আমার অবদান (এ মাসে):</span>
              <span className="khaat-contrib-amount">৳৪০০</span>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['sadaqah'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">সদকা যেকোনো পরিমাণের স্বেচ্ছামূলক দান। এই খাতে আসা অর্থ জরুরি মানবিক সহায়তা, প্রাকৃতিক দুর্যোগে সাহায্য এবং স্থানীয় অভাবীদের তাৎক্ষণিক সহায়তায় ব্যয় হয়।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>নির্ধারিত কোনো ন্যূনতম পরিমাণ নেই</li>
                    <li>যেকোনো সময় দেওয়া যাবে</li>
                    <li>অর্থ ব্যয়ের হিসাব মাসিক রিপোর্টে প্রকাশিত হয়</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions">
            <button className={`btn btn-ghost btn-sm${expandedDetails['sadaqah'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('sadaqah')} aria-expanded={!!expandedDetails['sadaqah']}>
              <ChevronIcon rotated={!!expandedDetails['sadaqah']} /> বিস্তারিত
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('সদকা', '💝', 'দান', 'donate')}>এই খাতে দান করুন</button>
          </div>
        </article>

        {/* 3. এতিম তহবিল */}
        <article className={`khaat-card type-dan${isHidden('দান') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">👨‍👧</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">এতিম তহবিল</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">💝 দান</span>
                  <span className="khaat-freq-badge">📅 মাসিক</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">এতিম শিশুদের খাদ্য, বস্ত্র, আশ্রয় ও শিক্ষা নিশ্চিত করতে মাসিক অবদান রাখুন। নিয়মিত সহায়তায় তাদের ভবিষ্যৎ গড়ে তুলতে সাহায্য করুন।</p>
            <div className="khaat-meta"><span className="khaat-amount-chip khaat-amount-var">⚖ পরিবর্তনযোগ্য পরিমাণ</span></div>
            <div className="khaat-progress-wrap">
              <div className="khaat-progress-top">
                <span className="khaat-progress-label">এ মাসের সংগ্রহ</span>
                <span className="khaat-progress-frac"><em>৳৯,২০০</em> / ৳১৫,০০০</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '61.3%' }}></div></div>
            </div>
            <div className="khaat-contrib" role="status">
              <span className="khaat-contrib-dot"></span>
              <span className="khaat-contrib-label">আমার অবদান (এ মাসে):</span>
              <span className="khaat-contrib-amount">৳৩০০</span>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['orphan'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">এতিম তহবিলে আসা মাসিক অর্থ দিয়ে স্থানীয় এতিম শিশুদের খাবার, পোশাক ও স্কুলের ফি সরাসরি প্রদান করা হয়। প্রতি মাসে ৫–১০ জন শিশু এই তহবিলের সুবিধা পায়।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>ন্যূনতম ১০০ টাকা/মাস থেকে শুরু করা যায়</li>
                    <li>মাসিক সংগ্রহের হিসাব প্রতি মাসের ৩০ তারিখে প্রকাশিত হয়</li>
                    <li>উপকারভোগীদের তালিকা পরিচালকমণ্ডলী অনুমোদিত</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions">
            <button className={`btn btn-ghost btn-sm${expandedDetails['orphan'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('orphan')} aria-expanded={!!expandedDetails['orphan']}>
              <ChevronIcon rotated={!!expandedDetails['orphan']} /> বিস্তারিত
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('এতিম তহবিল', '👨‍👧', 'দান', 'donate')}>এই খাতে দান করুন</button>
          </div>
        </article>

        {/* 4. শিক্ষা সহায়তা */}
        <article className={`khaat-card type-dan${isHidden('দান') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">📚</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">শিক্ষা সহায়তা</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">💝 দান</span>
                  <span className="khaat-freq-badge">📅 মাসিক</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">মেধাবী কিন্তু আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের বৃত্তি ও শিক্ষা উপকরণ প্রদান করা হয়। ভবিষ্যৎ প্রজন্মের আলোকিত মানুষ গড়তে সাহায্য করুন।</p>
            <div className="khaat-meta"><span className="khaat-amount-chip khaat-amount-var">⚖ পরিবর্তনযোগ্য পরিমাণ</span></div>
            <div className="khaat-progress-wrap">
              <div className="khaat-progress-top">
                <span className="khaat-progress-label">এ মাসের সংগ্রহ</span>
                <span className="khaat-progress-frac"><em>৳৬,৪০০</em> / ৳৮,০০০</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '80%' }}></div></div>
            </div>
            <div className="khaat-contrib" role="status">
              <span className="khaat-contrib-dot"></span>
              <span className="khaat-contrib-label">আমার অবদান (এ মাসে):</span>
              <span className="khaat-contrib-amount">৳২৫০</span>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['education'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">প্রতি মাসে সংগৃহীত অর্থ দিয়ে মেধাবী শিক্ষার্থীদের স্কুল ফি, বই ও পরীক্ষার ব্যয় মেটানো হয়। বর্তমানে ৬ জন শিক্ষার্থী বৃত্তির সুবিধা পাচ্ছে।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>শিক্ষা কমিটি উপকারভোগী নির্বাচন করে</li>
                    <li>শিক্ষার্থীর ফলাফল ও পারিবারিক অবস্থা যাচাই করা হয়</li>
                    <li>বার্ষিক একটি সাধারণ সভায় হিসাব উপস্থাপন করা হয়</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions">
            <button className={`btn btn-ghost btn-sm${expandedDetails['education'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('education')} aria-expanded={!!expandedDetails['education']}>
              <ChevronIcon rotated={!!expandedDetails['education']} /> বিস্তারিত
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('শিক্ষা সহায়তা', '📚', 'দান', 'donate')}>এই খাতে দান করুন</button>
          </div>
        </article>

        {/* 5. মাসিক সঞ্চয় */}
        <article className={`khaat-card type-shonchoy${isHidden('সঞ্চয়') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">🏦</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">মাসিক সঞ্চয়</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">🏦 সঞ্চয়</span>
                  <span className="khaat-freq-badge">📅 মাসিক</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">নিয়মিত মাসিক সঞ্চয় স্কিম। প্রতি মাসে নির্দিষ্ট পরিমাণ জমা রাখুন এবং প্রয়োজনে তা উত্তোলন করুন। ইসলামী নীতি মেনে সুদমুক্ত সঞ্চয়।</p>
            <div className="khaat-meta"><span className="khaat-amount-chip khaat-amount-fixed">🔒 নির্ধারিত পরিমাণ: ৳১,০০০/মাস</span></div>
            <div className="khaat-contrib contrib-savings" role="status">
              <span className="khaat-contrib-dot"></span>
              <span className="khaat-contrib-label">আমার মোট ব্যালেন্স:</span>
              <span className="khaat-contrib-amount">৳১২,০০০</span>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['monthly-savings'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">মাসিক সঞ্চয় স্কিমে প্রতি মাসে নির্ধারিত ১,০০০ টাকা জমা দিতে হয়। ১২ মাস পূর্ণ হলে একসাথে উত্তোলন করা যায় অথবা প্রয়োজনে আবেদনের মাধ্যমে আংশিক তোলা সম্ভব।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>প্রতি মাসের ১–৭ তারিখের মধ্যে জমা দিতে হবে</li>
                    <li>মাসিক কিস্তি মিস হলে পরের মাসে দ্বিগুণ দিতে হবে</li>
                    <li>১২ মাস আগে তোলা হলে ৫০ টাকা ফি প্রযোজ্য</li>
                    <li>সুদ যুক্ত হয় না — সম্পূর্ণ সুদমুক্ত সঞ্চয়</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions">
            <button className={`btn btn-ghost btn-sm${expandedDetails['monthly-savings'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('monthly-savings')} aria-expanded={!!expandedDetails['monthly-savings']}>
              <ChevronIcon rotated={!!expandedDetails['monthly-savings']} /> বিস্তারিত
            </button>
            <button className="btn btn-primary btn-sm" style={{ background: 'var(--success)', boxShadow: '0 2px 8px oklch(44% 0.14 145 / 0.35)' }} onClick={() => openModal('মাসিক সঞ্চয়', '🏦', 'সঞ্চয়', 'savings')}>এই খাতে সঞ্চয় করুন</button>
          </div>
        </article>

        {/* 6. বিশেষ সঞ্চয় */}
        <article className={`khaat-card type-shonchoy${isHidden('সঞ্চয়') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">💎</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">বিশেষ সঞ্চয়</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">🏦 সঞ্চয়</span>
                  <span className="khaat-freq-badge">⚡ এককালীন</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">বিবাহ, হজ্জ, চিকিৎসা বা অন্য যেকোনো বিশেষ উদ্দেশ্যে সঞ্চয় করুন। নিজের লক্ষ্য ঠিক করুন এবং প্রয়োজনমতো জমা দিন।</p>
            <div className="khaat-meta">
              <span className="khaat-amount-chip khaat-amount-var">⚖ পরিবর্তনযোগ্য পরিমাণ</span>
              <span className="khaat-freq-badge">যেকোনো সময়</span>
            </div>
            <div className="khaat-contrib contrib-savings" role="status">
              <span className="khaat-contrib-dot"></span>
              <span className="khaat-contrib-label">আমার মোট ব্যালেন্স:</span>
              <span className="khaat-contrib-amount">৳৫০০</span>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['special-savings'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">নিজের পছন্দমতো উদ্দেশ্য নির্ধারণ করে সঞ্চয় করুন। লক্ষ্যমাত্রা পূরণ হলে অথবা প্রয়োজনে যেকোনো সময় উত্তোলন করতে পারবেন।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>কোনো নির্দিষ্ট সময়সীমা নেই</li>
                    <li>উত্তোলনের জন্য ৩ দিন আগে আবেদন করতে হবে</li>
                    <li>লক্ষ্যমাত্রা পরিবর্তন করা যাবে</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions">
            <button className={`btn btn-ghost btn-sm${expandedDetails['special-savings'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('special-savings')} aria-expanded={!!expandedDetails['special-savings']}>
              <ChevronIcon rotated={!!expandedDetails['special-savings']} /> বিস্তারিত
            </button>
            <button className="btn btn-primary btn-sm" style={{ background: 'var(--success)', boxShadow: '0 2px 8px oklch(44% 0.14 145 / 0.35)' }} onClick={() => openModal('বিশেষ সঞ্চয়', '💎', 'সঞ্চয়', 'savings')}>এই খাতে সঞ্চয় করুন</button>
          </div>
        </article>

        {/* 7. কর্যে হাসানাঃ ঋণ */}
        <article className={`khaat-card type-rin${isHidden('ঋণ') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">💸</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">কর্যে হাসানাঃ ঋণ</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">💸 ঋণ</span>
                  <span className="khaat-freq-badge">⏳ পরিবর্তনযোগ্য মেয়াদ</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">জরুরি প্রয়োজনে সম্পূর্ণ সুদমুক্ত ঋণ নিন। ইসলামী আইনের ভিত্তিতে পরিচালিত এই ঋণে কোনো সুদ নেই, শুধু আসল ফেরত দিলেই হয়।</p>
            <div className="khaat-meta">
              <span className="khaat-amount-chip khaat-amount-sudomukt">✅ সম্পূর্ণ সুদমুক্ত</span>
              <span className="khaat-freq-badge">মেয়াদ আলোচনাযোগ্য</span>
            </div>
            <div className="khaat-contrib contrib-loan" role="status">
              <span className="khaat-contrib-dot"></span>
              <span className="khaat-contrib-label">আমার বর্তমান ঋণ:</span>
              <span className="khaat-contrib-amount">৳৮,০০০</span>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['loan'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">কর্যে হাসানাহ অর্থ &ldquo;উত্তম ঋণ&rdquo;। এখানে শুধু মূল পরিমাণ ফেরত দিতে হয় — কোনো সুদ, ফি বা লুকানো চার্জ নেই। বিশেষ পরিস্থিতিতে মেয়াদ বাড়ানোর সুযোগ আছে।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>সদস্যপদ কমপক্ষে ৩ মাস পুরনো হতে হবে</li>
                    <li>সর্বোচ্চ ঋণ সীমা ৳২০,০০০</li>
                    <li>কমিটির অনুমোদন পেলে ৭ দিনের মধ্যে প্রদান</li>
                    <li>মাসিক কিস্তিতে বা একসাথে ফেরত দেওয়া যাবে</li>
                    <li>পরিশোধের মেয়াদ সর্বোচ্চ ১২ মাস</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions">
            <button className={`btn btn-ghost btn-sm${expandedDetails['loan'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('loan')} aria-expanded={!!expandedDetails['loan']}>
              <ChevronIcon rotated={!!expandedDetails['loan']} /> বিস্তারিত
            </button>
            <button className="btn btn-primary btn-sm" style={{ background: 'var(--info)', boxShadow: '0 2px 8px oklch(55% 0.15 240 / 0.35)' }} onClick={() => openModal('কর্যে হাসানাঃ ঋণ', '💸', 'ঋণ', 'loan')}>ঋণ অনুরোধ করুন</button>
          </div>
        </article>

        {/* 8. সংগঠন তহবিল */}
        <article className={`khaat-card type-songothon${isHidden('সংগঠন') ? ' hidden' : ''}`}>
          <div className="khaat-card-main">
            <div className="khaat-card-header">
              <div className="khaat-icon-wrap" aria-hidden="true">🏢</div>
              <div className="khaat-card-title-block">
                <h2 className="khaat-card-name">সংগঠন তহবিল</h2>
                <div className="khaat-badges">
                  <span className="khaat-type-badge">🏢 সংগঠন</span>
                  <span className="khaat-freq-badge" style={{ background: 'var(--accent-light)', color: 'oklch(45% 0.16 55)', borderColor: 'oklch(88% 0.10 55)' }}>🔒 সদস্য দৃশ্যমান</span>
                </div>
              </div>
            </div>
            <p className="khaat-desc">সংগঠনের প্রশাসনিক ও পরিচালনা ব্যয় মেটাতে এই তহবিল ব্যবহৃত হয়। অফিস খরচ, ডিজিটাল সরঞ্জাম ও নিয়মিত পরিচালনার ব্যয় এখান থেকে বহন করা হয়।</p>
            <div className="khaat-meta">
              <span className="khaat-amount-chip" style={{ background: 'var(--accent-light)', color: 'oklch(45% 0.16 55)', border: '1px solid oklch(88% 0.10 55)' }}>📊 পরিচালক কর্তৃক পরিচালিত</span>
            </div>
            <div style={{ background: 'var(--accent-light)', border: '1px solid oklch(88% 0.10 55)', borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>ℹ️</span>
              <p style={{ fontSize: '12px', color: 'oklch(40% 0.14 55)', lineHeight: '1.6' }}>এই খাতটি সংগঠনের পরিচালকমণ্ডলী দ্বারা পরিচালিত হয়। সাধারণ সদস্যরা শুধু তথ্য দেখতে পারবেন। হিসাব বিবরণী বার্ষিক সাধারণ সভায় উপস্থাপন করা হয়।</p>
            </div>
            <div className={`khaat-detail-wrap${expandedDetails['org'] ? ' open' : ''}`}>
              <div className="khaat-detail-inner">
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">বিস্তারিত বিবরণ</p>
                  <p className="khaat-detail-text">সংগঠন তহবিলে সদস্যপদ ফি, বার্ষিক চাঁদা এবং বিশেষ অনুদান থেকে অর্থ সংগ্রহ হয়। এই তহবিল থেকে কার্যালয় পরিচালনা, ডিজিটাল সরঞ্জাম ক্রয় এবং কমিটির সভা-সংক্রান্ত ব্যয় মেটানো হয়।</p>
                </div>
                <div className="khaat-detail-section">
                  <p className="khaat-detail-heading">নিয়ম ও শর্ত</p>
                  <ul className="khaat-detail-list">
                    <li>বার্ষিক সাধারণ সভায় বাজেট অনুমোদন করা হয়</li>
                    <li>যেকোনো ব্যয় ৫,০০০ টাকার বেশি হলে কমিটির অনুমোদন প্রয়োজন</li>
                    <li>প্রতি প্রান্তিকে আর্থিক বিবরণী প্রকাশিত হয়</li>
                  </ul>
                </div>
                <Link href="/user/comments" className="khaat-comment-link"><CommentIcon /> প্রশ্ন থাকলে মন্তব্য করুন</Link>
              </div>
            </div>
          </div>
          <div className="khaat-card-actions" style={{ justifyContent: 'flex-end' }}>
            <button className={`btn btn-ghost btn-sm${expandedDetails['org'] ? ' btn-expand-active' : ''}`} onClick={() => toggleDetail('org')} aria-expanded={!!expandedDetails['org']}>
              <ChevronIcon rotated={!!expandedDetails['org']} /> বিস্তারিত দেখুন
            </button>
            <span className="badge badge-gold" style={{ padding: '7px 14px', fontSize: '12px' }}>🔒 শুধু পড়ার অনুমতি</span>
          </div>
        </article>

      </section>

      {/* ACTION MODAL */}
      <div className={`modal-backdrop${modalOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modalTitle" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="modal-sheet">
          <div className="modal-handle" aria-hidden="true"></div>
          <div className="modal-header">
            <span className="modal-title" id="modalTitle">{actionLabel(modalKhaat.type)}</span>
            <button className="modal-close" onClick={closeModal} aria-label="বন্ধ করুন">✕</button>
          </div>
          {!modalSuccess ? (
            <div className="modal-body">
              <div className="modal-khaat-preview">
                <span className="modal-khaat-icon" aria-hidden="true">{modalKhaat.icon}</span>
                <div>
                  <div className="modal-khaat-name">{modalKhaat.name}</div>
                  <div className="modal-khaat-type">{typeLabel(modalKhaat.type)}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="modalAmount">পরিমাণ (৳)</label>
                <input className="form-input" type="number" id="modalAmount" placeholder="০.০০" min="1" step="50" inputMode="decimal" value={modalAmount} onChange={e => setModalAmount(e.target.value)} aria-describedby="amountHint" />
                <p className="form-hint" id="amountHint">যেকোনো পরিমাণ লিখুন</p>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="modalNote">মন্তব্য (ঐচ্ছিক)</label>
                <input className="form-input" type="text" id="modalNote" placeholder="যেমন: রমজান মাসের যাকাত" maxLength={100} value={modalNote} onChange={e => setModalNote(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={closeModal}>বাতিল</button>
                <button className="btn btn-primary" style={getModalSubmitStyle()} onClick={submitModal}>নিশ্চিত করুন</button>
              </div>
            </div>
          ) : (
            <div className="modal-success show" role="status">
              <div className="success-icon" aria-hidden="true">✓</div>
              <div className="success-title">সফলভাবে জমা হয়েছে!</div>
              <p className="success-text">{successText}</p>
              <button className="btn btn-primary" onClick={closeModal} style={{ marginTop: '8px', width: '100%', maxWidth: '240px' }}>ঠিক আছে</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
