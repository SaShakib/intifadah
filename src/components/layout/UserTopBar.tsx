'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface UserTopBarProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
  notifCount?: number;
  showProfile?: boolean;
}

export function UserTopBar({ title, subtitle, onMenuToggle, notifCount = 2, showProfile = true }: UserTopBarProps) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger */}
        <button
          aria-label="মেনু"
          onClick={onMenuToggle}
          className="hide-desktop"
          style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-2)', flexShrink: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>{subtitle}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Date chip */}
        <span className="hide-mobile" style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, padding: '5px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 99 }}>
          ১৫ জুন ২০২৬
        </span>

        {/* Notification */}
        <button style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: 'var(--fg-2)' }} aria-label="বিজ্ঞপ্তি">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 016 6v3l1.5 2.5h-15L4 11V8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 15.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {notifCount > 0 && (
            <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--danger)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
              {notifCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        {showProfile && (
          <Link href="/user/profile" style={{ textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-mid), var(--brand))', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--brand-light)', transition: 'box-shadow 0.15s', cursor: 'pointer' }}>
              {user?.initials ?? 'র'}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
