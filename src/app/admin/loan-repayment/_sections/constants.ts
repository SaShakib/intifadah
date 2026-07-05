import { LOANS } from '@/lib/data/loans';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { RepaymentMetric } from './types';

const totalRepaid = LOANS.reduce((total, loan) => total + loan.totalRepaid, 0);
const totalOutstanding = LOANS.reduce((total, loan) => total + (loan.amount - loan.totalRepaid), 0);
const activeInstallments = LOANS.filter((loan) => loan.status === 'active' || loan.status === 'overdue');

export const REPAYMENT_METRICS: RepaymentMetric[] = [
  { label: 'মোট ফেরত', value: formatCurrencyBn(totalRepaid), hint: 'এ পর্যন্ত প্রাপ্ত' },
  { label: 'মোট বকেয়া', value: formatCurrencyBn(totalOutstanding), hint: 'অমীমাংসিত ব্যালেন্স' },
  { label: 'কিস্তি চলছে', value: String(activeInstallments.length), hint: 'চলমান ঋণ' },
  { label: 'ওভারডিউ', value: String(LOANS.filter((loan) => loan.status === 'overdue').length), hint: 'বিশেষ নজরদারি' },
];

export const REPAYMENT_ROWS = activeInstallments;
