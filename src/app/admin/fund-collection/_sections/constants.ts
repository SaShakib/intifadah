import { TRANSACTIONS } from '@/lib/data/transactions';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { FundMetric } from './types';

const collectionTx = TRANSACTIONS.filter((item) => ['collection', 'donation', 'savings'].includes(item.type));
const totalCollection = collectionTx.reduce((sum, item) => sum + item.amount, 0);
const completedCollection = collectionTx.filter((item) => item.status === 'completed');
const pendingCollection = collectionTx.filter((item) => item.status === 'pending');

export const FUND_METRICS: FundMetric[] = [
  { label: 'মোট সংগ্রহ', value: formatCurrencyBn(totalCollection), hint: 'কালেকশন + দান + সঞ্চয়' },
  { label: 'সম্পন্ন এন্ট্রি', value: String(completedCollection.length), hint: 'যাচাই করা লেনদেন' },
  { label: 'অপেক্ষমাণ এন্ট্রি', value: String(pendingCollection.length), hint: 'রিভিউ বাকি' },
  { label: 'সদস্য অংশগ্রহণ', value: String(new Set(collectionTx.map((item) => item.memberId)).size), hint: 'সক্রিয় অবদানকারী' },
];

export const FUND_COLLECTION_ROWS = collectionTx;

export const FUND_TYPE_SUMMARY = Object.entries(
  collectionTx.reduce<Record<string, number>>((acc, item) => {
    const key = item.type;
    acc[key] = (acc[key] ?? 0) + item.amount;
    return acc;
  }, {}),
).map(([type, amount]) => ({ type, amount }));
