import { isPast, isToday } from 'date-fns';
import type { Todo } from '@/types';

export function isInboxTodo(t: Todo): boolean {
  return !t.completed && t.projectId === null;
}

export function isTodayTodo(t: Todo): boolean {
  return !t.completed && Boolean(t.dueDate) && (isToday(new Date(t.dueDate!)) || isPast(new Date(t.dueDate!)));
}

export function isUpcomingTodo(t: Todo): boolean {
  return !t.completed && Boolean(t.dueDate) && !isToday(new Date(t.dueDate!)) && !isPast(new Date(t.dueDate!));
}
