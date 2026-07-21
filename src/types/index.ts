export type StatKey = 'body' | 'mind' | 'focus' | 'discipline' | 'creativity' | 'social';

export interface Stat {
  key: StatKey;
  label: string;
  icon: string;
  xp: number;
  level: number;
}

export interface Activity {
  id: string;
  name: string;
  color: string;
  icon: string;
  statKey: StatKey;
  createdAt: string;
  archived?: boolean;
}

export type SessionMode = 'pomodoro' | 'stopwatch' | 'countdown';

export interface TimeSession {
  id: string;
  activityId: string;
  mode: SessionMode;
  startedAt: string;
  endedAt: string | null;
  /** Seconds actually counted toward totals (excludes pomodoro breaks). */
  countedSeconds: number;
  /** For countdown mode, the planned target duration in seconds. */
  targetSeconds?: number;
  manual?: boolean;
  note?: string;
  autoStopped?: boolean;
}

export type HabitKind = 'binary' | 'numeric';

export interface HabitSchedule {
  type: 'daily' | 'weekly_count' | 'weekdays';
  /** for weekly_count: how many times per week */
  timesPerWeek?: number;
  /** for weekdays: 0=Sun..6=Sat */
  daysOfWeek?: number[];
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: HabitKind;
  targetValue?: number;
  unit?: string;
  schedule: HabitSchedule;
  statKey: StatKey;
  xpReward: number;
  penaltyXp: number;
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // yyyy-MM-dd
  value: number;
  completed: boolean;
  /** True if this log was auto-created by the penalty sweep (missed day), not by the user. */
  penalized?: boolean;
}

export type Priority = 'p1' | 'p2' | 'p3' | 'p4';

export interface Todo {
  id: string;
  title: string;
  notes?: string;
  projectId: string | null;
  priority: Priority;
  dueDate: string | null;
  labels: string[];
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  xpReward: number;
  unlockedAt: string | null;
  createdAt: string;
  builtin?: boolean;
}

export type AchievementCondition =
  | { type: 'total_time'; activityId?: string; hours: number }
  | { type: 'habit_streak'; habitId?: string; days: number }
  | { type: 'level_reached'; level: number }
  | { type: 'stat_level'; statKey: StatKey; level: number }
  | { type: 'todos_completed'; count: number }
  | { type: 'manual' };

export interface XpEvent {
  id: string;
  amount: number;
  reason: string;
  statKey?: StatKey;
  createdAt: string;
}

export interface TimeBudget {
  id: string;
  activityId: string;
  targetHoursPerWeek: number;
}
