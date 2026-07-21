import { format, getISOWeek, getYear } from 'date-fns';
import type { Habit } from '@/types';

export function isDueOnDate(habit: Habit, date: Date): boolean {
  const schedule = habit.schedule;
  if (schedule.type === 'daily') return true;
  if (schedule.type === 'weekdays') {
    return (schedule.daysOfWeek ?? []).includes(date.getDay());
  }
  // weekly_count has no fixed days — it's "due" every day until the week's quota is met,
  // so the penalty sweep only cares about it at week's end (handled separately).
  return false;
}

export function dateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function weekKey(date: Date): string {
  return `${getYear(date)}-W${getISOWeek(date)}`;
}
