export type StatKey = string;

export interface Stat {
  key: StatKey;
  label: string;
  icon: string;
  xp: number;
  level: number;
}

export interface StatDef {
  key: StatKey;
  label: string;
  icon: string;
  /** Built-in stats can't be deleted, only custom ones the user added. */
  builtin?: boolean;
}

/** Relative weight of XP routed to a stat. Weights don't need to sum to 100 — they're normalized at award time. */
export interface StatAllocation {
  statKey: StatKey;
  percent: number;
}

export interface Activity {
  id: string;
  name: string;
  color: string;
  icon: string;
  statAllocations: StatAllocation[];
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
  /** Snapshot of the XP granted for this session, so deleting it can reverse the exact amount. */
  xpAwarded?: number;
  /** Snapshot of the activity's stat split at award time (activity's own split may change later). */
  statAllocations?: StatAllocation[];
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
  statAllocations: StatAllocation[];
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
  statAllocations?: StatAllocation[];
  createdAt: string;
}

export interface TimeBudget {
  id: string;
  activityId: string;
  targetHoursPerWeek: number;
}
