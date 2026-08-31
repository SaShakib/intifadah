'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { LoansBottomSection, LoansMiddleSection, LoansTopSection } from './_sections';
import { ALL_LOAN_ROWS, LOAN_METRICS, OVERDUE_LOAN_ROWS } from './_sections/constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getAdminCategories, getAdminLoans, getAdminMembers, mapCategoryRow, mapLoanRow, toBanglaDate, toInitials, toMinorNumber, toUserRole } from '@/lib/api';

const initialData = {
  metrics: [] as typeof LOAN_METRICS,
  loans: [] as typeof ALL_LOAN_ROWS,
  overdueLoans: [] as typeof OVERDUE_LOAN_ROWS,
  members: [],
  categories: [],
};

export default function LoansPage() {
  const loadLoans = useCallback(async () => {
    const [rows, memberRows, categoryRows] = await Promise.all([
      getAdminLoans(),
      getAdminMembers({ limit: 500, active: true }),
      getAdminCategories({ active: true, categoryType: 3 }),
    ]);
    const loans = rows.map(mapLoanRow);
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

    const totalLoanAmount = loans.reduce((total, loan) => total + loan.amount, 0);
    const activeLoans = loans.filter((loan) => loan.status === 'active');
    const pendingLoans = loans.filter((loan) => loan.status === 'pending_approval');
    const overdueLoans = loans.filter((loan) => loan.status === 'overdue');

    return {
      metrics: [
        { label: 'মোট ঋণ', value: formatCurrencyBn(totalLoanAmount), hint: 'সব আবেদন মিলিয়ে' },
        { label: 'সক্রিয় ঋণ', value: String(activeLoans.length), hint: 'চলমান পরিশোধ' },
        { label: 'অপেক্ষমাণ', value: String(pendingLoans.length), hint: 'অনুমোদনের জন্য' },
        { label: 'ওভারডিউ', value: String(overdueLoans.length), hint: 'ফলোআপ প্রয়োজন' },
      ],
      loans,
      overdueLoans,
      members,
      categories,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadLoans, initialData, [], {
    cacheKey: queryKeys.admin.loans(),
    staleTimeMs: 30_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <LoansTopSection metrics={data.metrics} />
      <LoansMiddleSection loans={data.loans} members={data.members} categories={data.categories} onMutationSuccess={() => void refetch()} />
      <LoansBottomSection overdueLoans={data.overdueLoans} />
    </PageStack>
  );
}
