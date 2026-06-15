'use client';

import { useState, useCallback, useEffect } from 'react';

const MODULES = [
  'ড্যাশবোর্ড',
  'ফান্ড/কালেকশন',
  'ঋণ বিতরণ',
  'ঋণ ফেরত',
  'খাত পরিচালনা',
  'সদস্য তালিকা',
  'প্রতিবেদন',
  'ভূমিকা ও অনুমতি',
  'ডেটা ব্যাকআপ',
];

type PermRow = [number, number, number, number];

const PERMS: Record<string, PermRow[]> = {
  manager: [
    [1,0,0,0],[1,1,1,0],[1,1,1,0],[1,1,1,0],[1,1,1,0],[1,1,1,0],[1,0,0,0],[0,0,0,0],[0,0,0,0]
  ],
  'data-entry': [
    [1,0,0,0],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]
  ],
  blank: Array(9).fill([0,0,0,0]) as PermRow[],
};

const ACTIONS = ['পড়া', 'লেখা', 'আপডেট', 'মুছুন'];
const ACTION_PILL_CLASSES = ['ap-read', 'ap-write', 'ap-update', 'ap-delete'];
const TOGGLE_CLASSES = ['toggle-read', 'toggle-write', 'toggle-update', 'toggle-delete'];

const USERS = [
  { name: 'আবু বক্কর সিদ্দিক', role: 'ম্যানেজার', roleKey: 'manager', avatar: 'আ', avatarBg: 'oklch(85% 0.07 145)', avatarColor: 'oklch(35% 0.14 145)' },
  { name: 'ফাতেমা খানম', role: 'ডেটা এন্ট্রি', roleKey: 'data-entry', avatar: 'ফা', avatarBg: 'oklch(92% 0.05 240)', avatarColor: 'oklch(40% 0.15 240)' },
  { name: 'মো. আলী হোসেন', role: 'ম্যানেজার', roleKey: 'manager', avatar: 'আলী', avatarBg: 'oklch(93% 0.05 354)', avatarColor: 'var(--brand)' },
  { name: 'রহিমা বেগম', role: 'ডেটা এন্ট্রি', roleKey: 'data-entry', avatar: 'র', avatarBg: 'oklch(94% 0.05 80)', avatarColor: 'oklch(40% 0.14 75)' },
  { name: 'ইব্রাহিম শেখ', role: 'ম্যানেজার', roleKey: 'manager', avatar: 'ই', avatarBg: 'oklch(92% 0.05 300)', avatarColor: 'oklch(40% 0.12 300)' },
];

export default function RolesPermissionsPage() {
  const [toast, setToast] = useState('');
  const [selectedUserIdx, setSelectedUserIdx] = useState(0);
  const [currentPerms, setCurrentPerms] = useState<PermRow[]>(() =>
    PERMS.manager.map(row => [...row] as PermRow)
  );

  // New Role Modal
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [roleTemplate, setRoleTemplate] = useState('manager');
  const [modalPerms, setModalPerms] = useState<PermRow[]>(() =>
    PERMS.manager.map(row => [...row] as PermRow)
  );

  // New Admin Modal
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [showMemberResults, setShowMemberResults] = useState(true);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const selectUser = useCallback((idx: number) => {
    setSelectedUserIdx(idx);
    const user = USERS[idx];
    const perms = PERMS[user.roleKey] || PERMS.manager;
    setCurrentPerms(perms.map(row => [...row] as PermRow));
  }, []);

  const togglePerm = useCallback((modIdx: number, actIdx: number) => {
    setCurrentPerms(prev => {
      const next = prev.map(row => [...row] as PermRow);
      next[modIdx][actIdx] = next[modIdx][actIdx] ? 0 : 1;
      return next;
    });
  }, []);

  const applyTemplate = useCallback((tpl: string) => {
    const perms = PERMS[tpl] || PERMS.blank;
    setModalPerms(perms.map(row => [...row] as PermRow));
  }, []);

  const toggleModalPerm = useCallback((modIdx: number, actIdx: number) => {
    setModalPerms(prev => {
      const next = prev.map(row => [...row] as PermRow);
      next[modIdx][actIdx] = next[modIdx][actIdx] ? 0 : 1;
      return next;
    });
  }, []);

  useEffect(() => {
    applyTemplate(roleTemplate);
  }, [roleTemplate, applyTemplate]);

  const selectedUser = USERS[selectedUserIdx];

  return (
    <>
      <style>{`
        .rp2-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .rp2-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; text-decoration: none; line-height: 1; }
        .rp2-btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .rp2-btn-primary { background: var(--brand); color: #fff; }
        .rp2-btn-primary:hover { background: var(--brand-mid); transform: translateY(-1px); box-shadow: var(--sh-sm); }
        .rp2-btn-primary:active { transform: translateY(0); }
        .rp2-btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .rp2-btn-ghost:hover { background: var(--surface-2); }
        .rp2-btn-sm { padding: 7px 13px; font-size: 12.5px; }
        .rp2-btn-xs { padding: 5px 10px; font-size: 12px; }
        .rp2-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; }
        .rp2-badge-brand  { background: var(--brand-light); color: var(--brand); }
        .rp2-badge-success { background: var(--success-bg); color: var(--success); }
        .rp2-badge-warning { background: var(--warning-bg); color: var(--warning); }
        .rp2-badge-danger  { background: var(--danger-bg);  color: var(--danger); }
        .rp2-badge-info    { background: var(--info-bg);    color: var(--info); }
        .rp2-badge-muted   { background: var(--surface-2);  color: var(--muted); border: 1px solid var(--border); }
        .rp2-input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 14px; color: var(--fg); background: var(--surface); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .rp2-input:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .rp2-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--brand-light); color: var(--brand); font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rp2-page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
        .rp2-page-title { font-size: 22px; font-weight: 700; color: var(--fg); line-height: 1.2; }
        .rp2-page-subtitle { font-size: 13px; color: var(--muted); margin-top: 3px; }
        .rp2-super-banner { background: oklch(96% 0.05 80); border: 1px solid oklch(82% 0.12 75); border-radius: var(--r); padding: 13px 18px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .rp2-super-banner-text { font-size: 13.5px; font-weight: 600; color: oklch(40% 0.14 75); }
        .rp2-section-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .rp2-section-title { font-size: 16px; font-weight: 700; color: var(--fg); display: flex; align-items: center; gap: 8px; }
        .rp2-section-title::before { content: ''; display: inline-block; width: 3px; height: 18px; background: var(--brand); border-radius: 99px; }
        .rp2-role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .rp2-role-card { padding: 20px; position: relative; transition: box-shadow 0.15s, transform 0.15s; }
        .rp2-role-card:hover { box-shadow: var(--sh); transform: translateY(-2px); }
        .rp2-role-card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; font-size: 20px; }
        .rp2-role-card-name { font-size: 15px; font-weight: 700; color: var(--fg); margin-bottom: 6px; }
        .rp2-role-card-desc { font-size: 12.5px; color: var(--fg-2); line-height: 1.55; margin-bottom: 14px; }
        .rp2-role-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .rp2-role-card-actions { display: flex; gap: 8px; }
        .rp2-role-card-locked { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); padding: 6px 10px; background: var(--surface-2); border-radius: var(--r-sm); border: 1px solid var(--border); }
        .rp2-role-card.super { border-top: 3px solid var(--brand); }
        .rp2-role-card.manager { border-top: 3px solid var(--success); }
        .rp2-role-card.data-entry { border-top: 3px solid var(--info); }
        .rp2-perm-panels { display: grid; grid-template-columns: 280px 1fr; gap: 16px; margin-bottom: 32px; align-items: start; }
        .rp2-user-list-panel { border-radius: var(--r); overflow: hidden; border: 1px solid var(--border); background: var(--surface); box-shadow: var(--sh-sm); }
        .rp2-user-list-header { padding: 14px 16px; border-bottom: 1px solid var(--border); background: var(--surface-2); font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .rp2-user-row { display: flex; align-items: center; gap: 12px; padding: 13px 16px; cursor: pointer; transition: background 0.12s; border-bottom: 1px solid var(--border); }
        .rp2-user-row:last-child { border-bottom: none; }
        .rp2-user-row:hover { background: var(--brand-light); }
        .rp2-user-row.selected { background: oklch(95% 0.04 354); border-left: 3px solid var(--brand); padding-left: 13px; }
        .rp2-user-row-info { flex: 1; min-width: 0; }
        .rp2-user-row-name { font-size: 13.5px; font-weight: 600; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rp2-user-row-role { font-size: 11.5px; color: var(--muted); margin-top: 1px; }
        .rp2-matrix-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .rp2-matrix-panel-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--surface-2); border-radius: var(--r) var(--r) 0 0; }
        .rp2-matrix-user-info { display: flex; align-items: center; gap: 12px; }
        .rp2-matrix-user-name { font-size: 15px; font-weight: 700; color: var(--fg); }
        .rp2-matrix-user-role { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .rp2-perm-table { width: 100%; border-collapse: collapse; }
        .rp2-perm-table thead th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--border); background: var(--surface-2); }
        .rp2-perm-table thead th:first-child { padding-left: 20px; }
        .rp2-perm-table thead th:not(:first-child) { text-align: center; min-width: 80px; }
        .rp2-perm-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
        .rp2-perm-table tbody tr:last-child { border-bottom: none; }
        .rp2-perm-table tbody tr:hover { background: var(--surface-2); }
        .rp2-perm-table td { padding: 12px 16px; vertical-align: middle; }
        .rp2-perm-table td:first-child { padding-left: 20px; font-size: 13.5px; font-weight: 500; color: var(--fg); }
        .rp2-perm-table td:not(:first-child) { text-align: center; }
        .rp2-perm-table tfoot td { padding: 16px 20px; border-top: 2px solid var(--border); background: var(--surface-2); text-align: right; }
        .rp2-perm-table tfoot td:first-child { text-align: left; font-size: 12px; color: var(--muted); }
        .rp2-toggle-wrap { display: inline-flex; align-items: center; justify-content: center; }
        .rp2-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
        .rp2-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
        .rp2-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: oklch(88% 0.005 300); border-radius: 99px; transition: background 0.18s; }
        .rp2-toggle-slider::before { content: ''; position: absolute; height: 14px; width: 14px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform 0.18s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .rp2-toggle.toggle-read input:checked + .rp2-toggle-slider { background: oklch(45% 0.15 240); }
        .rp2-toggle.toggle-write input:checked + .rp2-toggle-slider { background: oklch(38% 0.14 145); }
        .rp2-toggle.toggle-update input:checked + .rp2-toggle-slider { background: oklch(48% 0.14 75); }
        .rp2-toggle.toggle-delete input:checked + .rp2-toggle-slider { background: oklch(48% 0.18 25); }
        .rp2-toggle input:checked + .rp2-toggle-slider::before { transform: translateX(16px); }
        .rp2-action-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
        .ap-read   { background: oklch(95% 0.05 240); color: oklch(45% 0.15 240); }
        .ap-write  { background: oklch(95% 0.05 145); color: oklch(38% 0.14 145); }
        .ap-update { background: oklch(96% 0.06 80);  color: oklch(48% 0.14 75); }
        .ap-delete { background: oklch(96% 0.05 25);  color: oklch(48% 0.18 25); }
        .rp2-audit-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rp2-audit-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid var(--border); background: var(--surface-2); white-space: nowrap; }
        .rp2-audit-table td { padding: 11px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--fg-2); }
        .rp2-audit-table tr:last-child td { border-bottom: none; }
        .rp2-audit-table tr:hover td { background: var(--surface-2); }
        .rp2-audit-date { color: var(--muted); font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums; }
        .rp2-audit-user { font-weight: 600; color: var(--fg); }
        .rp2-audit-detail { color: var(--fg-2); font-size: 12.5px; }
        .rp2-audit-action-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 11.5px; font-weight: 500; white-space: nowrap; }
        .rp2-modal-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; align-items: center; justify-content: center; padding: 20px; }
        .rp2-modal-backdrop.open { display: flex; }
        .rp2-modal { background: var(--surface); border-radius: var(--r-lg); box-shadow: var(--sh-lg); width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; animation: rp2ModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .rp2-modal-lg { max-width: 780px; }
        @keyframes rp2ModalIn { from { opacity: 0; transform: scale(0.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .rp2-modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; }
        .rp2-modal-title { font-size: 17px; font-weight: 700; color: var(--fg); }
        .rp2-modal-close { background: none; border: none; cursor: pointer; color: var(--muted); padding: 6px; border-radius: 8px; transition: all 0.12s; display: flex; align-items: center; }
        .rp2-modal-close:hover { background: var(--surface-2); color: var(--fg-2); }
        .rp2-modal-body { padding: 24px; flex: 1; }
        .rp2-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; background: var(--surface-2); border-radius: 0 0 var(--r-lg) var(--r-lg); }
        .rp2-form-group { margin-bottom: 18px; }
        .rp2-form-label { display: block; font-size: 13px; font-weight: 600; color: var(--fg-2); margin-bottom: 6px; }
        .rp2-form-label span { color: var(--danger); }
        .rp2-form-hint { font-size: 12px; color: var(--muted); margin-top: 5px; }
        .rp2-mini-perm-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .rp2-mini-perm-table th { padding: 8px 10px; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid var(--border); background: var(--surface-2); text-align: center; }
        .rp2-mini-perm-table th:first-child { text-align: left; padding-left: 12px; }
        .rp2-mini-perm-table td { padding: 9px 10px; border-bottom: 1px solid var(--border); text-align: center; font-size: 13px; }
        .rp2-mini-perm-table td:first-child { text-align: left; padding-left: 12px; font-size: 13px; color: var(--fg); font-weight: 500; }
        .rp2-mini-perm-table tr:last-child td { border-bottom: none; }
        .rp2-mini-toggle { position: relative; display: inline-block; width: 30px; height: 17px; flex-shrink: 0; }
        .rp2-mini-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
        .rp2-mini-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: oklch(88% 0.005 300); border-radius: 99px; transition: background 0.18s; }
        .rp2-mini-toggle-slider::before { content: ''; position: absolute; height: 11px; width: 11px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform 0.18s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .rp2-mini-toggle.toggle-read input:checked + .rp2-mini-toggle-slider { background: oklch(45% 0.15 240); }
        .rp2-mini-toggle.toggle-write input:checked + .rp2-mini-toggle-slider { background: oklch(38% 0.14 145); }
        .rp2-mini-toggle.toggle-update input:checked + .rp2-mini-toggle-slider { background: oklch(48% 0.14 75); }
        .rp2-mini-toggle.toggle-delete input:checked + .rp2-mini-toggle-slider { background: oklch(48% 0.18 25); }
        .rp2-mini-toggle input:checked + .rp2-mini-toggle-slider::before { transform: translateX(13px); }
        .rp2-toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--fg); color: #fff; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 500; z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.22s, transform 0.22s; white-space: nowrap; box-shadow: var(--sh); }
        .rp2-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        @media (max-width: 900px) { .rp2-perm-panels { grid-template-columns: 1fr; } .rp2-role-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .rp2-role-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Page Header */}
      <div className="rp2-page-header">
        <div>
          <h1 className="rp2-page-title">ভূমিকা ও অনুমতি</h1>
          <p className="rp2-page-subtitle">অ্যাডমিন ব্যবহারকারীদের ভূমিকা ও মডিউল-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ করুন</p>
        </div>
      </div>

      {/* Super Admin Banner */}
      <div className="rp2-super-banner">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.8 5.5H17l-4.6 3.3 1.8 5.5L10 13l-4.2 3.3 1.8-5.5L3 7.5h5.2L10 2z" stroke="oklch(48% 0.14 75)" strokeWidth="1.5" strokeLinejoin="round" fill="oklch(86% 0.12 75)"/></svg>
        <span className="rp2-super-banner-text">⚠️ এই পেজটি শুধুমাত্র সুপার অ্যাডমিনের জন্য — অনুমতির পরিবর্তন সিস্টেমের নিরাপত্তাকে প্রভাবিত করে</span>
      </div>

      {/* SECTION 1: ROLE TEMPLATES */}
      <div className="rp2-section-header">
        <h2 className="rp2-section-title">ভূমিকার টেমপ্লেট</h2>
        <button className="rp2-btn rp2-btn-primary rp2-btn-sm" onClick={() => setShowNewRoleModal(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          নতুন ভূমিকা তৈরি
        </button>
      </div>

      <div className="rp2-role-grid" style={{ marginBottom: 32 }}>
        {/* Super Admin Card */}
        <div className="rp2-card rp2-role-card super">
          <div className="rp2-role-card-icon" style={{ background: 'var(--brand-light)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2l2 6.2H19l-5.2 3.8 2 6.2L11 14.2 5.2 18l2-6.2L2 8.2h6L11 2z" stroke="var(--brand)" strokeWidth="1.6" strokeLinejoin="round" fill="oklch(92% 0.06 354)"/></svg>
          </div>
          <div className="rp2-role-card-name">সুপার অ্যাডমিন</div>
          <div className="rp2-role-card-desc">সব মডিউলে সম্পূর্ণ পড়া, লেখা, আপডেট ও মুছে ফেলার অ্যাক্সেস। সিস্টেমের সর্বোচ্চ কর্তৃপক্ষ।</div>
          <div className="rp2-role-card-meta">
            <span className="rp2-badge rp2-badge-brand"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/></svg>১ ব্যক্তি</span>
            <span className="rp2-badge" style={{ background: 'var(--brand-light)', color: 'var(--brand)', fontSize: 11 }}>সুরক্ষিত</span>
          </div>
          <div className="rp2-role-card-actions">
            <div className="rp2-role-card-locked">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="5.5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 5.5V4a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              সম্পাদন সীমাবদ্ধ
            </div>
          </div>
        </div>

        {/* Manager Card */}
        <div className="rp2-card rp2-role-card manager">
          <div className="rp2-role-card-icon" style={{ background: 'var(--success-bg)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke="var(--success)" strokeWidth="1.6"/><path d="M4 19c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="var(--success)" strokeWidth="1.6" strokeLinecap="round"/><path d="M16 11l1.5 1.5 3-3" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="rp2-role-card-name">ম্যানেজার</div>
          <div className="rp2-role-card-desc">বেশিরভাগ মডিউলে পড়া ও লেখার সুবিধা। মুছে ফেলার অ্যাক্সেস সীমিত। প্রতিবেদন শুধু দেখতে পারবেন।</div>
          <div className="rp2-role-card-meta">
            <span className="rp2-badge rp2-badge-success"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/></svg>৩ ব্যক্তি</span>
          </div>
          <div className="rp2-role-card-actions">
            <button className="rp2-btn rp2-btn-ghost rp2-btn-xs" onClick={() => showToast('ম্যানেজার ভূমিকা সম্পাদনা খুলছে...')}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2.5l1.5 1.5-7 7H2v-1.5l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              সম্পাদন
            </button>
            <button className="rp2-btn rp2-btn-ghost rp2-btn-xs" onClick={() => showToast('ম্যানেজার টেমপ্লেট ডুপ্লিকেট হয়েছে।')}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 9V2A1.5 1.5 0 013 .5h6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              ডুপ্লিকেট
            </button>
          </div>
        </div>

        {/* Data Entry Card */}
        <div className="rp2-card rp2-role-card data-entry">
          <div className="rp2-role-card-icon" style={{ background: 'var(--info-bg)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="2.5" stroke="var(--info)" strokeWidth="1.6"/><path d="M7 11h8M7 7.5h5M7 14.5h3" stroke="var(--info)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="rp2-role-card-name">ডেটা এন্ট্রি</div>
          <div className="rp2-role-card-desc">শুধুমাত্র ফান্ড কালেকশন ও ঋণ এন্ট্রির সুবিধা। সদস্য তালিকা শুধু পড়তে পারবেন। প্রতিবেদন অ্যাক্সেস নেই।</div>
          <div className="rp2-role-card-meta">
            <span className="rp2-badge rp2-badge-info"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/></svg>৫ ব্যক্তি</span>
          </div>
          <div className="rp2-role-card-actions">
            <button className="rp2-btn rp2-btn-ghost rp2-btn-xs" onClick={() => showToast('ডেটা এন্ট্রি ভূমিকা সম্পাদনা খুলছে...')}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2.5l1.5 1.5-7 7H2v-1.5l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              সম্পাদন
            </button>
            <button className="rp2-btn rp2-btn-ghost rp2-btn-xs" onClick={() => showToast('ডেটা এন্ট্রি টেমপ্লেট ডুপ্লিকেট হয়েছে।')}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 9V2A1.5 1.5 0 013 .5h6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              ডুপ্লিকেট
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: USER PERMISSION MANAGEMENT */}
      <div className="rp2-section-header">
        <h2 className="rp2-section-title">ইউজার পারমিশন ম্যানেজমেন্ট</h2>
        <button className="rp2-btn rp2-btn-primary rp2-btn-sm" onClick={() => setShowNewAdminModal(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          নতুন অ্যাডমিন যোগ
        </button>
      </div>

      <div className="rp2-perm-panels" style={{ marginBottom: 32 }}>
        {/* User List Panel */}
        <div className="rp2-user-list-panel">
          <div className="rp2-user-list-header">অ্যাডমিন তালিকা ({USERS.length} জন)</div>
          {USERS.map((user, idx) => (
            <div key={idx} className={`rp2-user-row${selectedUserIdx === idx ? ' selected' : ''}`} onClick={() => selectUser(idx)}>
              <div className="rp2-avatar" style={{ background: user.avatarBg, color: user.avatarColor, flexShrink: 0, fontSize: 13 }}>{user.avatar}</div>
              <div className="rp2-user-row-info">
                <div className="rp2-user-row-name">{user.name}</div>
                <div className="rp2-user-row-role">{user.role}</div>
              </div>
              <span style={{ fontSize: 16, flexShrink: 0, cursor: 'pointer' }} title="অনুমতি কপি" onClick={e => { e.stopPropagation(); showToast('পারমিশন কপি হয়েছে।'); }}>📋</span>
            </div>
          ))}
        </div>

        {/* Permission Matrix Panel */}
        <div className="rp2-matrix-panel">
          <div className="rp2-matrix-panel-header">
            <div className="rp2-matrix-user-info">
              <div className="rp2-avatar" style={{ background: selectedUser.avatarBg, color: selectedUser.avatarColor, width: 40, height: 40, fontSize: 15 }}>{selectedUser.avatar}</div>
              <div>
                <div className="rp2-matrix-user-name">{selectedUser.name}</div>
                <div className="rp2-matrix-user-role">{selectedUser.role} — পারমিশন কাস্টমাইজ করুন</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="rp2-btn rp2-btn-ghost rp2-btn-sm" onClick={() => { selectUser(selectedUserIdx); showToast('সব পারমিশন রিসেট হয়েছে।'); }}>রিসেট</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="rp2-perm-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>মডিউল</th>
                  <th><span className="rp2-action-pill ap-read">👁 পড়া</span></th>
                  <th><span className="rp2-action-pill ap-write">✏️ লেখা</span></th>
                  <th><span className="rp2-action-pill ap-update">🔄 আপডেট</span></th>
                  <th><span className="rp2-action-pill ap-delete">🗑 মুছুন</span></th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod, modIdx) => (
                  <tr key={modIdx}>
                    <td>{mod}</td>
                    {ACTIONS.map((act, actIdx) => (
                      <td key={actIdx}>
                        <div className="rp2-toggle-wrap">
                          <label className={`rp2-toggle ${TOGGLE_CLASSES[actIdx]}`} title={act}>
                            <input
                              type="checkbox"
                              checked={!!(currentPerms[modIdx]?.[actIdx])}
                              onChange={() => togglePerm(modIdx, actIdx)}
                            />
                            <span className="rp2-toggle-slider"></span>
                          </label>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>পরিবর্তনগুলো সংরক্ষণ করতে "সংরক্ষণ করুন" বাটনে ক্লিক করুন</span>
                      <button className="rp2-btn rp2-btn-primary" onClick={() => showToast('পারমিশন আপডেট হয়েছে।')}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        সংরক্ষণ করুন
                      </button>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: AUDIT LOG */}
      <div className="rp2-section-header">
        <h2 className="rp2-section-title">অডিট লগ</h2>
        <button className="rp2-btn rp2-btn-ghost rp2-btn-sm" onClick={() => showToast('অডিট লগ এক্সপোর্ট হচ্ছে...')}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 10v1A1.5 1.5 0 003 12.5h7A1.5 1.5 0 0011.5 11v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          এক্সপোর্ট
        </button>
      </div>

      <div className="rp2-card" style={{ overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rp2-audit-table">
            <thead>
              <tr>
                <th>তারিখ ও সময়</th>
                <th>ব্যবহারকারী</th>
                <th>কার্যক্রম</th>
                <th>বিস্তারিত</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '১৫ জুন ২০২৬', time: '১০:৩২ পূর্বাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--info-bg)', actionColor: 'var(--info)', action: 'পারমিশন পরিবর্তন', detail: <>আবু বক্কর সিদ্দিক — "ঋণ বিতরণ → মুছুন" অ্যাক্সেস <strong style={{ color: 'var(--danger)' }}>বন্ধ</strong> করা হয়েছে</> },
                { date: '১৫ জুন ২০২৬', time: '০৯:১৫ পূর্বাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--success-bg)', actionColor: 'var(--success)', action: 'নতুন অ্যাডমিন যোগ', detail: <>ইব্রাহিম শেখকে <strong>ম্যানেজার</strong> ভূমিকায় যোগ করা হয়েছে</> },
                { date: '১৪ জুন ২০২৬', time: '০৩:৪৮ অপরাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--warning-bg)', actionColor: 'var(--warning)', action: 'ভূমিকা আপডেট', detail: <>ম্যানেজার টেমপ্লেট — "প্রতিবেদন → লেখা" অ্যাক্সেস <strong style={{ color: 'var(--danger)' }}>সরানো</strong> হয়েছে</> },
                { date: '১৪ জুন ২০২৬', time: '১১:২২ পূর্বাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--info-bg)', actionColor: 'var(--info)', action: 'পারমিশন পরিবর্তন', detail: <>ফাতেমা খানম — "সদস্য তালিকা → পড়া" অ্যাক্সেস <strong style={{ color: 'var(--success)' }}>চালু</strong> করা হয়েছে</> },
                { date: '১৩ জুন ২০২৬', time: '০২:১০ অপরাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--success-bg)', actionColor: 'var(--success)', action: 'নতুন ভূমিকা তৈরি', detail: <>"ফিল্ড অ্যাজেন্ট" নামে নতুন ভূমিকা তৈরি করা হয়েছে (ডেটা এন্ট্রি টেমপ্লেট থেকে)</> },
                { date: '১২ জুন ২০২৬', time: '০৪:৫৫ অপরাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--danger-bg)', actionColor: 'var(--danger)', action: 'অ্যাডমিন নিষ্ক্রিয়', detail: <>করিম উদ্দিনের অ্যাডমিন অ্যাক্সেস <strong style={{ color: 'var(--danger)' }}>নিষ্ক্রিয়</strong> করা হয়েছে</> },
                { date: '১১ জুন ২০২৬', time: '০৯:৩০ পূর্বাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--info-bg)', actionColor: 'var(--info)', action: 'পারমিশন পরিবর্তন', detail: <>মো. আলী হোসেন — "খাত পরিচালনা → আপডেট" অ্যাক্সেস <strong style={{ color: 'var(--success)' }}>চালু</strong> করা হয়েছে</> },
                { date: '১০ জুন ২০২৬', time: '০১:২০ অপরাহ্ন', user: 'সুপার অ্যাডমিন', email: 'super@intifadah.com', actionBg: 'var(--success-bg)', actionColor: 'var(--success)', action: 'নতুন অ্যাডমিন যোগ', detail: <>রহিমা বেগমকে <strong>ডেটা এন্ট্রি</strong> ভূমিকায় যোগ করা হয়েছে</> },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="rp2-audit-date">{row.date}<br/><span style={{ fontSize: 11, color: 'var(--muted)' }}>{row.time}</span></td>
                  <td><div className="rp2-audit-user">{row.user}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{row.email}</div></td>
                  <td><span className="rp2-audit-action-badge" style={{ background: row.actionBg, color: row.actionColor }}>{row.action}</span></td>
                  <td className="rp2-audit-detail">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NEW ROLE */}
      <div className={`rp2-modal-backdrop${showNewRoleModal ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowNewRoleModal(false); }}>
        <div className="rp2-modal rp2-modal-lg">
          <div className="rp2-modal-header">
            <div>
              <div className="rp2-modal-title">নতুন ভূমিকা তৈরি</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>টেমপ্লেট বেছে নিন বা শূন্য থেকে শুরু করুন</div>
            </div>
            <button className="rp2-modal-close" onClick={() => setShowNewRoleModal(false)} aria-label="বন্ধ করুন">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="rp2-modal-body">
            <div className="rp2-form-group">
              <label className="rp2-form-label">ভূমিকার নাম <span>*</span></label>
              <input type="text" className="rp2-input" placeholder="যেমন: ফিল্ড অ্যাজেন্ট" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
            </div>
            <div className="rp2-form-group">
              <label className="rp2-form-label">বিবরণ</label>
              <textarea className="rp2-input" style={{ resize: 'vertical', minHeight: 80 }} placeholder="এই ভূমিকার কাজ ও সীমাবদ্ধতার বিবরণ লিখুন..." value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)}></textarea>
            </div>
            <div className="rp2-form-group">
              <label className="rp2-form-label">পারমিশন টেমপ্লেট</label>
              <select className="rp2-input" style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }} value={roleTemplate} onChange={e => setRoleTemplate(e.target.value)}>
                <option value="manager">ম্যানেজার টেমপ্লেট</option>
                <option value="data-entry">ডেটা এন্ট্রি টেমপ্লেট</option>
                <option value="blank">শূন্য থেকে শুরু</option>
              </select>
              <div className="rp2-form-hint">টেমপ্লেট বাছাই করলে নিচের পারমিশন ম্যাট্রিক্স স্বয়ংক্রিয়ভাবে পূরণ হবে</div>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginTop: 4 }}>
              <div style={{ padding: '10px 12px', background: 'var(--surface-2)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>পারমিশন ম্যাট্রিক্স</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="rp2-mini-perm-table">
                  <thead>
                    <tr>
                      <th>মডিউল</th>
                      <th>পড়া</th>
                      <th>লেখা</th>
                      <th>আপডেট</th>
                      <th>মুছুন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod, modIdx) => (
                      <tr key={modIdx}>
                        <td>{mod}</td>
                        {ACTIONS.map((act, actIdx) => (
                          <td key={actIdx}>
                            <div className="rp2-toggle-wrap">
                              <label className={`rp2-mini-toggle ${TOGGLE_CLASSES[actIdx]}`} title={act}>
                                <input
                                  type="checkbox"
                                  checked={!!(modalPerms[modIdx]?.[actIdx])}
                                  onChange={() => toggleModalPerm(modIdx, actIdx)}
                                />
                                <span className="rp2-mini-toggle-slider"></span>
                              </label>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="rp2-modal-footer">
            <button className="rp2-btn rp2-btn-ghost" onClick={() => setShowNewRoleModal(false)}>বাতিল</button>
            <button className="rp2-btn rp2-btn-primary" onClick={() => {
              if (!newRoleName.trim()) { showToast('ভূমিকার নাম দিন।'); return; }
              showToast(`"${newRoleName}" ভূমিকা সংরক্ষিত হয়েছে।`);
              setShowNewRoleModal(false);
              setNewRoleName('');
              setNewRoleDesc('');
              setRoleTemplate('manager');
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ভূমিকা সংরক্ষণ
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: NEW ADMIN */}
      <div className={`rp2-modal-backdrop${showNewAdminModal ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowNewAdminModal(false); }}>
        <div className="rp2-modal">
          <div className="rp2-modal-header">
            <div>
              <div className="rp2-modal-title">নতুন অ্যাডমিন যোগ</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>সদস্য তালিকা থেকে নির্বাচন করুন</div>
            </div>
            <button className="rp2-modal-close" onClick={() => setShowNewAdminModal(false)} aria-label="বন্ধ করুন">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="rp2-modal-body">
            <div className="rp2-form-group">
              <label className="rp2-form-label">সদস্য নির্বাচন <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                <input type="search" className="rp2-input" placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন..." style={{ paddingLeft: 34 }} value={memberSearch} onChange={e => { setMemberSearch(e.target.value); if (!e.target.value) { setShowMemberResults(true); setSelectedMember(''); } }} />
              </div>
              {showMemberResults && !selectedMember && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', marginTop: 8, overflow: 'hidden' }}>
                  {[
                    { name: 'নাসরিন আক্তার', init: 'না', bg: 'oklch(92% 0.05 240)', color: 'oklch(40% 0.15 240)', phone: '+880 1711-234567', num: '৩৪১' },
                    { name: 'মাহমুদ হাসান', init: 'মা', bg: 'var(--brand-light)', color: 'var(--brand)', phone: '+880 1812-987654', num: '২১৮' },
                    { name: 'সাদিয়া ইসলাম', init: 'সা', bg: 'oklch(94% 0.05 80)', color: 'oklch(40% 0.14 75)', phone: '+880 1677-456789', num: '১৫৫' },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.1s', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseOut={e => (e.currentTarget.style.background = '')}
                      onClick={() => { setSelectedMember(m.name); setMemberSearch(m.name); setShowMemberResults(false); }}>
                      <div className="rp2-avatar" style={{ background: m.bg, color: m.color }}>{m.init}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{m.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{m.phone} · সদস্য নং: {m.num}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedMember && (
                <div style={{ marginTop: 8, padding: '11px 14px', background: 'var(--success-bg)', border: '1px solid oklch(75% 0.12 145)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l4 4 8-8" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>{selectedMember}</span>
                  <span style={{ fontSize: 12, color: 'var(--success)', opacity: 0.7 }}>নির্বাচিত হয়েছে</span>
                </div>
              )}
            </div>

            <div className="rp2-form-group">
              <label className="rp2-form-label">ভূমিকা নির্বাচন <span>*</span></label>
              <select className="rp2-input" style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }} value={adminRole} onChange={e => setAdminRole(e.target.value)}>
                <option value="">— ভূমিকা বাছুন —</option>
                <option value="manager">ম্যানেজার</option>
                <option value="data-entry">ডেটা এন্ট্রি</option>
              </select>
              <div className="rp2-form-hint">ভূমিকা অনুযায়ী ডিফল্ট পারমিশন স্বয়ংক্রিয়ভাবে নির্ধারিত হবে</div>
            </div>

            <div className="rp2-form-group" style={{ marginBottom: 0 }}>
              <label className="rp2-form-label">অতিরিক্ত নোট</label>
              <textarea className="rp2-input" style={{ resize: 'vertical', minHeight: 80 }} placeholder="কোনো বিশেষ নির্দেশনা বা মন্তব্য থাকলে লিখুন..." value={adminNote} onChange={e => setAdminNote(e.target.value)}></textarea>
            </div>
          </div>
          <div className="rp2-modal-footer">
            <button className="rp2-btn rp2-btn-ghost" onClick={() => setShowNewAdminModal(false)}>বাতিল</button>
            <button className="rp2-btn rp2-btn-primary" onClick={() => {
              if (!selectedMember) { showToast('সদস্য নির্বাচন করুন।'); return; }
              if (!adminRole) { showToast('ভূমিকা নির্বাচন করুন।'); return; }
              const label = adminRole === 'manager' ? 'ম্যানেজার' : 'ডেটা এন্ট্রি';
              showToast(`${selectedMember} — ${label} হিসেবে যোগ হয়েছেন।`);
              setShowNewAdminModal(false);
              setAdminRole('');
              setAdminNote('');
              setMemberSearch('');
              setSelectedMember('');
              setShowMemberResults(true);
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              অ্যাডমিন যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`rp2-toast${toast ? ' show' : ''}`}>{toast}</div>
    </>
  );
}
