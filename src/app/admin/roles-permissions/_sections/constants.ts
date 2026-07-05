import type { RoleSummary } from './types';

export const ROLE_ROWS: RoleSummary[] = [
  { role: 'সুপার অ্যাডমিন', members: 1, modules: 'সকল মডিউল', level: 'high' },
  { role: 'ম্যানেজার', members: 2, modules: 'সদস্য, ঋণ, কালেকশন, রিপোর্ট', level: 'high' },
  { role: 'অ্যাকাউন্ট্যান্ট', members: 1, modules: 'কালেকশন, সঞ্চয়, রিপোর্ট', level: 'medium' },
  { role: 'সদস্য', members: 138, modules: 'ড্যাশবোর্ড, সঞ্চয়, দান, মন্তব্য', level: 'low' },
];

export const MODULE_ROWS = [
  ['ড্যাশবোর্ড', 'সকল ভূমিকা'],
  ['সদস্য ব্যবস্থাপনা', 'সুপার অ্যাডমিন, ম্যানেজার'],
  ['ঋণ ব্যবস্থাপনা', 'সুপার অ্যাডমিন, ম্যানেজার'],
  ['ফান্ড ও রিপোর্ট', 'সুপার অ্যাডমিন, ম্যানেজার, অ্যাকাউন্ট্যান্ট'],
  ['প্রোফাইল ও মন্তব্য', 'সকল ভূমিকা'],
];
