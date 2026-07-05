import { LOANS } from '@/lib/data/loans';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { UserLoanMetric } from './types';

const personalLoan = {
  amount: 12000,
  repaid: 4000,
  outstanding: 8000,
  nextInstallment: 2000,
};

export const USER_LOAN_METRICS: UserLoanMetric[] = [
  { label: 'মোট ঋণ', value: formatCurrencyBn(personalLoan.amount), hint: 'বর্তমান ঋণের পরিমাণ' },
  { label: 'পরিশোধিত', value: formatCurrencyBn(personalLoan.repaid), hint: 'এ পর্যন্ত ফেরত' },
  { label: 'বাকি', value: formatCurrencyBn(personalLoan.outstanding), hint: 'অমীমাংসিত ব্যালেন্স' },
  { label: 'পরবর্তী কিস্তি', value: formatCurrencyBn(personalLoan.nextInstallment), hint: '১ জুলাই ২০২৬' },
];

export const USER_LOAN_SCHEDULE_ROWS = [
  ['১ জুলাই ২০২৬', formatCurrencyBn(2000), 'অপেক্ষমাণ'],
  ['১ আগস্ট ২০২৬', formatCurrencyBn(2000), 'অপেক্ষমাণ'],
  ['১ সেপ্টেম্বর ২০২৬', formatCurrencyBn(2000), 'অপেক্ষমাণ'],
  ['১ অক্টোবর ২০২৬', formatCurrencyBn(2000), 'অপেক্ষমাণ'],
];

export const USER_LOAN_HISTORY_ROWS = LOANS.map((loan) => ({
  purpose: loan.purpose,
  amount: loan.amount,
  repaid: loan.totalRepaid,
  dueDate: loan.dueDate,
  status: loan.status,
}));
