import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { SAVINGS_HISTORY_ROWS, SAVINGS_METRICS, SAVINGS_PLAN_ROWS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { SavingsMetric } from './types';

interface SavingsTopSectionProps {
  metrics?: SavingsMetric[];
}

interface SavingsBottomSectionProps {
  history?: typeof SAVINGS_HISTORY_ROWS;
}

export function SavingsTopSection({ metrics = SAVINGS_METRICS }: SavingsTopSectionProps) {
  return (
    <section>
      <SectionHeader title="সঞ্চয় সারাংশ" subtitle="আপনার সঞ্চয়ের বর্তমান অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function SavingsMiddleSection() {
  return (
    <section>
      <Card>
        <SectionHeader title="সঞ্চয় পরিকল্পনা" subtitle="নির্ধারিত খাতসমূহ" />
        <DataTable headers={['খাত', 'প্রস্তাবিত পরিমাণ', 'সময়সূচি']} rows={SAVINGS_PLAN_ROWS} />
      </Card>
    </section>
  );
}

export function SavingsBottomSection({ history = SAVINGS_HISTORY_ROWS }: SavingsBottomSectionProps) {
  const rows = history.map((transaction) => [transaction.date, transaction.categoryName ?? '-', formatCurrencyBn(transaction.amount), 'সম্পন্ন']);

  return (
    <section>
      <Card>
        <SectionHeader title="সঞ্চয় ইতিহাস" subtitle="আপনার সম্পন্ন সঞ্চয় জমা" />
        <DataTable headers={['তারিখ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}
