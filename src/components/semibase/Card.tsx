import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section className={cn('rounded-xl border border-border bg-white p-4 shadow-sm', className)}>
      {children}
    </section>
  );
}
