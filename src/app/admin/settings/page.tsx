'use client';

import { useState } from 'react';
import { Database, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { PageStack } from '@/components/custom/PageStack';

const SETTING_ROWS = [
  { area: 'ডাটাবেস', key: 'প্রোভাইডার', value: 'Neon PostgreSQL', status: 'সক্রিয়' },
  { area: 'নিরাপত্তা', key: 'পারমিশন পরিবর্তন', value: 'অ্যাডমিন + সুপার অ্যাডমিন', status: 'সীমিত' },
  { area: 'সদস্য টাইপ', key: 'টাইপ ১', value: 'ইনতিফাদাহ সদস্য', status: 'মডারেট' },
  { area: 'সদস্য টাইপ', key: 'টাইপ ২', value: 'সাধারণ সদস্য', status: 'ইউজার' },
  { area: 'সদস্য টাইপ', key: 'টাইপ ৩', value: 'সংগঠন সদস্য', status: 'ইউজার' },
];

export default function AdminSettingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const rows = SETTING_ROWS.map((row) => ({
    id: `${row.area}-${row.key}`,
    tabValue: row.area,
    searchText: `${row.area} ${row.key} ${row.value} ${row.status}`,
    sortValues: [row.area, row.key, row.value, row.status],
    cells: [row.area, row.key, row.value, row.status],
  }));

  const save = () => {
    setModalOpen(false);
    setToast('সেটিংস সংরক্ষণ করা হয়েছে');
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <PageStack>
      <section>
        <SectionHeader title="সেটিংস" subtitle="সিস্টেম, নিরাপত্তা ও সদস্য টাইপ পরিচালনা" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="ডাটাবেস" value="Neon" hint="PostgreSQL pooler" />
          <MetricCard label="টাইপ ১" value="ইনতিফাদাহ" hint="মডারেট পারমিশন" />
          <MetricCard label="টাইপ ২" value="সাধারণ" hint="ইউজার পোর্টাল" />
          <MetricCard label="টাইপ ৩" value="সংগঠন" hint="অর্গ পোর্টাল" />
        </div>
      </section>

      <Card>
        <SectionHeader
          title="সিস্টেম কনফিগারেশন"
          subtitle="বর্তমান সক্রিয় নিয়ম"
          action={<Button onClick={() => setModalOpen(true)}><SlidersHorizontal className="h-4 w-4" />সেটিংস সম্পাদনা</Button>}
        />
        <DataTable
          headers={['এরিয়া', 'কী', 'মান', 'অবস্থা']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'ডাটাবেস', label: 'ডাটাবেস' },
            { value: 'নিরাপত্তা', label: 'নিরাপত্তা' },
            { value: 'সদস্য টাইপ', label: 'সদস্য টাইপ' },
          ]}
          searchPlaceholder="সেটিংস খুঁজুন..."
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader title="নিরাপত্তা" subtitle="পারমিশন পরিবর্তনের নিয়ম" />
          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-brand" />
            <p className="text-sm text-fg-2">ভূমিকা ও অনুমতি পরিবর্তন করতে অ্যাডমিন বা সুপার অ্যাডমিন রোল প্রয়োজন। ম্যানেজার ও ইনতিফাদাহ সদস্য মডিউল পারমিশন অনুযায়ী কাজ করবে।</p>
          </div>
        </Card>
        <Card>
          <SectionHeader title="ডাটাবেস" subtitle="বর্তমান সংযোগ" />
          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
            <Database className="mt-0.5 h-5 w-5 text-brand" />
            <p className="break-all text-sm text-fg-2">ep-soft-mountain-aowb6zvk-pooler.c-2.ap-southeast-1.aws.neon.tech / neondb</p>
          </div>
        </Card>
      </div>

      <AppModal
        open={modalOpen}
        title="সেটিংস সম্পাদনা"
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>বাতিল</Button>
            <Button onClick={save}><Save className="h-4 w-4" />সংরক্ষণ</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">টাইপ ১ লেবেল</span>
            <Input defaultValue="ইনতিফাদাহ সদস্য" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">টাইপ ১ ডিফল্ট রোল</span>
            <Input defaultValue="member_internal" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">টাইপ ২ লেবেল</span>
            <Input defaultValue="সাধারণ সদস্য" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">টাইপ ৩ লেবেল</span>
            <Input defaultValue="সংগঠন সদস্য" />
          </label>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </PageStack>
  );
}
