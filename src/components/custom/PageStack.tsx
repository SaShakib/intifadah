import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface PageStackProps {
  children: ReactNode;
  className?: string;
}

export function PageStack({ children, className }: PageStackProps) {
  return <div className={cn('space-y-5', className)}>{children}</div>;
}
