'use client';

import { useState } from 'react';
import { Save, ShieldCheck, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/base/Avatar';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { MODULE_ROWS, ROLE_ROWS } from './constants';
import { assignAdminUserRole, getErrorMessage, updateAdminRolePermissions } from '@/lib/api';
import type { RoleSummary } from './types';
import type { ApiAccessModuleRow, ApiRolePermissionRow, BackendRoleKey } from '@/lib/api';

function permissionBadge(level: 'high' | 'medium' | 'low') {
  if (level === 'high') return <Badge variant="danger">পূর্ণ অনুমতি</Badge>;
  if (level === 'medium') return <Badge variant="warning">আংশিক অনুমতি</Badge>;
  return <Badge variant="muted">সীমিত অনুমতি</Badge>;
}

interface RolesTopSectionProps {
  roleRows?: RoleSummary[];
}

interface RolesMiddleSectionProps {
  roleRows?: RoleSummary[];
  matrix?: ApiRolePermissionRow[];
  modules?: ApiAccessModuleRow[];
  assignableMembers?: Array<{ id: string; name: string; mobile: string; initials: string; roleKey: string }>;
  onMutationSuccess?: () => void | Promise<void>;
}

interface RolesBottomSectionProps {
  moduleRows?: typeof MODULE_ROWS;
}

export function RolesTopSection({ roleRows = ROLE_ROWS }: RolesTopSectionProps) {
  return (
    <section>
      <SectionHeader title="ভূমিকা সারাংশ" subtitle="ভূমিকা অনুযায়ী ব্যবহারকারীর সংখ্যা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="মোট ভূমিকা" value={String(roleRows.length)} hint="সিস্টেমে সক্রিয়" />
        <MetricCard label="মোট ব্যবহারকারী" value={String(roleRows.reduce((sum, row) => sum + row.members, 0))} hint="সব ভূমিকা মিলিয়ে" />
        <MetricCard label="পূর্ণ অনুমতি ভূমিকা" value={String(roleRows.filter((row) => row.level === 'high').length)} hint="উচ্চ অ্যাক্সেস" />
        <MetricCard label="সীমিত ভূমিকা" value={String(roleRows.filter((row) => row.level === 'low').length)} hint="নিম্ন অ্যাক্সেস" />
      </div>
    </section>
  );
}

const DEFAULT_ROLE_ASSIGNMENT = {
  userId: '',
  roleKey: 'admin' as BackendRoleKey,
};

const ACTION_LABEL: Record<'read' | 'write' | 'update' | 'delete', string> = {
  read: 'দেখা',
  write: 'তৈরি',
  update: 'সম্পাদনা',
  delete: 'মুছা',
};

const ROLE_OPTIONS: Array<{ value: BackendRoleKey; label: string }> = [
  { value: 'member_internal', label: 'ইনতিফাদাহ সদস্য' },
  { value: 'general_user', label: 'সাধারণ সদস্য' },
  { value: 'org_user', label: 'সংগঠন সদস্য' },
  { value: 'manager', label: 'ম্যানেজার' },
  { value: 'admin', label: 'অ্যাডমিন' },
  { value: 'super_admin', label: 'সুপার অ্যাডমিন' },
];

export function RolesMiddleSection({
  roleRows = ROLE_ROWS,
  matrix = [],
  modules = [],
  assignableMembers = [],
  onMutationSuccess,
}: RolesMiddleSectionProps) {
  const [modal, setModal] = useState<'admin' | null>(null);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(null);
  const [draftActions, setDraftActions] = useState<Record<string, Array<'read' | 'write' | 'update' | 'delete'>>>({});
  const [assignment, setAssignment] = useState(DEFAULT_ROLE_ASSIGNMENT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const selectedRole = matrix.find((role) => role.roleKey === selectedRoleKey) ?? matrix[0] ?? null;
  const showToast = (message: string) => {
    setModal(null);
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const assignRole = async () => {
    setSaving(true);
    try {
      await assignAdminUserRole(assignment.userId, assignment.roleKey);
      showToast('অ্যাডমিন অ্যাক্সেস আপডেট হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const getActions = (moduleKey: string) => {
    const current = selectedRole?.permissions.find((permission) => permission.moduleKey === moduleKey)?.actions ?? [];
    return draftActions[moduleKey] ?? current;
  };
  const toggleAction = (moduleKey: string, action: 'read' | 'write' | 'update' | 'delete') => {
    setDraftActions((current) => {
      const actions = current[moduleKey] ?? getActions(moduleKey);
      const next = actions.includes(action) ? actions.filter((item) => item !== action) : [...actions, action];
      return { ...current, [moduleKey]: next };
    });
  };
  const savePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await updateAdminRolePermissions(selectedRole.roleKey, modules.map((module) => ({
        moduleKey: module.module_key,
        actions: getActions(module.module_key),
      })));
      setDraftActions({});
      showToast('ভূমিকার অনুমতি আপডেট হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <Card>
        <SectionHeader
          title="ভূমিকা ও অনুমতি"
          subtitle="ভূমিকা অনুযায়ী মডিউল অ্যাক্সেস নিয়ন্ত্রণ"
          action={(
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => {
                setAssignment(DEFAULT_ROLE_ASSIGNMENT);
                setModal('admin');
              }}><UserPlus className="h-4 w-4" />অ্যাডমিন যোগ</Button>
            </div>
          )}
        />
        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {roleRows.map((row) => (
              <button
                key={row.roleKey}
                type="button"
                onClick={() => {
                  setSelectedRoleKey(row.roleKey);
                  setDraftActions({});
                }}
                className={selectedRole?.roleKey === row.roleKey ? 'w-full rounded-xl border border-brand bg-brand-light p-4 text-left shadow-sm' : 'w-full rounded-xl border border-border bg-white p-4 text-left shadow-sm transition hover:border-brand/40'}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-fg">{row.role}</p>
                    <p className="mt-1 text-xs text-muted">{row.members} জন ব্যবহারকারী</p>
                  </div>
                  {permissionBadge(row.level)}
                </div>
                <p className="text-xs leading-5 text-fg-2">{row.modules}</p>
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm font-bold text-fg">{selectedRole?.roleName ?? 'ভূমিকা নির্বাচন করুন'}</p>
                  <p className="text-xs text-muted">মডিউল অনুযায়ী অনুমতি</p>
                </div>
              </div>
              <Button size="sm" onClick={() => void savePermissions()} disabled={saving || !selectedRole}>
                <Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : 'অনুমতি সংরক্ষণ'}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-bold uppercase text-muted">
                    <th className="px-4 py-3">মডিউল</th>
                    {Object.entries(ACTION_LABEL).map(([action, label]) => (
                      <th key={action} className="px-4 py-3 text-center">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {modules.map((module) => (
                    <tr key={module.module_key}>
                      <td className="px-4 py-3 font-semibold text-fg">{module.module_name}</td>
                      {Object.keys(ACTION_LABEL).map((action) => (
                        <td key={action} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={getActions(module.module_key).includes(action as keyof typeof ACTION_LABEL)}
                            onChange={() => toggleAction(module.module_key, action as keyof typeof ACTION_LABEL)}
                            className="h-4 w-4 accent-[var(--brand)]"
                            disabled={!selectedRole}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
      <AppModal
        open={modal === 'admin'}
        title="অ্যাডমিন যোগ করুন"
        onClose={() => setModal(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModal(null)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void assignRole()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">সদস্য</span>
            <select value={assignment.userId} onChange={(event) => setAssignment((current) => ({ ...current, userId: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">
              <option value="">সদস্য নির্বাচন করুন</option>
              {assignableMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name} ({member.mobile})</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">ভূমিকা</span>
            <select value={assignment.roleKey} onChange={(event) => setAssignment((current) => ({ ...current, roleKey: event.target.value as BackendRoleKey }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm">
              {ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>
          <div className="rounded-xl border border-border bg-surface-2 p-3 sm:col-span-2">
            <p className="mb-2 text-xs font-bold text-muted">বর্তমান নির্বাচন</p>
            {assignableMembers.filter((member) => member.id === assignment.userId).map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar initials={member.initials} />
                <div>
                  <p className="text-sm font-bold text-fg">{member.name}</p>
                  <p className="text-xs text-muted">{member.mobile} • {member.roleKey}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function RolesBottomSection({ moduleRows = MODULE_ROWS }: RolesBottomSectionProps) {
  return (
    <section>
      <Card>
        <SectionHeader title="মডিউল-অ্যাক্সেস ম্যাপ" subtitle="মডিউলভিত্তিক কে ব্যবহার করতে পারবে" />
        <DataTable headers={['মডিউল', 'অনুমোদিত ভূমিকা']} rows={moduleRows} />
      </Card>
    </section>
  );
}
