'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { LoansBottomSection, LoansMiddleSection, LoansTopSection } from './_sections';
import { ALL_LOAN_ROWS, LOAN_METRICS, OVERDUE_LOAN_ROWS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getAdminLoans, mapLoanRow } from '@/lib/api';

const initialData = {
  metrics: LOAN_METRICS,
  loans: ALL_LOAN_ROWS,
  overdueLoans: OVERDUE_LOAN_ROWS,
};

export default function LoansPage() {
  const loadLoans = useCallback(async () => {
    const rows = await getAdminLoans();
    const loans = rows.map(mapLoanRow);

    const totalLoanAmount = loans.reduce((total, loan) => total + loan.amount, 0);
    const activeLoans = loans.filter((loan) => loan.status === 'active');
    const pendingLoans = loans.filter((loan) => loan.status === 'pending_approval');
    const overdueLoans = loans.filter((loan) => loan.status === 'overdue');

    return {
      metrics: [
        { label: 'মোট ঋণ', value: formatCurrencyBn(totalLoanAmount), hint: 'সব আবেদন মিলিয়ে' },
        { label: 'সক্রিয় ঋণ', value: String(activeLoans.length), hint: 'চলমান পরিশোধ' },
        { label: 'অপেক্ষমাণ', value: String(pendingLoans.length), hint: 'অনুমোদনের জন্য' },
        { label: 'ওভারডিউ', value: String(overdueLoans.length), hint: 'ফলোআপ প্রয়োজন' },
      ],
      loans,
      overdueLoans,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadLoans, initialData, [], {
    cacheKey: queryKeys.admin.loans(),
    staleTimeMs: 30_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <LoansTopSection metrics={data.metrics} />
      <LoansMiddleSection loans={data.loans} />
      <LoansBottomSection overdueLoans={data.overdueLoans} />
    </PageStack>
  );
}
