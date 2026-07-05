import { CATEGORIES } from '@/lib/data/categories';
import { TRANSACTIONS } from '@/lib/data/transactions';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { CategoryMetric } from './types';

const activeCategories = CATEGORIES.filter((category) => category.isActive);
const inactiveCategories = CATEGORIES.filter((category) => !category.isActive);
const relatedAmount = TRANSACTIONS.reduce((sum, item) => sum + item.amount, 0);

export const CATEGORY_METRICS: CategoryMetric[] = [
  { label: 'মোট খাত', value: String(CATEGORIES.length), hint: 'সব ধরন' },
  { label: 'সক্রিয় খাত', value: String(activeCategories.length), hint: 'বর্তমানে চালু' },
  { label: 'নিষ্ক্রিয় খাত', value: String(inactiveCategories.length), hint: 'পুনরায় চালু করা যাবে' },
  { label: 'খাতে মোট লেনদেন', value: formatCurrencyBn(relatedAmount), hint: 'ট্রানজেকশন ডেটা থেকে' },
];

export const CATEGORY_ROWS = CATEGORIES;

export const CATEGORY_TYPE_SUMMARY = Object.entries(
  CATEGORIES.reduce<Record<string, number>>((acc, category) => {
    acc[category.type] = (acc[category.type] ?? 0) + 1;
    return acc;
  }, {}),
).map(([type, count]) => ({ type, count }));
