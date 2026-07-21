import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('glass-panel rounded-2xl p-5', className)}
      {...props}
    />
  );
}
