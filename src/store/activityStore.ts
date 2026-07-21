import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, StatKey, TimeBudget } from '@/types';
import { makeId } from '@/lib/id';

export const ACTIVITY_COLORS = [
  '#7c3aed', '#22d3ee', '#f5b642', '#34d399', '#f5556b',
  '#60a5fa', '#f472b6', '#a3e635', '#fb923c', '#c084fc',
];

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'reading', name: 'Чтение', color: '#7c3aed', icon: 'BookOpen', statKey: 'mind', createdAt: new Date(0).toISOString() },
  { id: 'workout', name: 'Тренировка', color: '#f5556b', icon: 'Dumbbell', statKey: 'body', createdAt: new Date(0).toISOString() },
  { id: 'deep-work', name: 'Глубокая работа', color: '#22d3ee', icon: 'Target', statKey: 'focus', createdAt: new Date(0).toISOString() },
];

interface ActivityState {
  activities: Activity[];
  budgets: TimeBudget[];
  addActivity: (input: { name: string; color: string; icon: string; statKey: StatKey }) => Activity;
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
    { name: 'lifequest-activities' }
  )
);

export function getActivity(id: string): Activity | undefined {
  return useActivityStore.getState().activities.find((a) => a.id === id);
}
