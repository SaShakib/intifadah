'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type TabName = 'personal' | 'security' | 'notifications';

interface Session {
  id: number;
  icon: string;
  device: string;
  location: string;
  current: boolean;
  opacity?: number;
}

export default function ProfilePage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabName>('personal');

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal form
  const [name, setName] = useState('রহিম উদ্দিন');
  const [email, setEmail] = useState('rahim@example.com');
  const [address, setAddress] = useState('ওয়ার্ড ৩, কামালপুর, কুমিল্লা সদর, কুমিল্লা');
  const [ward, setWard] = useState('3');
  const [district, setDistrict] = useState('comilla');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [photoFileName, setPhotoFileName] = useState('বর্তমান ছবি');
  const [personalSaving, setPersonalSaving] = useState(false);

  // Security form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [strengthPct, setStrengthPct] = useState('0%');
  const [strengthColor, setStrengthColor] = useState('');
  const [strengthLabel, setStrengthLabel] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, icon: '📱', device: 'Android · Chrome', location: 'ঢাকা, বাংলাদেশ · এখনই সক্রিয়', current: true },
    { id: 2, icon: '💻', device: 'Windows · Firefox', location: 'কুমিল্লা, বাংলাদেশ · ২ দিন আগে', current: false, opacity: 0.70 },
    { id: 3, icon: '📲', device: 'iPhone · Safari', location: 'চট্টগ্রাম, বাংলাদেশ · ৫ দিন আগে', current: false, opacity: 0.65 },
  ]);

  // Notification toggles
  const [notifToggles, setNotifToggles] = useState({
    donation: true,
    savings: true,
    loan: true,
    installment: true,
    category: false,
    report: true,
  });

  // Deactivate modal
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateInput, setDeactivateInput] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const toastRef = useRef(0);

  function showToast(message: string, type = 'success') {
    const id = ++toastRef.current;
    setToasts(prev => [...prev, { id, msg: message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3700);
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('ছবির আকার সর্বোচ্চ ২ MB হতে হবে', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target?.result as string);
      setPhotoFileName(file.name);
      showToast('ছবি নির্বাচন করা হয়েছে। সংরক্ষণ করতে "তথ্য সংরক্ষণ করুন" চাপুন', 'success');
    };
    reader.readAsDataURL(file);
  }

  function checkStrength(pw: string) {
    if (!pw.length) { setStrengthPct('0%'); setStrengthLabel(''); setStrengthColor(''); return; }
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) || /[০-৯]/.test(pw)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    const levels = [
      { pct: '20%',  color: 'oklch(52% 0.18 25)',   text: 'দুর্বল' },
      { pct: '45%',  color: 'oklch(52% 0.18 25)',   text: 'দুর্বল' },
      { pct: '65%',  color: 'oklch(55% 0.14 75)',   text: 'মাঝামাঝি' },
      { pct: '85%',  color: 'oklch(44% 0.14 145)',  text: 'শক্তিশালী' },
      { pct: '100%', color: 'oklch(44% 0.14 145)',  text: 'শক্তিশালী' },
    ];
    const lvl = levels[Math.min(score, levels.length - 1)];
    setStrengthPct(lvl.pct);
    setStrengthColor(lvl.color);
    setStrengthLabel(lvl.text);
  }

  function submitPersonalForm(e: React.FormEvent) {
    e.preventDefault();
    setPersonalSaving(true);
    setTimeout(() => {
      setPersonalSaving(false);
      showToast('প্রোফাইল আপডেট হয়েছে ✓', 'success');
    }, 1200);
  }

  function submitPasswordForm(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { showToast('নতুন পাসওয়ার্ড মিলছে না', 'error'); return; }
    if (newPw.length < 8) { showToast('পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে', 'error'); return; }
    setPwSaving(true);
    setTimeout(() => {
      setPwSaving(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setStrengthPct('0%'); setStrengthLabel(''); setStrengthColor('');
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে ✓', 'success');
    }, 1100);
  }

  function revokeSession(id: number) {
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('সেশন বাতিল করা হয়েছে', 'success');
  }

  function saveNotifications() {
    showToast('বিজ্ঞপ্তি সেটিং সংরক্ষিত হয়েছে ✓', 'success');
  }

  function openDeactivate() {
    setDeactivateOpen(true);
    setDeactivateInput('');
  }

  function submitDeactivate() {
    setDeactivateOpen(false);
    showToast('একাউন্ট নিষ্ক্রিয়ের আবেদন পাঠানো হয়েছে। ম্যানেজার শীঘ্রই যোগাযোগ করবেন।', 'success');
  }

  const AccountActions = () => (
    <div style={{ borderTop: '1.5px dashed oklch(87% 0.008 354)', paddingTop: '24px', marginTop: '8px' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'oklch(55% 0.01 300)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
        অ্যাকাউন্ট পরিচালনা
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button className="pf-btn pf-btn-danger-outline" onClick={openDeactivate}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform="rotate(45 8 8)"/>
          </svg>
          একাউন্ট নিষ্ক্রিয় করার আবেদন করুন
        </button>
        <Link href="/login" className="pf-btn pf-btn-ghost">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          লগআউট
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        /* ══ PROFILE HERO ══ */
        .profile-hero {
          background: linear-gradient(135deg, oklch(50% 0.26 354) 0%, oklch(42% 0.24 354) 55%, oklch(38% 0.22 354) 100%);
          border-radius: 20px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.20);
        }
        .profile-hero::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: oklch(100% 0 0 / 0.05);
          pointer-events: none;
        }
        .profile-hero::after {
          content: '';
          position: absolute;
          bottom: -50px; left: 30%;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: oklch(100% 0 0 / 0.04);
          pointer-events: none;
        }
        .profile-hero-main {
          padding: 32px 32px 0;
          position: relative;
          z-index: 1;
        }
        .profile-hero-arabic {
          font-size: 11px;
          color: oklch(100% 0 0 / 0.45);
          letter-spacing: 0.06em;
          margin-bottom: 20px;
          direction: rtl;
          text-align: left;
        }
        .profile-hero-body {
          display: flex;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
        }
        .pf-avatar-wrap { position: relative; flex-shrink: 0; }
        .pf-avatar {
          width: 96px; height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, oklch(60% 0.20 354) 0%, oklch(100% 0 0 / 0.20) 100%);
          color: #fff;
          font-size: 30px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid oklch(100% 0 0 / 0.30);
          box-shadow: 0 4px 20px oklch(0% 0 0 / 0.25);
          cursor: pointer;
          transition: box-shadow 150ms, transform 150ms;
          position: relative;
          overflow: hidden;
        }
        .pf-avatar:hover { box-shadow: 0 6px 28px oklch(0% 0 0 / 0.35); transform: scale(1.03); }
        .pf-avatar img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; border-radius: 50%; }
        .pf-avatar-edit-badge {
          position: absolute;
          bottom: 2px; right: 2px;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: oklch(70% 0.18 55);
          color: #fff;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid oklch(50% 0.26 354);
          box-shadow: 0 2px 8px oklch(0% 0 0 / 0.2);
          cursor: pointer;
          transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pf-avatar-edit-badge:hover { transform: scale(1.15); }
        .profile-hero-info { flex: 1; min-width: 200px; padding-bottom: 4px; }
        .pf-name {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .pf-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .pf-joined {
          font-size: 12px;
          color: oklch(100% 0 0 / 0.60);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pf-hero-actions {
          margin-left: auto;
          padding-bottom: 4px;
          align-self: center;
        }
        /* Stats strip */
        .profile-stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid oklch(100% 0 0 / 0.12);
          margin-top: 24px;
          position: relative;
          z-index: 1;
        }
        .profile-stat {
          padding: 16px 20px;
          text-align: center;
          position: relative;
        }
        .profile-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: oklch(100% 0 0 / 0.12);
        }
        .profile-stat-value {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .profile-stat-label {
          font-size: 11px;
          color: oklch(100% 0 0 / 0.55);
          font-weight: 500;
        }

        /* ══ TAB NAV ══ */
        .pf-tab-nav {
          display: flex;
          gap: 4px;
          background: #ffffff;
          border: 1px solid oklch(91% 0.005 354);
          border-radius: 12px;
          padding: 5px;
          margin-bottom: 24px;
          box-shadow: 0 1px 6px oklch(50% 0.26 354 / 0.10);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pf-tab-nav::-webkit-scrollbar { display: none; }
        .pf-tab-btn {
          flex: 1;
          min-width: max-content;
          padding: 9px 18px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 500;
          color: oklch(55% 0.01 300);
          cursor: pointer;
          transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
          white-space: nowrap;
        }
        .pf-tab-btn:hover { color: oklch(12% 0.01 300); background: oklch(99% 0.003 354); }
        .pf-tab-btn.active {
          background: oklch(50% 0.26 354);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.30);
        }
        .pf-tab-panel { display: none; animation: pfFadeSlideIn 0.22s cubic-bezier(0, 0, 0.2, 1) both; }
        .pf-tab-panel.active { display: block; }
        @keyframes pfFadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ══ FORM CARD ══ */
        .pf-form-card {
          background: oklch(100% 0 0 / 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid oklch(100% 0 0 / 0.35);
          border-radius: 20px;
          box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.10), inset 0 1px 0 oklch(100% 0 0 / 0.5);
          padding: 28px;
          margin-bottom: 20px;
        }
        .pf-form-card-title {
          font-size: 15px;
          font-weight: 700;
          color: oklch(12% 0.01 300);
          letter-spacing: -0.01em;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid oklch(91% 0.005 354);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pf-form-card-title span { font-size: 18px; }

        /* ══ FORM ELEMENTS ══ */
        .pf-form-group { margin-bottom: 18px; }
        .pf-form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: oklch(35% 0.015 300);
          margin-bottom: 6px;
        }
        .pf-form-note {
          font-size: 11.5px;
          color: oklch(55% 0.01 300);
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pf-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .pf-input {
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
        .pf-input:focus { border-color: oklch(42% 0.24 354); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .pf-input:disabled, .pf-input[readonly] {
          background: oklch(96% 0.003 354);
          color: oklch(55% 0.01 300);
          cursor: not-allowed;
        }
        .pf-input::placeholder { color: oklch(55% 0.01 300); }
        select.pf-input { cursor: pointer; }
        textarea.pf-input { resize: vertical; min-height: 80px; }

        /* ══ RADIO ══ */
        .pf-radio-group { display: flex; gap: 12px; flex-wrap: wrap; }
        .pf-radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border: 1.5px solid oklch(91% 0.005 354);
          border-radius: 8px;
          cursor: pointer;
          transition: all 150ms;
          font-size: 13.5px;
          font-weight: 500;
          color: oklch(35% 0.015 300);
          user-select: none;
        }
        .pf-radio-option:hover { border-color: oklch(75% 0.14 354); background: oklch(97% 0.04 354); }
        .pf-radio-dot {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid oklch(91% 0.005 354);
          background: #ffffff;
          transition: all 150ms;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pf-radio-option.selected {
          border-color: oklch(50% 0.26 354);
          background: oklch(97% 0.04 354);
          color: oklch(42% 0.24 354);
          font-weight: 600;
        }
        .pf-radio-option.selected .pf-radio-dot {
          border-color: oklch(50% 0.26 354);
          background: oklch(50% 0.26 354);
        }
        .pf-radio-dot-inner {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #fff;
        }

        /* ══ PHOTO UPLOAD ══ */
        .pf-photo-upload-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: oklch(99% 0.003 354);
          border: 1px dashed oklch(91% 0.005 354);
          border-radius: 12px;
        }
        .pf-photo-preview {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, oklch(50% 0.26 354) 0%, oklch(60% 0.20 354) 100%);
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          border: 2px solid oklch(91% 0.005 354);
        }
        .pf-photo-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .pf-photo-upload-info { flex: 1; }
        .pf-photo-upload-name { font-size: 13px; font-weight: 600; color: oklch(35% 0.015 300); margin-bottom: 2px; }
        .pf-photo-upload-hint { font-size: 11.5px; color: oklch(55% 0.01 300); }

        /* ══ DIVIDER ══ */
        .pf-section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 20px;
        }
        .pf-section-divider-line { flex: 1; height: 1px; background: oklch(91% 0.005 354); }
        .pf-section-divider-label {
          font-size: 11.5px;
          font-weight: 600;
          color: oklch(55% 0.01 300);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ══ BUTTONS ══ */
        .pf-btn {
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
        .pf-btn:active { transform: scale(0.97); }
        .pf-btn-primary {
          background: oklch(50% 0.26 354);
          color: #fff;
          box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.35);
        }
        .pf-btn-primary:hover { background: oklch(42% 0.24 354); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); transform: translateY(-1px); }
        .pf-btn-ghost { background: transparent; color: oklch(35% 0.015 300); border: 1px solid oklch(91% 0.005 354); }
        .pf-btn-ghost:hover { background: oklch(99% 0.003 354); color: oklch(12% 0.01 300); }
        .pf-btn-ghost-white {
          background: oklch(100% 0 0 / 0.15);
          color: #fff;
          border: 1px solid oklch(100% 0 0 / 0.30);
        }
        .pf-btn-ghost-white:hover { background: oklch(100% 0 0 / 0.25); }
        .pf-btn-danger-outline {
          background: transparent;
          color: oklch(52% 0.18 25);
          border: 1.5px solid oklch(80% 0.10 25);
        }
        .pf-btn-danger-outline:hover { background: oklch(96% 0.05 25); }
        .pf-btn-sm { padding: 7px 14px; font-size: 12.5px; }
        .pf-btn-xs { padding: 5px 11px; font-size: 12px; }
        .pf-btn-full { width: 100%; }

        /* ══ BADGES ══ */
        .pf-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 9px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .pf-badge-success { background: oklch(95% 0.05 145); color: oklch(44% 0.14 145); }
        .pf-badge-warning { background: oklch(96% 0.06 80); color: oklch(55% 0.14 75); }
        .pf-badge-white   { background: oklch(100% 0 0 / 0.20); color: #fff; }

        /* ══ STRENGTH METER ══ */
        .pf-strength-meter { margin-top: 8px; }
        .pf-strength-bar-track {
          height: 4px;
          background: oklch(91% 0.005 354);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        .pf-strength-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.3s cubic-bezier(0, 0, 0.2, 1), background-color 0.3s;
        }
        .pf-strength-label {
          font-size: 11.5px;
          font-weight: 600;
          transition: color 0.3s;
        }

        /* ══ PASSWORD EYE ══ */
        .pf-pw-wrap { position: relative; }
        .pf-pw-wrap .pf-input { padding-right: 42px; }
        .pf-eye-toggle {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: oklch(55% 0.01 300);
          font-size: 16px;
          line-height: 1;
          padding: 4px;
          transition: color 150ms;
        }
        .pf-eye-toggle:hover { color: oklch(50% 0.26 354); }

        /* ══ SESSIONS ══ */
        .pf-session-list { display: flex; flex-direction: column; gap: 10px; }
        .pf-session-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: oklch(99% 0.003 354);
          border: 1px solid oklch(91% 0.005 354);
          transition: opacity 0.3s, transform 0.3s;
        }
        .pf-session-item.current {
          background: oklch(97% 0.04 354);
          border-color: oklch(82% 0.12 354);
        }
        .pf-session-icon {
          width: 38px; height: 38px;
          border-radius: 8px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          border: 1px solid oklch(91% 0.005 354);
        }
        .pf-session-info { flex: 1; }
        .pf-session-device {
          font-size: 13px;
          font-weight: 600;
          color: oklch(12% 0.01 300);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }
        .pf-session-meta { font-size: 12px; color: oklch(55% 0.01 300); }

        /* ══ TOGGLE SWITCHES ══ */
        .pf-notif-list { display: flex; flex-direction: column; gap: 2px; }
        .pf-notif-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid oklch(91% 0.005 354);
        }
        .pf-notif-item:last-child { border-bottom: none; }
        .pf-notif-item-info { flex: 1; }
        .pf-notif-item-label { font-size: 13.5px; font-weight: 600; color: oklch(12% 0.01 300); margin-bottom: 2px; }
        .pf-notif-item-desc { font-size: 12px; color: oklch(55% 0.01 300); }
        .pf-toggle-switch {
          position: relative;
          width: 44px; height: 24px;
          flex-shrink: 0;
          cursor: pointer;
        }
        .pf-toggle-track {
          position: absolute;
          inset: 0;
          border-radius: 99px;
          background: oklch(85% 0.005 300);
          transition: background 150ms cubic-bezier(0, 0, 0.2, 1);
          border: 1.5px solid oklch(80% 0.01 300);
        }
        .pf-toggle-thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px oklch(0% 0 0 / 0.20);
          transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pf-toggle-switch.on .pf-toggle-track {
          background: oklch(50% 0.26 354);
          border-color: oklch(42% 0.24 354);
        }
        .pf-toggle-switch.on .pf-toggle-thumb {
          transform: translateX(20px);
        }

        /* ══ MODAL ══ */
        .pf-modal-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: oklch(0% 0 0 / 0.55);
          z-index: 500;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .pf-modal-backdrop.open { display: flex; }
        .pf-modal {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 60px oklch(0% 0 0 / 0.30);
          animation: pfModalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes pfModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .pf-modal-icon {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: oklch(96% 0.05 25);
          color: oklch(52% 0.18 25);
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .pf-modal-title {
          font-size: 17px;
          font-weight: 700;
          color: oklch(12% 0.01 300);
          text-align: center;
          margin-bottom: 8px;
        }
        .pf-modal-desc {
          font-size: 13px;
          color: oklch(35% 0.015 300);
          text-align: center;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .pf-modal-confirm-hint {
          font-size: 12.5px;
          color: oklch(35% 0.015 300);
          margin-bottom: 8px;
        }
        .pf-modal-confirm-hint strong { color: oklch(52% 0.18 25); }
        .pf-modal-actions { display: flex; gap: 10px; }
        .pf-modal-actions .pf-btn { flex: 1; }

        /* ══ TOAST ══ */
        .pf-toast-container {
          position: fixed;
          bottom: 84px;
          right: 24px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }
        .pf-toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          background: #ffffff;
          border: 1px solid oklch(91% 0.005 354);
          border-radius: 12px;
          box-shadow: 0 8px 24px oklch(0% 0 0 / 0.14);
          font-size: 13.5px;
          font-weight: 600;
          min-width: 260px;
          max-width: 340px;
          animation: pfToastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          pointer-events: auto;
        }
        .pf-toast.success { border-left: 3px solid oklch(44% 0.14 145); }
        .pf-toast.error   { border-left: 3px solid oklch(52% 0.18 25); }
        .pf-toast-icon {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .pf-toast.success .pf-toast-icon { background: oklch(95% 0.05 145); color: oklch(44% 0.14 145); }
        .pf-toast.error   .pf-toast-icon { background: oklch(96% 0.05 25); color: oklch(52% 0.18 25); }
        .pf-toast-text { flex: 1; color: oklch(12% 0.01 300); }
        @keyframes pfToastIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ══ CALLOUT ══ */
        .pf-callout {
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 13px;
        }
        .pf-callout-warning {
          background: oklch(96% 0.06 80);
          border: 1px solid oklch(86% 0.09 80);
          color: oklch(40% 0.10 75);
        }
        .pf-callout-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

        /* ══ SPIN ══ */
        @keyframes pfSpin { to { transform: rotate(360deg); } }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 640px) {
          .profile-hero-main { padding: 24px 20px 0; }
          .profile-hero-body { gap: 16px; }
          .pf-name { font-size: 20px; }
          .pf-avatar { width: 76px; height: 76px; font-size: 24px; }
          .pf-avatar-edit-badge { width: 24px; height: 24px; font-size: 10px; }
          .profile-stats-strip { grid-template-columns: repeat(2, 1fr); }
          .profile-stat:nth-child(2)::after { display: none; }
          .profile-stat:nth-child(3)::after { display: none; }
          .profile-stat { padding: 12px 14px; }
          .profile-stat-value { font-size: 15px; }
          .pf-hero-actions { display: none; }
          .pf-form-row { grid-template-columns: 1fr; }
          .pf-form-card { padding: 20px; }
          .pf-modal { padding: 24px 20px; }
        }
      `}</style>

      {/* Toast Container */}
      <div className="pf-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`pf-toast ${t.type}`}>
            <div className="pf-toast-icon">{t.type === 'success' ? '✓' : '✕'}</div>
            <div className="pf-toast-text">{t.msg}</div>
          </div>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      {/* ══ PROFILE HERO ══ */}
      <div className="profile-hero">
        <div className="profile-hero-main">
          <div className="profile-hero-arabic">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
          <div className="profile-hero-body">
            {/* Avatar */}
            <div className="pf-avatar-wrap">
              <div className="pf-avatar" onClick={() => fileInputRef.current?.click()} title="ছবি পরিবর্তন করতে ক্লিক করুন">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="প্রোফাইল ছবি" />
                ) : (
                  <span>র.উ</span>
                )}
              </div>
              <div className="pf-avatar-edit-badge" onClick={() => fileInputRef.current?.click()} title="ছবি পরিবর্তন করুন">✏️</div>
            </div>
            {/* Info */}
            <div className="profile-hero-info">
              <div className="pf-name">রহিম উদ্দিন</div>
              <div className="pf-meta">
                <span className="pf-badge pf-badge-white">সাধারণ সদস্য</span>
                <span className="pf-badge" style={{ background: 'oklch(100% 0 0 / 0.15)', color: 'oklch(100% 0 0 / 0.80)', fontSize: '11px' }}>#০০৫</span>
              </div>
              <div className="pf-joined">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 1.5V4M11 1.5V4M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                যোগদান: ১৫ জানুয়ারি ২০২৫
              </div>
            </div>
            {/* Edit button */}
            <div className="pf-hero-actions">
              <button className="pf-btn pf-btn-ghost-white pf-btn-sm" onClick={() => setActiveTab('personal')}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M11.5 2.5a1.5 1.5 0 0 1 2.12 2.12L5.5 12.74l-3 .76.76-3 8.24-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                প্রোফাইল সম্পাদনা
              </button>
            </div>
          </div>
        </div>
        {/* Stats strip */}
        <div className="profile-stats-strip">
          <div className="profile-stat">
            <div className="profile-stat-value">৳৩,২৫০</div>
            <div className="profile-stat-label">মোট দান</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">৳১২,৫০০</div>
            <div className="profile-stat-label">মোট সঞ্চয়</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">৳৮,০০০</div>
            <div className="profile-stat-label">ঋণ</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">১৭ মাস</div>
            <div className="profile-stat-label">যোগদান</div>
          </div>
        </div>
      </div>

      {/* ══ TAB NAV ══ */}
      <div className="pf-tab-nav" role="tablist">
        <button
          className={`pf-tab-btn${activeTab === 'personal' ? ' active' : ''}`}
          onClick={() => setActiveTab('personal')}
          role="tab"
          aria-selected={activeTab === 'personal'}
        >
          👤 ব্যক্তিগত তথ্য
        </button>
        <button
          className={`pf-tab-btn${activeTab === 'security' ? ' active' : ''}`}
          onClick={() => setActiveTab('security')}
          role="tab"
          aria-selected={activeTab === 'security'}
        >
          🔒 নিরাপত্তা
        </button>
        <button
          className={`pf-tab-btn${activeTab === 'notifications' ? ' active' : ''}`}
          onClick={() => setActiveTab('notifications')}
          role="tab"
          aria-selected={activeTab === 'notifications'}
        >
          🔔 বিজ্ঞপ্তি সেটিং
        </button>
      </div>

      {/* ══ TAB 1: Personal ══ */}
      <div className={`pf-tab-panel${activeTab === 'personal' ? ' active' : ''}`} role="tabpanel">
        <form className="pf-form-card" onSubmit={submitPersonalForm}>
          <div className="pf-form-card-title">
            <span>📋</span> ব্যক্তিগত তথ্য সম্পাদনা
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="inputName">পূর্ণ নাম</label>
            <input type="text" id="inputName" className="pf-input" value={name} onChange={e => setName(e.target.value)} placeholder="আপনার পূর্ণ নাম" required />
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="inputMobile">মোবাইল নম্বর</label>
            <input type="tel" id="inputMobile" className="pf-input" defaultValue="০১৭১২-৩৪৫৬৭৮" readOnly />
            <div className="pf-form-note">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              পরিবর্তনের জন্য ম্যানেজারকে জানান
            </div>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="inputEmail">ইমেইল ঠিকানা</label>
            <input type="email" id="inputEmail" className="pf-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="আপনার ইমেইল" />
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">লিঙ্গ</label>
            <div className="pf-radio-group">
              <label className={`pf-radio-option${gender === 'male' ? ' selected' : ''}`} onClick={() => setGender('male')}>
                <div className="pf-radio-dot">
                  {gender === 'male' && <div className="pf-radio-dot-inner" />}
                </div>
                পুরুষ
              </label>
              <label className={`pf-radio-option${gender === 'female' ? ' selected' : ''}`} onClick={() => setGender('female')}>
                <div className="pf-radio-dot">
                  {gender === 'female' && <div className="pf-radio-dot-inner" />}
                </div>
                মহিলা
              </label>
            </div>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="inputAddress">ঠিকানা</label>
            <textarea id="inputAddress" className="pf-input" rows={3} placeholder="আপনার সম্পূর্ণ ঠিকানা" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="pf-form-row">
            <div className="pf-form-group" style={{ marginBottom: 0 }}>
              <label className="pf-form-label" htmlFor="inputWard">ওয়ার্ড নম্বর</label>
              <input type="number" id="inputWard" className="pf-input" value={ward} onChange={e => setWard(e.target.value)} min={1} max={50} placeholder="ওয়ার্ড" />
            </div>
            <div className="pf-form-group" style={{ marginBottom: 0 }}>
              <label className="pf-form-label" htmlFor="inputDistrict">জেলা</label>
              <select id="inputDistrict" className="pf-input" value={district} onChange={e => setDistrict(e.target.value)}>
                <option value="">জেলা বেছে নিন</option>
                <option value="comilla">কুমিল্লা</option>
                <option value="dhaka">ঢাকা</option>
                <option value="chittagong">চট্টগ্রাম</option>
                <option value="sylhet">সিলেট</option>
                <option value="rajshahi">রাজশাহী</option>
                <option value="khulna">খুলনা</option>
                <option value="barishal">বরিশাল</option>
                <option value="rangpur">রংপুর</option>
                <option value="mymensingh">ময়মনসিংহ</option>
                <option value="narayanganj">নারায়ণগঞ্জ</option>
                <option value="gazipur">গাজীপুর</option>
                <option value="cox">কক্সবাজার</option>
              </select>
            </div>
          </div>

          {/* Photo upload */}
          <div className="pf-section-divider">
            <div className="pf-section-divider-line" />
            <div className="pf-section-divider-label">প্রোফাইল ছবি</div>
            <div className="pf-section-divider-line" />
          </div>

          <div className="pf-form-group">
            <div className="pf-photo-upload-row">
              <div className="pf-photo-preview">
                {avatarSrc ? <img src={avatarSrc} alt="প্রোফাইল ছবি" /> : <span>র.উ</span>}
              </div>
              <div className="pf-photo-upload-info">
                <div className="pf-photo-upload-name">{photoFileName}</div>
                <div className="pf-photo-upload-hint">JPG, PNG বা GIF · সর্বোচ্চ ২ MB</div>
              </div>
              <button type="button" className="pf-btn pf-btn-ghost pf-btn-sm" onClick={() => fileInputRef.current?.click()}>
                পরিবর্তন করুন
              </button>
            </div>
          </div>

          <button type="submit" className="pf-btn pf-btn-primary pf-btn-full" style={{ marginTop: '4px' }} disabled={personalSaving}>
            {personalSaving ? (
              <span style={{ display: 'inline-block', animation: 'pfSpin 0.7s linear infinite' }}>⏳</span>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M13 5L6.5 11.5L3 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {personalSaving ? ' সংরক্ষণ হচ্ছে…' : 'তথ্য সংরক্ষণ করুন'}
          </button>
        </form>

        <AccountActions />
      </div>

      {/* ══ TAB 2: Security ══ */}
      <div className={`pf-tab-panel${activeTab === 'security' ? ' active' : ''}`} role="tabpanel">

        {/* Change Password */}
        <form className="pf-form-card" onSubmit={submitPasswordForm}>
          <div className="pf-form-card-title">
            <span>🔑</span> পাসওয়ার্ড পরিবর্তন
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="inputCurrentPw">বর্তমান পাসওয়ার্ড</label>
            <div className="pf-pw-wrap">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                id="inputCurrentPw"
                className="pf-input"
                placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                required
              />
              <button type="button" className="pf-eye-toggle" onClick={() => setShowCurrentPw(p => !p)} aria-label="দেখান">
                {showCurrentPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="inputNewPw">নতুন পাসওয়ার্ড</label>
            <div className="pf-pw-wrap">
              <input
                type={showNewPw ? 'text' : 'password'}
                id="inputNewPw"
                className="pf-input"
                placeholder="ন্যূনতম ৮ অক্ষর"
                minLength={8}
                value={newPw}
                onChange={e => { setNewPw(e.target.value); checkStrength(e.target.value); }}
                required
              />
              <button type="button" className="pf-eye-toggle" onClick={() => setShowNewPw(p => !p)} aria-label="দেখান">
                {showNewPw ? '🙈' : '👁'}
              </button>
            </div>
            {/* Strength meter */}
            {newPw.length > 0 && (
              <div className="pf-strength-meter">
                <div className="pf-strength-bar-track">
                  <div className="pf-strength-bar-fill" style={{ width: strengthPct, backgroundColor: strengthColor }} />
                </div>
                <div className="pf-strength-label" style={{ color: strengthColor }}>{strengthLabel}</div>
              </div>
            )}
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="inputConfirmPw">পাসওয়ার্ড নিশ্চিত করুন</label>
            <div className="pf-pw-wrap">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                id="inputConfirmPw"
                className="pf-input"
                placeholder="পাসওয়ার্ড আবার লিখুন"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
              />
              <button type="button" className="pf-eye-toggle" onClick={() => setShowConfirmPw(p => !p)} aria-label="দেখান">
                {showConfirmPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="pf-btn pf-btn-primary pf-btn-full" disabled={pwSaving}>
            {pwSaving ? (
              <span style={{ display: 'inline-block', animation: 'pfSpin 0.7s linear infinite' }}>⏳</span>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="white" strokeWidth="1.5"/>
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
            {pwSaving ? ' পরিবর্তন হচ্ছে…' : 'পাসওয়ার্ড পরিবর্তন করুন'}
          </button>
        </form>

        {/* Active Sessions */}
        <div className="pf-form-card">
          <div className="pf-form-card-title">
            <span>📱</span> সক্রিয় সেশনসমূহ
          </div>
          <div className="pf-session-list">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`pf-session-item${session.current ? ' current' : ''}`}
                style={session.opacity ? { opacity: session.opacity } : undefined}
              >
                <div className="pf-session-icon">{session.icon}</div>
                <div className="pf-session-info">
                  <div className="pf-session-device">
                    {session.device}
                    {session.current && (
                      <span className="pf-badge pf-badge-success" style={{ fontSize: '10px', padding: '2px 7px' }}>বর্তমান</span>
                    )}
                  </div>
                  <div className="pf-session-meta">{session.location}</div>
                </div>
                {!session.current && (
                  <button className="pf-btn pf-btn-ghost pf-btn-xs" onClick={() => revokeSession(session.id)}>
                    সেশন বাতিল
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px' }}>
            <div className="pf-callout pf-callout-warning">
              <span className="pf-callout-icon">⚠️</span>
              <div>অপরিচিত ডিভাইস দেখলে তাৎক্ষণিক সেশন বাতিল করুন এবং পাসওয়ার্ড পরিবর্তন করুন।</div>
            </div>
          </div>
        </div>

        <AccountActions />
      </div>

      {/* ══ TAB 3: Notifications ══ */}
      <div className={`pf-tab-panel${activeTab === 'notifications' ? ' active' : ''}`} role="tabpanel">
        <div className="pf-form-card">
          <div className="pf-form-card-title">
            <span>🔔</span> বিজ্ঞপ্তি পছন্দসমূহ
          </div>

          <div className="pf-notif-list">
            {([
              { key: 'donation', label: 'দানের অনুমোদন হলে জানান', desc: 'দান গৃহীত হলে SMS ও অ্যাপ নোটিফিকেশন পাঠান' },
              { key: 'savings',  label: 'সঞ্চয়ের অনুমোদন হলে জানান', desc: 'সঞ্চয় জমা নিশ্চিত হলে জানান' },
              { key: 'loan',     label: 'ঋণের আপডেট জানান', desc: 'ঋণ অনুমোদন, বিতরণ ও পরিবর্তনের সংবাদ' },
              { key: 'installment', label: 'কিস্তির রিমাইন্ডার পাঠান', desc: 'ঋণ পরিশোধের তারিখের আগে স্মরণ করিয়ে দিন' },
              { key: 'category', label: 'নতুন খাত যোগ হলে জানান', desc: 'প্রশাসক নতুন খাত তৈরি করলে সংবাদ পান' },
              { key: 'report',   label: 'মাসিক রিপোর্ট পাঠান', desc: 'প্রতি মাসের শুরুতে আগের মাসের সারসংক্ষেপ' },
            ] as { key: keyof typeof notifToggles; label: string; desc: string }[]).map(item => (
              <div key={item.key} className="pf-notif-item">
                <div className="pf-notif-item-info">
                  <div className="pf-notif-item-label">{item.label}</div>
                  <div className="pf-notif-item-desc">{item.desc}</div>
                </div>
                <div
                  className={`pf-toggle-switch${notifToggles[item.key] ? ' on' : ''}`}
                  role="switch"
                  aria-checked={notifToggles[item.key]}
                  tabIndex={0}
                  onClick={() => setNotifToggles(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNotifToggles(prev => ({ ...prev, [item.key]: !prev[item.key] })); } }}
                >
                  <div className="pf-toggle-track" />
                  <div className="pf-toggle-thumb" />
                </div>
              </div>
            ))}
          </div>

          <button className="pf-btn pf-btn-primary pf-btn-full" style={{ marginTop: '20px' }} onClick={saveNotifications}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5L3 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            সেটিং সংরক্ষণ করুন
          </button>
        </div>

        <AccountActions />
      </div>

      {/* ══ DEACTIVATE MODAL ══ */}
      <div
        className={`pf-modal-backdrop${deactivateOpen ? ' open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setDeactivateOpen(false); }}
      >
        <div className="pf-modal" role="dialog" aria-modal="true" aria-labelledby="pfModalTitle">
          <div className="pf-modal-icon">⚠️</div>
          <div className="pf-modal-title" id="pfModalTitle">একাউন্ট নিষ্ক্রিয় করার আবেদন</div>
          <div className="pf-modal-desc">
            আপনার একাউন্ট নিষ্ক্রিয় করার জন্য আবেদন করতে চাইলে নিচে আপনার নাম লিখুন। ম্যানেজার অনুমোদনের পর একাউন্টটি স্থগিত হবে।
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div className="pf-modal-confirm-hint">নিশ্চিত করতে <strong>রহিম উদ্দিন</strong> লিখুন:</div>
            <input
              type="text"
              className="pf-input"
              placeholder="আপনার নাম লিখুন"
              value={deactivateInput}
              onChange={e => setDeactivateInput(e.target.value)}
              autoFocus
            />
          </div>
          <div className="pf-modal-actions">
            <button className="pf-btn pf-btn-ghost" onClick={() => setDeactivateOpen(false)}>বাতিল করুন</button>
            <button
              className="pf-btn pf-btn-primary"
              disabled={deactivateInput.trim() !== 'রহিম উদ্দিন'}
              onClick={submitDeactivate}
              style={{ background: 'oklch(52% 0.18 25)', boxShadow: '0 2px 8px oklch(52% 0.18 25 / 0.35)' }}
            >
              আবেদন করুন
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
