 'use client';

import { useState } from 'react';
import { BellOff, BellRing } from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal } from '@/components/semibase/AppModal';
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
  subscribedCategoryIds?: string[];
  onSubscriptionChange?: (categoryId: string, isActive: boolean, amountMinor?: number) => Promise<void>;
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

export function UserCategoriesMiddleSection({ categories = USER_CATEGORY_ROWS, subscribedCategoryIds = [], onSubscriptionChange }: UserCategoriesMiddleSectionProps) {
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [variableCategory, setVariableCategory] = useState<(typeof USER_CATEGORY_ROWS)[number] | null>(null);
  const [variableAmount, setVariableAmount] = useState('');
  const subscribeVariableCategory = async () => {
    if (!variableCategory || !Number(variableAmount) || Number(variableAmount) < 1) return;
    setSavingCategoryId(variableCategory.id);
    try {
      await onSubscriptionChange?.(variableCategory.id, true, Number(variableAmount));
      setVariableCategory(null);
      setVariableAmount('');
    } finally {
      setSavingCategoryId(null);
    }
  };
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
      (category.type === 'savings' || category.type === 'donation') && (category.isVariable || category.amount) ? (
        <Button
          key={`${category.id}-subscription`}
          size="sm"
          variant={subscribedCategoryIds.includes(category.id) ? 'secondary' : 'primary'}
          disabled={savingCategoryId === category.id}
          onClick={async () => {
            if (!subscribedCategoryIds.includes(category.id) && category.isVariable) {
              setVariableCategory(category);
              return;
            }
            setSavingCategoryId(category.id);
            try {
              await onSubscriptionChange?.(category.id, !subscribedCategoryIds.includes(category.id));
            } finally {
              setSavingCategoryId(null);
            }
          }}
        >
          {subscribedCategoryIds.includes(category.id) ? <BellOff className="h-3.5 w-3.5" /> : <BellRing className="h-3.5 w-3.5" />}
          {subscribedCategoryIds.includes(category.id) ? 'বন্ধ করুন' : 'সাবস্ক্রাইব'}
        </Button>
      ) : '-',
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
          headers={['খাত', 'ধরণ', 'পুনরাবৃত্তি', 'পরিমাণ', { header: 'রিমাইন্ডার', hideOnMobile: true }, 'স্ট্যাটাস']}
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
      <AppModal open={Boolean(variableCategory)} title="আপনার মাসিক/নিয়মিত পরিমাণ দিন" onClose={() => setVariableCategory(null)} footer={<><Button variant="secondary" onClick={() => setVariableCategory(null)}>বাতিল</Button><Button disabled={!Number(variableAmount) || Number(variableAmount) < 1 || savingCategoryId === variableCategory?.id} onClick={() => void subscribeVariableCategory()}>{savingCategoryId === variableCategory?.id ? 'সংরক্ষণ হচ্ছে...' : 'সাবস্ক্রাইব করুন'}</Button></>}>
        <p className="text-sm leading-6 text-fg-2"><strong>{variableCategory?.name}</strong> পরিবর্তনশীল পরিমাণের খাত। আপনার জন্য প্রতিবার যে পরিমাণের বকেয়া তৈরি হবে, সেটি লিখুন।</p>
        <label className="mt-4 block text-sm font-semibold text-fg">পরিমাণ <Input className="mt-1" type="number" min="1" value={variableAmount} onChange={(event) => setVariableAmount(event.target.value)} placeholder="যেমন: ৫০" /></label>
      </AppModal>
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
