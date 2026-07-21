import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'accent' | 'ghost' | 'danger' | 'surface';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white glow-primary',
  accent: 'bg-accent hover:brightness-110 text-bg glow-accent',
  ghost: 'bg-transparent hover:bg-surface-hover text-text border border-border',
  danger: 'bg-danger/15 hover:bg-danger/25 text-danger border border-danger/30',
  surface: 'bg-surface hover:bg-surface-hover text-text border border-border',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5',
};

export function Button({ variant = 'surface', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
