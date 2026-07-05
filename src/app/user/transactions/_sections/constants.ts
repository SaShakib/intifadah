import { USER_TRANSACTIONS } from '@/lib/data/transactions';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { TransactionMetric } from './types';

const totalIn = USER_TRANSACTIONS.reduce((sum, item) => sum + item.amount, 0);
const totalCount = USER_TRANSACTIONS.length;

export const TRANSACTION_METRICS: TransactionMetric[] = [
  { label: 'মোট লেনদেন', value: String(totalCount), hint: 'রেকর্ড করা এন্ট্রি' },
  { label: 'মোট পরিমাণ', value: formatCurrencyBn(totalIn), hint: 'সব এন্ট্রি যোগফল' },
  { label: 'সর্বশেষ তারিখ', value: USER_TRANSACTIONS[0]?.date ?? '-', hint: 'শেষ আপডেট' },
  { label: 'গড় পরিমাণ', value: formatCurrencyBn(Math.round(totalIn / Math.max(1, totalCount))), hint: 'প্রতি লেনদেনে গড়' },
];

export const TRANSACTION_ROWS = USER_TRANSACTIONS;

export const TRANSACTION_TYPE_SUMMARY = Object.entries(
  USER_TRANSACTIONS.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + item.amount;
    return acc;
  }, {}),
).map(([type, amount]) => ({ type, amount }));
