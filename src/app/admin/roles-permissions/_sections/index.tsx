import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { MODULE_ROWS, ROLE_ROWS } from './constants';
import type { RoleSummary } from './types';

function permissionBadge(level: 'high' | 'medium' | 'low') {
  if (level === 'high') return <Badge variant="danger">পূর্ণ অনুমতি</Badge>;
  if (level === 'medium') return <Badge variant="warning">আংশিক অনুমতি</Badge>;
  return <Badge variant="muted">সীমিত অনুমতি</Badge>;
}

interface RolesTopSectionProps {
  roleRows?: RoleSummary[];
}

interface RolesMiddleSectionProps {
  roleRows?: RoleSummary[];
}

interface RolesBottomSectionProps {
  moduleRows?: typeof MODULE_ROWS;
}

export function RolesTopSection({ roleRows = ROLE_ROWS }: RolesTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ভূমিকা সারাংশ" subtitle="ভূমিকা অনুযায়ী ব্যবহারকারীর সংখ্যা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="মোট ভূমিকা" value={String(roleRows.length)} hint="সিস্টেমে সক্রিয়" />
        <MetricCard label="মোট ব্যবহারকারী" value={String(roleRows.reduce((sum, row) => sum + row.members, 0))} hint="সব ভূমিকা মিলিয়ে" />
        <MetricCard label="পূর্ণ অনুমতি ভূমিকা" value={String(roleRows.filter((row) => row.level === 'high').length)} hint="উচ্চ অ্যাক্সেস" />
        <MetricCard label="সীমিত ভূমিকা" value={String(roleRows.filter((row) => row.level === 'low').length)} hint="নিম্ন অ্যাক্সেস" />
      </div>
    </section>
  );
}

export function RolesMiddleSection({ roleRows = ROLE_ROWS }: RolesMiddleSectionProps) {
  const rows = roleRows.map((row) => [row.role, String(row.members), row.modules, permissionBadge(row.level)]);

  return (
    <section>
      <Card>
        <SectionHeader title="ভূমিকা তালিকা" subtitle="কারা কোন মডিউলে কাজ করতে পারবে" />
        <DataTable headers={['ভূমিকা', 'সদস্য সংখ্যা', 'অনুমোদিত মডিউল', 'অ্যাক্সেস']} rows={rows} />
      </Card>
    </section>
  );
}

export function RolesBottomSection({ moduleRows = MODULE_ROWS }: RolesBottomSectionProps) {
  return (
    <section>
      <Card>
        <SectionHeader title="মডিউল-অ্যাক্সেস ম্যাপ" subtitle="মডিউলভিত্তিক কে ব্যবহার করতে পারবে" />
        <DataTable headers={['মডিউল', 'অনুমোদিত ভূমিকা']} rows={moduleRows} />
      </Card>
    </section>
  );
}
