import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { MEMBER_METRICS, MEMBER_TABLE_ROWS, RECENT_MEMBER_ROWS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';

interface MembersTopSectionProps {
  metrics?: typeof MEMBER_METRICS;
}

interface MembersMiddleSectionProps {
  members?: typeof MEMBER_TABLE_ROWS;
}

interface MembersBottomSectionProps {
  recentMembers?: typeof RECENT_MEMBER_ROWS;
}

export function MembersTopSection({ metrics = MEMBER_METRICS }: MembersTopSectionProps) {
  return (
    <section>
      <SectionHeader title="সদস্য সারাংশ" subtitle="মেম্বারশিপের দ্রুত অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function MembersMiddleSection({ members = MEMBER_TABLE_ROWS }: MembersMiddleSectionProps) {
  const rows = members.map((member) => [
    member.memberId,
    member.name,
    member.phone,
    formatCurrencyBn(member.totalSavings),
    <Badge key={member.id} variant={member.isActive ? 'success' : 'muted'}>
      {member.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
    </Badge>,
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="সদস্য তালিকা" subtitle="সকল সদস্যের বর্তমান অবস্থা" />
        <DataTable headers={['আইডি', 'নাম', 'ফোন', 'সঞ্চয়', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}

export function MembersBottomSection({ recentMembers = RECENT_MEMBER_ROWS }: MembersBottomSectionProps) {
  const rows = recentMembers.map((member) => [
    member.name,
    member.joinDate,
    member.address ?? '-',
    formatCurrencyBn(member.totalDonations),
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক যোগদান" subtitle="সর্বশেষ ৫টি সদস্য অ্যাকাউন্ট" />
        <DataTable headers={['নাম', 'যোগদানের তারিখ', 'ঠিকানা', 'মোট দান']} rows={rows} />
      </Card>
    </section>
  );
}
