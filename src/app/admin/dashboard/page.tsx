'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import {
  AdminDashboardBottomSection,
  AdminDashboardMiddleSection,
  AdminDashboardTopSection,
} from './_sections';
import {
  DASHBOARD_METRICS,
  DASHBOARD_PENDING_LOANS,
  DASHBOARD_RECENT_TRANSACTIONS,
} from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getAdminCollections, getAdminDashboardSummary, getAdminLoans, mapLoanRow, mapTransactionRow, toMinorNumber } from '@/lib/api';

const initialData = {
  metrics: DASHBOARD_METRICS,
  pendingLoans: DASHBOARD_PENDING_LOANS,
  recentTransactions: DASHBOARD_RECENT_TRANSACTIONS,
};

export default function DashboardPage() {
  const loadDashboard = useCallback(async () => {
    const [summary, loansRows, collectionRows] = await Promise.all([
      getAdminDashboardSummary(),
      getAdminLoans({ status: '0,3' }),
      getAdminCollections({ limit: 8 }),
    ]);

    const pendingLoans = loansRows
      .map(mapLoanRow)
      .filter((loan) => loan.status === 'pending_approval' || loan.status === 'overdue')
      .slice(0, 5);

    const recentTransactions = collectionRows.slice(0, 8).map(mapTransactionRow);

    return {
      metrics: [
        { label: 'মোট সদস্য', value: String(summary.totalMembers), hint: 'সক্রিয় সদস্য' },
        { label: 'মোট তহবিল', value: formatCurrencyBn(toMinorNumber(summary.totalCollectionMinor)), hint: 'বর্তমান ফান্ড' },
        { label: 'মোট বিতরণ', value: formatCurrencyBn(toMinorNumber(summary.totalLoanDistributedMinor)), hint: 'ঋণ বিতরণ' },
        { label: 'বর্তমান ব্যালেন্স', value: formatCurrencyBn(toMinorNumber(summary.currentBalanceMinor)), hint: 'ব্যবহারযোগ্য' },
      ],
      pendingLoans,
      recentTransactions,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadDashboard, initialData, [], {
    cacheKey: queryKeys.admin.dashboard(),
    staleTimeMs: 45_000,
  });

  return (
    <PageStack>
      {loading && <ApiLoadingNotice />}
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <AdminDashboardTopSection metrics={data.metrics} />
      <AdminDashboardMiddleSection pendingLoans={data.pendingLoans} />
      <AdminDashboardBottomSection recentTransactions={data.recentTransactions} />
    </PageStack>
  );
}
