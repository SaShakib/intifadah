'use client';

import { useState } from 'react';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { UserBottomNav } from '@/components/layout/UserBottomNav';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/user/dashboard':    { title: 'আমার ড্যাশবোর্ড', subtitle: 'আপনার আর্থিক সারাংশ' },
  '/user/donations':    { title: 'দান করুন', subtitle: 'আপনার দানের হিসাব' },
  '/user/savings':      { title: 'সঞ্চয়', subtitle: 'আপনার সঞ্চয়ের বিবরণ' },
  '/user/loan':         { title: 'ঋণ', subtitle: 'ঋণ ও কিস্তির তথ্য' },
  '/user/transactions': { title: 'লেনদেন', subtitle: 'সব লেনদেনের ইতিহাস' },
  '/user/categories':   { title: 'খাতসূচি', subtitle: 'সকল খাতের বিবরণ' },
  '/user/expenses':     { title: 'খরচের হিসাব', subtitle: 'ব্যক্তিগত ব্যয়ের বিবরণ' },
  '/user/comments':     { title: 'মন্তব্য', subtitle: 'যোগাযোগ ও মন্তব্য' },
  '/user/profile':      { title: 'প্রোফাইল', subtitle: 'আপনার তথ্য পরিচালনা' },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageInfo = PAGE_TITLES[pathname] ?? { title: 'ইনতিফাদাহ' };

  return (
    <>
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-area">
        <UserTopBar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
        />

        <main className="page-content" style={{ padding: '24px 24px 40px', flex: 1 }}>
          {children}
        </main>

        <UserBottomNav />
      </div>
    </>
  );
}
