'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/user/dashboard',     label: 'হোম',      icon: HomeIcon },
  { href: '/user/donations',     label: 'দান',       icon: DonateIcon },
  { href: '/user/savings',       label: 'সঞ্চয়',    icon: SavingsIcon },
  { href: '/user/transactions',  label: 'লেনদেন',   icon: TransactionIcon },
  { href: '/user/profile',       label: 'প্রোফাইল', icon: ProfileIcon },
];

export function UserBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} className={`bn-item ${active ? 'active' : ''}`}>
            <item.icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return <svg viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>;
}
function DonateIcon() {
  return <svg viewBox="0 0 22 22" fill="none"><path d="M11 19C11 19 3 14 3 8.5a4.5 4.5 0 019-0 4.5 4.5 0 019 0C21 14 11 19 11 19z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SavingsIcon() {
  return <svg viewBox="0 0 22 22" fill="none"><path d="M18 9.5a7 7 0 11-14 0c0-1.5.5-3 1.5-4M11 2v3M15.5 4.5L13.5 6.5M19 8.5l-2 .5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 13h8M7 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function TransactionIcon() {
  return <svg viewBox="0 0 22 22" fill="none"><path d="M3 7h16M5 11l-2 2 2 2M17 15l2-2-2-2M7 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ProfileIcon() {
  return <svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 19c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
