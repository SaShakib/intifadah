import type { ExpenseMetric, ExpenseRow } from './types';
import { formatCurrencyBn } from '@/lib/utils/format';

export const EXPENSE_ROWS: ExpenseRow[] = [
  { date: '১৬ জুন ২০২৬', category: 'পারিবারিক খরচ', amount: 1500, note: 'সাপ্তাহিক বাজার' },
  { date: '১২ জুন ২০২৬', category: 'চিকিৎসা', amount: 700, note: 'ঔষধ' },
  { date: '০৮ জুন ২০২৬', category: 'পরিবহন', amount: 450, note: 'যাতায়াত' },
  { date: '০২ জুন ২০২৬', category: 'শিক্ষা', amount: 1200, note: 'কোর্স ফি' },
  { date: '২৮ মে ২০২৬', category: 'পারিবারিক খরচ', amount: 980, note: 'রান্না সামগ্রী' },
];

const totalExpenses = EXPENSE_ROWS.reduce((sum, row) => sum + row.amount, 0);

export const EXPENSE_METRICS: ExpenseMetric[] = [
  { label: 'মাসিক খরচ', value: formatCurrencyBn(totalExpenses), hint: 'চলতি তালিকা থেকে' },
  { label: 'রেকর্ড সংখ্যা', value: String(EXPENSE_ROWS.length), hint: 'নিবন্ধিত ব্যয়' },
  { label: 'গড় ব্যয়', value: formatCurrencyBn(Math.round(totalExpenses / EXPENSE_ROWS.length)), hint: 'প্রতি এন্ট্রি' },
  { label: 'সবচেয়ে বড় ব্যয়', value: formatCurrencyBn(Math.max(...EXPENSE_ROWS.map((row) => row.amount))), hint: 'একক ব্যয়ের সর্বোচ্চ' },
];

export const EXPENSE_BUDGET_ROWS = [
  ['পারিবারিক খরচ', formatCurrencyBn(8000), formatCurrencyBn(2480), '৩১%'],
  ['চিকিৎসা', formatCurrencyBn(3000), formatCurrencyBn(700), '২৩%'],
  ['পরিবহন', formatCurrencyBn(2000), formatCurrencyBn(450), '২২%'],
  ['শিক্ষা', formatCurrencyBn(4000), formatCurrencyBn(1200), '৩০%'],
];
