import type { NavItem } from './types';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'ড্যাশবোর্ড', icon: '◈', section: 'মূল' },
  { href: '/admin/fund-collection', label: 'ফান্ড / কালেকশন', icon: '৳', section: 'আর্থিক' },
  { href: '/admin/loans', label: 'ঋণ বিতরণ', icon: 'ঋ', section: 'আর্থিক' },
  { href: '/admin/loan-repayment', label: 'ঋণ ফেরত', icon: '↺', section: 'আর্থিক' },
  { href: '/admin/categories', label: 'খাত পরিচালনা', icon: '☰', section: 'আর্থিক' },
  { href: '/admin/members', label: 'সদস্য তালিকা', icon: '👥', section: 'সদস্য' },
  { href: '/admin/reports', label: 'প্রতিবেদন', icon: '▤', section: 'সদস্য' },
  { href: '/admin/roles-permissions', label: 'ভূমিকা ও অনুমতি', icon: '✓', section: 'প্রশাসন' },
];

export const USER_NAV_ITEMS: NavItem[] = [
  { href: '/user/dashboard', label: 'ড্যাশবোর্ড', icon: '◈', section: 'মূল' },
  { href: '/user/donations', label: 'দান করুন', icon: '❤', section: 'আর্থিক' },
  { href: '/user/savings', label: 'সঞ্চয়', icon: '⬤', section: 'আর্থিক' },
  { href: '/user/loan', label: 'ঋণ', icon: 'ঋ', section: 'আর্থিক' },
  { href: '/user/transactions', label: 'লেনদেন', icon: '↹', section: 'আর্থিক' },
  { href: '/user/categories', label: 'খাতসূচি', icon: '☰', section: 'তথ্য' },
  { href: '/user/expenses', label: 'খরচের হিসাব', icon: '⟡', section: 'তথ্য' },
  { href: '/user/comments', label: 'মন্তব্য', icon: '✉', section: 'তথ্য' },
  { href: '/user/profile', label: 'প্রোফাইল', icon: '◎', section: 'অ্যাকাউন্ট' },
];

export const USER_BOTTOM_NAV = USER_NAV_ITEMS.filter((item) =>
  ['/user/dashboard', '/user/donations', '/user/savings', '/user/transactions', '/user/profile'].includes(item.href),
);
