'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { AppToast } from '@/components/semibase/AppModal';
import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'secondary';
  label?: string;
}

export function ShareButton({ url, title, text, size = 'sm', variant = 'ghost', label }: ShareButtonProps) {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2600); };

  const share = async () => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url: fullUrl });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        showToast('লিংক কপি হয়েছে');
      } catch {
        showToast('লিংক কপি করা যায়নি');
      }
    }
  };

  return (
    <>
      <Button size={size} variant={variant} onClick={() => void share()}>
        <Share2 className="h-3.5 w-3.5" />{label}
      </Button>
      <AppToast message={toast} />
    </>
  );
}