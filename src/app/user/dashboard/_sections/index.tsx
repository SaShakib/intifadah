'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  CalendarHeart,
  CircleUserRound,
  HandCoins,
  HeartHandshake,
  ListFilter,
  MessageSquareText,
  ReceiptText,
  RotateCcw,
  Save,
  Users,
  WalletCards,
} from 'lucide-react';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { AppModal, AppToast } from '@/components/semibase/AppModal';
import { createUserLoan, createUserLoanRepayment, createUserTransaction, getErrorMessage } from '@/lib/api';
import { formatCurrencyBn } from '@/lib/utils/format';
import type { UserDashboardMetric } from './types';
import type { Category, Transaction } from '@/types';

interface UserDashboardTopSectionProps {
  metrics: UserDashboardMetric[];
}

interface UserDashboardMiddleSectionProps {
  alerts: string[];
  categories: Category[];
  onMutationSuccess?: () => void | Promise<void>;
}

interface UserDashboardBottomSectionProps {
  transactions: Transaction[];
}

type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
  tone: 'brand' | 'success' | 'info' | 'warning' | 'accent';
  href?: string;
  modal?: 'donate' | 'savings' | 'loan' | 'pay';
};

type DashboardLayout = 'cards' | 'list';

type HomeCard =
  | { key: 'korje'; label: string; description: string; cardIcon: LucideIcon; tone: QuickAction['tone'] }
  | { key: 'songothon'; label: string; description: string; cardIcon: LucideIcon; tone: QuickAction['tone'] }
  | { key: 'book'; label: string; description: string; cardIcon: LucideIcon; tone: QuickAction['tone'] };

const actionToneClasses: Record<QuickAction['tone'], string> = {
  brand: 'bg-brand-light text-brand',
  success: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
  warning: 'bg-warning-bg text-warning',
  accent: 'bg-accent-light text-accent',
};

function ServiceTile({ action, onAction, delayMs = 0 }: { action: QuickAction; onAction: (modal: NonNullable<QuickAction['modal']>) => void; delayMs?: number }) {
  const content = (
    <>
      <span className={`grid h-12 w-12 place-items-center rounded-full transition duration-200 group-hover:scale-105 sm:h-14 sm:w-14 ${actionToneClasses[action.tone]}`}>
        <action.icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <span className="mt-1.5 line-clamp-1 px-1 text-center text-[11px] font-medium leading-4 text-fg-2 sm:text-xs">{action.label}</span>
      <span className="sr-only">{action.description}</span>
    </>
  );

  const className = 'group flex min-w-0 flex-col items-center rounded-2xl py-2 animate-[dashboard-service-in_260ms_ease-out] transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2';
  const style = { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' as const };

  if (action.href) {
    return <Link href={action.href} className={className} style={style} aria-label={action.description}>{content}</Link>;
  }

  return <button type="button" onClick={() => onAction(action.modal!)} className={className} style={style} aria-label={action.description}>{content}</button>;
}

function HomeCategoryTile({ card, onSelect, delayMs = 0 }: { card: HomeCard; onSelect: (key: HomeCard['key']) => void; delayMs?: number }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.key)}
      style={{ animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' }}
      className="group flex min-w-0 animate-[dashboard-service-in_260ms_ease-out] flex-col items-center gap-2.5 py-2 transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2"
    >
      <span className={`grid h-14 w-14 place-items-center rounded-full transition duration-200 group-hover:scale-105 sm:h-16 sm:w-16 ${actionToneClasses[card.tone]}`}>
        <card.cardIcon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
      </span>
      <span className="line-clamp-1 px-1 text-center text-[11px] font-semibold leading-4 text-fg-2 sm:text-xs">{card.label}</span>
    </button>
  );
}

export function UserDashboardTopSection({ metrics }: UserDashboardTopSectionProps) {
  return (
    <section>
      <SectionHeader title="আর্থিক সারাংশ" subtitle="আপনার অ্যাকাউন্টের দ্রুত অবস্থা" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_ACTION_FORM = {
  categoryId: '',
  loanId: '',
  amountMinor: '',
  occurredOn: new Date().toISOString().slice(0, 10),
  dueOn: new Date().toISOString().slice(0, 10),
  termDays: '90',
  note: '',
};

export function UserDashboardMiddleSection({ alerts, categories, onMutationSuccess }: UserDashboardMiddleSectionProps) {
  const [modal, setModal] = useState<'donate' | 'savings' | 'loan' | 'pay' | null>(null);
  const [layoutMode, setLayoutMode] = useState<DashboardLayout>(() => {
    if (typeof window === 'undefined') {
      return 'cards';
    }
    return (localStorage.getItem('intifadah-dashboard-layout') as DashboardLayout | null) ?? 'cards';
  });
  const [serviceGroup, setServiceGroup] = useState<'korje' | 'songothon' | 'book'>('korje');
  const [cardView, setCardView] = useState<HomeCard['key'] | null>(null);
  const [form, setForm] = useState(DEFAULT_ACTION_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('intifadah-dashboard-layout', layoutMode);
  }, [layoutMode]);

  const switchLayout = (mode: DashboardLayout) => {
    setLayoutMode(mode);
    setCardView(null);
  };
  const showToast = (message: string) => {
    setModal(null);
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };
  const openAction = (nextModal: typeof modal) => {
    setForm(DEFAULT_ACTION_FORM);
    setModal(nextModal);
  };
  const saveAction = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const amountMinor = Number(form.amountMinor);
      const categoryId = form.categoryId ? Number(form.categoryId) : null;
      if (modal === 'loan') {
        await createUserLoan({
          categoryId: Number(form.categoryId),
          principalMinor: amountMinor,
          purpose: form.note.trim() || 'ঋণের আবেদন',
          requestedOn: form.occurredOn,
          dueOn: form.dueOn,
          termDays: form.termDays ? Number(form.termDays) : null,
        });
      } else if (modal === 'pay') {
        await createUserLoanRepayment(form.loanId, {
          amountMinor,
          paidOn: form.occurredOn,
          note: form.note.trim() || undefined,
        });
      } else {
        await createUserTransaction({
          txType: modal === 'donate' ? 2 : 3,
          categoryId,
          amountMinor,
          occurredOn: form.occurredOn,
          note: form.note.trim() || undefined,
        });
      }
      showToast('রিকোয়েস্ট সফলভাবে জমা হয়েছে');
      await onMutationSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const categoryOptions = categories.filter((category) => {
    if (modal === 'donate') return category.type === 'donation';
    if (modal === 'savings') return category.type === 'savings';
    if (modal === 'loan') return category.type === 'loan';
    return true;
  });

  const korrzeHasanaActions: QuickAction[] = [
    { label: 'সঞ্চয় করুন', description: 'সঞ্চয় জমা দিন', icon: WalletCards, tone: 'success', modal: 'savings' },
    { label: 'দান করুন', description: 'খাত নির্বাচন করে দান করুন', icon: HeartHandshake, tone: 'brand', modal: 'donate' },
    { label: 'ঋণ চাই', description: 'কর্যে হাসানার জন্য আবেদন করুন', icon: HandCoins, tone: 'info', modal: 'loan' },
    { label: 'ঋণ পরিশোধ', description: 'ঋণের কিস্তি পরিশোধ করুন', icon: RotateCcw, tone: 'warning', modal: 'pay' },
    { label: 'খাতসূচি', description: 'আপনার আর্থিক খাত দেখুন', icon: ListFilter, tone: 'accent', href: '/user/categories' },
  ];

  const songothonActions: QuickAction[] = [
    { label: 'কার্জক্রম', description: 'সংগঠনের কার্যক্রম দেখুন', icon: CalendarHeart, tone: 'info', href: '/activities' },
    { label: 'নামাজ ও কুরআন', description: 'নামাজ ও কুরআনের অগ্রগতি দেখুন', icon: BookOpenCheck, tone: 'success', href: '/user/quran' },
    { label: 'খরচের হিসাব', description: 'খরচের হিসাব দেখুন', icon: ReceiptText, tone: 'warning', href: '/user/expenses' },
    { label: 'মন্তব্য', description: 'মন্তব্য ও পরামর্শ দেখুন', icon: MessageSquareText, tone: 'info', href: '/user/comments' },
    { label: 'প্রোফাইল', description: 'আপনার প্রোফাইল দেখুন', icon: CircleUserRound, tone: 'accent', href: '/user/profile' },
  ];

  const bookActions: QuickAction[] = [
    { label: 'বইঘর', description: 'বইয়ের সংগ্রহ ব্রাউজ করুন ও ধার নিন', icon: BookOpen, tone: 'brand', href: '/books' },
  ];

  const homeCards: HomeCard[] = [
    { key: 'songothon', label: 'সংগঠন', description: 'দ্বীনি ও সদস্য সেবা', cardIcon: Users, tone: 'success' },
    { key: 'korje', label: 'কর্যে হাসানা', description: 'আর্থিক সেবা', cardIcon: HandCoins, tone: 'info' },
    { key: 'book', label: 'বইঘর', description: 'বইয়ের সংগ্রহ', cardIcon: BookOpen, tone: 'brand' },
  ];
  const selectedCard = cardView === null ? null : homeCards.find((card) => card.key === cardView);
  const subActions = cardView === 'korje' ? korrzeHasanaActions : cardView === 'songothon' ? songothonActions : cardView === 'book' ? bookActions : [];

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-border bg-surface p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-fg">দ্রুত সেবা</p>
            <p className="text-xs text-muted">যা খুঁজছেন, এক ট্যাপে</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 rounded-full bg-surface-2 p-0.5" role="group" aria-label="ভিউ বাছাই">
              <button
                type="button"
                onClick={() => switchLayout('cards')}
                aria-pressed={layoutMode === 'cards'}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 sm:text-xs ${layoutMode === 'cards' ? 'bg-brand text-white shadow-sm' : 'text-fg-2 hover:text-fg'}`}
              >
                কার্ড
              </button>
              <button
                type="button"
                onClick={() => switchLayout('list')}
                aria-pressed={layoutMode === 'list'}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 sm:text-xs ${layoutMode === 'list' ? 'bg-brand text-white shadow-sm' : 'text-fg-2 hover:text-fg'}`}
              >
                তালিকা
              </button>
            </div>
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">ইনতিফাদাহ</span>
          </div>
        </div>

        {layoutMode === 'cards' ? (
          cardView === null ? (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {homeCards.map((card, index) => (
                <HomeCategoryTile key={card.key} card={card} onSelect={setCardView} delayMs={index * 70} />
              ))}
            </div>
          ) : (
            <div key={cardView} className="mt-4">
              <button
                type="button"
                onClick={() => setCardView(null)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-brand transition hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              >
                <ArrowLeft className="h-4 w-4" />ফিরে যান
              </button>
              {selectedCard && (
                <div className="mt-3 flex items-center gap-3">
                  <span className={`grid h-12 w-12 place-items-center rounded-full ${actionToneClasses[selectedCard.tone]}`}>
                    <selectedCard.cardIcon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="font-bold text-fg">{selectedCard.label}</p>
                    <p className="text-xs text-muted">{selectedCard.description}</p>
                  </div>
                </div>
              )}
              <div className="mt-4 grid grid-cols-4 gap-x-1 gap-y-4 sm:grid-cols-5">
                {subActions.map((action, index) => (
                  <ServiceTile key={action.label} action={action} onAction={openAction} delayMs={index * 35} />
                ))}
              </div>
            </div>
          )
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1">
              <button
                type="button"
                onClick={() => setServiceGroup('korje')}
                aria-pressed={serviceGroup === 'korje'}
                className={`flex items-center justify-center gap-1 rounded-full px-1 py-2.5 text-[11px] font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 sm:gap-2 sm:px-3 sm:text-sm ${serviceGroup === 'korje' ? 'bg-brand text-white shadow-sm' : 'text-fg-2 hover:text-fg'}`}
              >
                <HandCoins className="hidden h-4 w-4 sm:inline-flex" />
                কর্যে হাসানা
              </button>
              <button
                type="button"
                onClick={() => setServiceGroup('songothon')}
                aria-pressed={serviceGroup === 'songothon'}
                className={`flex items-center justify-center gap-1 rounded-full px-1 py-2.5 text-[11px] font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 sm:gap-2 sm:px-3 sm:text-sm ${serviceGroup === 'songothon' ? 'bg-brand text-white shadow-sm' : 'text-fg-2 hover:text-fg'}`}
              >
                <Users className="hidden h-4 w-4 sm:inline-flex" />
                সংগঠন
              </button>
              <button
                type="button"
                onClick={() => setServiceGroup('book')}
                aria-pressed={serviceGroup === 'book'}
                className={`flex items-center justify-center gap-1 rounded-full px-1 py-2.5 text-[11px] font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 sm:gap-2 sm:px-3 sm:text-sm ${serviceGroup === 'book' ? 'bg-brand text-white shadow-sm' : 'text-fg-2 hover:text-fg'}`}
              >
                <BookOpen className="hidden h-4 w-4 sm:inline-flex" />
                বইঘর
              </button>
            </div>

            <div key={serviceGroup} className="mt-3 grid grid-cols-4 gap-x-1 gap-y-4 sm:grid-cols-5">
              {(serviceGroup === 'korje' ? korrzeHasanaActions : serviceGroup === 'songothon' ? songothonActions : bookActions).map((action, index) => (
                <ServiceTile key={action.label} action={action} onAction={openAction} delayMs={index * 35} />
              ))}
            </div>
          </>
        )}
      </div>

      <Card>
        <SectionHeader title="স্মরণ করিয়ে দেওয়া" subtitle="এই সপ্তাহের গুরুত্বপূর্ণ তথ্য" />
        <ul className="space-y-2 text-sm text-fg-2">
          {alerts.map((alert) => (
            <li key={alert} className="rounded-xl border border-border bg-surface-2 px-3 py-2">
              {alert}
            </li>
          ))}
        </ul>
      </Card>
      <AppModal
        open={modal !== null}
        title={modal === 'donate' ? 'দান করুন' : modal === 'savings' ? 'সঞ্চয় করুন' : modal === 'loan' ? 'ঋণের আবেদন' : 'ঋণ পরিশোধ'}
        onClose={() => setModal(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModal(null)} disabled={saving}>বাতিল</Button>
            <Button onClick={() => void saveAction()} disabled={saving}><Save className="h-4 w-4" />{saving ? 'জমা হচ্ছে...' : 'জমা দিন'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {modal === 'pay' && <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">ঋণ আইডি</span><Input value={form.loanId} onChange={(event) => setForm((current) => ({ ...current, loanId: event.target.value }))} placeholder="ঋণ আইডি" /></label>}
          {modal !== 'pay' && <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">খাত</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">খাত নির্বাচন করুন</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">পরিমাণ</span><Input type="number" value={form.amountMinor} onChange={(event) => setForm((current) => ({ ...current, amountMinor: event.target.value }))} placeholder="৳" /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">তারিখ</span><Input type="date" value={form.occurredOn} onChange={(event) => setForm((current) => ({ ...current, occurredOn: event.target.value }))} /></label>
          {modal === 'loan' && <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">ফেরতের তারিখ</span><Input type="date" value={form.dueOn} onChange={(event) => setForm((current) => ({ ...current, dueOn: event.target.value }))} /></label>}
          {modal === 'loan' && <label className="space-y-1"><span className="text-xs font-semibold text-fg-2">মেয়াদ (দিন)</span><Input type="number" value={form.termDays} onChange={(event) => setForm((current) => ({ ...current, termDays: event.target.value }))} placeholder="90" /></label>}
          <label className="space-y-1 sm:col-span-2"><span className="text-xs font-semibold text-fg-2">নোট</span><textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light" placeholder="প্রয়োজনে বিস্তারিত লিখুন..." /></label>
        </div>
      </AppModal>
      <AppToast message={toast} />
    </section>
  );
}

export function UserDashboardBottomSection({ transactions }: UserDashboardBottomSectionProps) {
  const rows = transactions.map((transaction) => ({
    id: transaction.id,
    tabValue: transaction.status,
    searchText: `${transaction.date} ${transaction.categoryName ?? ''}`,
    sortValues: [transaction.date, transaction.categoryName ?? '', transaction.amount, transaction.status],
    cells: [
      transaction.date,
      transaction.categoryName ?? '-',
      <span key={`${transaction.id}-amount`} className="font-semibold tabular-nums">{formatCurrencyBn(transaction.amount)}</span>,
      <Badge key={transaction.id} variant={transaction.status === 'pending' ? 'warning' : 'success'}>
        {transaction.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}
      </Badge>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="সাম্প্রতিক লেনদেন" subtitle="আপনার সর্বশেষ ট্রানজেকশন" />
        <DataTable
          headers={['তারিখ', 'খাত', 'পরিমাণ', 'স্ট্যাটাস']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'completed', label: 'সম্পন্ন' },
            { value: 'pending', label: 'অপেক্ষমাণ' },
          ]}
          searchPlaceholder="খাত বা তারিখ..."
        />
      </Card>
    </section>
  );
}
