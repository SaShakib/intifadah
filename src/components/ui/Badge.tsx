import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'brand' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
