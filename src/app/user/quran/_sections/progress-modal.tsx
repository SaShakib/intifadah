'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { RichTextEditor } from '@/components/custom/RichTextEditor';
import { AppModal } from '@/components/semibase/AppModal';
import type { ApiQuranPlanRow, ApiQuranPlanProgressRow } from '@/lib/api';

interface ProgressModalProps {
  open: boolean;
  plan: ApiQuranPlanRow | null;
  todayEntry: ApiQuranPlanProgressRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: { recordDate: string; quantity: number; note: string }) => void;
}

export function ProgressModal({ open, plan, todayEntry, saving, onClose, onSave }: ProgressModalProps) {
  const [recordDate, setRecordDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [invalid, setInvalid] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setRecordDate(todayEntry?.record_date ?? new Date().toISOString().slice(0, 10));
      setQuantity(todayEntry ? String(todayEntry.quantity) : '');
      setNote(todayEntry?.note ?? '');
      setInvalid({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, todayEntry]);

  if (!plan) return null;

  const unitShort = plan.goal_type === 1 ? 'পৃষ্ঠা' : 'আয়াত';
  const fieldLabel = plan.goal_type === 1 ? 'আজ কত পৃষ্ঠা পড়া হয়েছে?' : 'আজ কত আয়াত মুখস্থ হয়েছে?';
  const isEdit = Boolean(todayEntry);

  const handleSave = () => {
    const parsed = Number(quantity);
    if (!quantity.trim() || !Number.isInteger(parsed) || parsed < 1) {
      setInvalid({ quantity: `অগ্রগতির সংখ্যা দিন (১ বা তার বেশি ${unitShort})` });
      return;
    }
    setInvalid({});
    onSave({ recordDate, quantity: parsed, note });
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? `${plan.plan_name} — আজকের অগ্রগতি আপডেট` : `${plan.plan_name} — আজকের অগ্রগতি`}
      onClose={onClose}
      loading={saving}
      loadingLabel="সংরক্ষণ হচ্ছে..."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>বাতিল</Button>
          <Button onClick={handleSave} disabled={saving}>{isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-fg-2">
          লক্ষ্য: মোট {plan.total_target} {unitShort} · অগ্রগতি: {plan.total_quantity} {unitShort}
        </p>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">তারিখ</span>
          <Input type="date" value={recordDate} onChange={(event) => setRecordDate(event.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">{fieldLabel}</span>
          <Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder={`${unitShort} সংখ্যা দিন`} />
          {invalid.quantity && <span className="text-xs font-semibold text-danger">{invalid.quantity}</span>}
        </label>
        {isEdit && <p className="text-xs text-warning">এই তারিখে আগের হিসাব চলে গিয়ে নতুন সংখ্যা বসবে।</p>}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">নোট (ঐচ্ছিক)</span>
          <RichTextEditor value={note} onChange={setNote} placeholder="আজকের অগ্রগতি নোট..." />
        </div>
      </div>
    </AppModal>
  );
}