import { CATEGORIES } from '@/lib/data/categories';
import type { UserCategoryMetric } from './types';

export const USER_CATEGORY_METRICS: UserCategoryMetric[] = [
  { label: 'মোট খাত', value: String(CATEGORIES.length), hint: 'সিস্টেমে নিবন্ধিত' },
  { label: 'সক্রিয় খাত', value: String(CATEGORIES.filter((item) => item.isActive).length), hint: 'বর্তমানে ব্যবহৃত' },
  { label: 'দান খাত', value: String(CATEGORIES.filter((item) => item.type === 'donation').length), hint: 'স্বেচ্ছা অবদান' },
  { label: 'সঞ্চয় খাত', value: String(CATEGORIES.filter((item) => item.type === 'savings').length), hint: 'নিয়মিত সঞ্চয়' },
];

export const USER_CATEGORY_ROWS = CATEGORIES;
