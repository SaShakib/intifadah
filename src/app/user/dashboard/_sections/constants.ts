import { USER_STATS } from '@/lib/data/stats';
import { USER_TRANSACTIONS } from '@/lib/data/transactions';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { UserDashboardMetric } from './types';

export const USER_DASHBOARD_METRICS: UserDashboardMetric[] = [
  { label: 'মোট সঞ্চয়', value: formatCurrencyBn(USER_STATS.totalSavings), hint: 'আপনার ব্যক্তিগত সঞ্চয়' },
  { label: 'মোট দান', value: formatCurrencyBn(USER_STATS.totalDonations), hint: 'অবদান' },
  { label: 'মোট অবদান', value: formatCurrencyBn(USER_STATS.totalContributions), hint: 'সঞ্চয় + দান' },
  { label: 'মাসিক লক্ষ্য', value: formatCurrencyBn(USER_STATS.monthlyTarget), hint: `পরিশোধিত: ${formatCurrencyBn(USER_STATS.monthlyPaid)}` },
];

export const USER_DASHBOARD_TRANSACTIONS = USER_TRANSACTIONS;

export const USER_DASHBOARD_ALERTS = [
  'এই মাসের বাকি লক্ষ্য: ৳৫০০',
  'পরবর্তী সঞ্চয় কিস্তি: ১ জুলাই ২০২৬',
  'সদস্য সভা: ৫ জুলাই ২০২৬',
];
