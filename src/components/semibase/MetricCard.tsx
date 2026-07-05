import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({ label, value, hint, icon, className }: MetricCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-4 shadow-sm', className)}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-fg">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
