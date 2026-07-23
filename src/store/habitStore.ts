import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subDays, startOfWeek, endOfWeek, isBefore, startOfDay } from 'date-fns';
import type { Habit, HabitKind, HabitLog, HabitSchedule, StatAllocation } from '@/types';
import { makeId } from '@/lib/id';
import { dateKey, isDueOnDate, weekKey } from '@/lib/habitSchedule';
import { useGamificationStore } from '@/store/gamificationStore';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  penalizedWeeklyMarkers: string[]; // `${habitId}:${weekKey}`

  addHabit: (input: {
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
  }) => Habit;
  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id'>>) => void;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;

  setBinary: (habitId: string, date: Date, completed: boolean) => void;
  setNumericValue: (habitId: string, date: Date, value: number) => void;
  runPenaltySweep: () => void;
}

function findLog(logs: HabitLog[], habitId: string, key: string): HabitLog | undefined {
  return logs.find((l) => l.habitId === habitId && l.date === key);
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      penalizedWeeklyMarkers: [],

      addHabit: (input) => {
        const habit: Habit = {
          id: makeId(),
          createdAt: new Date().toISOString(),
          ...input,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
        return habit;
      },

      updateHabit: (id, patch) => {
        set((state) => ({ habits: state.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
      },

      archiveHabit: (id) => {
        set((state) => ({ habits: state.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)) }));
      },

      unarchiveHabit: (id) => {
        set((state) => ({ habits: state.habits.map((h) => (h.id === id ? { ...h, archived: false } : h)) }));
      },

      setBinary: (habitId, date, completed) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const key = dateKey(date);
        const existing = findLog(get().logs, habitId, key);
        const wasCompleted = existing?.completed ?? false;

        set((state) => {
          if (existing) {
            return {
              logs: state.logs.map((l) => (l.id === existing.id ? { ...l, completed, value: completed ? 1 : 0, penalized: false } : l)),
            };
          }
          const log: HabitLog = { id: makeId(), habitId, date: key, value: completed ? 1 : 0, completed };
          return { logs: [...state.logs, log] };
        });

        if (completed && !wasCompleted) {
          useGamificationStore.getState().awardXp(habit.xpReward, `Привычка: ${habit.name}`, habit.statAllocations);
        } else if (!completed && wasCompleted) {
          useGamificationStore.getState().awardXp(-habit.xpReward, `Отмена: ${habit.name}`, habit.statAllocations);
        }
      },

      setNumericValue: (habitId, date, value) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const key = dateKey(date);
        const existing = findLog(get().logs, habitId, key);
        const wasCompleted = existing?.completed ?? false;
        const target = habit.targetValue ?? 1;
        const clamped = Math.max(0, value);
        const nowCompleted = clamped >= target;

        set((state) => {
          if (existing) {
            return {
              logs: state.logs.map((l) =>
                l.id === existing.id ? { ...l, value: clamped, completed: nowCompleted, penalized: false } : l
              ),
            };
          }
          const log: HabitLog = { id: makeId(), habitId, date: key, value: clamped, completed: nowCompleted };
          return { logs: [...state.logs, log] };
        });

        if (nowCompleted && !wasCompleted) {
          useGamificationStore.getState().awardXp(habit.xpReward, `Привычка: ${habit.name}`, habit.statAllocations);
        } else if (!nowCompleted && wasCompleted) {
          useGamificationStore.getState().awardXp(-habit.xpReward, `Отмена: ${habit.name}`, habit.statAllocations);
        }
      },

      runPenaltySweep: () => {
        const { habits, logs, penalizedWeeklyMarkers } = get();
        const today = startOfDay(new Date());
        const newLogs: HabitLog[] = [];
        const newMarkers: string[] = [];

        for (const habit of habits) {
          if (habit.archived) continue;
          const createdAt = startOfDay(new Date(habit.createdAt));

          if (habit.schedule.type === 'weekly_count') {
            const lastWeekEnd = endOfWeek(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), { weekStartsOn: 1 });
            const lastWeekStart = startOfWeek(lastWeekEnd, { weekStartsOn: 1 });
            if (isBefore(lastWeekEnd, createdAt)) continue;
            const marker = `${habit.id}:${weekKey(lastWeekStart)}`;
            if (penalizedWeeklyMarkers.includes(marker) || newMarkers.includes(marker)) continue;
            const completedCount = logs.filter((l) => {
              if (l.habitId !== habit.id || !l.completed) return false;
              const d = new Date(l.date);
              return d >= lastWeekStart && d <= lastWeekEnd;
            }).length;
            if (completedCount < (habit.schedule.timesPerWeek ?? 1)) {
              useGamificationStore
                .getState()
                .penalize(habit.penaltyXp, `Не выполнено за неделю: ${habit.name}`, habit.statAllocations);
            }
            newMarkers.push(marker);
            continue;
          }

          // daily / weekdays: check each past day since creation (cap lookback to avoid runaway loops)
          for (let i = 1; i <= 30; i++) {
            const day = subDays(today, i);
            if (isBefore(day, createdAt)) break;
            if (!isDueOnDate(habit, day)) continue;
            const key = dateKey(day);
            if (findLog(logs, habit.id, key) || newLogs.some((l) => l.habitId === habit.id && l.date === key)) continue;
            useGamificationStore.getState().penalize(habit.penaltyXp, `Пропуск: ${habit.name}`, habit.statAllocations);
            newLogs.push({ id: makeId(), habitId: habit.id, date: key, value: 0, completed: false, penalized: true });
          }
        }

        if (newLogs.length || newMarkers.length) {
          set((state) => ({
            logs: [...state.logs, ...newLogs],
            penalizedWeeklyMarkers: [...state.penalizedWeeklyMarkers, ...newMarkers],
          }));
        }
      },
    }),
    {
      name: 'lifequest-habits',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as HabitState;
        if (version < 2 && Array.isArray(state?.habits)) {
          state.habits = state.habits.map((h) => {
            const legacy = h as Habit & { statKey?: string };
            if (!h.statAllocations && legacy.statKey) {
              return { ...h, statAllocations: [{ statKey: legacy.statKey, percent: 100 }] };
            }
            return h.statAllocations ? h : { ...h, statAllocations: [] };
          });
        }
        return state;
      },
    }
  )
);

/** Strips a deleted stat out of every habit's allocations (called from gamificationStore.removeStat). */
export function stripStatFromHabits(statKey: string) {
  useHabitStore.setState((state) => ({
    habits: state.habits.map((h) => ({
      ...h,
      statAllocations: h.statAllocations.filter((alloc) => alloc.statKey !== statKey),
    })),
  }));
}
