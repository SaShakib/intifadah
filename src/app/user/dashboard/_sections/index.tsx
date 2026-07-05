import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { USER_DASHBOARD_ALERTS, USER_DASHBOARD_METRICS, USER_DASHBOARD_TRANSACTIONS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { UserDashboardMetric } from './types';

interface UserDashboardTopSectionProps {
  metrics?: UserDashboardMetric[];
}

interface UserDashboardMiddleSectionProps {
  alerts?: string[];
}

interface UserDashboardBottomSectionProps {
  transactions?: typeof USER_DASHBOARD_TRANSACTIONS;
}

export function UserDashboardTopSection({ metrics = USER_DASHBOARD_METRICS }: UserDashboardTopSectionProps) {
  return (
    <section>
      <SectionHeader title="আর্থিক সারাংশ" subtitle="আপনার অ্যাকাউন্টের দ্রুত অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function UserDashboardMiddleSection({ alerts = USER_DASHBOARD_ALERTS }: UserDashboardMiddleSectionProps) {
  return (
    <section>
      <Card>
        <SectionHeader title="স্মরণ করিয়ে দেওয়া" subtitle="এই সপ্তাহের গুরুত্বপূর্ণ তথ্য" />
        <ul className="space-y-2 text-sm text-fg-2">
          {alerts.map((alert) => (
            <li key={alert} className="rounded-xl border border-border bg-surface-2 px-3 py-2">
              {alert}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

export function UserDashboardBottomSection({ transactions = USER_DASHBOARD_TRANSACTIONS }: UserDashboardBottomSectionProps) {
  const rows = transactions.map((transaction) => [
    transaction.date,
    transaction.categoryName ?? '-',
    formatCurrencyBn(transaction.amount),
    <Badge key={transaction.id} variant={transaction.status === 'pending' ? 'warning' : 'success'}>
      {transaction.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}
    </Badge>,
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক লেনদেন" subtitle="আপনার সর্বশেষ ট্রানজেকশন" />
        <DataTable headers={['তারিখ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}
