'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { RichTextEditor } from '@/components/custom/RichTextEditor';
import { AppModal } from '@/components/semibase/AppModal';
import type { ApiBookPlanRow } from '@/lib/api';

interface BookPageUpdateModalProps {
  open: boolean;
  plan: ApiBookPlanRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: { currentPage: number; note: string }) => void;
}

export function BookPageUpdateModal({ open, plan, saving, onClose, onSave }: BookPageUpdateModalProps) {
  const [currentPage, setCurrentPage] = useState('');
  const [note, setNote] = useState('');
  const [invalid, setInvalid] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !plan) return;
    const timer = window.setTimeout(() => {
      setCurrentPage(String(plan.current_page));
      setNote(plan.note ?? '');
      setInvalid({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, plan]);

  if (!plan) return null;

  const percent = Math.min(100, Math.round((Number(plan.current_page) / Math.max(1, Number(plan.total_pages))) * 100));

  const handleSave = () => {
    const page = Number(currentPage);
    if (!currentPage.trim() || !Number.isInteger(page) || page < 0 || page > plan.total_pages) {
      setInvalid({ currentPage: `০ থেকে ${plan.total_pages} এর মধ্যে পৃষ্ঠা সংখ্যা দিন` });
      return;
    }
    setInvalid({});
    onSave({ currentPage: page, note });
  };

  return (
    <AppModal
      open={open}
      title={`${plan.book_title} — পড়ার অগ্রগতি`}
      onClose={onClose}
      loading={saving}
      loadingLabel="সংরক্ষণ হচ্ছে..."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>বাতিল</Button>
          <Button onClick={handleSave} disabled={saving}>সংরক্ষণ করুন</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="mb-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-fg-2">এখন পর্যন্ত পড়েছেন</span>
            <span className="font-bold text-fg">{plan.current_page} / {plan.total_pages} পৃষ্ঠা ({percent}%)</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">আপনি এখন কত পৃষ্ঠা পর্যন্ত পড়েছেন?</span>
          <Input type="number" min="0" max={plan.total_pages} value={currentPage} onChange={(event) => setCurrentPage(event.target.value)} placeholder="যেমন: ১২০" autoFocus />
          {invalid.currentPage && <span className="text-xs font-semibold text-danger">{invalid.currentPage}</span>}
        </label>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-fg-2">নোট (ঐচ্ছিক)</span>
          <RichTextEditor value={note} onChange={setNote} placeholder="পড়ার নোট..." />
        </div>
        {Number(currentPage) >= plan.total_pages && Number(currentPage) > 0 && <p className="text-xs font-bold text-success">সব পৃষ্ঠা পড়ে শেষ করেছেন! সংরক্ষণ করুন, তারপর কার্ডের “সম্পন্ন” বোতামে চিহ্নিত করুন।</p>}
      </div>
    </AppModal>
  );
}