'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { ReportsBottomSection, ReportsMiddleSection, ReportsTopSection } from './_sections';
import { MEMBER_REPORT_ROWS, MONTHLY_REPORT_ROWS, REPORT_METRICS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import {
  getAdminCollections,
  getAdminDashboardSummary,
  getMemberFinancialSummary,
  toMinorNumber,
} from '@/lib/api';

const initialData = {
  metrics: [] as typeof REPORT_METRICS,
  monthlyRows: [] as typeof MONTHLY_REPORT_ROWS,
  memberRows: [] as typeof MEMBER_REPORT_ROWS,
};

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('bn-BD', { month: 'short' }).format(new Date(year, month, 1));
}

export default function ReportsPage() {
  const loadReports = useCallback(async () => {
    const [summary, transactionsRows, memberSummaryRows] = await Promise.all([
      getAdminDashboardSummary(),
      getAdminCollections({ limit: 500 }),
      getMemberFinancialSummary(),
    ]);

    const monthBuckets = new Map<string, number>();
    for (const row of transactionsRows) {
      const parsed = new Date(row.occurred_on);
      if (Number.isNaN(parsed.getTime())) {
        continue;
      }

      const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
      monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + Number(row.amount_minor));
    }

    const now = new Date();
    const monthlyRows = Array.from({ length: 6 }).map((_, offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const total = monthBuckets.get(key) ?? 0;

      return {
        month: monthLabel(date.getFullYear(), date.getMonth()),
        value: Math.round(total / 1000),
        isCurrent: offset === 5,
      };
    });

    const memberRows = memberSummaryRows.map((row) => ({
      name: row.full_name,
      savings: toMinorNumber(row.total_deposit_minor),
      donations: toMinorNumber(row.total_repaid_minor),
      activeLoan: Math.max(0, toMinorNumber(row.current_due_minor)),
    }));

    return {
      metrics: [
        { label: 'মোট সংগ্রহ', value: formatCurrencyBn(toMinorNumber(summary.totalCollectionMinor)), hint: 'সমস্ত সময়' },
        { label: 'ঋণ বিতরণ', value: formatCurrencyBn(toMinorNumber(summary.totalLoanDistributedMinor)), hint: 'সক্রিয় ঋণসহ' },
        { label: 'বর্তমান ব্যালেন্স', value: formatCurrencyBn(toMinorNumber(summary.currentBalanceMinor)), hint: 'বর্তমান নগদ অবস্থা' },
        { label: 'মোট সদস্য', value: String(summary.totalMembers), hint: 'নিবন্ধিত সদস্য' },
      ],
      monthlyRows,
      memberRows,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadReports, initialData, [], {
    cacheKey: queryKeys.admin.reports(),
    staleTimeMs: 60_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <ReportsTopSection metrics={data.metrics} />
      <ReportsMiddleSection monthlyRows={data.monthlyRows} />
      <ReportsBottomSection memberRows={data.memberRows} />
    </PageStack>
  );
}
