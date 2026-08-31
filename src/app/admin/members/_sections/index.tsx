'use client';

import { useState } from 'react';
import { Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/base/Avatar';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { MEMBER_METRICS, MEMBER_TABLE_ROWS, RECENT_MEMBER_ROWS } from './constants';
import { createAdminMember, deactivateAdminMember, getErrorMessage, updateAdminMember } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { AdminMemberInput, BackendRoleKey } from '@/lib/api';
import type { Member, UserRole } from '@/types';

interface MembersTopSectionProps {
  metrics?: typeof MEMBER_METRICS;
}

interface MembersMiddleSectionProps {
  members?: typeof MEMBER_TABLE_ROWS;
  onMutationSuccess?: () => void | Promise<void>;
}

interface MembersBottomSectionProps {
  recentMembers?: typeof RECENT_MEMBER_ROWS;
}

export function MembersTopSection({ metrics = MEMBER_METRICS }: MembersTopSectionProps) {
  return (
    <section>
      <SectionHeader title="সদস্য সারাংশ" subtitle="মেম্বারশিপের দ্রুত অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_MEMBER_FORM: AdminMemberInput = {
  fullName: '',
  mobile: '',
  email: '',
  userKind: 2,
  roleKey: 'general_user',
  addressLine: '',
  isActive: true,
};

const ROLE_OPTIONS: Array<{ value: BackendRoleKey; label: string }> = [
  { value: 'member_internal', label: 'ইনতিফাদাহ সদস্য' },
  { value: 'general_user', label: 'সাধারণ সদস্য' },
  { value: 'org_user', label: 'সংগঠন সদস্য' },
  { value: 'manager', label: 'ম্যানেজার' },
  { value: 'admin', label: 'অ্যাডমিন' },
];

function roleForKind(userKind: number): BackendRoleKey {
  if (userKind === 1) return 'member_internal';
  if (userKind === 3) return 'org_user';
  return 'general_user';
}

export function MembersMiddleSection({ members = MEMBER_TABLE_ROWS, onMutationSuccess }: MembersMiddleSectionProps) {
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdminMemberInput>(DEFAULT_MEMBER_FORM);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const updateForm = <K extends keyof AdminMemberInput>(key: K, value: AdminMemberInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const openCreateModal = () => {
    setSelectedMember(null);
    setForm(DEFAULT_MEMBER_FORM);
    setModal('new');
  };
  const backendRoleFromMember = (role: UserRole): BackendRoleKey => {
    if (role === 'super_admin' || role === 'admin' || role === 'manager' || role === 'member_internal') return role;
    if (role === 'org') return 'org_user';
    return 'general_user';
  };
  const userKindFromRole = (role: UserRole): 1 | 2 | 3 => {
    if (role === 'member_internal' || role === 'manager' || role === 'admin' || role === 'super_admin') return 1;
    if (role === 'org') return 3;
    return 2;
  };
  const openEditModal = (member: Member) => {
    const roleKey = backendRoleFromMember(member.role);
    setSelectedMember(member);
    setForm({
      fullName: member.name,
      mobile: member.phone,
      email: member.email ?? '',
      userKind: userKindFromRole(member.role),
      roleKey,
      addressLine: member.address ?? '',
      isActive: member.isActive,
    });
    setModal('edit');
  };
  const saveMember = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        email: form.email?.trim() || undefined,
        addressLine: form.addressLine?.trim() || undefined,
      };
      if (modal === 'edit' && selectedMember) {
        await updateAdminMember(selectedMember.id, payload);
        showToast('সদস্য আপডেট করা হয়েছে');
      } else {
        const row = await createAdminMember(payload);
        showToast(row.temporary_password ? `নতুন সদস্য সংরক্ষণ করা হয়েছে। পাসওয়ার্ড: ${row.temporary_password}` : 'নতুন সদস্য সংরক্ষণ করা হয়েছে');
      }
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const deactivateMember = async () => {
    if (!selectedMember) return;
    setSaving(true);
    try {
      await deactivateAdminMember(selectedMember.id);
      showToast('সদস্য নিষ্ক্রিয় করা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const rows = members.map((member) => ({
    id: member.id,
    tabValue: member.isActive ? 'active' : 'inactive',
    filterValues: { role: member.role, status: member.isActive ? 'active' : 'inactive' },
    searchText: `${member.memberId} ${member.name} ${member.phone} ${member.email ?? ''} ${member.address ?? ''}`,
    sortValues: [member.memberId, member.name, member.phone, member.totalSavings, member.isActive ? 1 : 0, ''],
    cells: [
      member.memberId,
      <div key={`${member.id}-name`} className="flex items-center gap-3">
        <Avatar initials={member.initials} />
        <div>
          <p className="font-bold text-fg">{member.name}</p>
          <p className="text-xs text-muted">{member.address ?? member.email ?? 'ঠিকানা নেই'}</p>
        </div>
      </div>,
      member.phone,
      <span key={`${member.id}-savings`} className="font-semibold tabular-nums">{formatCurrencyBn(member.totalSavings)}</span>,
      <Badge key={member.id} variant={member.isActive ? 'success' : 'muted'}>
        {member.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
      </Badge>,
      <div key={`${member.id}-actions`} className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={() => openEditModal(member)}><Pencil className="h-3.5 w-3.5" />সম্পাদনা</Button>
      </div>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader
          title="সদস্য তালিকা"
          subtitle="সকল সদস্যের বর্তমান অবস্থা"
          action={<Button onClick={openCreateModal}><Plus className="h-4 w-4" />নতুন সদস্য</Button>}
        />
        <DataTable
          headers={['আইডি', 'নাম', 'ফোন', 'সঞ্চয়', 'স্ট্যাটাস', { header: 'কার্যক্রম', align: 'right', sortable: false }]}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'active', label: 'সক্রিয়' },
            { value: 'inactive', label: 'নিষ্ক্রিয়' },
          ]}
          filters={[
            {
              id: 'role',
              label: 'সব ভূমিকা',
              options: Array.from(new Set(members.map((member) => member.role))).map((role) => ({ value: role, label: role })),
            },
          ]}
          searchPlaceholder="নাম, আইডি, ফোন বা ঠিকানা..."
        />
      </Card>
      <AppModal
        open={modal !== null}
        title={modal === 'edit' ? 'সদস্য সম্পাদনা' : 'নতুন সদস্য যোগ করুন'}
        onClose={() => setModal(null)}
        footer={(
          <>
            {modal === 'edit' && <Button variant="danger" onClick={() => void deactivateMember()} disabled={saving}><Trash2 className="h-4 w-4" />নিষ্ক্রিয়</Button>}
            <Button variant="secondary" onClick={() => setModal(null)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveMember()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">পূর্ণ নাম</span><Input value={form.fullName} onChange={(event) => updateForm('fullName', event.target.value)} placeholder="সদস্যের নাম" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">মোবাইল</span><Input value={form.mobile} onChange={(event) => updateForm('mobile', event.target.value)} placeholder="01XXXXXXXXX" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ইমেইল</span><Input type="email" value={form.email ?? ''} onChange={(event) => updateForm('email', event.target.value)} placeholder="name@example.com" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">সদস্য টাইপ</span><select value={form.userKind} onChange={(event) => {
            const userKind = Number(event.target.value) as 1 | 2 | 3;
            setForm((current) => ({ ...current, userKind, roleKey: roleForKind(userKind) }));
          }} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="1">টাইপ ১ - ইনতিফাদাহ সদস্য</option><option value="2">টাইপ ২ - সাধারণ সদস্য</option><option value="3">টাইপ ৩ - সংগঠন সদস্য</option></select></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ভূমিকা</span><select value={form.roleKey} onChange={(event) => updateForm('roleKey', event.target.value as BackendRoleKey)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">ঠিকানা</span><Input value={form.addressLine ?? ''} onChange={(event) => updateForm('addressLine', event.target.value)} placeholder="ঠিকানা" /></label>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function MembersBottomSection({ recentMembers = RECENT_MEMBER_ROWS }: MembersBottomSectionProps) {
  const rows = recentMembers.map((member) => [
    member.name,
    member.joinDate,
    member.address ?? '-',
    formatCurrencyBn(member.totalDonations),
  ]);

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক যোগদান" subtitle="সর্বশেষ ৫টি সদস্য অ্যাকাউন্ট" />
        <DataTable headers={['নাম', 'যোগদানের তারিখ', 'ঠিকানা', 'মোট দান']} rows={rows} />
      </Card>
    </section>
  );
}
