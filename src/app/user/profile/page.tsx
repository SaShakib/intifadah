'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CURRENT_USER } from '@/lib/data/members';
import { useTheme } from '@/contexts/ThemeContext';
import { THEMES, COLOR_MODES } from '@/lib/themes';

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'সুপার অ্যাডমিন', manager: 'ম্যানেজার',
  accountant: 'হিসাবরক্ষক', user: 'সাধারণ সদস্য', org: 'সংস্থা',
};

export default function ProfilePage() {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [name, setName]       = useState(CURRENT_USER.name);
  const [phone, setPhone]     = useState(CURRENT_USER.phone);
  const [email, setEmail]     = useState(CURRENT_USER.email ?? '');
  const [address, setAddress] = useState(CURRENT_USER.address ?? '');
  const [gender, setGender]   = useState(CURRENT_USER.gender ?? 'male');
  const [saved, setSaved]     = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 540, margin: '0 auto' }}>
      {/* Profile header */}
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 700, margin: '0 auto 14px',
          boxShadow: '0 4px 16px var(--brand) / 0.3',
        }}>
          {CURRENT_USER.initials}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>{CURRENT_USER.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>সদস্য আইডি: {CURRENT_USER.memberId}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-brand">{ROLE_LABEL[CURRENT_USER.role] ?? CURRENT_USER.role}</span>
          <span className={`badge ${CURRENT_USER.isActive ? 'badge-success' : 'badge-danger'}`}>
            {CURRENT_USER.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </span>
          <span className="badge badge-muted">যোগদান: {CURRENT_USER.joinDate}</span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 18 }}>তথ্য সম্পাদনা করুন</div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">পূর্ণ নাম</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="আপনার নাম লিখুন" />
          </div>
          <div className="form-group">
            <label className="form-label">মোবাইল নম্বর</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">ইমেইল</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">ঠিকানা</label>
            <input className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="আপনার ঠিকানা লিখুন" />
          </div>
          <div className="form-group">
            <label className="form-label">লিঙ্গ</label>
            <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
              {[['male', 'পুরুষ'], ['female', 'মহিলা'], ['other', 'অন্যান্য']].map(([val, lbl]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--fg-2)' }}>
                  <input type="radio" name="gender" value={val} checked={gender === val} onChange={() => setGender(val as typeof gender)} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            {saved ? '✓ সংরক্ষিত হয়েছে' : 'সংরক্ষণ করুন'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>অ্যাকাউন্ট তথ্য</div>
        {[
          ['ভূমিকা', ROLE_LABEL[CURRENT_USER.role] ?? CURRENT_USER.role],
          ['সদস্য আইডি', CURRENT_USER.memberId],
          ['যোগদানের তারিখ', CURRENT_USER.joinDate],
          ['অ্যাকাউন্ট অবস্থা', CURRENT_USER.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Theme settings */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>থিম সেটিংস</div>
        <div style={{ marginBottom: 16 }}>
          <div className="form-label">রঙ নির্বাচন</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} style={{
                width: 36, height: 36, borderRadius: '50%', background: t.color, border: 'none',
                cursor: 'pointer', outline: theme === t.id ? `3px solid ${t.color}` : '3px solid transparent',
                outlineOffset: 2, transition: 'outline 0.15s',
              }} title={t.label} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            বর্তমান: {THEMES.find(t => t.id === theme)?.label ?? 'ডিফল্ট'}
          </div>
        </div>
        <div>
          <div className="form-label">ডিসপ্লে মোড</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {COLOR_MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} className={`btn btn-sm ${mode === m.id ? 'btn-primary' : 'btn-ghost'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin link */}
      <Link href="/admin/dashboard" className="btn btn-ghost btn-full" style={{ textAlign: 'center' }}>
        অ্যাডমিন প্যানেল দেখুন →
      </Link>
    </div>
  );
}
