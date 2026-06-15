'use client';

import { useState } from 'react';

const fmt = (n: number) => '৳' + n.toLocaleString('en-IN');

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', title: 'মুদি কেনাকাটা', amount: 1200, category: 'খাদ্য', date: '১৫ জুন ২০২৬', note: 'সাপ্তাহিক বাজার' },
  { id: 'e2', title: 'বাসভাড়া', amount: 800, category: 'যানবাহন', date: '১৪ জুন ২০২৬' },
  { id: 'e3', title: 'বিদ্যুৎ বিল', amount: 1500, category: 'ইউটিলিটি', date: '১৩ জুন ২০২৬' },
  { id: 'e4', title: 'ওষুধ', amount: 450, category: 'স্বাস্থ্য', date: '১২ জুন ২০২৬' },
  { id: 'e5', title: 'ইন্টারনেট বিল', amount: 600, category: 'ইউটিলিটি', date: '১০ জুন ২০২৬' },
];

const EXPENSE_CATS = ['খাদ্য', 'যানবাহন', 'ইউটিলিটি', 'স্বাস্থ্য', 'শিক্ষা', 'বিনোদন', 'অন্যান্য'];

const CAT_ICON: Record<string, string> = {
  খাদ্য: '🍚', যানবাহন: '🚌', ইউটিলিটি: '💡', স্বাস্থ্য: '🏥', শিক্ষা: '📚', বিনোদন: '🎮', অন্যান্য: '📦',
};
const CAT_COLOR: Record<string, string> = {
  খাদ্য: 'var(--success)', যানবাহন: 'var(--info)', ইউটিলিটি: 'var(--warning)',
  স্বাস্থ্য: 'var(--danger)', শিক্ষা: 'var(--brand)', বিনোদন: 'var(--purple)', অন্যান্য: 'var(--muted)',
};

function ExpenseCard({ exp, onDelete }: { exp: Expense; onDelete: (id: string) => void }) {
  return (
    <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--r)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {CAT_ICON[exp.category] ?? '📦'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{exp.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="badge badge-muted">{exp.category}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{exp.date}</span>
        </div>
        {exp.note && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{exp.note}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="money" style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>-{fmt(exp.amount)}</div>
        <button onClick={() => onDelete(exp.id)} style={{ fontSize: 11, color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>
          মুছুন
        </button>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]       = useState('');
  const [amount, setAmount]     = useState('');
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [note, setNote]         = useState('');
  const [date, setDate]         = useState('');

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const catBreakdown = EXPENSE_CATS.map(cat => ({
    cat,
    sum: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.sum > 0);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const newExp: Expense = {
      id: `e${Date.now()}`,
      title, amount: Number(amount), category,
      date: date || '১৫ জুন ২০২৬',
      note: note || undefined,
    };
    setExpenses(prev => [newExp, ...prev]);
    setTitle(''); setAmount(''); setNote(''); setDate('');
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="card" style={{ padding: 16, borderLeft: '3px solid var(--danger)' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>এই মাসের খরচ</div>
          <div className="money" style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{fmt(total)}</div>
        </div>
        <div className="card" style={{ padding: 16, borderLeft: '3px solid var(--brand)' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>মোট এন্ট্রি</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand)' }}>{expenses.length}টি</div>
        </div>
      </div>

      {/* Add button */}
      <button className="btn btn-primary btn-full" onClick={() => setShowForm(v => !v)}>
        {showForm ? '✕ বন্ধ করুন' : '+ নতুন খরচ যোগ করুন'}
      </button>

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>খরচ যোগ করুন</div>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">শিরোনাম</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="কি কিনলেন?" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">পরিমাণ (৳)</label>
                <input className="input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="০" required />
              </div>
              <div className="form-group">
                <label className="form-label">তারিখ</label>
                <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">বিভাগ</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">নোট (ঐচ্ছিক)</label>
              <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="বিস্তারিত..." />
            </div>
            <button type="submit" className="btn btn-primary btn-full">যোগ করুন</button>
          </form>
        </div>
      )}

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>বিভাগ ওয়ারি খরচ</div>
          {catBreakdown.map(({ cat, sum }) => {
            const pct = Math.round((sum / total) * 100);
            const color = CAT_COLOR[cat] ?? 'var(--muted)';
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{CAT_ICON[cat]}</span> {cat}
                  </span>
                  <span className="money" style={{ fontSize: 12, fontWeight: 700, color }}>{fmt(sum)}</span>
                </div>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 99 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expense list */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>সকল খরচ</div>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>কোনো খরচ পাওয়া যায়নি</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenses.map(exp => <ExpenseCard key={exp.id} exp={exp} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}
