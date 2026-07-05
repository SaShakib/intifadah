import { USER_STATS } from '@/lib/data/stats';
import { USER_TRANSACTIONS } from '@/lib/data/transactions';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { SavingsMetric } from './types';

const savingsTransactions = USER_TRANSACTIONS.filter((item) => item.type === 'savings');

export const SAVINGS_METRICS: SavingsMetric[] = [
  { label: 'মোট সঞ্চয়', value: formatCurrencyBn(USER_STATS.totalSavings), hint: 'বর্তমান ব্যালেন্স' },
  { label: 'মাসিক লক্ষ্য', value: formatCurrencyBn(USER_STATS.monthlyTarget), hint: 'চলতি মাসের লক্ষ্য' },
  { label: 'মাসিক জমা', value: formatCurrencyBn(USER_STATS.monthlyPaid), hint: 'চলতি মাসে প্রদেয়' },
  { label: 'বাকি লক্ষ্য', value: formatCurrencyBn(Math.max(0, USER_STATS.monthlyTarget - USER_STATS.monthlyPaid)), hint: 'এই মাসে বাকি' },
];

export const SAVINGS_PLAN_ROWS = [
  ['মাসিক সঞ্চয়', '৳১,০০০', 'প্রতি মাসের ১ তারিখ'],
  ['বিশেষ সঞ্চয়', 'পরিবর্তনশীল', 'যেকোনো সময়'],
  ['জরুরী সঞ্চয়', '৳৫০০', 'মাসের শেষ সপ্তাহ'],
];

export const SAVINGS_HISTORY_ROWS = savingsTransactions;
