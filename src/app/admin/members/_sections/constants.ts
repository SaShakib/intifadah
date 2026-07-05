import { MEMBERS } from '@/lib/data/members';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { MemberMetric } from './types';

const activeMembers = MEMBERS.filter((member) => member.isActive);
const inactiveMembers = MEMBERS.filter((member) => !member.isActive);
const totalSavings = MEMBERS.reduce((total, member) => total + member.totalSavings, 0);

export const MEMBER_METRICS: MemberMetric[] = [
  { label: 'মোট সদস্য', value: String(MEMBERS.length), hint: 'সকল নিবন্ধিত সদস্য' },
  { label: 'সক্রিয় সদস্য', value: String(activeMembers.length), hint: 'চলমান অ্যাকাউন্ট' },
  { label: 'নিষ্ক্রিয় সদস্য', value: String(inactiveMembers.length), hint: 'পুনরায় সক্রিয় করা যাবে' },
  { label: 'মোট সঞ্চয়', value: formatCurrencyBn(totalSavings), hint: 'সব সদস্য মিলে' },
];

export const MEMBER_TABLE_ROWS = MEMBERS;

export const RECENT_MEMBER_ROWS = [...MEMBERS]
  .sort((a, b) => b.joinDate.localeCompare(a.joinDate))
  .slice(0, 5);
