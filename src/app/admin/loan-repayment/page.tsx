'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import {
  LoanRepaymentBottomSection,
  LoanRepaymentMiddleSection,
  LoanRepaymentTopSection,
} from './_sections';
import { REPAYMENT_METRICS, REPAYMENT_ROWS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getAdminLoans, mapLoanRow } from '@/lib/api';

const initialData = {
  metrics: [] as typeof REPAYMENT_METRICS,
  rows: [] as typeof REPAYMENT_ROWS,
};

export default function LoanRepaymentPage() {
  const loadRepayments = useCallback(async () => {
    const rows = await getAdminLoans();
    const loans = rows.map(mapLoanRow);

    const totalRepaid = loans.reduce((total, loan) => total + loan.totalRepaid, 0);
    const totalOutstanding = loans.reduce((total, loan) => total + (loan.amount - loan.totalRepaid), 0);
    const activeInstallments = loans.filter((loan) => loan.status === 'active' || loan.status === 'overdue');

    return {
      metrics: [
        { label: 'মোট ফেরত', value: formatCurrencyBn(totalRepaid), hint: 'এ পর্যন্ত প্রাপ্ত' },
        { label: 'মোট বকেয়া', value: formatCurrencyBn(totalOutstanding), hint: 'অমীমাংসিত ব্যালেন্স' },
        { label: 'কিস্তি চলছে', value: String(activeInstallments.length), hint: 'চলমান ঋণ' },
        { label: 'ওভারডিউ', value: String(loans.filter((loan) => loan.status === 'overdue').length), hint: 'বিশেষ নজরদারি' },
      ],
      rows: activeInstallments,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadRepayments, initialData, [], {
    cacheKey: queryKeys.admin.loans({ scope: 'repayment' }),
    staleTimeMs: 30_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <LoanRepaymentTopSection metrics={data.metrics} />
      <LoanRepaymentMiddleSection rows={data.rows} onMutationSuccess={() => void refetch()} />
      <LoanRepaymentBottomSection />
    </PageStack>
  );
}
