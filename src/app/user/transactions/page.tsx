'use client';

import { useState } from 'react';
import { USER_TRANSACTIONS } from '@/lib/data/transactions';

const fmt = (n: number) => '৳' + n.toLocaleString('en-IN');

const TYPE_TABS = [
  { key: 'all', label: 'সব' },
  { key: 'donation', label: 'দান' },
  { key: 'savings', label: 'সঞ্চয়' },
  { key: 'loan', label: 'ঋণ' },
  { key: 'collection', label: 'চাঁদা' },
];

const DATE_CHIPS = ['এই সপ্তাহ', 'এই মাস', 'এই বছর'];

const TYPE_BADGE: Record<string, string> = {
  savings: 'badge-info', donation: 'badge-success', collection: 'badge-brand',
  loan: 'badge-warning', repayment: 'badge-purple', expense: 'badge-danger',
};
const TYPE_LABEL: Record<string, string> = {
  savings: 'সঞ্চয়', donation: 'দান', collection: 'চাঁদা',
  loan: 'ঋণ', repayment: 'পরিশোধ', expense: 'খরচ',
};
const TYPE_ICON: Record<string, string> = {
  savings: '💰', donation: '🤲', collection: '📥', loan: '📋', repayment: '↩️', expense: '📝',
};
const STATUS_BADGE: Record<string, string> = {
  completed: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger', overdue: 'badge-danger',
};
const STATUS_LABEL: Record<string, string> = {
  completed: 'সম্পন্ন', pending: 'অপেক্ষমান', rejected: 'বাতিল', overdue: 'মেয়াদোত্তীর্ণ',
};

const INCOME_TYPES = new Set(['savings', 'donation', 'collection', 'repayment']);

function TxCard({ tx }: { tx: typeof USER_TRANSACTIONS[0] }) {
  const isIn = INCOME_TYPES.has(tx.type);
  return (
    <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 'var(--r)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20, flexShrink: 0,
        background: isIn ? 'var(--success-bg)' : 'var(--danger-bg)',
      }}>
        {TYPE_ICON[tx.type] ?? '💳'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 3 }}>
          {tx.categoryName ?? TYPE_LABEL[tx.type]}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span className={`badge ${TYPE_BADGE[tx.type] ?? 'badge-muted'}`}>{TYPE_LABEL[tx.type]}</span>
          <span className={`badge ${STATUS_BADGE[tx.status] ?? 'badge-muted'}`}>{STATUS_LABEL[tx.status]}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{tx.date}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="money" style={{ fontSize: 15, fontWeight: 700, color: isIn ? 'var(--success)' : 'var(--danger)' }}>
          {isIn ? '+' : '-'}{fmt(tx.amount)}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateChip, setDateChip]     = useState('এই মাস');

  const filtered = typeFilter === 'all'
    ? USER_TRANSACTIONS
    : USER_TRANSACTIONS.filter(tx => tx.type === typeFilter);

  const totalIn  = filtered.filter(tx => INCOME_TYPES.has(tx.type)).reduce((s, tx) => s + tx.amount, 0);
  const totalOut = filtered.filter(tx => !INCOME_TYPES.has(tx.type)).reduce((s, tx) => s + tx.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="card" style={{ padding: 14, borderLeft: '3px solid var(--success)' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>মোট জমা</div>
          <div className="money" style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>+{fmt(totalIn)}</div>
        </div>
        <div className="card" style={{ padding: 14, borderLeft: '3px solid var(--danger)' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>মোট খরচ</div>
          <div className="money" style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>-{fmt(totalOut)}</div>
        </div>
      </div>

      {/* Date chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {DATE_CHIPS.map(chip => (
          <button key={chip} onClick={() => setDateChip(chip)} style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', border: 'none', fontFamily: 'inherit',
            background: dateChip === chip ? 'var(--brand)' : 'var(--surface-2)',
            color: dateChip === chip ? '#fff' : 'var(--fg-2)',
            transition: 'all 0.15s',
          }}>
            {chip}
          </button>
        ))}
      </div>

      {/* Type filter tabs */}
      <div className="tabs">
        {TYPE_TABS.map(t => (
          <button key={t.key} className={`tab${typeFilter === t.key ? ' active' : ''}`} onClick={() => setTypeFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>কোনো লেনদেন পাওয়া যায়নি</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(tx => <TxCard key={tx.id} tx={tx} />)}
        </div>
      )}
    </div>
  );
}
