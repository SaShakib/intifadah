import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger-soft';
type ButtonSize = 'default' | 'sm' | 'xs';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary'
    : variant === 'ghost' ? 'btn-ghost'
    : 'btn-danger-soft';

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'xs' ? 'btn-xs' : '';
  const widthClass = fullWidth ? 'btn-full' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
