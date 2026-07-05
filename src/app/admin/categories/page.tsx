'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { CategoriesBottomSection, CategoriesMiddleSection, CategoriesTopSection } from './_sections';
import { CATEGORY_METRICS, CATEGORY_ROWS, CATEGORY_TYPE_SUMMARY } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getAdminCategories, getAdminCollections, mapCategoryRow, mapTransactionRow } from '@/lib/api';

const initialData = {
  metrics: CATEGORY_METRICS,
  categories: CATEGORY_ROWS,
  summary: CATEGORY_TYPE_SUMMARY,
};

export default function CategoriesPage() {
  const loadCategories = useCallback(async () => {
    const [categoryRows, collectionRows] = await Promise.all([
      getAdminCategories(),
      getAdminCollections({ limit: 500 }),
    ]);

    const categories = categoryRows.map(mapCategoryRow);
    const transactions = collectionRows.map(mapTransactionRow);
    const relatedAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    const activeCategories = categories.filter((category) => category.isActive);
    const inactiveCategories = categories.filter((category) => !category.isActive);

    const summaryMap = categories.reduce<Record<string, number>>((acc, category) => {
      acc[category.type] = (acc[category.type] ?? 0) + 1;
      return acc;
    }, {});

    return {
      metrics: [
        { label: 'মোট খাত', value: String(categories.length), hint: 'সব ধরন' },
        { label: 'সক্রিয় খাত', value: String(activeCategories.length), hint: 'বর্তমানে চালু' },
        { label: 'নিষ্ক্রিয় খাত', value: String(inactiveCategories.length), hint: 'পুনরায় চালু করা যাবে' },
        { label: 'খাতে মোট লেনদেন', value: formatCurrencyBn(relatedAmount), hint: 'ট্রানজেকশন ডেটা থেকে' },
      ],
      categories,
      summary: Object.entries(summaryMap).map(([type, count]) => ({ type, count })),
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadCategories, initialData, [], {
    cacheKey: queryKeys.admin.categories(),
    staleTimeMs: 120_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <CategoriesTopSection metrics={data.metrics} />
      <CategoriesMiddleSection categories={data.categories} />
      <CategoriesBottomSection summary={data.summary} />
    </PageStack>
  );
}
