'use client';

import { useState } from 'react';
import { MEMBERS } from '@/lib/data/members';
import type { Member } from '@/types';

const TABS = [
  { key: 'all',      label: 'সব' },
  { key: 'active',   label: 'সক্রিয়' },
  { key: 'inactive', label: 'নিষ্ক্রিয়' },
];

export default function MembersPage() {
  const [tab, setTab]       = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MEMBERS.filter(m => {
    const matchTab =
      tab === 'all'      ? true :
      tab === 'active'   ? m.isActive :
      !m.isActive;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      m.name.includes(q) || m.phone.includes(q) || m.memberId.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>সদস্য তালিকা</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>মোট {MEMBERS.length} জন সদস্য</p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon /> নতুন সদস্য
        </button>
      </div>

      {/* Search + Tabs */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <SearchIcon />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="নাম, ফোন বা আইডি দিয়ে খুঁজুন…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ padding: '0 18px' }}>
          <div className="tabs" style={{ marginTop: 12 }}>
            {TABS.map(t => (
              <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>সদস্য</th>
                <th>আইডি</th>
                <th>ফোন</th>
                <th>যোগদান</th>
                <th>সঞ্চয়</th>
                <th>ঋণ</th>
                <th>অবস্থা</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                    কোনো সদস্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
              {filtered.map(m => (
                <MemberRow key={m.id} member={m} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MemberRow({ member: m }: { member: Member }) {
  const hue = (m.name.charCodeAt(0) * 23) % 360;
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="avatar"
            style={{ background: `oklch(92% 0.04 ${hue})`, color: `oklch(38% 0.12 ${hue})` }}
          >
            {m.initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.gender === 'female' ? 'মহিলা' : 'পুরুষ'}</div>
          </div>
        </div>
      </td>
      <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 12 }}>{m.memberId}</td>
      <td style={{ color: 'var(--fg-2)' }}>{m.phone}</td>
      <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{m.joinDate}</td>
      <td className="money" style={{ fontWeight: 600 }}>৳{m.totalSavings.toLocaleString('bn-BD')}</td>
      <td>
        {m.activeLoan ? (
          <span className="badge badge-warning money">৳{m.activeLoan.toLocaleString('bn-BD')}</span>
        ) : (
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
        )}
      </td>
      <td>
        <span className={`badge ${m.isActive ? 'badge-success' : 'badge-muted'}`}>
          {m.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </span>
      </td>
      <td>
        <a href="#" style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 500 }}>বিস্তারিত →</a>
      </td>
    </tr>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 15 15" fill="none"
      style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
    >
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
