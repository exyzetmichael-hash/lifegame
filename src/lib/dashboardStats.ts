import { startOfDay, startOfWeek, startOfMonth, eachDayOfInterval, format, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TimeSession } from '@/types';

export type Period = 'day' | 'week' | 'month';

export function periodRange(period: Period, reference: Date = new Date()): { start: Date; end: Date } {
  const end = new Date(reference);
  if (period === 'day') return { start: startOfDay(reference), end };
  if (period === 'week') return { start: startOfWeek(reference, { weekStartsOn: 1 }), end };
  return { start: startOfMonth(reference), end };
}

export function sessionsInRange(sessions: TimeSession[], start: Date, end: Date): TimeSession[] {
  return sessions.filter((s) => {
    const started = new Date(s.startedAt);
    return isWithinInterval(started, { start, end });
  });
}

export function totalsByActivity(sessions: TimeSession[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.activityId, (map.get(s.activityId) ?? 0) + s.countedSeconds);
  }
  return map;
}

export function dailySeriesSeconds(sessions: TimeSession[], start: Date, end: Date): { date: string; label: string; seconds: number }[] {
  const days = eachDayOfInterval({ start, end: end < start ? start : end });
  return days.map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const seconds = sessions
      .filter((s) => {
        const started = new Date(s.startedAt);
        return started >= dayStart && started <= dayEnd;
      })
      .reduce((sum, s) => sum + s.countedSeconds, 0);
    return { date: format(day, 'yyyy-MM-dd'), label: format(day, 'EEEEEE', { locale: ru }), seconds };
  });
}

export function totalsByWeekday(sessions: TimeSession[]): number[] {
  // index 0 = Monday .. 6 = Sunday
  const totals = new Array(7).fill(0) as number[];
  for (const s of sessions) {
    const day = new Date(s.startedAt).getDay(); // 0 = Sunday
    const idx = day === 0 ? 6 : day - 1;
    totals[idx] += s.countedSeconds;
  }
  return totals;
}
