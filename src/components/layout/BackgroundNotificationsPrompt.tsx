'use client';

import { useEffect, useState } from 'react';
import { BellRing, LoaderCircle } from 'lucide-react';
import { AppModal } from '@/components/semibase/AppModal';
import { useBackgroundNotifications } from '@/hooks/useBackgroundNotifications';

const DISMISS_KEY = 'intifadah-background-notifications-later';

export function BackgroundNotificationsPrompt() {
  const { status, busy, error, enable } = useBackgroundNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== 'default' && status !== 'error') {
      return;
    }

    if (window.localStorage.getItem(DISMISS_KEY)) return;
    const timeout = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, 'true');
    setOpen(false);
  };

  const handleEnable = async () => {
    const enabled = await enable();
    if (enabled) {
      setOpen(false);
    }
  };

  if (status === 'unsupported' || status === 'unconfigured' || status === 'blocked') return null;

  return (
    <AppModal
      open={open && (status === 'default' || status === 'error')}
      title="বিজ্ঞপ্তি চালু করুন"
      onClose={dismiss}
      footer={(
        <>
          <button type="button" onClick={dismiss} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-2">
            এখন নয়
          </button>
          <button
            type="button"
            onClick={() => void handleEnable()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
            চালু করুন
          </button>
        </>
      )}
    >
      <p className="text-sm leading-6 text-muted">প্রতিদিন রাত ৯টায় Quran ও Namaj tracking করার স্মরণিকা পেতে বিজ্ঞপ্তি চালু করুন। অ্যাপ বন্ধ থাকলেও এটি আসবে।</p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </AppModal>
  );
}
