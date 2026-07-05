import { LOANS } from '@/lib/data/loans';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { LoanMetric } from './types';

const totalLoanAmount = LOANS.reduce((total, loan) => total + loan.amount, 0);
const activeLoans = LOANS.filter((loan) => loan.status === 'active');
const pendingLoans = LOANS.filter((loan) => loan.status === 'pending_approval');
const overdueLoans = LOANS.filter((loan) => loan.status === 'overdue');

export const LOAN_METRICS: LoanMetric[] = [
  { label: 'মোট ঋণ', value: formatCurrencyBn(totalLoanAmount), hint: 'সব আবেদন মিলিয়ে' },
  { label: 'সক্রিয় ঋণ', value: String(activeLoans.length), hint: 'চলমান পরিশোধ' },
  { label: 'অপেক্ষমাণ', value: String(pendingLoans.length), hint: 'অনুমোদনের জন্য' },
  { label: 'ওভারডিউ', value: String(overdueLoans.length), hint: 'ফলোআপ প্রয়োজন' },
];

export const ALL_LOAN_ROWS = LOANS;
export const OVERDUE_LOAN_ROWS = overdueLoans;
