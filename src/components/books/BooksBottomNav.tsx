'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookMarked, BookOpen, LayoutDashboard, MessagesSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';

export function BooksBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return null;

  const items = [
    { href: isAdmin ? '/admin/dashboard' : '/user/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { href: '/books', label: 'বইঘর', icon: BookOpen },
    { href: '/books/my', label: 'আমার বই', icon: BookMarked },
    { href: '/books/requests', label: 'অনুরোধ', icon: MessagesSquare },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[var(--bottomnav-h)] grid-cols-4 border-t border-border bg-white/95 backdrop-blur md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition',
              active ? 'text-brand' : 'text-muted',
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}