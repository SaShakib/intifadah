'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AppModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
}

export function AppModal({ open, title, children, footer, onClose, className }: AppModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <section
        className={cn('max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 pt-5">
          <h2 id="app-modal-title" className="text-lg font-bold text-fg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface-2 text-muted transition hover:bg-danger-bg hover:text-danger"
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{footer}</footer>}
      </section>
    </div>
  );
}

interface AppDrawerProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function AppDrawer({ open, title, children, footer, onClose }: AppDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[800] bg-black/35" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="app-drawer-title" className="text-base font-bold text-fg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface-2 text-muted transition hover:bg-danger-bg hover:text-danger"
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex flex-wrap gap-2 border-t border-border p-4">{footer}</footer>}
      </aside>
    </div>
  );
}

export function AppToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-[5.5rem] left-1/2 z-[950] -translate-x-1/2 rounded-lg bg-brand-mid px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  );
}
