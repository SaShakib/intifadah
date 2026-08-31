import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { DASHBOARD_METRICS, DASHBOARD_PENDING_LOANS, DASHBOARD_RECENT_TRANSACTIONS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';

interface AdminDashboardTopSectionProps {
  metrics?: typeof DASHBOARD_METRICS;
}

interface AdminDashboardMiddleSectionProps {
  pendingLoans?: typeof DASHBOARD_PENDING_LOANS;
}

interface AdminDashboardBottomSectionProps {
  recentTransactions?: typeof DASHBOARD_RECENT_TRANSACTIONS;
}

export function AdminDashboardTopSection({ metrics = DASHBOARD_METRICS }: AdminDashboardTopSectionProps) {
  return (
    <section>
      <SectionHeader title="আজকের সারাংশ" subtitle="ফান্ড, সদস্য ও ব্যালেন্সের দ্রুত অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function AdminDashboardMiddleSection({ pendingLoans = DASHBOARD_PENDING_LOANS }: AdminDashboardMiddleSectionProps) {
  const rows = pendingLoans.map((loan) => ({
    id: loan.id,
    tabValue: loan.status,
    searchText: `${loan.borrowerName} ${loan.purpose} ${loan.dueDate}`,
    sortValues: [loan.borrowerName, loan.purpose, loan.amount, loan.dueDate, loan.status],
    cells: [
      loan.borrowerName,
      loan.purpose,
      <span key={`${loan.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(loan.amount)}</span>,
      loan.dueDate,
      <Badge key={loan.id} variant={loan.status === 'overdue' ? 'danger' : 'warning'}>
        {loan.status === 'overdue' ? 'ওভারডিউ' : 'অনুমোদন অপেক্ষায়'}
      </Badge>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="বকেয়া ও অনুমোদন অপেক্ষমান ঋণ" subtitle="যেগুলো এখনই রিভিউ করা দরকার" />
        <DataTable
          headers={['সদস্য', 'উদ্দেশ্য', 'পরিমাণ', 'শেষ তারিখ', 'স্ট্যাটাস']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'pending_approval', label: 'অপেক্ষমাণ' },
            { value: 'overdue', label: 'ওভারডিউ', tone: 'danger' },
          ]}
          searchPlaceholder="সদস্য বা উদ্দেশ্য..."
        />
      </Card>
    </section>
  );
}

export function AdminDashboardBottomSection({
  recentTransactions = DASHBOARD_RECENT_TRANSACTIONS,
}: AdminDashboardBottomSectionProps) {
  const rows = recentTransactions.map((transaction) => [
    transaction.memberName,
    transaction.categoryName ?? '-',
    formatCurrencyBn(transaction.amount),
    transaction.date,
    <Badge key={transaction.id} variant={transaction.status === 'pending' ? 'warning' : 'success'}>
      {transaction.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}
    </Badge>,
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক লেনদেন" subtitle="সর্বশেষ ৮টি কার্যক্রম" />
        <DataTable headers={['সদস্য', 'খাত', 'পরিমাণ', 'তারিখ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}
