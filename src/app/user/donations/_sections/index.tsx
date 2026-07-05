import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { DONATION_CATEGORY_ROWS, DONATION_HISTORY_ROWS, DONATION_METRICS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { DonationMetric } from './types';

interface DonationsTopSectionProps {
  metrics?: DonationMetric[];
}

interface DonationsMiddleSectionProps {
  categories?: typeof DONATION_CATEGORY_ROWS;
}

interface DonationsBottomSectionProps {
  history?: typeof DONATION_HISTORY_ROWS;
}

export function DonationsTopSection({ metrics = DONATION_METRICS }: DonationsTopSectionProps) {
  return (
    <section>
      <SectionHeader title="দান সারাংশ" subtitle="আপনার দানের অগ্রগতি" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function DonationsMiddleSection({ categories = DONATION_CATEGORY_ROWS }: DonationsMiddleSectionProps) {
  const rows = categories.map((category) => [
    category.name,
    category.description ?? '-',
    category.isVariable ? 'পরিবর্তনশীল' : category.amount ? formatCurrencyBn(category.amount) : '-',
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="দান খাতসমূহ" subtitle="যেসব খাতে আপনি দান করতে পারবেন" />
        <DataTable headers={['খাত', 'বিবরণ', 'প্রস্তাবিত পরিমাণ']} rows={rows} />
      </Card>
    </section>
  );
}

export function DonationsBottomSection({ history = DONATION_HISTORY_ROWS }: DonationsBottomSectionProps) {
  const rows = history.map((item) => [item.date, item.categoryName ?? '-', formatCurrencyBn(item.amount), 'সম্পন্ন']);

  return (
    <section>
      <Card>
        <SectionHeader title="দান ইতিহাস" subtitle="আপনার সম্পন্ন দানসমূহ" />
        <DataTable headers={['তারিখ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}
