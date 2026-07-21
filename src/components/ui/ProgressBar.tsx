import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0..1
  color?: string;
  className?: string;
  trackClassName?: string;
  animated?: boolean;
}

export function ProgressBar({ value, color = 'var(--color-primary)', className, trackClassName, animated = true }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={clsx('h-2 w-full rounded-full bg-border/60 overflow-hidden', trackClassName)}>
      <div
        className={clsx('h-full rounded-full', animated && 'transition-[width] duration-500 ease-out', className)}
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
