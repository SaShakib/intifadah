import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { MEMBER_REPORT_ROWS, MONTHLY_REPORT_ROWS, REPORT_METRICS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { ReportMetric } from './types';

interface ReportsTopSectionProps {
  metrics?: ReportMetric[];
}

interface ReportsMiddleSectionProps {
  monthlyRows?: typeof MONTHLY_REPORT_ROWS;
}

interface ReportsBottomSectionProps {
  memberRows?: typeof MEMBER_REPORT_ROWS;
}

export function ReportsTopSection({ metrics = REPORT_METRICS }: ReportsTopSectionProps) {
  return (
    <section>
      <SectionHeader title="রিপোর্ট সারাংশ" subtitle="প্রধান আর্থিক সূচক" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function ReportsMiddleSection({ monthlyRows = MONTHLY_REPORT_ROWS }: ReportsMiddleSectionProps) {
  const widthClasses = ['w-[81%]', 'w-[69%]', 'w-[89%]', 'w-[84%]', 'w-full', 'w-[59%]'];

  return (
    <section>
      <Card>
        <SectionHeader title="মাসভিত্তিক কালেকশন" subtitle="জানুয়ারি থেকে জুন" />
        <div className="space-y-3">
          {monthlyRows.map((row, index) => {
            const dynamicWidthClass = widthClasses[index] ?? 'w-1/2';
            return (
              <div key={row.month} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-2">{row.month}</span>
                  <span className="font-semibold text-fg">{formatCurrencyBn(row.value * 1000)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2">
                  <div className={`h-2 rounded-full bg-brand ${dynamicWidthClass}`} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

export function ReportsBottomSection({ memberRows = MEMBER_REPORT_ROWS }: ReportsBottomSectionProps) {
  const rows = memberRows.map((row) => ({
    id: row.name,
    searchText: row.name,
    sortValues: [row.name, row.savings, row.donations, row.activeLoan],
    cells: [
      row.name,
      <span key={`${row.name}-savings`} className="font-semibold tabular-nums">{formatCurrencyBn(row.savings)}</span>,
      <span key={`${row.name}-donations`} className="font-semibold tabular-nums">{formatCurrencyBn(row.donations)}</span>,
      <span key={`${row.name}-activeLoan`} className="font-semibold tabular-nums">{formatCurrencyBn(row.activeLoan)}</span>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="সদস্যভিত্তিক রিপোর্ট" subtitle="সঞ্চয়, দান ও ঋণের সারাংশ" />
        <DataTable headers={['সদস্য', 'সঞ্চয়', 'দান', 'সক্রিয় ঋণ']} rows={rows} searchPlaceholder="সদস্য খুঁজুন..." />
      </Card>
    </section>
  );
}
