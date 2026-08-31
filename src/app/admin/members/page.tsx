'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { MembersBottomSection, MembersMiddleSection, MembersTopSection } from './_sections';
import { MEMBER_METRICS, MEMBER_TABLE_ROWS, RECENT_MEMBER_ROWS } from './_sections/constants';
import { queryKeys, useApiQuery } from '@/lib/api';
import { getAdminMembers, toBanglaDate, toInitials, toMinorNumber, toUserRole } from '@/lib/api';

const initialData = {
  metrics: [] as typeof MEMBER_METRICS,
  members: [] as typeof MEMBER_TABLE_ROWS,
  recentMembers: [] as typeof RECENT_MEMBER_ROWS,
};

export default function MembersPage() {
  const loadMembers = useCallback(async () => {
    const rows = await getAdminMembers({ limit: 300 });

    const members = rows.map((row) => ({
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

    const activeMembers = members.filter((member) => member.isActive);
    const inactiveMembers = members.filter((member) => !member.isActive);
    const totalSavings = members.reduce((sum, member) => sum + member.totalSavings, 0);

    const recentMembers = [...members]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 5);

    return {
      metrics: [
        { label: 'মোট সদস্য', value: String(members.length), hint: 'সকল নিবন্ধিত সদস্য' },
        { label: 'সক্রিয় সদস্য', value: String(activeMembers.length), hint: 'চলমান অ্যাকাউন্ট' },
        { label: 'নিষ্ক্রিয় সদস্য', value: String(inactiveMembers.length), hint: 'পুনরায় সক্রিয় করা যাবে' },
        { label: 'মোট সঞ্চয়', value: new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalSavings).replace('BDT', '৳'), hint: 'সব সদস্য মিলে' },
      ],
      members,
      recentMembers,
    };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadMembers, initialData, [], {
    cacheKey: queryKeys.admin.members({ limit: 300 }),
    staleTimeMs: 120_000,
  });

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}

      <MembersTopSection metrics={data.metrics} />
      <MembersMiddleSection members={data.members} onMutationSuccess={() => void refetch()} />
      <MembersBottomSection recentMembers={data.recentMembers} />
    </PageStack>
  );
}
