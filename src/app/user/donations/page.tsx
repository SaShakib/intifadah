'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { DonationsBottomSection, DonationsMiddleSection, DonationsTopSection } from './_sections';
import { DONATION_CATEGORY_ROWS, DONATION_HISTORY_ROWS, DONATION_METRICS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserCategories, getUserTransactions, mapCategoryRow, mapTransactionRow } from '@/lib/api';

const initialData = {
  metrics: DONATION_METRICS,
  categories: DONATION_CATEGORY_ROWS,
  history: DONATION_HISTORY_ROWS,
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

    return {
      metrics: [
        { label: 'মোট দান', value: formatCurrencyBn(totalDonated), hint: 'এ পর্যন্ত ব্যক্তিগত অবদান' },
        { label: 'মোট দান সংখ্যা', value: String(history.length), hint: 'সম্পন্ন লেনদেন' },
        { label: 'গড় দান', value: formatCurrencyBn(Math.round(totalDonated / Math.max(1, history.length))), hint: 'প্রতি দানে গড়' },
        { label: 'এই মাসের লক্ষ্য', value: formatCurrencyBn(2000), hint: 'লক্ষ্য অনুযায়ী দান করুন' },
      ],
      categories,
      history,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadDonations, initialData, [], {
    cacheKey: queryKeys.user.transactions({ limit: 300, type: 'donation' }),
    staleTimeMs: 45_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <DonationsTopSection metrics={data.metrics} />
      <DonationsMiddleSection categories={data.categories} />
      <DonationsBottomSection history={data.history} />
    </PageStack>
  );
}
