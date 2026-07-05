import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { CATEGORY_METRICS, CATEGORY_ROWS, CATEGORY_TYPE_SUMMARY } from './constants';
import type { CategoryMetric } from './types';

const TYPE_LABEL: Record<string, string> = {
  donation: 'দান',
  savings: 'সঞ্চয়',
  loan: 'ঋণ',
  expense: 'ব্যয়',
};

const RECUR_LABEL: Record<string, string> = {
  daily: 'দৈনিক',
  weekly: 'সাপ্তাহিক',
  monthly: 'মাসিক',
  yearly: 'বার্ষিক',
  one_time: 'এককালীন',
};

interface CategoriesTopSectionProps {
  metrics?: CategoryMetric[];
}

interface CategoriesMiddleSectionProps {
  categories?: typeof CATEGORY_ROWS;
}

interface CategoriesBottomSectionProps {
  summary?: typeof CATEGORY_TYPE_SUMMARY;
}

export function CategoriesTopSection({ metrics = CATEGORY_METRICS }: CategoriesTopSectionProps) {
  return (
    <section>
      <SectionHeader title="খাত সারাংশ" subtitle="খাতের সংখ্যা এবং সক্রিয়তা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function CategoriesMiddleSection({ categories = CATEGORY_ROWS }: CategoriesMiddleSectionProps) {
  const rows = categories.map((category) => [
    category.name,
    TYPE_LABEL[category.type],
    RECUR_LABEL[category.recurrence],
    category.isVariable ? 'পরিবর্তনশীল' : category.amount ? `৳${category.amount}` : '-',
    <Badge key={category.id} variant={category.isActive ? 'success' : 'muted'}>
      {category.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
    </Badge>,
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="খাত তালিকা" subtitle="প্রতি খাতের ধরন, পুনরাবৃত্তি ও স্ট্যাটাস" />
        <DataTable headers={['খাত', 'ধরণ', 'পুনরাবৃত্তি', 'পরিমাণ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}

export function CategoriesBottomSection({ summary = CATEGORY_TYPE_SUMMARY }: CategoriesBottomSectionProps) {
  const rows = summary.map((item) => [TYPE_LABEL[item.type] ?? item.type, String(item.count)]);

  return (
    <section>
      <Card>
        <SectionHeader title="ধরণভিত্তিক খাত" subtitle="প্রতি ধরণে মোট খাত সংখ্যা" />
        <DataTable headers={['ধরণ', 'খাত সংখ্যা']} rows={rows} />
      </Card>
    </section>
  );
}
