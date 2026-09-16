'use client';

import { useEffect, useState } from 'react';
import { BookOpen, BookMarked } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { RichTextEditor } from '@/components/custom/RichTextEditor';
import { AppModal } from '@/components/semibase/AppModal';
import { cn } from '@/lib/utils/cn';
import type { ApiQuranPlanRow, QuranPlanGoalType } from '@/lib/api';

interface PlanModalProps {
  open: boolean;
  plan: ApiQuranPlanRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: { planName: string; goalType: QuranPlanGoalType; fromRef: string; toRef: string; surahReference: string; totalTarget: number; note: string }) => void;
}

export function PlanModal({ open, plan, saving, onClose, onSave }: PlanModalProps) {
  const [planName, setPlanName] = useState('');
  const [goalType, setGoalType] = useState<QuranPlanGoalType>(1);
  const [fromRef, setFromRef] = useState('');
  const [toRef, setToRef] = useState('');
  const [surahReference, setSurahReference] = useState('');
  const [totalTarget, setTotalTarget] = useState('');
  const [note, setNote] = useState('');
  const [invalid, setInvalid] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setPlanName(plan?.plan_name ?? '');
      setGoalType(plan?.goal_type ?? 1);
      setFromRef(plan?.from_ref ?? '');
      setToRef(plan?.to_ref ?? '');
      setSurahReference(plan?.surah_reference ?? '');
      setTotalTarget(plan ? String(plan.total_target) : '');
      setNote(plan?.note ?? '');
      setInvalid({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, plan]);

  const unitShort = goalType === 1 ? 'পৃষ্ঠা' : 'আয়াত';

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!planName.trim()) {
      errors.planName = 'প্ল্যানের নাম দিন';
    }
    const target = Number(totalTarget);
    if (!totalTarget.trim() || !Number.isInteger(target) || target <= 0) {
      errors.totalTarget = `মোট ${unitShort} সংখ্যা দিন (১ বা তার বেশি)`;
    }
    setInvalid(errors);
    if (Object.keys(errors).length) {
      return;
    }
    onSave({
      planName: planName.trim(),
      goalType,
      fromRef: fromRef.trim(),
      toRef: toRef.trim(),
      surahReference: surahReference.trim(),
      totalTarget: target,
      note,
    });
  };

  const goalOption = (value: QuranPlanGoalType, label: string, detail: string) => (
    <button
      type="button"
      onClick={() => setGoalType(value)}
      className={cn(
        'flex-1 rounded-xl border px-3 py-3 text-left transition',
        goalType === value ? 'border-brand bg-brand-light/40 ring-2 ring-brand/20' : 'border-border bg-white hover:border-brand/40',
      )}
    >
      <span className="flex items-center gap-2 text-sm font-bold text-fg">
        {value === 1 ? <BookOpen className="h-4 w-4 text-brand" /> : <BookMarked className="h-4 w-4 text-brand" />}
        {label}
      </span>
      <span className="mt-1 block text-xs text-fg-2">{detail}</span>
    </button>
  );

  return (
    <AppModal
      open={open}
      title={plan ? 'প্ল্যান সম্পাদনা করুন' : 'নতুন প্ল্যান তৈরি করুন'}
      onClose={onClose}
      loading={saving}
      loadingLabel={plan ? 'সংরক্ষণ হচ্ছে...' : 'তৈরি হচ্ছে...'}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>বাতিল</Button>
          <Button onClick={handleSave} disabled={saving}>{plan ? 'আপডেট করুন' : 'প্ল্যান তৈরি করুন'}</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">প্ল্যানের নাম</span>
          <Input value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="যেমন: কুরআন খতম, সূরা বাকারা মুখস্থ..." />
          {invalid.planName && <span className="text-xs font-semibold text-danger">{invalid.planName}</span>}
        </label>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">লক্ষ্যের ধরন</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            {goalOption(1, 'তিলাওয়াত', 'পৃষ্ঠা দিয়ে অগ্রগতি রেকর্ড হবে')}
            {goalOption(2, 'মুখস্থ', 'আয়াত দিয়ে অগ্রগতি রেকর্ড হবে')}
          </div>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">লক্ষ্য — মোট {unitShort}</span>
          <Input type="number" min="1" value={totalTarget} onChange={(event) => setTotalTarget(event.target.value)} placeholder={unitShort === 'পৃষ্ঠা' ? 'যেমন: ৬০৪' : 'যেমন: ৩০০'} />
          {invalid.totalTarget && <span className="text-xs font-semibold text-danger">{invalid.totalTarget}</span>}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">শুরু থেকে (ঐচ্ছিক)</span>
            <Input value={fromRef} onChange={(event) => setFromRef(event.target.value)} placeholder={unitShort === 'পৃষ্ঠা' ? 'যেমন: ১' : 'যেমন: ১'} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">শেষ পর্যন্ত (ঐচ্ছিক)</span>
            <Input value={toRef} onChange={(event) => setToRef(event.target.value)} placeholder={unitShort === 'পৃষ্ঠা' ? 'যেমন: ৩০' : 'যেমন: ২৮৬'} />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">{goalType === 2 ? 'সূরা / অধ্যায় (ঐচ্ছিক)' : 'সূরা / রেফারেন্স (ঐচ্ছিক)'}</span>
          <Input value={surahReference} onChange={(event) => setSurahReference(event.target.value)} placeholder="যেমন: সূরা আল-বাকারা" />
        </label>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">নোট</span>
          <RichTextEditor value={note} onChange={setNote} placeholder="নোট লিখুন..." />
        </div>
      </div>
    </AppModal>
  );
}