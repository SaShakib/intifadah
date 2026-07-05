import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { REPAYMENT_METRICS, REPAYMENT_ROWS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { RepaymentMetric } from './types';

interface LoanRepaymentTopSectionProps {
  metrics?: RepaymentMetric[];
}

interface LoanRepaymentMiddleSectionProps {
  rows?: typeof REPAYMENT_ROWS;
}

export function LoanRepaymentTopSection({ metrics = REPAYMENT_METRICS }: LoanRepaymentTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ঋণ ফেরত সারাংশ" subtitle="ফেরত, বকেয়া এবং কিস্তির অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function LoanRepaymentMiddleSection({ rows: repayments = REPAYMENT_ROWS }: LoanRepaymentMiddleSectionProps) {
  const rows = repayments.map((loan) => {
    const outstanding = loan.amount - loan.totalRepaid;
    return [
      loan.borrowerName,
      formatCurrencyBn(loan.amount),
      formatCurrencyBn(loan.totalRepaid),
      formatCurrencyBn(outstanding),
      formatCurrencyBn(loan.installmentAmount ?? 0),
      loan.status === 'overdue' ? <Badge key={loan.id} variant="danger">ওভারডিউ</Badge> : <Badge key={loan.id} variant="info">চলমান</Badge>,
    ];
  });

  return (
    <section>
      <Card>
        <SectionHeader title="কিস্তি ট্র্যাকার" subtitle="সদস্যভিত্তিক ফেরত অগ্রগতি" />
        <DataTable headers={['সদস্য', 'মোট ঋণ', 'ফেরত', 'বকেয়া', 'মাসিক কিস্তি', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}

export function LoanRepaymentBottomSection() {
  return (
    <section>
      <Card>
        <SectionHeader title="ফলোআপ নির্দেশনা" subtitle="টিম অপারেশনের জন্য প্রস্তাবিত ধাপ" />
        <ul className="space-y-2 text-sm text-fg-2">
          <li>১. ওভারডিউ ঋণের জন্য ৭ দিনের মধ্যে রিমাইন্ডার পাঠান।</li>
          <li>২. কিস্তি ভেঙে দেওয়ার অনুরোধগুলো সাপ্তাহিক সভায় অনুমোদন করুন।</li>
          <li>৩. ফেরত সংগ্রহের সারাংশ মাস শেষে রিপোর্টে যুক্ত করুন।</li>
        </ul>
      </Card>
    </section>
  );
}
