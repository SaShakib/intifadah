'use client';

import Link from 'next/link';
import { BookMarked, BookOpen, BookOpenCheck, MessagesSquare, Plus } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';

export type BooksSection = 'store' | 'my' | 'requests' | 'plans';

function tabClass(active: boolean) {
  return active
    ? 'flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-2 py-1.5 text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60'
    : 'flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[11px] font-semibold text-fg-2 transition hover:bg-white hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60';
}

interface BooksHeaderProps {
  active?: BooksSection;
  myBookCount?: number;
  requestCount?: number;
  onAddBook: () => void;
}

export function BooksHeader({ active, myBookCount = 0, requestCount = 0, onAddBook }: BooksHeaderProps) {
  const { isAuthenticated } = useAuth();

  const tabs: { href: string; key: BooksSection; label: string; icon: typeof BookOpen; count?: number }[] = [
    { href: '/books', key: 'store', label: 'বইঘর', icon: BookOpen },
    { href: '/books/my', key: 'my', label: 'আমার বই', icon: BookMarked, count: myBookCount },
    { href: '/books/requests', key: 'requests', label: 'অনুরোধ', icon: MessagesSquare, count: requestCount },
    { href: '/books/plans', key: 'plans', label: 'প্ল্যান', icon: BookOpenCheck },
  ];

  return (
    <>
      <header className="border-b border-border bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4"><Link href="/books" className="flex items-center gap-2 font-bold text-fg"><BookOpen className="h-5 w-5 text-brand" />ইনতিফাদাহ বইঘর</Link><div className="flex flex-wrap gap-2">{isAuthenticated ? <Button size="sm" variant="secondary" onClick={onAddBook}><Plus className="h-4 w-4" />বই যোগ করুন</Button> : <Link href="/login?books=1"><Button size="sm">লগইন করে যোগ করুন</Button></Link>}</div></div></header>
      {isAuthenticated && <nav className="border-b border-border bg-white"><div className="mx-auto max-w-6xl px-4 py-3"><div className="grid grid-cols-4 gap-1 rounded-full bg-surface-2 p-1">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={tabClass(isActive)}
            >
              <Icon className={cn('h-4 w-4', isActive && 'h-5 w-5')} />
              <span className={isActive ? 'sr-only' : undefined}>{tab.label}</span>
              {!isActive && tab.count != null && tab.count > 0 && <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">{tab.count}</span>}
            </Link>
          );
        })}
      </div></div></nav>}
    </>
  );
}