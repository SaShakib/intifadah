'use client';

import { useState, useEffect } from 'react';

const CAT_META: Record<string, { cls: string; icon: string }> = {
  'খাদ্য':      { cls: 'cat-food',      icon: '🛒' },
  'বাসস্থান':   { cls: 'cat-housing',   icon: '🏠' },
  'পরিবহন':    { cls: 'cat-transport',  icon: '🚌' },
  'চিকিৎসা':   { cls: 'cat-health',    icon: '💊' },
  'শিক্ষা':    { cls: 'cat-edu',       icon: '📚' },
  'পোশাক':     { cls: 'cat-cloth',     icon: '👗' },
  'বিনোদন':    { cls: 'cat-entertain', icon: '🎬' },
  'ইউটিলিটি':  { cls: 'cat-util',      icon: '⚡' },
  'অন্যান্য':  { cls: 'cat-other',     icon: '📦' },
};

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const BN_MONTHS_SHORT = ['জানু.','ফেব্রু.','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টে.','অক্টো.','নভে.','ডিসে.'];

function toBengaliNum(n: number | string) {
  const d = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(n).replace(/[0-9]/g, c => d[+c]);
}

function formatAmount(n: number) {
  return '৳' + toBengaliNum(n.toLocaleString('en-IN'));
}

function formatDateBengali(dateStr: string) {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${toBengaliNum(d)} ${BN_MONTHS_SHORT[m-1]}`;
}

function catBadgeClass(cat: string) {
  const map: Record<string, string> = {
    'খাদ্য': 'badge-brand', 'বাসস্থান': 'badge-info',
    'পরিবহন': 'badge-success', 'চিকিৎসা': 'badge-warning',
    'শিক্ষা': 'badge-purple', 'পোশাক': 'badge-muted',
    'বিনোদন': 'badge-muted', 'ইউটিলিটি': 'badge-info',
    'অন্যান্য': 'badge-muted',
  };
  return map[cat] || 'badge-muted';
}

interface Expense {
  id: number;
  date: string;
  desc: string;
  cat: string;
  amount: number;
  note: string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 1,  date: '2026-06-15', desc: 'বাজার',            cat: 'খাদ্য',    amount: 850,  note: 'সাপ্তাহিক বাজার' },
  { id: 2,  date: '2026-06-14', desc: 'রিকশা ভাড়া',      cat: 'পরিবহন',   amount: 150,  note: 'অফিস যাতায়াত' },
  { id: 3,  date: '2026-06-13', desc: 'ডাক্তার',          cat: 'চিকিৎসা',  amount: 500,  note: 'নিয়মিত চেকআপ' },
  { id: 4,  date: '2026-06-12', desc: 'ইন্টারনেট বিল',    cat: 'ইউটিলিটি', amount: 600,  note: 'মাসিক বিল' },
  { id: 5,  date: '2026-06-10', desc: 'সন্তানের টিউশন',  cat: 'শিক্ষা',   amount: 1500, note: 'জুন মাস' },
  { id: 6,  date: '2026-06-08', desc: 'বাজার',            cat: 'খাদ্য',    amount: 720,  note: 'রোজকার বাজার' },
  { id: 7,  date: '2026-06-06', desc: 'বাস ভাড়া',        cat: 'পরিবহন',   amount: 300,  note: 'শহরে যাওয়া' },
  { id: 8,  date: '2026-06-05', desc: 'ফল কিনলাম',       cat: 'খাদ্য',    amount: 380,  note: '' },
  { id: 9,  date: '2026-06-04', desc: 'ইলেকট্রিক বিল',   cat: 'ইউটিলিটি', amount: 950,  note: 'মে মাসের বিল' },
  { id: 10, date: '2026-06-03', desc: 'বাজার',            cat: 'খাদ্য',    amount: 650,  note: 'সাপ্তাহিক' },
  { id: 11, date: '2026-06-02', desc: 'ওষুধ',            cat: 'চিকিৎসা',  amount: 350,  note: 'হাসপাতাল' },
  { id: 12, date: '2026-06-01', desc: 'মোবাইল রিচার্জ',  cat: 'ইউটিলিটি', amount: 200,  note: '' },
];

const INITIAL_BUDGETS: Record<string, number> = {
  'খাদ্য': 7000, 'বাসস্থান': 4000, 'পরিবহন': 2500,
  'চিকিৎসা': 2000, 'শিক্ষা': 2000, 'পোশাক': 1000,
  'বিনোদন': 500, 'ইউটিলিটি': 2000, 'অন্যান্য': 500,
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [nextId, setNextId] = useState(13);
  const [budgets, setBudgets] = useState<Record<string, number>>(INITIAL_BUDGETS);
  const [viewMonth, setViewMonth] = useState(6);
  const [viewYear, setViewYear] = useState(2026);
  const [filterCat, setFilterCat] = useState('');
  const [filterMonthVal, setFilterMonthVal] = useState('6-2026');
  const [searchInput, setSearchInput] = useState('');
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [overallBudget, setOverallBudget] = useState(20000);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState('2026-06-15');
  const [expCat, setExpCat] = useState('');
  const [expNote, setExpNote] = useState('');
  const [exitingId, setExitingId] = useState<number | null>(null);
  const [enteringId, setEnteringId] = useState<number | null>(null);

  const showToast = (message: string, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getViewExpenses = (month = viewMonth, year = viewYear) =>
    expenses.filter(e => {
      const [y, m] = e.date.split('-').map(Number);
      return y === year && m === month;
    });

  const catTotalFn = (cat: string, list: Expense[]) =>
    list.filter(e => e.cat === cat).reduce((s, e) => s + e.amount, 0);

  const getFilteredRows = () => {
    const [fm, fy] = filterMonthVal ? filterMonthVal.split('-').map(Number) : [viewMonth, viewYear];
    const search = searchInput.trim().toLowerCase();
    return expenses.filter(e => {
      const [y, m] = e.date.split('-').map(Number);
      if (y !== fy || m !== fm) return false;
      if (filterCat && e.cat !== filterCat) return false;
      if (search && !e.desc.includes(search) && !e.note.includes(search) && !e.cat.includes(search)) return false;
      return true;
    });
  };

  const filteredRows = getFilteredRows();
  const viewExp = getViewExpenses();
  const thisMonthTotal = viewExp.reduce((s, e) => s + e.amount, 0);
  const totalSpent = viewExp.reduce((s, e) => s + e.amount, 0);
  const overallRemain = overallBudget - totalSpent;

  const handleAddExpense = (ev: React.FormEvent) => {
    ev.preventDefault();
    const amount = parseInt(expAmount, 10);
    if (!expDesc) { showToast('বিবরণ লিখুন', 'danger'); return; }
    if (!amount || amount < 1) { showToast('সঠিক পরিমাণ লিখুন', 'danger'); return; }
    if (!expCat) { showToast('বিভাগ নির্বাচন করুন', 'danger'); return; }
    if (!expDate) { showToast('তারিখ নির্বাচন করুন', 'danger'); return; }

    const newExp: Expense = { id: nextId, date: expDate, desc: expDesc, cat: expCat, amount, note: expNote };
    setExpenses(prev => [newExp, ...prev]);
    setNextId(n => n + 1);
    setExpDesc('');
    setExpAmount('');
    setExpNote('');
    setExpDate('2026-06-15');
    setExpCat('');

    const [y, m] = expDate.split('-').map(Number);
    setViewMonth(m); setViewYear(y);
    setFilterMonthVal(`${m}-${y}`);

    showToast(`✅ "${expDesc}" যোগ হয়েছে!`, 'success');
    setEnteringId(newExp.id);
    setTimeout(() => setEnteringId(null), 400);
  };

  const deleteExpense = (id: number) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    if (!confirm(`"${exp.desc}" (${formatAmount(exp.amount)}) মুছে ফেলবেন?`)) return;
    setExitingId(id);
    setTimeout(() => {
      setExpenses(prev => prev.filter(e => e.id !== id));
      setExitingId(null);
      showToast(`🗑️ "${exp.desc}" মুছে ফেলা হয়েছে`, 'info');
    }, 260);
  };

  const navigateMonth = (dir: number) => {
    let nm = viewMonth + dir;
    let ny = viewYear;
    if (nm > 12) { nm = 1; ny++; }
    if (nm < 1)  { nm = 12; ny--; }
    setViewMonth(nm);
    setViewYear(ny);
    setFilterMonthVal(`${nm}-${ny}`);
  };

  const catColors: Record<string, string> = {
    'cat-food': 'var(--brand)', 'cat-housing': 'var(--info)', 'cat-transport': 'var(--success)',
    'cat-health': 'var(--warning)', 'cat-edu': 'oklch(50% 0.18 290)', 'cat-util': 'oklch(55% 0.14 210)',
    'cat-cloth': 'var(--accent)', 'cat-entertain': 'oklch(55% 0.16 130)', 'cat-other': 'var(--muted)',
  };

  const getCategoryRows = () => {
    const total = viewExp.reduce((s, e) => s + e.amount, 0);
    return Object.entries(CAT_META).map(([name, meta]) => ({
      name, meta,
      amount: catTotalFn(name, viewExp),
      pct: total > 0 ? Math.round(catTotalFn(name, viewExp) / total * 100) : 0,
    })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  };

  const getBudgetRows = () => {
    return Object.entries(CAT_META).map(([name, meta]) => {
      const spent = catTotalFn(name, viewExp);
      const budget = budgets[name] || 0;
      const pct = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;
      const remain = budget - spent;
      let remClass = 'ok';
      if (pct >= 100) remClass = 'over';
      else if (pct >= 80) remClass = 'warn';
      return { name, meta, spent, budget, pct, remain, remClass };
    });
  };

  return (
    <>
      <style>{`
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .glass-card {
          background: oklch(100% 0 0 / 0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid oklch(100% 0 0 / 0.35); border-radius: var(--r-lg);
          box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.12), inset 0 1px 0 oklch(100% 0 0 / 0.5);
        }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 18px; border-radius: var(--r-sm); font-family: var(--font); font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; transition: all 150ms cubic-bezier(0, 0, 0.2, 1); text-decoration: none; white-space: nowrap; line-height: 1; }
        .btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--brand); color: #fff; box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.35); }
        .btn-primary:hover { background: var(--brand-mid); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); }
        .btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .btn-ghost:hover { background: var(--surface-2); color: var(--fg); }
        .btn-full { width: 100%; }
        .btn-icon { width: 32px; height: 32px; padding: 0; border-radius: var(--r-sm); background: var(--danger-bg); color: var(--danger); border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 150ms; font-size: 14px; }
        .btn-icon:hover { background: oklch(92% 0.08 25); transform: scale(1.05); }

        .badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: 0.01em; }
        .badge-success { background: var(--success-bg); color: var(--success); }
        .badge-warning { background: var(--warning-bg); color: var(--warning); }
        .badge-danger  { background: var(--danger-bg);  color: var(--danger); }
        .badge-info    { background: var(--info-bg);    color: var(--info); }
        .badge-muted   { background: var(--surface-2);  color: var(--muted); border: 1px solid var(--border); }
        .badge-brand   { background: var(--brand-light); color: var(--brand); }
        .badge-purple  { background: oklch(95% 0.05 290); color: oklch(50% 0.18 290); }

        .input {
          width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--r-sm);
          font-family: var(--font); font-size: 14px; color: var(--fg); background: var(--surface);
          outline: none; transition: border-color 150ms, box-shadow 150ms; appearance: none; -webkit-appearance: none;
        }
        .input:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.15); }
        .input::placeholder { color: var(--muted); }

        select.input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
        }

        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--fg-2); margin-bottom: 6px; }
        .form-label span { color: var(--brand); margin-left: 2px; }

        .section { margin-bottom: 28px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-title { font-size: 16px; font-weight: 700; color: var(--fg); letter-spacing: -0.01em; }
        .section-subtitle { font-size: 12px; color: var(--muted); font-weight: 400; margin-top: 1px; }

        .page-hero { margin-bottom: 24px; }
        .page-hero-title { font-size: 22px; font-weight: 800; color: var(--fg); letter-spacing: -0.03em; line-height: 1.2; }
        .page-hero-sub { font-size: 13px; color: var(--muted); margin-top: 4px; }

        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .summary-card { padding: 20px 22px; border-radius: var(--r); position: relative; overflow: hidden; transition: transform 150ms cubic-bezier(0, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0, 0, 0.2, 1); }
        .summary-card:hover { transform: translateY(-2px); box-shadow: var(--sh); }
        .summary-card-primary { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%); color: #fff; box-shadow: 0 4px 20px oklch(50% 0.26 354 / 0.35); }
        .summary-card-primary::after { content: ''; position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; border-radius: 50%; background: oklch(100% 0 0 / 0.08); }
        .summary-card-surface { background: var(--surface); border: 1px solid var(--border); box-shadow: var(--sh-sm); }
        .summary-card-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px; opacity: 0.75; }
        .summary-card-primary .summary-card-label { color: oklch(100% 0 0 / 0.80); }
        .summary-card-surface .summary-card-label { color: var(--muted); }
        .summary-card-amount { font-size: 26px; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
        .summary-card-primary .summary-card-amount { color: #fff; }
        .summary-card-surface .summary-card-amount { color: var(--fg); }
        .summary-card-sub { font-size: 12px; margin-top: 4px; }
        .summary-card-primary .summary-card-sub { color: oklch(100% 0 0 / 0.65); }
        .summary-card-surface .summary-card-sub { color: var(--muted); }
        .summary-card-icon { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); font-size: 32px; opacity: 0.18; }

        .chart-card { padding: 22px 24px; margin-bottom: 28px; }
        .chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .month-nav { display: flex; align-items: center; gap: 10px; }
        .month-nav-btn { width: 32px; height: 32px; border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--surface-2); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--fg-2); font-size: 13px; transition: all 150ms; }
        .month-nav-btn:hover { background: var(--brand-light); color: var(--brand); border-color: oklch(85% 0.08 354); }
        .month-nav-label { font-size: 14px; font-weight: 700; color: var(--fg); min-width: 90px; text-align: center; }

        .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 140px; padding-bottom: 24px; position: relative; }
        .bar-chart::before { content: ''; position: absolute; bottom: 24px; left: 0; right: 0; height: 1px; background: var(--border); }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .bar-amount { font-size: 10px; color: var(--muted); font-weight: 600; white-space: nowrap; }
        .bar-track { width: 100%; background: var(--brand-light); border-radius: 6px 6px 0 0; overflow: hidden; position: relative; min-height: 4px; }
        .bar-fill { width: 100%; background: var(--brand); border-radius: 6px 6px 0 0; transition: height 0.6s cubic-bezier(0, 0, 0.2, 1); opacity: 0.65; }
        .bar-fill.current { background: linear-gradient(180deg, var(--brand) 0%, var(--brand-mid) 100%); opacity: 1; box-shadow: 0 -2px 8px oklch(50% 0.26 354 / 0.30); }
        .bar-label { font-size: 10.5px; color: var(--muted); font-weight: 500; text-align: center; }
        .bar-label.current { color: var(--brand); font-weight: 700; }

        .two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; align-items: start; }
        .form-card { padding: 24px; }
        .form-card-title { font-size: 15px; font-weight: 700; color: var(--fg); margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .form-card-title-icon { width: 32px; height: 32px; border-radius: var(--r-sm); background: var(--brand-light); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .category-card { padding: 22px 24px; }
        .category-card-title { font-size: 15px; font-weight: 700; color: var(--fg); margin-bottom: 6px; }
        .category-card-sub { font-size: 12px; color: var(--muted); margin-bottom: 18px; }
        .category-list { display: flex; flex-direction: column; gap: 14px; }
        .category-row-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .category-name { font-size: 13px; font-weight: 600; color: var(--fg); display: flex; align-items: center; gap: 7px; }
        .category-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .category-meta { display: flex; align-items: center; gap: 8px; }
        .category-amount { font-size: 13px; font-weight: 700; color: var(--fg); }
        .category-pct { font-size: 11px; color: var(--muted); }
        .category-bar-track { height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .category-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s cubic-bezier(0, 0, 0.2, 1); }

        .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .filter-bar .input { width: auto; font-size: 13px; padding: 8px 12px; }
        .filter-search { flex: 1; min-width: 160px; position: relative; }
        .filter-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 14px; pointer-events: none; }
        .filter-search .input { padding-left: 32px; }

        .table-card { padding: 0; overflow: hidden; }
        .table-header-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        thead th { padding: 11px 16px; text-align: left; font-size: 11.5px; font-weight: 700; color: var(--muted); letter-spacing: 0.04em; text-transform: uppercase; background: var(--surface-2); border-bottom: 1px solid var(--border); white-space: nowrap; }
        thead th:last-child { text-align: center; width: 60px; }
        tbody tr { border-bottom: 1px solid var(--border); transition: background 150ms; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--surface-2); }
        td { padding: 12px 16px; font-size: 13.5px; color: var(--fg); vertical-align: middle; }
        td.td-date { color: var(--muted); font-size: 12.5px; white-space: nowrap; }
        td.td-desc { font-weight: 500; }
        td.td-amount { font-weight: 700; color: var(--fg); white-space: nowrap; }
        td.td-note { color: var(--muted); font-size: 12.5px; max-width: 140px; }
        td.td-action { text-align: center; }
        .table-empty { padding: 40px 20px; text-align: center; color: var(--muted); font-size: 14px; }
        .table-empty-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.4; }

        @keyframes rowEnter { from { opacity: 0; transform: translateY(-8px); background: oklch(97% 0.04 354); } to { opacity: 1; transform: translateY(0); background: transparent; } }
        @keyframes rowExit { from { opacity: 1; transform: scaleY(1); max-height: 60px; } to { opacity: 0; transform: scaleY(0); max-height: 0; padding: 0; } }
        .row-entering { animation: rowEnter 0.3s cubic-bezier(0, 0, 0.2, 1) forwards; }
        .row-exiting  { animation: rowExit 0.25s cubic-bezier(0, 0, 0.2, 1) forwards; overflow: hidden; }

        .budget-collapsible { margin-bottom: 28px; }
        .budget-toggle { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; user-select: none; border-radius: var(--r); background: var(--surface); border: 1px solid var(--border); transition: all 150ms; }
        .budget-toggle:hover { background: var(--surface-2); }
        .budget-toggle-left { display: flex; align-items: center; gap: 10px; }
        .budget-toggle-icon { width: 32px; height: 32px; border-radius: var(--r-sm); background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .budget-toggle-title { font-size: 14px; font-weight: 700; color: var(--fg); }
        .budget-toggle-sub { font-size: 12px; color: var(--muted); }
        .budget-toggle-arrow { font-size: 18px; color: var(--muted); transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
        .budget-toggle-arrow.open { transform: rotate(180deg); }
        .budget-body { background: var(--surface); border: 1px solid var(--border); border-top: none; border-radius: 0 0 var(--r) var(--r); overflow: hidden; max-height: 0; transition: max-height 0.4s cubic-bezier(0, 0, 0.2, 1); }
        .budget-body.open { max-height: 600px; }
        .budget-body-inner { padding: 20px; }
        .budget-overall { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .budget-overall-label { font-size: 13.5px; font-weight: 600; color: var(--fg); white-space: nowrap; }
        .budget-overall-input { max-width: 160px; }
        .budget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 18px; }
        .budget-item { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 12px 14px; }
        .budget-item-label { font-size: 12px; font-weight: 600; color: var(--fg-2); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .budget-item-input { font-size: 13px; padding: 7px 10px; margin-bottom: 10px; }
        .budget-progress-track { height: 5px; background: var(--border); border-radius: 99px; overflow: hidden; margin-top: 6px; }
        .budget-progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s cubic-bezier(0, 0, 0.2, 1); }
        .budget-remaining { font-size: 11px; margin-top: 5px; }
        .budget-remaining.ok { color: var(--success); }
        .budget-remaining.warn { color: var(--warning); }
        .budget-remaining.over { color: var(--danger); }

        .toast-container { position: fixed; top: 80px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { padding: 12px 18px; border-radius: var(--r); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--sh); font-size: 13.5px; font-weight: 500; color: var(--fg); max-width: 300px; display: flex; align-items: center; gap: 10px; pointer-events: auto; animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .toast.toast-success { border-left: 3px solid var(--success); }
        .toast.toast-danger  { border-left: 3px solid var(--danger); }
        .toast.toast-info    { border-left: 3px solid var(--info); }
        .toast-icon { font-size: 18px; flex-shrink: 0; }
        .toast-text { flex: 1; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

        .hidden { display: none !important; }
        .divider { height: 1px; background: var(--border); margin: 20px 0; }

        @media (max-width: 1024px) { .two-col-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .page-content { padding: 16px 16px 80px; }
          .summary-grid { grid-template-columns: 1fr; gap: 12px; }
          .form-row { grid-template-columns: 1fr; }
          .bar-chart { height: 100px; gap: 6px; }
          .bar-amount { display: none; }
          .filter-bar { flex-direction: column; align-items: stretch; }
          .filter-bar .input { width: 100%; }
          .filter-search { min-width: auto; }
          .budget-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .page-hero-title { font-size: 18px; }
          .budget-grid { grid-template-columns: 1fr; }
          .summary-card-amount { font-size: 22px; }
        }
      `}</style>

      {/* Hero */}
      <div className="page-hero">
        <h1 className="page-hero-title">খরচের হিসাব</h1>
        <p className="page-hero-sub">আপনার ব্যক্তিগত খরচের হিসাব রাখুন</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="summary-card summary-card-primary">
          <div className="summary-card-label">এই মাসে খরচ</div>
          <div className="summary-card-amount">{formatAmount(thisMonthTotal)}</div>
          <div className="summary-card-sub">{BN_MONTHS[viewMonth-1]} {toBengaliNum(viewYear)}</div>
          <div className="summary-card-icon" aria-hidden="true">📝</div>
        </div>
        <div className="summary-card summary-card-surface">
          <div className="summary-card-label">গত মাসে</div>
          <div className="summary-card-amount">৳১৩,২০০</div>
          <div className="summary-card-sub" style={{ color: 'var(--warning)', fontWeight: 600 }}>↑ ১৯.৭% বেশি</div>
          <div className="summary-card-icon" aria-hidden="true">📅</div>
        </div>
        <div className="summary-card summary-card-surface">
          <div className="summary-card-label">গড় মাসিক</div>
          <div className="summary-card-amount">৳১৪,৫০০</div>
          <div className="summary-card-sub">গত ৬ মাসের গড়</div>
          <div className="summary-card-icon" aria-hidden="true">📊</div>
        </div>
      </div>

      {/* BAR CHART */}
      <section className="section">
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <div className="section-title">মাসিক খরচের প্রবণতা</div>
              <div className="section-subtitle">গত ৬ মাসের তুলনামূলক চিত্র</div>
            </div>
            <div className="month-nav">
              <button className="month-nav-btn" onClick={() => navigateMonth(-1)} aria-label="আগের মাস">←</button>
              <div className="month-nav-label">{BN_MONTHS[viewMonth-1]} {toBengaliNum(viewYear)}</div>
              <button className="month-nav-btn" onClick={() => navigateMonth(1)} aria-label="পরের মাস">→</button>
            </div>
          </div>

          <div className="bar-chart" role="img" aria-label="মাসিক খরচের বার চার্ট">
            {[
              { amount: '৳১২.৫ক', pct: 89, label: 'জানু.', current: false },
              { amount: '৳১১.৮ক', pct: 84, label: 'ফেব্রু.', current: false },
              { amount: '৳১৩.৯ক', pct: 99, label: 'মার্চ', current: false },
              { amount: '৳১৫.১ক', pct: 100, label: 'এপ্রিল', current: false },
              { amount: '৳১৩.২ক', pct: 93, label: 'মে', current: false },
              { amount: '৳১৫.৮ক', pct: 100, label: 'জুন', current: true },
            ].map((bar, i) => (
              <div key={i} className="bar-col">
                <div className="bar-amount">{bar.amount}</div>
                <div className="bar-track" style={{ height: 'calc(100% - 40px)' }}>
                  <div className={`bar-fill${bar.current ? ' current' : ''}`} style={{ height: `${bar.pct}%` }}></div>
                </div>
                <div className={`bar-label${bar.current ? ' current' : ''}`}>{bar.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM + CATEGORY GRID */}
      <div className="two-col-grid">
        {/* Add Expense Form */}
        <div className="glass-card form-card">
          <div className="form-card-title">
            <div className="form-card-title-icon" aria-hidden="true">➕</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>নতুন খরচ যোগ করুন</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400, marginTop: '2px' }}>খরচের বিবরণ লিখুন</div>
            </div>
          </div>

          <form onSubmit={handleAddExpense} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="expDesc">বিবরণ<span>*</span></label>
              <input className="input" id="expDesc" type="text" placeholder="কী কারণে খরচ হলো" autoComplete="off" required value={expDesc} onChange={e => setExpDesc(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="expAmount">পরিমাণ (৳)<span>*</span></label>
                <input className="input" id="expAmount" type="number" min={1} step={1} placeholder="০" required value={expAmount} onChange={e => setExpAmount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="expDate">তারিখ<span>*</span></label>
                <input className="input" id="expDate" type="date" required value={expDate} onChange={e => setExpDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expCat">বিভাগ<span>*</span></label>
              <select className="input" id="expCat" required value={expCat} onChange={e => setExpCat(e.target.value)}>
                <option value="">— বিভাগ নির্বাচন করুন —</option>
                {Object.keys(CAT_META).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expNote">নোট <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(ঐচ্ছিক)</span></label>
              <textarea className="input" id="expNote" rows={2} placeholder="অতিরিক্ত তথ্য…" style={{ resize: 'vertical', minHeight: '60px' }} value={expNote} onChange={e => setExpNote(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              <span>➕</span> খরচ যোগ করুন
            </button>
          </form>
        </div>

        {/* Category Breakdown */}
        <div className="card category-card">
          <div className="category-card-title">বিভাগ অনুযায়ী খরচ</div>
          <div className="category-card-sub">
            {BN_MONTHS[viewMonth-1]} {toBengaliNum(viewYear)} — মোট <strong>{formatAmount(thisMonthTotal)}</strong>
          </div>

          <div className="category-list">
            {getCategoryRows().length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px', fontSize: '13px' }}>এই মাসে কোনো খরচ নেই</div>
            ) : getCategoryRows().map(c => (
              <div key={c.name} className={c.meta.cls}>
                <div className="category-row-top">
                  <div className="category-name">
                    <div className="category-dot" style={{ background: catColors[c.meta.cls] || 'var(--muted)' }}></div>
                    <span>{c.meta.icon} {c.name}</span>
                  </div>
                  <div className="category-meta">
                    <span className="category-amount">{formatAmount(c.amount)}</span>
                    <span className="category-pct">{toBengaliNum(c.pct)}%</span>
                  </div>
                </div>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${c.pct}%`, background: catColors[c.meta.cls] || 'var(--muted)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPENSE HISTORY TABLE */}
      <section className="section">
        <div className="card table-card">
          <div className="table-header-row">
            <div>
              <div className="section-title">খরচের ইতিহাস</div>
              <div className="section-subtitle">
                {BN_MONTHS[viewMonth-1]} {toBengaliNum(viewYear)} · <span>{toBengaliNum(filteredRows.length)}</span>টি খরচ
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="filter-bar">
              <div className="filter-search">
                <span className="filter-search-icon" aria-hidden="true">🔍</span>
                <input className="input" type="search" placeholder="খরচ খুঁজুন…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              </div>
              <select className="input" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="">সব বিভাগ</option>
                {Object.keys(CAT_META).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input" style={{ width: 'auto' }} value={filterMonthVal} onChange={e => setFilterMonthVal(e.target.value)}>
                <option value="6-2026">জুন ২০২৬</option>
                <option value="5-2026">মে ২০২৬</option>
                <option value="4-2026">এপ্রিল ২০২৬</option>
                <option value="3-2026">মার্চ ২০২৬</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>বিবরণ</th>
                  <th>বিভাগ</th>
                  <th>পরিমাণ</th>
                  <th>নোট</th>
                  <th>মুছুন</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(e => {
                  const catMeta = CAT_META[e.cat] || { cls: 'cat-other', icon: '📦' };
                  return (
                    <tr
                      key={e.id}
                      className={e.id === enteringId ? 'row-entering' : e.id === exitingId ? 'row-exiting' : ''}
                    >
                      <td className="td-date">{formatDateBengali(e.date)}</td>
                      <td className="td-desc">{e.desc}</td>
                      <td>
                        <span className={`badge ${catBadgeClass(e.cat)}`}>{catMeta.icon} {e.cat}</span>
                      </td>
                      <td className="td-amount">{formatAmount(e.amount)}</td>
                      <td className="td-note">{e.note || '—'}</td>
                      <td className="td-action">
                        <button className="btn-icon" onClick={() => deleteExpense(e.id)} title={`${e.desc} মুছুন`} aria-label={`${e.desc} মুছুন`}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredRows.length === 0 && (
              <div className="table-empty">
                <div className="table-empty-icon">📋</div>
                <div>কোনো খরচ পাওয়া যায়নি</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BUDGET SECTION */}
      <section className="budget-collapsible">
        <div className="budget-toggle" onClick={() => setBudgetOpen(o => !o)} role="button" aria-expanded={budgetOpen}>
          <div className="budget-toggle-left">
            <div className="budget-toggle-icon" aria-hidden="true">🎯</div>
            <div>
              <div className="budget-toggle-title">মাসিক বাজেট নির্ধারণ</div>
              <div className="budget-toggle-sub">বিভাগ অনুযায়ী বাজেট সেট করুন</div>
            </div>
          </div>
          <span className={`budget-toggle-arrow${budgetOpen ? ' open' : ''}`} aria-hidden="true">▾</span>
        </div>

        <div className={`budget-body${budgetOpen ? ' open' : ''}`}>
          <div className="budget-body-inner">
            <div className="budget-overall">
              <label className="budget-overall-label" htmlFor="overallBudget">মোট মাসিক বাজেট (৳)</label>
              <input
                className="input budget-overall-input"
                id="overallBudget"
                type="number"
                value={overallBudget}
                min={0}
                step={100}
                onChange={e => setOverallBudget(parseInt(e.target.value, 10) || 0)}
              />
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                ব্যয়: <strong style={{ color: 'var(--danger)' }}>{formatAmount(totalSpent)}</strong>
                &nbsp;·&nbsp; অবশিষ্ট: <strong style={{ color: overallRemain < 0 ? 'var(--danger)' : 'var(--success)' }}>{formatAmount(Math.abs(overallRemain))}</strong>
              </div>
            </div>

            <div className="budget-grid">
              {getBudgetRows().map(row => (
                <div key={row.name} className={`budget-item ${row.meta.cls}`}>
                  <div className="budget-item-label">
                    <div className="category-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: catColors[row.meta.cls] || 'var(--muted)', flexShrink: 0 }}></div>
                    {row.meta.icon} {row.name}
                  </div>
                  <input
                    className="input budget-item-input"
                    type="number"
                    min={0}
                    step={100}
                    value={row.budget}
                    onChange={e => setBudgets(prev => ({ ...prev, [row.name]: parseInt(e.target.value, 10) || 0 }))}
                    placeholder="০"
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>ব্যয়: <strong>{formatAmount(row.spent)}</strong></div>
                  <div className="budget-progress-track">
                    <div className="budget-progress-fill" style={{ width: `${row.pct}%`, background: catColors[row.meta.cls] || 'var(--brand)' }}></div>
                  </div>
                  <div className={`budget-remaining ${row.remClass}`}>
                    {row.pct >= 100 ? '⚠️ ' : ''}{row.remain >= 0 ? `বাকি: ${formatAmount(row.remain)}` : `বেশি: ${formatAmount(-row.remain)}`}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={() => showToast('✅ বাজেট সংরক্ষিত হয়েছে!', 'success')}>
              <span>✅</span> বাজেট সেট করুন
            </button>
          </div>
        </div>
      </section>

      {/* TOAST CONTAINER */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon" aria-hidden="true">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : 'ℹ️'}
            </span>
            <span className="toast-text">{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
