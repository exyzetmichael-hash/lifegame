import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'danger' | 'surface';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  ghost: 'bg-transparent hover:bg-sunken text-text-2',
  danger: 'bg-p1/10 hover:bg-p1/20 text-p1 border border-p1/25',
  surface: 'bg-surface hover:bg-sunken text-text border border-border',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-[13px] px-3 py-1.5 rounded-btn gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-btn gap-2',
  lg: 'text-base px-6 py-3.5 rounded-md gap-2.5',
};

export function Button({ variant = 'surface', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-colors duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
