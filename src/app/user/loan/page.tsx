'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { LoanBottomSection, LoanMiddleSection, LoanTopSection } from './_sections';
import { USER_LOAN_HISTORY_ROWS, USER_LOAN_METRICS, USER_LOAN_SCHEDULE_ROWS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserLoans, mapLoanRow } from '@/lib/api';

const initialData = {
      metrics: [] as typeof USER_LOAN_METRICS,
      scheduleRows: [] as typeof USER_LOAN_SCHEDULE_ROWS,
      loanHistory: [] as typeof USER_LOAN_HISTORY_ROWS,
  activeLoans: [],
};

export default function UserLoanPage() {
  const loadLoans = useCallback(async () => {
    const loanRows = await getUserLoans();
    const loans = loanRows.map(mapLoanRow);

    const totalLoan = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRepaid = loans.reduce((sum, loan) => sum + loan.totalRepaid, 0);
    const totalOutstanding = Math.max(0, totalLoan - totalRepaid);

    const activeOrOverdue = loans.filter((loan) => loan.status === 'active' || loan.status === 'overdue');

    const scheduleRows = activeOrOverdue.map((loan) => [
      loan.dueDate,
      formatCurrencyBn(loan.installmentAmount ?? Math.max(0, loan.amount - loan.totalRepaid)),
      loan.status === 'overdue' ? 'ওভারডিউ' : 'অপেক্ষমাণ',
    ]);

    const nextInstallment = activeOrOverdue[0]?.installmentAmount ?? 0;

    return {
      metrics: [
        { label: 'মোট ঋণ', value: formatCurrencyBn(totalLoan), hint: 'বর্তমান ঋণের পরিমাণ' },
        { label: 'পরিশোধিত', value: formatCurrencyBn(totalRepaid), hint: 'এ পর্যন্ত ফেরত' },
        { label: 'বাকি', value: formatCurrencyBn(totalOutstanding), hint: 'অমীমাংসিত ব্যালেন্স' },
        { label: 'পরবর্তী কিস্তি', value: formatCurrencyBn(nextInstallment), hint: activeOrOverdue[0]?.dueDate ?? 'তথ্য নেই' },
      ],
      scheduleRows,
      activeLoans: activeOrOverdue,
      loanHistory: loans.map((loan) => ({
        purpose: loan.purpose,
        amount: loan.amount,
        repaid: loan.totalRepaid,
        dueDate: loan.dueDate,
        status: loan.status,
      })),
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadLoans, initialData, [], {
    cacheKey: queryKeys.user.loans(),
    staleTimeMs: 30_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <LoanTopSection metrics={data.metrics} />
      <LoanMiddleSection scheduleRows={data.scheduleRows} activeLoans={data.activeLoans} onMutationSuccess={() => void refetch()} />
      <LoanBottomSection loanHistory={data.loanHistory} />
    </PageStack>
  );
}
