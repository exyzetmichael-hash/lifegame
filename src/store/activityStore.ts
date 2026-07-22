import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, StatAllocation, TimeBudget } from '@/types';
import { makeId } from '@/lib/id';

export const ACTIVITY_COLORS = [
  '#db5a45', '#4f8f6d', '#c98a2b', '#4f6d8c', '#8b5d7a', '#4a8c8c',
];

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'reading', name: 'Чтение', color: '#c98a2b', icon: 'Bookmark', statAllocations: [{ statKey: 'mind', percent: 100 }], createdAt: new Date(0).toISOString() },
  { id: 'workout', name: 'Тренировка', color: '#4f8f6d', icon: 'Dumbbell', statAllocations: [{ statKey: 'body', percent: 100 }], createdAt: new Date(0).toISOString() },
  { id: 'deep-work', name: 'Глубокая работа', color: '#db5a45', icon: 'BookOpen', statAllocations: [{ statKey: 'focus', percent: 100 }], createdAt: new Date(0).toISOString() },
];

interface ActivityState {
  activities: Activity[];
  budgets: TimeBudget[];
  addActivity: (input: { name: string; color: string; icon: string; statAllocations: StatAllocation[] }) => Activity;
  updateActivity: (id: string, patch: Partial<Omit<Activity, 'id'>>) => void;
  archiveActivity: (id: string) => void;
  setBudget: (activityId: string, targetHoursPerWeek: number) => void;
  removeBudget: (activityId: string) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: DEFAULT_ACTIVITIES,
      budgets: [],

      addActivity: (input) => {
        const activity: Activity = {
          id: makeId(),
          createdAt: new Date().toISOString(),
          ...input,
        };
        set((state) => ({ activities: [...state.activities, activity] }));
        return activity;
      },

      updateActivity: (id, patch) => {
        set((state) => ({
          activities: state.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }));
      },

      archiveActivity: (id) => {
        set((state) => ({
          activities: state.activities.map((a) => (a.id === id ? { ...a, archived: true } : a)),
        }));
      },

      setBudget: (activityId, targetHoursPerWeek) => {
        set((state) => {
          const existing = state.budgets.find((b) => b.activityId === activityId);
          if (existing) {
            return {
              budgets: state.budgets.map((b) => (b.activityId === activityId ? { ...b, targetHoursPerWeek } : b)),
            };
          }
          return { budgets: [...state.budgets, { id: makeId(), activityId, targetHoursPerWeek }] };
        });
      },

      removeBudget: (activityId) => {
        set((state) => ({ budgets: state.budgets.filter((b) => b.activityId !== activityId) }));
      },
    }),
    {
      name: 'lifequest-activities',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as ActivityState;
        if (version < 2 && Array.isArray(state?.activities)) {
          state.activities = state.activities.map((a) => {
            const legacy = a as Activity & { statKey?: string };
            if (!a.statAllocations && legacy.statKey) {
              return { ...a, statAllocations: [{ statKey: legacy.statKey, percent: 100 }] };
            }
            return a.statAllocations ? a : { ...a, statAllocations: [] };
          });
        }
        return state;
      },
    }
  )
);

export function getActivity(id: string): Activity | undefined {
  return useActivityStore.getState().activities.find((a) => a.id === id);
}

/** Strips a deleted stat out of every activity's allocations (called from gamificationStore.removeStat). */
export function stripStatFromActivities(statKey: string) {
  useActivityStore.setState((state) => ({
    activities: state.activities.map((a) => ({
      ...a,
      statAllocations: a.statAllocations.filter((alloc) => alloc.statKey !== statKey),
    })),
  }));
}
