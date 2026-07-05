import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { ALL_LOAN_ROWS, LOAN_METRICS, OVERDUE_LOAN_ROWS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { LoanMetric } from './types';

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="info">সক্রিয়</Badge>;
  if (status === 'pending_approval') return <Badge variant="warning">অপেক্ষমাণ</Badge>;
  if (status === 'overdue') return <Badge variant="danger">ওভারডিউ</Badge>;
  return <Badge variant="success">পরিশোধিত</Badge>;
}

interface LoansTopSectionProps {
  metrics?: LoanMetric[];
}

interface LoansMiddleSectionProps {
  loans?: typeof ALL_LOAN_ROWS;
}

interface LoansBottomSectionProps {
  overdueLoans?: typeof OVERDUE_LOAN_ROWS;
}

export function LoansTopSection({ metrics = LOAN_METRICS }: LoansTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ঋণ সারাংশ" subtitle="ঋণ বিতরণ ও ঝুঁকির অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function LoansMiddleSection({ loans = ALL_LOAN_ROWS }: LoansMiddleSectionProps) {
  const rows = loans.map((loan) => [
    loan.borrowerName,
    loan.purpose,
    formatCurrencyBn(loan.amount),
    loan.issueDate,
    loan.dueDate,
    statusBadge(loan.status),
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="ঋণের তালিকা" subtitle="সব ঋণ একসাথে দেখুন" />
        <DataTable headers={['সদস্য', 'উদ্দেশ্য', 'পরিমাণ', 'শুরুর তারিখ', 'শেষ তারিখ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}

export function LoansBottomSection({ overdueLoans = OVERDUE_LOAN_ROWS }: LoansBottomSectionProps) {
  const rows = overdueLoans.map((loan) => [
    loan.borrowerName,
    formatCurrencyBn(loan.amount - loan.totalRepaid),
    loan.dueDate,
    formatCurrencyBn(loan.installmentAmount ?? 0),
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="ওভারডিউ ঋণ ফলোআপ" subtitle="যেগুলোতে জরুরি যোগাযোগ দরকার" />
        <DataTable headers={['সদস্য', 'বকেয়া', 'শেষ সময়', 'কিস্তি']} rows={rows} />
      </Card>
    </section>
  );
}
