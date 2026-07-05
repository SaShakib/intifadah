'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import {
  UserCategoriesBottomSection,
  UserCategoriesMiddleSection,
  UserCategoriesTopSection,
} from './_sections';
import { USER_CATEGORY_METRICS, USER_CATEGORY_ROWS } from './_sections/constants';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserCategories, mapCategoryRow } from '@/lib/api';

const initialData = {
  metrics: USER_CATEGORY_METRICS,
  categories: USER_CATEGORY_ROWS,
};

export default function UserCategoriesPage() {
  const loadCategories = useCallback(async () => {
    const rows = await getUserCategories();
    const categories = rows.map(mapCategoryRow);

    return {
      metrics: [
        { label: 'মোট খাত', value: String(categories.length), hint: 'সিস্টেমে নিবন্ধিত' },
        { label: 'সক্রিয় খাত', value: String(categories.filter((item) => item.isActive).length), hint: 'বর্তমানে ব্যবহৃত' },
        { label: 'দান খাত', value: String(categories.filter((item) => item.type === 'donation').length), hint: 'স্বেচ্ছা অবদান' },
        { label: 'সঞ্চয় খাত', value: String(categories.filter((item) => item.type === 'savings').length), hint: 'নিয়মিত সঞ্চয়' },
      ],
      categories,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadCategories, initialData, [], {
    cacheKey: queryKeys.user.categories(),
    staleTimeMs: 120_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <UserCategoriesTopSection metrics={data.metrics} />
      <UserCategoriesMiddleSection categories={data.categories} />
      <UserCategoriesBottomSection />
    </PageStack>
  );
}
