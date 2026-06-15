import type { DashboardStats } from '@/types';

export const ADMIN_STATS: DashboardStats = {
  totalMembers: 142,
  totalFund: 845500,
  totalCollection: 1230000,
  totalLoans: 375000,
  currentBalance: 470500,
  activeLoans: 18,
};

export const USER_STATS = {
  totalSavings: 32000,
  totalDonations: 12500,
  activeLoan: 0,
  totalContributions: 44500,
  monthlyTarget: 2000,
  monthlyPaid: 1500,
  overdueAmount: 0,
};

export const MONTHLY_CHART_DATA = [
  { month: 'জানু', value: 85 },
  { month: 'ফেব্রু', value: 72 },
  { month: 'মার্চ', value: 93 },
  { month: 'এপ্রিল', value: 88 },
  { month: 'মে', value: 105 },
  { month: 'জুন', value: 62, isCurrent: true },
];
