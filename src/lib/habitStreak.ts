import { subDays, isBefore, startOfDay } from 'date-fns';
import type { Habit, HabitLog } from '@/types';
import { dateKey, isDueOnDate } from '@/lib/habitSchedule';

/** Consecutive completed due-days ending today or yesterday (breaks on the first missed due day). */
export function calcStreak(habit: Habit, logs: HabitLog[]): number {
  if (habit.schedule.type === 'weekly_count') return 0; // streaks aren't meaningful for weekly-quota habits
  const createdAt = startOfDay(new Date(habit.createdAt));
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  let streak = 0;
  let cursor = startOfDay(new Date());

  // Today doesn't break the streak if not yet completed (day isn't over).
  if (isDueOnDate(habit, cursor)) {
    const log = habitLogs.find((l) => l.date === dateKey(cursor));
    if (log?.completed) streak += 1;
  }
  cursor = subDays(cursor, 1);

  while (!isBefore(cursor, createdAt)) {
    if (isDueOnDate(habit, cursor)) {
      const log = habitLogs.find((l) => l.date === dateKey(cursor));
      if (log?.completed) {
        streak += 1;
      } else {
        break;
      }
    }
    cursor = subDays(cursor, 1);
  }
  return streak;
}
