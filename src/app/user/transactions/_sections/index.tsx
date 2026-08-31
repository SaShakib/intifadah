import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { TRANSACTION_METRICS, TRANSACTION_ROWS, TRANSACTION_TYPE_SUMMARY } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { TransactionMetric } from './types';

const TYPE_LABEL: Record<string, string> = {
  collection: 'কালেকশন',
  savings: 'সঞ্চয়',
  loan: 'ঋণ',
  donation: 'দান',
  repayment: 'পরিশোধ',
};

interface TransactionsTopSectionProps {
  metrics?: TransactionMetric[];
}

interface TransactionsMiddleSectionProps {
  rows?: typeof TRANSACTION_ROWS;
}

interface TransactionsBottomSectionProps {
  summary?: typeof TRANSACTION_TYPE_SUMMARY;
}

export function TransactionsTopSection({ metrics = TRANSACTION_METRICS }: TransactionsTopSectionProps) {
  return (
    <section>
      <SectionHeader title="লেনদেন সারাংশ" subtitle="আপনার সম্পূর্ণ লেনদেন অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function TransactionsMiddleSection({ rows: transactions = TRANSACTION_ROWS }: TransactionsMiddleSectionProps) {
  const rows = transactions.map((item) => ({
    id: item.id,
    tabValue: item.type,
    filterValues: { type: item.type, status: item.status },
    searchText: `${item.date} ${TYPE_LABEL[item.type] ?? item.type} ${item.categoryName ?? ''}`,
    sortValues: [item.date, TYPE_LABEL[item.type] ?? item.type, item.categoryName ?? '', item.amount, item.status],
    cells: [
      item.date,
      TYPE_LABEL[item.type] ?? item.type,
      item.categoryName ?? '-',
      <span key={`${item.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(item.amount)}</span>,
      <Badge key={item.id} variant={item.status === 'pending' ? 'warning' : 'success'}>
        {item.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}
      </Badge>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="লেনদেন তালিকা" subtitle="তারিখ অনুযায়ী সাজানো" />
        <DataTable
          headers={['তারিখ', 'ধরণ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
          ]}
          filters={[
            {
              id: 'status',
              label: 'সব স্ট্যাটাস',
              options: [
                { value: 'completed', label: 'সম্পন্ন' },
                { value: 'pending', label: 'অপেক্ষমাণ' },
              ],
            },
          ]}
          searchPlaceholder="তারিখ, ধরণ বা খাত..."
        />
      </Card>
    </section>
  );
}

export function TransactionsBottomSection({ summary = TRANSACTION_TYPE_SUMMARY }: TransactionsBottomSectionProps) {
  const rows = summary.map((item) => [TYPE_LABEL[item.type] ?? item.type, formatCurrencyBn(item.amount)]);

  return (
    <section>
      <Card>
        <SectionHeader title="ধরণভিত্তিক সারাংশ" subtitle="কোন ধরণে কত লেনদেন হয়েছে" />
        <DataTable headers={['ধরণ', 'মোট পরিমাণ']} rows={rows} />
      </Card>
    </section>
  );
}
