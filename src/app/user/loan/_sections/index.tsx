import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { USER_LOAN_HISTORY_ROWS, USER_LOAN_METRICS, USER_LOAN_SCHEDULE_ROWS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { UserLoanMetric } from './types';

function historyStatusBadge(status: string) {
  if (status === 'active') return <Badge variant="info">সক্রিয়</Badge>;
  if (status === 'pending_approval') return <Badge variant="warning">অপেক্ষমাণ</Badge>;
  if (status === 'overdue') return <Badge variant="danger">ওভারডিউ</Badge>;
  return <Badge variant="success">পরিশোধিত</Badge>;
}

interface LoanTopSectionProps {
  metrics?: UserLoanMetric[];
}

interface LoanMiddleSectionProps {
  scheduleRows?: typeof USER_LOAN_SCHEDULE_ROWS;
}

interface LoanBottomSectionProps {
  loanHistory?: typeof USER_LOAN_HISTORY_ROWS;
}

export function LoanTopSection({ metrics = USER_LOAN_METRICS }: LoanTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ঋণ সারাংশ" subtitle="আপনার বর্তমান ঋণ ও কিস্তির অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function LoanMiddleSection({ scheduleRows = USER_LOAN_SCHEDULE_ROWS }: LoanMiddleSectionProps) {
  return (
    <section>
      <Card>
        <SectionHeader title="কিস্তির সময়সূচি" subtitle="পরবর্তী কিস্তি তালিকা" />
        <DataTable headers={['তারিখ', 'পরিমাণ', 'স্ট্যাটাস']} rows={scheduleRows} />
      </Card>
    </section>
  );
}

export function LoanBottomSection({ loanHistory = USER_LOAN_HISTORY_ROWS }: LoanBottomSectionProps) {
  const rows = loanHistory.map((loan) => [
    loan.purpose,
    formatCurrencyBn(loan.amount),
    formatCurrencyBn(loan.repaid),
    loan.dueDate,
    historyStatusBadge(loan.status),
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="ঋণ ইতিহাস" subtitle="পূর্ববর্তী ও চলমান ঋণসমূহ" />
        <DataTable headers={['উদ্দেশ্য', 'ঋণের পরিমাণ', 'পরিশোধ', 'শেষ তারিখ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}
