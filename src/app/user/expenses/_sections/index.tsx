import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { EXPENSE_BUDGET_ROWS, EXPENSE_METRICS, EXPENSE_ROWS } from './constants';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { ExpenseMetric, ExpenseRow } from './types';

interface ExpensesTopSectionProps {
  metrics?: ExpenseMetric[];
}

interface ExpensesMiddleSectionProps {
  budgetRows?: typeof EXPENSE_BUDGET_ROWS;
}

interface ExpensesBottomSectionProps {
  rows?: ExpenseRow[];
}

export function ExpensesTopSection({ metrics = EXPENSE_METRICS }: ExpensesTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ব্যয় সারাংশ" subtitle="আপনার খরচের বর্তমান অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function ExpensesMiddleSection({ budgetRows = EXPENSE_BUDGET_ROWS }: ExpensesMiddleSectionProps) {
  return (
    <section>
      <Card>
        <SectionHeader title="বাজেট বনাম ব্যয়" subtitle="খাতভিত্তিক ব্যয়ের তুলনা" />
        <DataTable headers={['খাত', 'বাজেট', 'ব্যয়', 'ব্যবহার']} rows={budgetRows} />
      </Card>
    </section>
  );
}

export function ExpensesBottomSection({ rows: expenseRows = EXPENSE_ROWS }: ExpensesBottomSectionProps) {
  const rows = expenseRows.map((row) => [row.date, row.category, formatCurrencyBn(row.amount), row.note]);

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক খরচ" subtitle="সর্বশেষ ব্যয় এন্ট্রি" />
        <DataTable headers={['তারিখ', 'খাত', 'পরিমাণ', 'নোট']} rows={rows} />
      </Card>
    </section>
  );
}
