'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/data/categories';
import type { Category, CategoryType, RecurrenceType } from '@/types';

const TYPE_LABEL: Record<CategoryType, string> = {
  donation: 'দান',
  savings:  'সঞ্চয়',
  loan:     'ঋণ',
  expense:  'খরচ',
};

const TYPE_BADGE: Record<CategoryType, string> = {
  donation: 'badge-success',
  savings:  'badge-info',
  loan:     'badge-warning',
  expense:  'badge-danger',
};

const RECURRENCE_LABEL: Record<RecurrenceType, string> = {
  daily:    'দৈনিক',
  weekly:   'সাপ্তাহিক',
  monthly:  'মাসিক',
  yearly:   'বার্ষিক',
  one_time: 'একবার',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState(CATEGORIES);

  function toggleActive(id: string) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  }

  const active   = categories.filter(c => c.isActive).length;
  const inactive = categories.filter(c => !c.isActive).length;

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>খাত ব্যবস্থাপনা</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
            মোট {categories.length}টি খাত — {active}টি সক্রিয়, {inactive}টি নিষ্ক্রিয়
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon /> নতুন খাত
        </button>
      </div>

      {/* Category cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {categories.map(c => (
          <CategoryCard key={c.id} category={c} onToggle={() => toggleActive(c.id)} />
        ))}
      </div>
    </>
  );
}

function CategoryCard({ category: c, onToggle }: { category: Category; onToggle: () => void }) {
  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        opacity: c.isActive ? 1 : 0.6,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>{c.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${TYPE_BADGE[c.type]}`}>{TYPE_LABEL[c.type]}</span>
            <span className="badge badge-muted">{RECURRENCE_LABEL[c.recurrence]}</span>
            {!c.isActive && <span className="badge badge-muted">নিষ্ক্রিয়</span>}
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          aria-label={c.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
          style={{
            width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: c.isActive ? 'var(--brand)' : 'var(--border)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: c.isActive ? 21 : 3,
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
          }} />
        </button>
      </div>

      {/* Description */}
      {c.description && (
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>{c.description}</p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div>
          {c.amount != null && !c.isVariable ? (
            <span className="money" style={{ fontSize: 15, fontWeight: 700, color: 'var(--brand)' }}>
              ৳{c.amount.toLocaleString('bn-BD')}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>পরিবর্তনশীল পরিমাণ</span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm">সম্পাদনা</button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
