import type { Priority } from '@/types';

export const PRIORITY_ORDER: Priority[] = ['p1', 'p2', 'p3', 'p4'];

export const PRIORITY_COLOR: Record<Priority, string> = {
  p1: 'var(--color-p1)',
  p2: 'var(--color-p2)',
  p3: 'var(--color-p3)',
  p4: 'var(--color-p4)',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  p4: 'P4',
};
