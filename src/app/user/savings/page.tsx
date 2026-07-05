'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { SavingsBottomSection, SavingsMiddleSection, SavingsTopSection } from './_sections';
import { SAVINGS_HISTORY_ROWS, SAVINGS_METRICS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserTransactions, mapTransactionRow } from '@/lib/api';

const initialData = {
  metrics: SAVINGS_METRICS,
  history: SAVINGS_HISTORY_ROWS,
};

const MONTHLY_TARGET = 2000;

export default function SavingsPage() {
  const loadSavings = useCallback(async () => {
    const txRows = await getUserTransactions({ limit: 300 });
    const history = txRows.map(mapTransactionRow).filter((tx) => tx.type === 'savings');

    const totalSavings = history.reduce((sum, tx) => sum + tx.amount, 0);

    const now = new Date();
    const monthlyPaid = txRows
      .filter((row) => {
        if (Number(row.tx_type) !== 3) {
          return false;
        }
        const d = new Date(row.occurred_on);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, row) => sum + Number(row.amount_minor), 0);

    return {
      metrics: [
        { label: 'মোট সঞ্চয়', value: formatCurrencyBn(totalSavings), hint: 'বর্তমান ব্যালেন্স' },
        { label: 'মাসিক লক্ষ্য', value: formatCurrencyBn(MONTHLY_TARGET), hint: 'চলতি মাসের লক্ষ্য' },
        { label: 'মাসিক জমা', value: formatCurrencyBn(monthlyPaid), hint: 'চলতি মাসে প্রদেয়' },
        { label: 'বাকি লক্ষ্য', value: formatCurrencyBn(Math.max(0, MONTHLY_TARGET - monthlyPaid)), hint: 'এই মাসে বাকি' },
      ],
      history,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadSavings, initialData, [], {
    cacheKey: queryKeys.user.transactions({ limit: 300, type: 'savings' }),
    staleTimeMs: 45_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <SavingsTopSection metrics={data.metrics} />
      <SavingsMiddleSection />
      <SavingsBottomSection history={data.history} />
    </PageStack>
  );
}
