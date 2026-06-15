'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/user/dashboard',    label: 'ড্যাশবোর্ড',    section: 'মূল' },
  { href: '/user/donations',    label: 'দান করুন',       section: 'আর্থিক' },
  { href: '/user/savings',      label: 'সঞ্চয়',         section: 'আর্থিক' },
  { href: '/user/loan',         label: 'ঋণ',             section: 'আর্থিক' },
  { href: '/user/transactions', label: 'লেনদেন',         section: 'আর্থিক' },
  { href: '/user/categories',   label: 'খাতসূচি',       section: 'তথ্য' },
  { href: '/user/expenses',     label: 'খরচের হিসাব',   section: 'তথ্য' },
  { href: '/user/comments',     label: 'মন্তব্য',       section: 'তথ্য' },
  { href: '/user/profile',      label: 'প্রোফাইল',      section: 'অ্যাকাউন্ট' },
];

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sections = [...new Set(NAV_ITEMS.map(i => i.section))];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid oklch(100% 0 0 / 0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)', color: '#fff', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px oklch(50% 0.26 354 / 0.40)' }}>
              ই
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>ইনতিফাদাহ</div>
              <div style={{ fontSize: 10, color: 'oklch(100% 0 0 / 0.45)', letterSpacing: '0.02em', marginTop: 1 }}>কর্যে হাসানাঃ</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid oklch(100% 0 0 / 0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand) 0%, oklch(60% 0.20 354) 100%)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid oklch(100% 0 0 / 0.12)' }}>
            {user?.initials ?? 'র'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(100% 0 0 / 0.90)', lineHeight: 1.3 }}>{user?.name ?? 'রহিমা খাতুন'}</div>
            <div style={{ fontSize: 11, color: 'oklch(100% 0 0 / 0.40)', marginTop: 1 }}>সাধারণ সদস্য</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {sections.map(section => (
            <div key={section}>
              <div style={{ padding: '14px 20px 6px', fontSize: 10, fontWeight: 600, color: 'oklch(100% 0 0 / 0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {section}
              </div>
              {NAV_ITEMS.filter(i => i.section === section).map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 20px',
                      color: active ? '#fff' : 'oklch(100% 0 0 / 0.55)',
                      textDecoration: 'none', fontSize: 13.5, fontWeight: active ? 600 : 500,
                      background: active ? 'oklch(100% 0 0 / 0.08)' : 'transparent',
                      borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid oklch(100% 0 0 / 0.07)' }}>
          <div style={{ fontSize: 10, color: 'oklch(100% 0 0 / 0.22)', textAlign: 'center' }}>
            ইনতিফাদাহ — কর্যে হাসানাঃ
          </div>
        </div>
      </aside>
    </>
  );
}
