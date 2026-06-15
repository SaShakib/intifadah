'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loginAs, setLoginAs] = useState<'admin' | 'user' | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (role: 'admin' | 'user') => {
    setLoginAs(role);
    setLoading(true);
    setTimeout(() => {
      login(role);
      router.push(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    }, 1200);
  };

  return (
    <div className="login-wrap" style={{ display: 'grid', gridTemplateColumns: 'var(--login-cols, 1fr 1fr)', minHeight: '100vh' }}>
      <style>{`@media (max-width: 680px){.login-wrap{--login-cols:1fr}.login-brand{padding:28px 24px!important;min-height:160px;justify-content:flex-start!important}.login-form-side-inner{padding:28px 20px!important;align-items:flex-start!important}}`}</style>

      {/* LEFT — Brand Panel */}
      <div className="login-brand" style={{
        background: 'linear-gradient(160deg, oklch(10% 0.01 55) 0%, oklch(16% 0.04 354) 55%, oklch(28% 0.14 354) 100%)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
          <circle cx="80%" cy="15%" r="300" fill="white" fillOpacity="0.04"/>
          <circle cx="10%" cy="80%" r="200" fill="white" fillOpacity="0.05"/>
          <circle cx="90%" cy="90%" r="120" fill="white" fillOpacity="0.06"/>
          <circle cx="30%" cy="20%" r="80"  fill="white" fillOpacity="0.05"/>
          <circle cx="55%" cy="55%" r="180" fill="white" fillOpacity="0.03"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ width: 52, height: 52, background: 'oklch(70% 0.18 55 / 0.25)', border: '1.5px solid oklch(70% 0.18 55 / 0.5)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'oklch(70% 0.18 55)', marginBottom: 20 }}>
            ই
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>ইনতিফাদাহ</h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 28 }}>কর্যে হাসানাঃ</p>

          <span style={{ display: 'inline-block', background: 'oklch(50% 0.26 354 / 0.3)', border: '1px solid oklch(50% 0.26 354 / 0.5)', color: '#fff', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', marginBottom: 36 }}>
            দান • সঞ্চয় • ঋণ
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'ভরসাযোগ্য আর্থিক ব্যবস্থাপনা',
              'স্বচ্ছ লেনদেনের হিসাব',
              'সহজ ঋণ ও সঞ্চয় পরিচালনা',
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                  <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              ইনতিফাদাহ একটি সুদমুক্ত সামাজিক<br/>আর্থিক সহযোগিতা প্ল্যাটফর্ম।
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'oklch(99% 0.004 354)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>স্বাগতম! 👋</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 14 }}>আপনার অ্যাকাউন্টে লগইন করুন</p>

          <form onSubmit={e => { e.preventDefault(); handleLogin('user'); }} noValidate>
            {/* Identifier */}
            <div className="form-group">
              <label className="form-label" htmlFor="identifier">মোবাইল নম্বর বা ইমেইল</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="1.5" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <circle cx="8" cy="11.5" r="0.8" fill="currentColor"/>
                    <path d="M6.5 4h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input id="identifier" type="text" className="input" placeholder="01XXXXXXXXX অথবা email@example.com" defaultValue="01711-234567" style={{ paddingLeft: 38 }} dir="ltr" />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>পাসওয়ার্ড</label>
                <a href="#" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>পাসওয়ার্ড ভুলে গেছেন?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPw ? 'text' : 'password'} className="input" placeholder="••••••••" defaultValue="demo1234" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, display: 'flex', alignItems: 'center' }} aria-label="পাসওয়ার্ড দেখুন">
                  {showPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px 18px', fontSize: 15, fontWeight: 600, marginTop: 8, opacity: loading ? 0.85 : 1 }}>
              {loading && loginAs === 'user' ? (
                <><span className="spinner" />লগইন হচ্ছে...</>
              ) : 'লগইন করুন (সদস্য)'}
            </button>
          </form>

          <div className="divider">অথবা ডেমো হিসেবে দেখুন</div>

          {/* Quick access demo buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => handleLogin('admin')}
              disabled={loading}
              className="btn btn-ghost"
              style={{ width: '100%', padding: '12px 18px', justifyContent: 'center', gap: 8 }}
            >
              {loading && loginAs === 'admin' ? <><span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--fg)' }} />লোড হচ্ছে...</> : (
                <>
                  <AdminShieldIcon />
                  অ্যাডমিন হিসেবে দেখুন
                </>
              )}
            </button>

            <button
              onClick={() => handleLogin('user')}
              disabled={loading}
              className="btn btn-ghost"
              style={{ width: '100%', padding: '12px 18px', justifyContent: 'center', gap: 8 }}
            >
              {loading && loginAs === 'user' ? <><span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--fg)' }} />লোড হচ্ছে...</> : (
                <>
                  <UserIcon />
                  সদস্য হিসেবে দেখুন
                </>
              )}
            </button>
          </div>

          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
            এটি একটি ডেমো অ্যাপ — আসল ডেটা নয়
          </p>
        </div>
      </div>
    </div>
  );
}

function EyeOpenIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 9C2.5 5.5 5.5 3.5 9 3.5S15.5 5.5 17 9c-1.5 3.5-4.5 5.5-8 5.5S2.5 12.5 1 9z" stroke="currentColor" strokeWidth="1.4"/><circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
function EyeClosedIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M7.5 7.7A2.5 2.5 0 0011.3 11.5M5 5.2C3.1 6.3 1.8 7.6 1 9c1.5 3.5 4.5 5.5 8 5.5 1.4 0 2.8-.3 4-1M13 12.8C14.9 11.7 16.2 10.4 17 9c-1.5-3.5-4.5-5.5-8-5.5-.5 0-1 0-1.5.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function AdminShieldIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.5 2.5 6.2 6 7 3.5-.8 6-3.5 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 8.5l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 13.5c0-2.761 2.239-5 5.5-5s5.5 2.239 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
