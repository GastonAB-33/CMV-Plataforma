import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-primary text-white hover:bg-blue-700',
        variant === 'ghost' && 'bg-transparent text-foreground hover:bg-slate-100',
        className,
      )}
      {...props}
    />
  );
}
