'use client';

import { useState } from 'react';
import type { Permission } from '@/types';

const MODULES = ['সদস্য', 'ফান্ড', 'ঋণ', 'ঋণ ফেরত', 'খাত', 'প্রতিবেদন'];
const PERM_KEYS: (keyof Omit<Permission, 'module'>)[] = ['read', 'write', 'update', 'delete'];
const PERM_LABEL: Record<string, string> = { read: 'পড়া', write: 'লেখা', update: 'সম্পাদনা', delete: 'মুছা' };

function makePerms(modules: string[], flags: boolean[][]): Permission[] {
  return modules.map((m, i) => ({
    module: m,
    read:   flags[i][0],
    write:  flags[i][1],
    update: flags[i][2],
    delete: flags[i][3],
  }));
}

const INITIAL_ROLES = [
  {
    id: 'r1', name: 'ম্যানেজার', description: 'সকল মডিউলে সম্পূর্ণ অ্যাক্সেস',
    color: 'var(--brand)', colorBg: 'var(--brand-light)',
    assignedTo: ['আবু বক্কর সিদ্দিক'],
    permissions: makePerms(MODULES, [
      [true,true,true,true], [true,true,true,true], [true,true,true,true],
      [true,true,true,true], [true,true,true,true], [true,true,true,false],
    ]),
  },
  {
    id: 'r2', name: 'হিসাবরক্ষক', description: 'আর্থিক মডিউলে লেখার অ্যাক্সেস',
    color: 'var(--info)', colorBg: 'var(--info-bg)',
    assignedTo: [],
    permissions: makePerms(MODULES, [
      [true,false,false,false], [true,true,true,false], [true,true,true,false],
      [true,true,true,false],   [true,false,false,false],[true,false,false,false],
    ]),
  },
  {
    id: 'r3', name: 'সাধারণ সদস্য', description: 'শুধুমাত্র নিজের তথ্য দেখার অ্যাক্সেস',
    color: 'var(--muted)', colorBg: 'var(--surface-2)',
    assignedTo: ['রহিমা খাতুন', 'আবদুল রহমান', 'মো. করিম'],
    permissions: makePerms(MODULES, [
      [true,false,false,false], [true,false,false,false], [true,false,false,false],
      [true,false,false,false],  [true,false,false,false], [true,false,false,false],
    ]),
  },
];

type Role = typeof INITIAL_ROLES[number];

export default function RolesPermissionsPage() {
  const [roles, setRoles]       = useState(INITIAL_ROLES);
  const [activeRole, setActive] = useState('r1');

  const role = roles.find(r => r.id === activeRole)!;

  function togglePerm(roleId: string, module: string, key: keyof Omit<Permission, 'module'>) {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      return {
        ...r,
        permissions: r.permissions.map(p =>
          p.module === module ? { ...p, [key]: !p[key] } : p
        ),
      };
    }));
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>ভূমিকা ও অনুমতি</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>ব্যবহারকারীদের ভূমিকা এবং অ্যাক্সেস নিয়ন্ত্রণ করুন</p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon /> নতুন ভূমিকা
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }} className="main-grid">

        {/* Role list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roles.map(r => (
            <RoleCard key={r.id} role={r} active={activeRole === r.id} onClick={() => setActive(r.id)} />
          ))}
        </div>

        {/* Permissions matrix */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>{role.name}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>{role.description}</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ minWidth: 120 }}>মডিউল</th>
                  {PERM_KEYS.map(k => (
                    <th key={k} style={{ textAlign: 'center', minWidth: 70 }}>{PERM_LABEL[k]}</th>
                  ))}
                  <th style={{ textAlign: 'center' }}>সব</th>
                </tr>
              </thead>
              <tbody>
                {role.permissions.map(perm => {
                  const allEnabled = PERM_KEYS.every(k => perm[k]);
                  return (
                    <tr key={perm.module}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{perm.module}</td>
                      {PERM_KEYS.map(k => (
                        <td key={k} style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={perm[k]}
                            onChange={() => togglePerm(role.id, perm.module, k)}
                          />
                        </td>
                      ))}
                      <td style={{ textAlign: 'center' }}>
                        <Checkbox
                          checked={allEnabled}
                          onChange={() => {
                            const next = !allEnabled;
                            PERM_KEYS.forEach(k => {
                              if (perm[k] !== next) togglePerm(role.id, perm.module, k);
                            });
                          }}
                          accent
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm">পূর্বাবস্থায় ফিরুন</button>
            <button className="btn btn-primary btn-sm">পরিবর্তন সংরক্ষণ করুন</button>
          </div>
        </div>

      </div>
    </>
  );
}

function RoleCard({ role, active, onClick }: { role: Role; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? role.colorBg : 'var(--surface)',
        border: `1.5px solid ${active ? role.color : 'var(--border)'}`,
        borderRadius: 'var(--r)',
        padding: '14px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: active ? role.color : 'var(--fg)' }}>{role.name}</span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{role.description}</p>
      {role.assignedTo.length > 0 ? (
        <p style={{ fontSize: 11, color: 'var(--fg-2)' }}>
          {role.assignedTo.length}জন সদস্য
        </p>
      ) : (
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>কোনো সদস্য নেই</p>
      )}
    </button>
  );
}

function Checkbox({ checked, onChange, accent }: { checked: boolean; onChange: () => void; accent?: boolean }) {
  return (
    <button
      onClick={onChange}
      aria-checked={checked}
      role="checkbox"
      style={{
        width: 20, height: 20, borderRadius: 5, border: 'none', cursor: 'pointer',
        background: checked ? (accent ? 'var(--brand)' : 'var(--success)') : 'var(--surface-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
        outline: checked ? `2px solid ${accent ? 'oklch(50% 0.26 354 / 0.3)' : 'oklch(44% 0.14 145 / 0.3)'}` : 'none',
        outlineOffset: 1,
      }}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
