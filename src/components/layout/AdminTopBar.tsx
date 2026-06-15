'use client';

import { useAuth } from '@/contexts/AuthContext';

interface AdminTopBarProps {
  title: string;
  onMenuToggle: () => void;
  notifCount?: number;
}

export function AdminTopBar({ title, onMenuToggle, notifCount = 3 }: AdminTopBarProps) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      {/* Hamburger (mobile only) */}
      <button
        aria-label="মেনু"
        onClick={onMenuToggle}
        className="hide-desktop"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-2)', display: 'flex', alignItems: 'center', padding: 4 }}
      >
        <HamburgerIcon />
      </button>

      <span style={{ fontWeight: 600, color: 'var(--fg)', fontSize: 15 }}>{title}</span>

      <div style={{ flex: 1 }} />

      {/* Search (desktop) */}
      <div className="hide-mobile" style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input type="search" className="input" placeholder="খুঁজুন..." style={{ width: 220, padding: '8px 12px 8px 30px', fontSize: 13 }} />
      </div>

      {/* Notification bell */}
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px 6px', display: 'flex', alignItems: 'center' }} aria-label="বিজ্ঞপ্তি">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2a6 6 0 016 6v3l1.5 2.5h-15L4 11V8a6 6 0 016-6z" stroke="var(--fg-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 15.5a2 2 0 004 0" stroke="var(--fg-2)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {notifCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: '#fff', fontSize: 10, borderRadius: 99, padding: '2px 5px', minWidth: 18, textAlign: 'center', lineHeight: 1.4 }}>
            {notifCount}
          </span>
        )}
      </button>

      {/* User avatar */}
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 8, transition: 'background 0.12s' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'oklch(85% 0.07 145)', color: 'oklch(35% 0.14 145)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
          {user?.initials ?? 'আ'}
        </div>
        <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)' }}>
          {user?.name?.split(' ')[0] ?? 'আবু বক্কর'}
        </span>
        <svg className="hide-mobile" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 5l4 4 4-4" stroke="var(--muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
