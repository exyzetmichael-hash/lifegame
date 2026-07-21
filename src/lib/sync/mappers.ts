import type {
  Activity,
  TimeBudget,
  TimeSession,
  Habit,
  HabitLog,
  Project,
  Todo,
  Achievement,
  XpEvent,
} from '@/types';

const asStr = (v: unknown): string | undefined => (v == null ? undefined : String(v));

export const activityRow = {
  toRow: (a: Activity) => ({
    id: a.id,
    name: a.name,
    color: a.color,
    icon: a.icon,
    stat_key: a.statKey,
    created_at: a.createdAt,
    archived: Boolean(a.archived),
  }),
  fromRow: (r: Record<string, unknown>): Activity => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as string,
    icon: r.icon as string,
    statKey: r.stat_key as Activity['statKey'],
    createdAt: r.created_at as string,
    archived: Boolean(r.archived),
  }),
};

export const budgetRow = {
  toRow: (b: TimeBudget) => ({
    id: b.id,
    activity_id: b.activityId,
    target_hours_per_week: b.targetHoursPerWeek,
  }),
  fromRow: (r: Record<string, unknown>): TimeBudget => ({
    id: r.id as string,
    activityId: r.activity_id as string,
    targetHoursPerWeek: Number(r.target_hours_per_week),
  }),
};

export const sessionRow = {
  toRow: (s: TimeSession) => ({
    id: s.id,
    activity_id: s.activityId,
    mode: s.mode,
    started_at: s.startedAt,
    ended_at: s.endedAt,
    counted_seconds: Math.round(s.countedSeconds),
    target_seconds: s.targetSeconds ?? null,
    manual: Boolean(s.manual),
    note: s.note ?? null,
    auto_stopped: Boolean(s.autoStopped),
  }),
  fromRow: (r: Record<string, unknown>): TimeSession => ({
    id: r.id as string,
    activityId: r.activity_id as string,
    mode: r.mode as TimeSession['mode'],
    startedAt: r.started_at as string,
    endedAt: (r.ended_at as string) ?? null,
    countedSeconds: Number(r.counted_seconds),
    targetSeconds: r.target_seconds == null ? undefined : Number(r.target_seconds),
    manual: Boolean(r.manual),
    note: asStr(r.note),
    autoStopped: Boolean(r.auto_stopped),
  }),
};

export const habitRow = {
  toRow: (h: Habit) => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    color: h.color,
    kind: h.kind,
    target_value: h.targetValue ?? null,
    unit: h.unit ?? null,
    schedule: h.schedule,
    stat_key: h.statKey,
    xp_reward: h.xpReward,
    penalty_xp: h.penaltyXp,
    created_at: h.createdAt,
    archived: Boolean(h.archived),
  }),
  fromRow: (r: Record<string, unknown>): Habit => ({
    id: r.id as string,
    name: r.name as string,
    icon: r.icon as string,
    color: r.color as string,
    kind: r.kind as Habit['kind'],
    targetValue: r.target_value == null ? undefined : Number(r.target_value),
    unit: asStr(r.unit),
    schedule: r.schedule as Habit['schedule'],
    statKey: r.stat_key as Habit['statKey'],
    xpReward: Number(r.xp_reward),
    penaltyXp: Number(r.penalty_xp),
    createdAt: r.created_at as string,
    archived: Boolean(r.archived),
  }),
};

export const habitLogRow = {
  toRow: (l: HabitLog) => ({
    id: l.id,
    habit_id: l.habitId,
    date: l.date,
    value: l.value,
    completed: l.completed,
    penalized: Boolean(l.penalized),
  }),
  fromRow: (r: Record<string, unknown>): HabitLog => ({
    id: r.id as string,
    habitId: r.habit_id as string,
    date: r.date as string,
    value: Number(r.value),
    completed: Boolean(r.completed),
    penalized: Boolean(r.penalized),
  }),
};

export const projectRow = {
  toRow: (p: Project) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    created_at: p.createdAt,
  }),
  fromRow: (r: Record<string, unknown>): Project => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as string,
    createdAt: r.created_at as string,
  }),
};

export const todoRow = {
  toRow: (t: Todo) => ({
    id: t.id,
    title: t.title,
    notes: t.notes ?? null,
    project_id: t.projectId,
    priority: t.priority,
    due_date: t.dueDate,
    completed: t.completed,
    completed_at: t.completedAt,
    created_at: t.createdAt,
  }),
  fromRow: (r: Record<string, unknown>): Todo => ({
    id: r.id as string,
    title: r.title as string,
    notes: asStr(r.notes),
    projectId: (r.project_id as string) ?? null,
    priority: r.priority as Todo['priority'],
    dueDate: (r.due_date as string) ?? null,
    completed: Boolean(r.completed),
    completedAt: (r.completed_at as string) ?? null,
    createdAt: r.created_at as string,
  }),
};

export const achievementRow = {
  toRow: (a: Achievement) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    condition: a.condition,
    xp_reward: a.xpReward,
    unlocked_at: a.unlockedAt,
    created_at: a.createdAt,
    builtin: Boolean(a.builtin),
  }),
  fromRow: (r: Record<string, unknown>): Achievement => ({
    id: r.id as string,
    name: r.name as string,
    description: r.description as string,
    icon: r.icon as string,
    condition: r.condition as Achievement['condition'],
    xpReward: Number(r.xp_reward),
    unlockedAt: (r.unlocked_at as string) ?? null,
    createdAt: r.created_at as string,
    builtin: Boolean(r.builtin),
  }),
};

export const xpEventRow = {
  toRow: (e: XpEvent) => ({
    id: e.id,
    amount: e.amount,
    reason: e.reason,
    stat_key: e.statKey ?? null,
    created_at: e.createdAt,
  }),
  fromRow: (r: Record<string, unknown>): XpEvent => ({
    id: r.id as string,
    amount: Number(r.amount),
    reason: r.reason as string,
    statKey: (r.stat_key as XpEvent['statKey']) ?? undefined,
    createdAt: r.created_at as string,
  }),
};
