import type { Priority } from '@/types';

export const PRIORITY_ORDER: Priority[] = ['p1', 'p2', 'p3', 'p4'];

export const PRIORITY_COLOR: Record<Priority, string> = {
  p1: '#f5556b',
  p2: '#fbbf24',
  p3: '#60a5fa',
  p4: '#5c628a',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  p4: 'P4',
};
