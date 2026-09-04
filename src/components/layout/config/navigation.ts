import type { NavItem } from './types';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'ড্যাশবোর্ড', icon: 'layout-dashboard', section: 'প্রধান মেনু' },
  { href: '/admin/fund-collection', label: 'ফান্ড / কালেকশন', icon: 'circle-dollar-sign', section: 'প্রধান মেনু' },
  { href: '/admin/loans', label: 'ঋণ বিতরণ', icon: 'hand-coins', section: 'প্রধান মেনু' },
  { href: '/admin/loan-repayment', label: 'ঋণ ফেরত', icon: 'rotate-ccw', section: 'প্রধান মেনু' },
  { href: '/admin/categories', label: 'খাত পরিচালনা', icon: 'list-filter', section: 'প্রধান মেনু' },
  { href: '/admin/members', label: 'সদস্য তালিকা', icon: 'users', section: 'প্রধান মেনু' },
  { href: '/admin/reports', label: 'প্রতিবেদন', icon: 'chart-no-axes-combined', section: 'প্রধান মেনু' },
  { href: '/admin/quran', label: 'Quran ও Namaj', icon: 'book-open-check', section: 'ইনতিফাদাহ সদস্য' },
  { href: '/admin/settings', label: 'সেটিংস', icon: 'settings', section: 'সেটিংস' },
  { href: '/admin/roles-permissions', label: 'ভূমিকা ও অনুমতি', icon: 'lock-keyhole', section: 'সেটিংস', permissionOnly: true },
];

export const USER_NAV_ITEMS: NavItem[] = [
  { href: '/user/dashboard', label: 'ড্যাশবোর্ড', icon: 'layout-dashboard', section: 'প্রধান মেনু' },
  { href: '/user/donations', label: 'দান করুন', icon: 'heart-handshake', section: 'প্রধান মেনু' },
  { href: '/user/savings', label: 'সঞ্চয়', icon: 'wallet-cards', section: 'প্রধান মেনু' },
  { href: '/user/loan', label: 'ঋণ', icon: 'hand-coins', section: 'প্রধান মেনু' },
  { href: '/user/quran', label: 'Quran ও Namaj', icon: 'book-open-check', section: 'প্রধান মেনু' },
  { href: '/user/transactions', label: 'লেনদেন', icon: 'arrow-left-right', section: 'প্রধান মেনু' },
  { href: '/user/categories', label: 'খাতসূচি', icon: 'list-filter', section: 'প্রধান মেনু' },
  { href: '/user/expenses', label: 'খরচের হিসাব', icon: 'receipt-text', section: 'প্রধান মেনু' },
  { href: '/user/comments', label: 'মন্তব্য', icon: 'message-square-text', section: 'প্রধান মেনু' },
  { href: '/user/profile', label: 'প্রোফাইল', icon: 'circle-user-round', section: 'সেটিংস' },
];

export const USER_BOTTOM_NAV = USER_NAV_ITEMS.filter((item) =>
  ['/user/dashboard', '/user/donations', '/user/savings', '/user/transactions', '/user/profile'].includes(item.href),
);
