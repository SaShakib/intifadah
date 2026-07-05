import { ADMIN_STATS } from '@/lib/data/stats';
import { LOANS } from '@/lib/data/loans';
import { TRANSACTIONS } from '@/lib/data/transactions';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { DashboardMetric } from './types';

export const DASHBOARD_METRICS: DashboardMetric[] = [
  { label: 'মোট সদস্য', value: String(ADMIN_STATS.totalMembers), hint: 'সক্রিয় সদস্য' },
  { label: 'মোট তহবিল', value: formatCurrencyBn(ADMIN_STATS.totalFund), hint: 'বর্তমান ফান্ড' },
  { label: 'মোট কালেকশন', value: formatCurrencyBn(ADMIN_STATS.totalCollection), hint: 'সর্বমোট জমা' },
  { label: 'বর্তমান ব্যালেন্স', value: formatCurrencyBn(ADMIN_STATS.currentBalance), hint: 'ব্যবহারযোগ্য' },
];

export const DASHBOARD_PENDING_LOANS = LOANS.filter((loan) => loan.status !== 'active').slice(0, 5);

export const DASHBOARD_RECENT_TRANSACTIONS = TRANSACTIONS.slice(0, 8);
