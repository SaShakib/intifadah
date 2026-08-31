import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { USER_CATEGORY_METRICS, USER_CATEGORY_ROWS } from './constants';
import type { UserCategoryMetric } from './types';

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

interface UserCategoriesTopSectionProps {
  metrics?: UserCategoryMetric[];
}

interface UserCategoriesMiddleSectionProps {
  categories?: typeof USER_CATEGORY_ROWS;
}

export function UserCategoriesTopSection({ metrics = USER_CATEGORY_METRICS }: UserCategoriesTopSectionProps) {
  return (
    <section>
      <SectionHeader title="খাতসমূহ" subtitle="আপনার জন্য উপলব্ধ খাতসমূহের সারাংশ" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

export function UserCategoriesMiddleSection({ categories = USER_CATEGORY_ROWS }: UserCategoriesMiddleSectionProps) {
  const rows = categories.map((category) => ({
    id: category.id,
    tabValue: category.type,
    filterValues: { recurrence: category.recurrence, status: category.isActive ? 'active' : 'inactive' },
    searchText: `${category.name} ${TYPE_LABEL[category.type]} ${RECUR_LABEL[category.recurrence]} ${category.description ?? ''}`,
    sortValues: [category.name, TYPE_LABEL[category.type], RECUR_LABEL[category.recurrence], category.amount ?? 0, category.isActive ? 1 : 0],
    cells: [
      category.name,
      TYPE_LABEL[category.type],
      RECUR_LABEL[category.recurrence],
      category.isVariable ? 'পরিবর্তনশীল' : category.amount ? `৳${category.amount}` : '-',
      <Badge key={category.id} variant={category.isActive ? 'success' : 'muted'}>
        {category.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
      </Badge>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="খাত তালিকা" subtitle="ধরণ ও নিয়মসহ বিস্তারিত" />
        <DataTable
          headers={['খাত', 'ধরণ', 'পুনরাবৃত্তি', 'পরিমাণ', 'স্ট্যাটাস']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
          ]}
          filters={[
            {
              id: 'recurrence',
              label: 'সব পুনরাবৃত্তি',
              options: Object.entries(RECUR_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
          searchPlaceholder="খাত, ধরণ বা নিয়ম..."
        />
      </Card>
    </section>
  );
}

export function UserCategoriesBottomSection() {
  return (
    <section>
      <Card>
        <SectionHeader title="ব্যবহারের নিয়ম" subtitle="খাত নির্বাচন করার আগে যেগুলো জানা দরকার" />
        <ul className="space-y-2 text-sm text-fg-2">
          <li>১. পরিবর্তনশীল খাতে আপনার ইচ্ছামতো পরিমাণ দিন।</li>
          <li>২. ফিক্সড খাতে নির্ধারিত অঙ্ক অনুযায়ী জমা দিন।</li>
          <li>৩. ঋণ খাতে আবেদন করলে অনুমোদনের পর লেনদেন সম্পন্ন হবে।</li>
        </ul>
      </Card>
    </section>
  );
}
