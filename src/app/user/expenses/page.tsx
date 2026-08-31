'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { ExpensesBottomSection, ExpensesMiddleSection, ExpensesTopSection } from './_sections';
import { EXPENSE_BUDGET_ROWS, EXPENSE_METRICS, EXPENSE_ROWS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getUserExpenses, mapTransactionRow } from '@/lib/api';

const initialData = {
  metrics: [] as typeof EXPENSE_METRICS,
  budgetRows: [] as typeof EXPENSE_BUDGET_ROWS,
  expenseRows: [] as typeof EXPENSE_ROWS,
};

export default function ExpensesPage() {
  const loadExpenses = useCallback(async () => {
    const rows = await getUserExpenses({ limit: 300 });
    const expenses = rows.map(mapTransactionRow);

    const expenseRows = expenses.map((row) => ({
      date: row.date,
      category: row.categoryName ?? 'অনির্ধারিত',
      amount: row.amount,
      note: row.note ?? '-',
    }));

    const totalExpenses = expenseRows.reduce((sum, row) => sum + row.amount, 0);

    const byCategory = expenseRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + row.amount;
      return acc;
    }, {});

    const budgetRows = Object.entries(byCategory).map(([category, spent]) => {
      const budget = Math.max(spent, Math.round(spent * 1.4));
      const percentage = budget > 0 ? `${Math.round((spent / budget) * 100)}%` : '0%';
      return [category, formatCurrencyBn(budget), formatCurrencyBn(spent), percentage];
    });

    return {
      metrics: [
        { label: 'মাসিক খরচ', value: formatCurrencyBn(totalExpenses), hint: 'চলতি তালিকা থেকে' },
        { label: 'রেকর্ড সংখ্যা', value: String(expenseRows.length), hint: 'নিবন্ধিত ব্যয়' },
        { label: 'গড় ব্যয়', value: formatCurrencyBn(Math.round(totalExpenses / Math.max(1, expenseRows.length))), hint: 'প্রতি এন্ট্রি' },
        { label: 'সবচেয়ে বড় ব্যয়', value: formatCurrencyBn(Math.max(0, ...expenseRows.map((row) => row.amount))), hint: 'একক ব্যয়ের সর্বোচ্চ' },
      ],
      budgetRows,
      expenseRows,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadExpenses, initialData, [], {
    cacheKey: queryKeys.user.expenses({ limit: 300 }),
    staleTimeMs: 45_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <ExpensesTopSection metrics={data.metrics} />
      <ExpensesMiddleSection budgetRows={data.budgetRows} />
      <ExpensesBottomSection rows={data.expenseRows} />
    </PageStack>
  );
}
