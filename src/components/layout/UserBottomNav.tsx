'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { USER_BOTTOM_NAV } from '@/components/layout/config/navigation';
import { cn } from '@/lib/utils/cn';

export function UserBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[var(--bottomnav-h)] grid-cols-5 border-t border-border bg-white/95 backdrop-blur md:hidden">
      {USER_BOTTOM_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition',
              active ? 'text-brand' : 'text-muted',
            )}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
