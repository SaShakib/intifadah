'use client';

import Link from 'next/link';
import { BookMarked, BookOpen, LayoutDashboard, MessagesSquare, Plus } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { useAuth } from '@/contexts/AuthContext';

export type BooksSection = 'store' | 'my' | 'requests';

function tabClass(active: boolean) {
  return active
    ? 'flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-2 py-2 text-sm font-bold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60'
    : 'flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-fg-2 transition hover:bg-white hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60';
}

interface BooksHeaderProps {
  active: BooksSection;
  myBookCount?: number;
  requestCount?: number;
  onAddBook: () => void;
}

export function BooksHeader({ active, myBookCount = 0, requestCount = 0, onAddBook }: BooksHeaderProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/user/dashboard';

  return (
    <>
      <header className="border-b border-border bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4"><Link href="/books" className="flex items-center gap-2 font-bold text-fg"><BookOpen className="h-5 w-5 text-brand" />ইনতিফাদাহ বইঘর</Link><div className="flex gap-2">{isAuthenticated && <Link href={dashboardHref}><Button size="sm" variant="secondary"><LayoutDashboard className="h-4 w-4" />ড্যাশবোর্ড</Button></Link>}{isAuthenticated ? <Button size="sm" variant="secondary" onClick={onAddBook}><Plus className="h-4 w-4" />বই যোগ করুন</Button> : <Link href="/login?books=1"><Button size="sm">লগইন করে যোগ করুন</Button></Link>}</div></div></header>
      {isAuthenticated && <nav className="border-b border-border bg-white"><div className="mx-auto max-w-6xl px-4 py-3"><div className="grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1">
        <Link href="/books" aria-current={active === 'store' ? 'page' : undefined} className={tabClass(active === 'store')}><BookOpen className="h-4 w-4" />বইঘর</Link>
        <Link href="/books/my" aria-current={active === 'my' ? 'page' : undefined} className={tabClass(active === 'my')}><BookMarked className="h-4 w-4" />আমার বই{myBookCount > 0 && <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">{myBookCount}</span>}</Link>
        <Link href="/books/requests" aria-current={active === 'requests' ? 'page' : undefined} className={tabClass(active === 'requests')}><MessagesSquare className="h-4 w-4" />অনুরোধ{requestCount > 0 && <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">{requestCount}</span>}</Link>
      </div></div></nav>}
    </>
  );
}