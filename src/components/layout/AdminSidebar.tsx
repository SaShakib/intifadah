'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/base/Avatar';
import { NavIcon } from '@/components/layout/NavIcon';
import { ADMIN_NAV_ITEMS } from '@/components/layout/config/navigation';
import { getRoleLabel } from '@/lib/api';
import { cn } from '@/lib/utils/cn';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, roleKey, canManagePermissions, logout } = useAuth();
  const navItems = ADMIN_NAV_ITEMS.filter((item) => !item.permissionOnly || canManagePermissions);
  const sections = [...new Set(navItems.map((item) => item.section))];

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace('/login');
    router.refresh();
  };

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
          'fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-white/10 bg-sidebar text-white transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <Image src="/icons/intifadah.jpeg" alt="ইনতিফাদাহ" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="text-sm font-semibold">ইনতিফাদাহ</p>
              <p className="text-xs text-white/60">কর্যে হাসানাঃ</p>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar initials={user?.initials ?? 'আ'} className="bg-emerald-200 text-emerald-900" />
            <div>
              <p className="text-sm font-medium text-white">{user?.name ?? 'ব্যবহারকারী'}</p>
              <p className="text-xs text-white/60">{getRoleLabel(roleKey, user?.role === 'member_internal' ? 1 : undefined)}</p>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white/40">{section}</p>
              <div className="space-y-1">
                {navItems.filter((item) => item.section === section).map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition',
                        active ? 'bg-brand font-semibold text-white shadow-sm shadow-brand/30' : 'text-white/75 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <NavIcon name={item.icon} className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => void handleLogout()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            লগআউট
          </button>
        </div>
      </aside>
    </>
  );
}
