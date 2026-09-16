'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible((window.scrollY ?? window.pageYOffset) > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="উপরে যান"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed right-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-lg transition-all duration-300 md:right-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
      style={{ bottom: 'calc(var(--bottomnav-h) + 1rem)', marginBottom: 0 }}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}