'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import {
  UserDashboardBottomSection,
  UserDashboardMiddleSection,
  UserDashboardTopSection,
} from './_sections';
import type { UserDashboardMetric } from './_sections/types';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import {
  getUserDashboardSummary,
  getUserCategories,
  getUserLoans,
  getUserTransactions,
  mapCategoryRow,
  mapLoanRow,
  mapTransactionRow,
  toBanglaDate,
} from '@/lib/api';
import type { Category, Transaction } from '@/types';

const initialData = {
  metrics: [] as UserDashboardMetric[],
  alerts: [] as string[],
  transactions: [] as Transaction[],
  categories: [] as Category[],
};

export default function UserDashboardPage() {
  const loadDashboard = useCallback(async () => {
    const [summary, transactionsRows, loanRows, categoryRows] = await Promise.all([
      getUserDashboardSummary(),
      getUserTransactions({ limit: 8 }),
      getUserLoans(),
      getUserCategories({ active: true }),
    ]);

    const transactions = transactionsRows.map(mapTransactionRow);
    const loans = loanRows.map(mapLoanRow);
    const categories = categoryRows.map(mapCategoryRow);

    const totalSavings = transactions
      .filter((item) => item.type === 'savings')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalDonations = transactions
      .filter((item) => item.type === 'donation')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalContributions = Number(summary.totalCollectionMinor ?? 0);
    const monthlyTarget = categories
      .filter((category) => category.type === 'savings' && category.recurrence === 'monthly' && !category.isVariable)
      .reduce((sum, category) => sum + Number(category.amount ?? 0), 0);

    const now = new Date();
    const monthlyPaid = transactionsRows
      .filter((row) => {
        if (Number(row.tx_type) !== 3) {
          return false;
        }
        const d = new Date(row.occurred_on);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, row) => sum + Number(row.amount_minor), 0);

    const nextLoanDue = [...loans]
      .filter((loan) => loan.status === 'active' || loan.status === 'overdue')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

    const alerts = [
      ...(monthlyTarget ? [`এই মাসের বাকি সঞ্চয় পরিকল্পনা: ${formatCurrencyBn(Math.max(0, monthlyTarget - monthlyPaid))}`] : []),
      nextLoanDue ? `পরবর্তী ঋণ কিস্তি: ${nextLoanDue.dueDate}` : 'বর্তমানে কোনো বকেয়া ঋণ কিস্তি নেই',
      `মোট সক্রিয় ঋণ: ${loans.filter((loan) => loan.status === 'active').length}টি`,
    ];

    return {
      metrics: [
        { label: 'মোট সঞ্চয়', value: formatCurrencyBn(totalSavings), hint: 'আপনার ব্যক্তিগত সঞ্চয়' },
        { label: 'মোট দান', value: formatCurrencyBn(totalDonations), hint: 'অবদান' },
        { label: 'মোট অবদান', value: formatCurrencyBn(totalContributions), hint: 'সঞ্চয় + দান' },
        { label: 'মাসিক সঞ্চয় পরিকল্পনা', value: monthlyTarget ? formatCurrencyBn(monthlyTarget) : 'সেট করা নেই', hint: `জমা: ${formatCurrencyBn(monthlyPaid)}` },
      ],
      alerts,
      transactions: transactions.slice(0, 6).map((tx) => ({ ...tx, date: tx.date || toBanglaDate(null) })),
      categories,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadDashboard, initialData, [], {
    cacheKey: queryKeys.user.dashboard(),
    staleTimeMs: 45_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <UserDashboardTopSection metrics={data.metrics} />
      <UserDashboardMiddleSection alerts={data.alerts} categories={data.categories} onMutationSuccess={() => void refetch()} />
      <UserDashboardBottomSection transactions={data.transactions} />
    </PageStack>
  );
}
