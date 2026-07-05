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
import { getAdminCollections, mapTransactionRow } from '@/lib/api';

const initialData = {
  metrics: FUND_METRICS,
  rows: FUND_COLLECTION_ROWS,
  summary: FUND_TYPE_SUMMARY,
};

const FUND_TYPES = new Set(['collection', 'donation', 'savings']);

export default function FundCollectionPage() {
  const loadCollections = useCallback(async () => {
    const rows = await getAdminCollections({ limit: 300 });
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

    return {
      metrics: [
        { label: 'মোট সংগ্রহ', value: formatCurrencyBn(totalCollection), hint: 'কালেকশন + দান + সঞ্চয়' },
        { label: 'সম্পন্ন এন্ট্রি', value: String(completedCollection.length), hint: 'যাচাই করা লেনদেন' },
        { label: 'অপেক্ষমাণ এন্ট্রি', value: String(pendingCollection.length), hint: 'রিভিউ বাকি' },
        { label: 'সদস্য অংশগ্রহণ', value: String(new Set(collections.map((item) => item.memberId)).size), hint: 'সক্রিয় অবদানকারী' },
      ],
      rows: collections,
      summary,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadCollections, initialData, [], {
    cacheKey: queryKeys.admin.collections({ limit: 300 }),
    staleTimeMs: 30_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <FundCollectionTopSection metrics={data.metrics} />
      <FundCollectionMiddleSection rows={data.rows} />
      <FundCollectionBottomSection summary={data.summary} />
    </PageStack>
  );
}
