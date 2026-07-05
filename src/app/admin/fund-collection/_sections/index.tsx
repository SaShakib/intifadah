import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { FUND_COLLECTION_ROWS, FUND_METRICS, FUND_TYPE_SUMMARY } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { FundMetric } from './types';

const TYPE_LABEL: Record<string, string> = {
  collection: 'কালেকশন',
  donation: 'দান',
  savings: 'সঞ্চয়',
};

interface FundCollectionTopSectionProps {
  metrics?: FundMetric[];
}

interface FundCollectionMiddleSectionProps {
  rows?: typeof FUND_COLLECTION_ROWS;
}

interface FundCollectionBottomSectionProps {
  summary?: typeof FUND_TYPE_SUMMARY;
}

export function FundCollectionTopSection({ metrics = FUND_METRICS }: FundCollectionTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ফান্ড সংগ্রহ সারাংশ" subtitle="বর্তমান সংগ্রহের অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function FundCollectionMiddleSection({ rows: items = FUND_COLLECTION_ROWS }: FundCollectionMiddleSectionProps) {
  const rows = items.map((item) => [
    item.memberName,
    TYPE_LABEL[item.type] ?? item.type,
    item.categoryName ?? '-',
    formatCurrencyBn(item.amount),
    item.date,
    <Badge key={item.id} variant={item.status === 'pending' ? 'warning' : 'success'}>
      {item.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}
    </Badge>,
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক সংগ্রহ" subtitle="প্রতিটি জমার অবস্থা" />
        <DataTable headers={['সদস্য', 'ধরণ', 'খাত', 'পরিমাণ', 'তারিখ', 'স্ট্যাটাস']} rows={rows} />
      </Card>
    </section>
  );
}

export function FundCollectionBottomSection({ summary = FUND_TYPE_SUMMARY }: FundCollectionBottomSectionProps) {
  const rows = summary.map((item) => [TYPE_LABEL[item.type] ?? item.type, formatCurrencyBn(item.amount)]);

  return (
    <section>
      <Card>
        <SectionHeader title="ধরণভিত্তিক সংগ্রহ" subtitle="কোন ধরণ থেকে কত ফান্ড এসেছে" />
        <DataTable headers={['ধরণ', 'মোট পরিমাণ']} rows={rows} />
      </Card>
    </section>
  );
}
