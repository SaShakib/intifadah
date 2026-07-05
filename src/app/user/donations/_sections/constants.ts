import { USER_TRANSACTIONS } from '@/lib/data/transactions';
import { CATEGORIES } from '@/lib/data/categories';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { DonationMetric } from './types';

const donationTransactions = USER_TRANSACTIONS.filter((item) => item.type === 'donation');
const totalDonated = donationTransactions.reduce((sum, item) => sum + item.amount, 0);

export const DONATION_METRICS: DonationMetric[] = [
  { label: 'মোট দান', value: formatCurrencyBn(totalDonated), hint: 'এ পর্যন্ত ব্যক্তিগত অবদান' },
  { label: 'মোট দান সংখ্যা', value: String(donationTransactions.length), hint: 'সম্পন্ন লেনদেন' },
  { label: 'গড় দান', value: formatCurrencyBn(Math.round(totalDonated / Math.max(1, donationTransactions.length))), hint: 'প্রতি দানে গড়' },
  { label: 'এই মাসের লক্ষ্য', value: formatCurrencyBn(2000), hint: 'লক্ষ্য অনুযায়ী দান করুন' },
];

export const DONATION_CATEGORY_ROWS = CATEGORIES.filter((category) => category.type === 'donation');
export const DONATION_HISTORY_ROWS = donationTransactions;
