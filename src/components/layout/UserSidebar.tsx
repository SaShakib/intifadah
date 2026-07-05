'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/base/Avatar';
import { USER_NAV_ITEMS } from '@/components/layout/config/navigation';
import { cn } from '@/lib/utils/cn';

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const sections = [...new Set(USER_NAV_ITEMS.map((item) => item.section))];

  return (
    <>
      <button
        className={cn(
          'fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition md:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-label="সাইডবার বন্ধ করুন"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 border-r border-white/10 bg-sidebar text-white transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">ই</div>
            <div>
              <p className="text-sm font-semibold">ইনতিফাদাহ</p>
              <p className="text-xs text-white/60">কর্যে হাসানাঃ</p>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar initials={user?.initials ?? 'র'} className="bg-brand-light text-brand" />
            <div>
              <p className="text-sm font-medium text-white">{user?.name ?? 'রহিমা খাতুন'}</p>
              <p className="text-xs text-white/60">সাধারণ সদস্য</p>
            </div>
          </div>
        </div>

        <nav className="h-[calc(100%-11.5rem)] overflow-y-auto px-2 py-2">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{section}</p>
              <div className="space-y-1">
                {USER_NAV_ITEMS.filter((item) => item.section === section).map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                        active ? 'bg-white/20 font-semibold text-white' : 'text-white/75 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center text-xs">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3">
          <p className="text-center text-[11px] text-white/50">ইনতিফাদাহ — সদস্য পোর্টাল</p>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="flex w-full items-center justify-center rounded-xl border border-white/20 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            লগআউট
          </button>
        </div>
      </aside>
    </>
  );
}
