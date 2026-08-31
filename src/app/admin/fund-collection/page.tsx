'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import {
  FundCollectionBottomSection,
  FundCollectionMiddleSection,
  FundCollectionTopSection,
} from './_sections';
import { FUND_COLLECTION_ROWS, FUND_METRICS, FUND_TYPE_SUMMARY } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getAdminCategories, getAdminCollections, getAdminMembers, mapCategoryRow, mapTransactionRow, toBanglaDate, toInitials, toMinorNumber, toUserRole } from '@/lib/api';

const initialData = {
  metrics: [] as typeof FUND_METRICS,
  rows: [] as typeof FUND_COLLECTION_ROWS,
  summary: [] as typeof FUND_TYPE_SUMMARY,
  members: [],
  categories: [],
};

const FUND_TYPES = new Set(['collection', 'donation', 'savings']);

export default function FundCollectionPage() {
  const loadCollections = useCallback(async () => {
    const [rows, memberRows, categoryRows] = await Promise.all([
      getAdminCollections({ limit: 300 }),
      getAdminMembers({ limit: 500, active: true }),
      getAdminCategories({ active: true }),
    ]);
    const collections = rows
      .map(mapTransactionRow)
      .filter((item) => FUND_TYPES.has(item.type));

    const totalCollection = collections.reduce((sum, item) => sum + item.amount, 0);
    const completedCollection = collections.filter((item) => item.status === 'completed');
    const pendingCollection = collections.filter((item) => item.status === 'pending');

    const summary = Object.entries(
      collections.reduce<Record<string, number>>((acc, item) => {
        acc[item.type] = (acc[item.type] ?? 0) + item.amount;
        return acc;
      }, {}),
    ).map(([type, amount]) => ({ type, amount }));
    const members = memberRows.map((row) => ({
      id: String(row.id),
      memberId: `INT-${String(row.id).padStart(3, '0')}`,
      name: row.full_name,
      phone: row.mobile,
      ...(row.email ? { email: row.email } : {}),
      role: toUserRole(row.role_key),
      initials: toInitials(row.full_name),
      joinDate: toBanglaDate(row.joined_on),
      isActive: row.is_active,
      totalSavings: toMinorNumber(row.total_deposit_minor),
      totalDonations: 0,
    }));
    const categories = categoryRows.map(mapCategoryRow);

    return {
      metrics: [
        { label: 'মোট সংগ্রহ', value: formatCurrencyBn(totalCollection), hint: 'কালেকশন + দান + সঞ্চয়' },
        { label: 'সম্পন্ন এন্ট্রি', value: String(completedCollection.length), hint: 'যাচাই করা লেনদেন' },
        { label: 'অপেক্ষমাণ এন্ট্রি', value: String(pendingCollection.length), hint: 'রিভিউ বাকি' },
        { label: 'সদস্য অংশগ্রহণ', value: String(new Set(collections.map((item) => item.memberId)).size), hint: 'সক্রিয় অবদানকারী' },
      ],
      rows: collections,
      summary,
      members,
      categories,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadCollections, initialData, [], {
    cacheKey: queryKeys.admin.collections({ limit: 300 }),
    staleTimeMs: 30_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <FundCollectionTopSection metrics={data.metrics} />
      <FundCollectionMiddleSection rows={data.rows} members={data.members} categories={data.categories} onMutationSuccess={() => void refetch()} />
      <FundCollectionBottomSection summary={data.summary} />
    </PageStack>
  );
}
