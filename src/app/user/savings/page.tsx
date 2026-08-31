'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { SavingsBottomSection, SavingsMiddleSection, SavingsTopSection } from './_sections';
import type { SavingsMetric } from './_sections/types';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserCategories, getUserTransactions, mapCategoryRow, mapTransactionRow } from '@/lib/api';
import type { Category, Transaction } from '@/types';

const initialData = {
  metrics: [] as SavingsMetric[],
  history: [] as Transaction[],
  categories: [] as Category[],
};

export default function SavingsPage() {
  const loadSavings = useCallback(async () => {
    const [txRows, categoryRows] = await Promise.all([
      getUserTransactions({ limit: 300 }),
      getUserCategories({ active: true }),
    ]);
    const history = txRows.map(mapTransactionRow).filter((tx) => tx.type === 'savings');
    const categories = categoryRows.map(mapCategoryRow).filter((category) => category.type === 'savings');

    const totalSavings = history.reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyTarget = categories
      .filter((category) => category.recurrence === 'monthly' && !category.isVariable)
      .reduce((sum, category) => sum + Number(category.amount ?? 0), 0);

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
        { label: 'মাসিক পরিকল্পনা', value: monthlyTarget ? formatCurrencyBn(monthlyTarget) : 'সেট করা নেই', hint: 'নির্ধারিত খাত থেকে' },
        { label: 'মাসিক জমা', value: formatCurrencyBn(monthlyPaid), hint: 'চলতি মাসে প্রদেয়' },
        { label: 'বাকি পরিকল্পনা', value: monthlyTarget ? formatCurrencyBn(Math.max(0, monthlyTarget - monthlyPaid)) : '-', hint: 'চলতি মাসের নির্ধারিত খাত' },
      ],
      history,
      categories,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadSavings, initialData, [], {
    cacheKey: queryKeys.user.transactions({ limit: 300, type: 'savings' }),
    staleTimeMs: 45_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <SavingsTopSection metrics={data.metrics} />
      <SavingsMiddleSection categories={data.categories} onMutationSuccess={() => void refetch()} />
      <SavingsBottomSection history={data.history} />
    </PageStack>
  );
}
