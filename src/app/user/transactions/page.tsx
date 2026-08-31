'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import {
  TransactionsBottomSection,
  TransactionsMiddleSection,
  TransactionsTopSection,
} from './_sections';
import { TRANSACTION_METRICS, TRANSACTION_ROWS, TRANSACTION_TYPE_SUMMARY } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserTransactions, mapTransactionRow } from '@/lib/api';

const initialData = {
  metrics: [] as typeof TRANSACTION_METRICS,
  rows: [] as typeof TRANSACTION_ROWS,
  summary: [] as typeof TRANSACTION_TYPE_SUMMARY,
};

export default function TransactionsPage() {
  const loadTransactions = useCallback(async () => {
    const rows = await getUserTransactions({ limit: 300 });
    const transactions = rows.map(mapTransactionRow);

    const total = transactions.reduce((sum, item) => sum + item.amount, 0);
    const summary = Object.entries(
      transactions.reduce<Record<string, number>>((acc, item) => {
        acc[item.type] = (acc[item.type] ?? 0) + item.amount;
        return acc;
      }, {}),
    ).map(([type, amount]) => ({ type, amount }));

    return {
      metrics: [
        { label: 'মোট লেনদেন', value: String(transactions.length), hint: 'রেকর্ড করা এন্ট্রি' },
        { label: 'মোট পরিমাণ', value: formatCurrencyBn(total), hint: 'সব এন্ট্রি যোগফল' },
        { label: 'সর্বশেষ তারিখ', value: transactions[0]?.date ?? '-', hint: 'শেষ আপডেট' },
        { label: 'গড় পরিমাণ', value: formatCurrencyBn(Math.round(total / Math.max(1, transactions.length))), hint: 'প্রতি লেনদেনে গড়' },
      ],
      rows: transactions,
      summary,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadTransactions, initialData, [], {
    cacheKey: queryKeys.user.transactions({ limit: 300 }),
    staleTimeMs: 45_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <TransactionsTopSection metrics={data.metrics} />
      <TransactionsMiddleSection rows={data.rows} />
      <TransactionsBottomSection summary={data.summary} />
    </PageStack>
  );
}
