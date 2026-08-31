'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { DonationsBottomSection, DonationsMiddleSection, DonationsTopSection } from './_sections';
import type { DonationMetric } from './_sections/types';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserCategories, getUserTransactions, mapCategoryRow, mapTransactionRow } from '@/lib/api';
import type { Category, Transaction } from '@/types';

const initialData = {
  metrics: [] as DonationMetric[],
  categories: [] as Category[],
  history: [] as Transaction[],
};

export default function DonationsPage() {
  const loadDonations = useCallback(async () => {
    const [categoryRows, txRows] = await Promise.all([
      getUserCategories(),
      getUserTransactions({ limit: 300 }),
    ]);

    const categories = categoryRows.map(mapCategoryRow).filter((category) => category.type === 'donation');
    const history = txRows.map(mapTransactionRow).filter((tx) => tx.type === 'donation');
    const totalDonated = history.reduce((sum, item) => sum + item.amount, 0);
    const monthlyPlan = categories
      .filter((category) => category.recurrence === 'monthly' && !category.isVariable)
      .reduce((sum, category) => sum + Number(category.amount ?? 0), 0);

    return {
      metrics: [
        { label: 'মোট দান', value: formatCurrencyBn(totalDonated), hint: 'এ পর্যন্ত ব্যক্তিগত অবদান' },
        { label: 'মোট দান সংখ্যা', value: String(history.length), hint: 'সম্পন্ন লেনদেন' },
        { label: 'গড় দান', value: formatCurrencyBn(Math.round(totalDonated / Math.max(1, history.length))), hint: 'প্রতি দানে গড়' },
        { label: 'মাসিক পরিকল্পনা', value: monthlyPlan ? formatCurrencyBn(monthlyPlan) : 'সেট করা নেই', hint: 'নির্ধারিত খাত থেকে' },
      ],
      categories,
      history,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadDonations, initialData, [], {
    cacheKey: queryKeys.user.transactions({ limit: 300, type: 'donation' }),
    staleTimeMs: 45_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <DonationsTopSection metrics={data.metrics} />
      <DonationsMiddleSection categories={data.categories} onMutationSuccess={() => void refetch()} />
      <DonationsBottomSection history={data.history} />
    </PageStack>
  );
}
