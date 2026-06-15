'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NAV_SECTIONS = [
  {
    label: 'মূল',
    items: [
      { href: '/admin/dashboard', label: 'ড্যাশবোর্ড', icon: DashboardIcon },
    ],
  },
  {
    label: 'আর্থিক',
    items: [
      { href: '/admin/fund-collection', label: 'ফান্ড / কালেকশন', icon: FundIcon },
      { href: '/admin/loans', label: 'ঋণ বিতরণ', icon: LoanIcon },
      { href: '/admin/loan-repayment', label: 'ঋণ ফেরত', icon: RepayIcon },
      { href: '/admin/categories', label: 'খাত পরিচালনা', icon: CategoryIcon },
    ],
  },
  {
    label: 'সদস্য',
    items: [
      { href: '/admin/members', label: 'সদস্য তালিকা', icon: MembersIcon },
      { href: '/admin/reports', label: 'প্রতিবেদন', icon: ReportIcon },
    ],
  },
  {
    label: 'প্রশাসন',
    items: [
      { href: '/admin/roles-permissions', label: 'ভূমিকা ও অনুমতি', icon: RoleIcon },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* Brand */}
        <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid oklch(100% 0 0 / 0.12)' }}>
          <div style={{ width: 38, height: 38, background: 'oklch(100% 0 0 / 0.18)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
            ই
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>ইনতিফাদাহ</div>
            <div style={{ fontSize: 11, color: 'oklch(100% 0 0 / 0.65)' }}>কর্যে হাসানাঃ</div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid oklch(100% 0 0 / 0.12)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'oklch(85% 0.07 145)', color: 'oklch(35% 0.14 145)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {user?.initials ?? 'আ'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name ?? 'আবু বক্কর সিদ্দিক'}</div>
            <div style={{ fontSize: 11, color: 'oklch(100% 0 0 / 0.65)' }}>ম্যানেজার</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div style={{ padding: '14px 16px 4px', fontSize: 10, fontWeight: 700, color: 'oklch(100% 0 0 / 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {section.label}
              </div>
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`sb-item ${active ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', margin: '1px 8px', borderRadius: 9, color: active ? '#fff' : 'oklch(100% 0 0 / 0.72)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', transition: 'all 0.12s', background: active ? 'oklch(100% 0 0 / 0.2)' : 'transparent' }}
                  >
                    <item.icon />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: 14, borderTop: '1px solid oklch(100% 0 0 / 0.12)' }}>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', width: '100%', background: 'none', border: 'none', borderRadius: 9, color: 'oklch(100% 0 0 / 0.55)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.12s' }}
          >
            <LogoutIcon />
            লগআউট
          </button>
        </div>

      </aside>
    </>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */
function DashboardIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
function FundIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 4.5V3.5a2.5 2.5 0 015 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M4.5 9.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function LoanIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function RepayIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CategoryIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4.5h12M2 8h8M2 11.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function MembersIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 13.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="12" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M14 13.5a3 3 0 00-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function ReportIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function RoleIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M12 9.5l.7.7 1.8-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10.5 11L14 8l-3.5-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
