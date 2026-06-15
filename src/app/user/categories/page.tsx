'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/data/categories';
import type { CategoryType } from '@/types';

const TYPE_LABEL: Record<CategoryType, string> = {
  donation: 'দান', savings: 'সঞ্চয়', loan: 'ঋণ', expense: 'খরচ',
};
const TYPE_BADGE: Record<CategoryType, string> = {
  donation: 'badge-success', savings: 'badge-info', loan: 'badge-warning', expense: 'badge-danger',
};
const TYPE_COLOR: Record<CategoryType, string> = {
  donation: 'var(--success)', savings: 'var(--info)', loan: 'var(--warning)', expense: 'var(--danger)',
};
const TYPE_BG: Record<CategoryType, string> = {
  donation: 'var(--success-bg)', savings: 'var(--info-bg)', loan: 'var(--warning-bg)', expense: 'var(--danger-bg)',
};

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'দৈনিক', weekly: 'সাপ্তাহিক', monthly: 'মাসিক', yearly: 'বার্ষিক', one_time: 'একবার',
};

const USER_CONTRIBUTION: Record<string, number> = {
  c1: 800, c2: 5000, c3: 0, c4: 1500, c5: 1000, c6: 0,
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'সব' },
  { key: 'donation', label: 'দান' },
  { key: 'savings', label: 'সঞ্চয়' },
  { key: 'loan', label: 'ঋণ' },
];

function CategoryCard({ cat }: { cat: typeof CATEGORIES[0] }) {
  const contrib = USER_CONTRIBUTION[cat.id] ?? 0;
  const target = cat.amount ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((contrib / target) * 100)) : 0;

  return (
    <div className="card" style={{ padding: 16, borderTop: `3px solid ${TYPE_COLOR[cat.type]}`, opacity: cat.isActive ? 1 : 0.6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>{cat.name}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${TYPE_BADGE[cat.type]}`}>{TYPE_LABEL[cat.type]}</span>
            <span className="badge badge-muted">{RECURRENCE_LABEL[cat.recurrence]}</span>
            {!cat.isActive && <span className="badge badge-danger">নিষ্ক্রিয়</span>}
          </div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: TYPE_BG[cat.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
          {cat.type === 'donation' ? '🤲' : cat.type === 'savings' ? '💰' : cat.type === 'loan' ? '📋' : '📝'}
        </div>
      </div>

      {cat.description && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>{cat.description}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: target > 0 ? 8 : 0 }}>
        <span style={{ color: 'var(--muted)' }}>আমার অবদান</span>
        <span className="money" style={{ fontWeight: 700, color: TYPE_COLOR[cat.type] }}>
          ৳{contrib.toLocaleString('en-IN')}
        </span>
      </div>

      {target > 0 && (
        <>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: TYPE_COLOR[cat.type], borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--muted)' }}>
            <span>লক্ষ্য: ৳{target.toLocaleString('en-IN')}</span>
            <span>{pct}%</span>
          </div>
        </>
      )}

      {cat.isVariable && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
          ✦ পরিমাণ নিজে নির্ধারণ করা যায়
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? CATEGORIES : CATEGORIES.filter(c => c.type === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>{CATEGORIES.length}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>মোট খাত</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>{CATEGORIES.filter(c => c.isActive).length}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>সক্রিয় খাত</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {FILTERS.map(f => (
          <button key={f.key} className={`tab${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Category cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>কোনো খাত পাওয়া যায়নি</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      )}
    </div>
  );
}
