import { ADMIN_STATS, MONTHLY_CHART_DATA } from '@/lib/data/stats';
import { MEMBERS } from '@/lib/data/members';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { ReportMetric } from './types';

export const REPORT_METRICS: ReportMetric[] = [
  { label: 'মোট সংগ্রহ', value: formatCurrencyBn(ADMIN_STATS.totalCollection), hint: 'সমস্ত সময়' },
  { label: 'ঋণ বিতরণ', value: formatCurrencyBn(ADMIN_STATS.totalLoans), hint: 'সক্রিয় ঋণসহ' },
  { label: 'বর্তমান ব্যালেন্স', value: formatCurrencyBn(ADMIN_STATS.currentBalance), hint: 'বর্তমান নগদ অবস্থা' },
  { label: 'মোট সদস্য', value: String(ADMIN_STATS.totalMembers), hint: 'নিবন্ধিত সদস্য' },
];

export const MONTHLY_REPORT_ROWS = MONTHLY_CHART_DATA;

export const MEMBER_REPORT_ROWS = MEMBERS.map((member) => ({
  name: member.name,
  savings: member.totalSavings,
  donations: member.totalDonations,
  activeLoan: member.activeLoan ?? 0,
}));
