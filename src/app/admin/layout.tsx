'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopBar } from '@/components/layout/AdminTopBar';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard':        'ড্যাশবোর্ড',
  '/admin/members':          'সদস্য তালিকা',
  '/admin/loans':            'ঋণ বিতরণ',
  '/admin/loan-repayment':   'ঋণ ফেরত',
  '/admin/fund-collection':  'ফান্ড / কালেকশন',
  '/admin/categories':       'খাত পরিচালনা',
  '/admin/reports':          'প্রতিবেদন',
  '/admin/roles-permissions':'ভূমিকা ও অনুমতি',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'ড্যাশবোর্ড';

  return (
    <>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-area">
        <AdminTopBar
          title={title}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
        />

        <main style={{ padding: 24, flex: 1 }}>
          {children}
        </main>
      </div>
    </>
  );
}
