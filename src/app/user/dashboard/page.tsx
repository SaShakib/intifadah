'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import {
  UserDashboardBottomSection,
  UserDashboardMiddleSection,
  UserDashboardTopSection,
} from './_sections';
import {
  USER_DASHBOARD_ALERTS,
  USER_DASHBOARD_METRICS,
  USER_DASHBOARD_TRANSACTIONS,
} from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import {
  getUserDashboardSummary,
  getUserLoans,
  getUserTransactions,
  mapLoanRow,
  mapTransactionRow,
  toBanglaDate,
} from '@/lib/api';

const initialData = {
  metrics: USER_DASHBOARD_METRICS,
  alerts: USER_DASHBOARD_ALERTS,
  transactions: USER_DASHBOARD_TRANSACTIONS,
};

const MONTHLY_TARGET = 2000;

export default function UserDashboardPage() {
  const loadDashboard = useCallback(async () => {
    const [summary, transactionsRows, loanRows] = await Promise.all([
      getUserDashboardSummary(),
      getUserTransactions({ limit: 8 }),
      getUserLoans(),
    ]);

    const transactions = transactionsRows.map(mapTransactionRow);
    const loans = loanRows.map(mapLoanRow);

    const totalSavings = transactions
      .filter((item) => item.type === 'savings')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalDonations = transactions
      .filter((item) => item.type === 'donation')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalContributions = Number(summary.totalCollectionMinor ?? 0);

    const now = new Date();
    const monthlyPaid = transactionsRows
      .filter((row) => {
        const d = new Date(row.occurred_on);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, row) => sum + Number(row.amount_minor), 0);

    const nextLoanDue = [...loans]
      .filter((loan) => loan.status === 'active' || loan.status === 'overdue')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

    const alerts = [
      `এই মাসের বাকি লক্ষ্য: ${formatCurrencyBn(Math.max(0, MONTHLY_TARGET - monthlyPaid))}`,
      nextLoanDue ? `পরবর্তী ঋণ কিস্তি: ${nextLoanDue.dueDate}` : 'বর্তমানে কোনো বকেয়া ঋণ কিস্তি নেই',
      `মোট সক্রিয় ঋণ: ${loans.filter((loan) => loan.status === 'active').length}টি`,
    ];

    return {
      metrics: [
        { label: 'মোট সঞ্চয়', value: formatCurrencyBn(totalSavings), hint: 'আপনার ব্যক্তিগত সঞ্চয়' },
        { label: 'মোট দান', value: formatCurrencyBn(totalDonations), hint: 'অবদান' },
        { label: 'মোট অবদান', value: formatCurrencyBn(totalContributions), hint: 'সঞ্চয় + দান' },
        { label: 'মাসিক লক্ষ্য', value: formatCurrencyBn(MONTHLY_TARGET), hint: `পরিশোধিত: ${formatCurrencyBn(monthlyPaid)}` },
      ],
      alerts,
      transactions: transactions.slice(0, 6).map((tx) => ({ ...tx, date: tx.date || toBanglaDate(null) })),
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadDashboard, initialData, [], {
    cacheKey: queryKeys.user.dashboard(),
    staleTimeMs: 45_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <UserDashboardTopSection metrics={data.metrics} />
      <UserDashboardMiddleSection alerts={data.alerts} />
      <UserDashboardBottomSection transactions={data.transactions} />
    </PageStack>
  );
}
