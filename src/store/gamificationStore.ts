import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, AchievementCondition, Stat, StatAllocation, StatDef, StatKey, XpEvent } from '@/types';
import { levelFromXp } from '@/lib/leveling';
import { makeId } from '@/lib/id';
import { useToastStore } from '@/store/toastStore';
import { stripStatFromActivities } from '@/store/activityStore';
import { stripStatFromHabits } from '@/store/habitStore';

const BUILTIN_STAT_DEFS: StatDef[] = [
  { key: 'body', label: 'Тело', icon: 'Dumbbell', builtin: true },
  { key: 'mind', label: 'Разум', icon: 'BrainCircuit', builtin: true },
  { key: 'focus', label: 'Фокус', icon: 'Target', builtin: true },
  { key: 'discipline', label: 'Дисциплина', icon: 'ShieldCheck', builtin: true },
  { key: 'creativity', label: 'Креатив', icon: 'Sparkles', builtin: true },
  { key: 'social', label: 'Социум', icon: 'Users', builtin: true },
];

function defsToRecord(defs: StatDef[]): Record<StatKey, StatDef> {
  return Object.fromEntries(defs.map((d) => [d.key, d]));
}

function emptyStats(defs: StatDef[]): Record<StatKey, Stat> {
  return Object.fromEntries(
    defs.map((d) => [d.key, { key: d.key, label: d.label, icon: d.icon, xp: 0, level: 1 }])
  );
}

/** Distributes `amount` across allocations proportionally to their weights (weights need not sum to 100). */
function distribute(amount: number, allocations: StatAllocation[] | undefined): { statKey: StatKey; share: number }[] {
  if (!allocations || allocations.length === 0) return [];
  const totalWeight = allocations.reduce((sum, a) => sum + Math.max(0, a.percent), 0);
  if (totalWeight <= 0) return [];
  return allocations
    .filter((a) => a.percent > 0)
    .map((a) => ({ statKey: a.statKey, share: (amount * a.percent) / totalWeight }));
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    name: 'Первый шаг',
    description: 'Заверши свою первую сессию таймера',
    icon: 'Play',
    condition: { type: 'total_time', hours: 0.0166 },
    xpReward: 20,
    unlockedAt: null,
    createdAt: new Date(0).toISOString(),
    builtin: true,
  },
  {
    id: 'ten-hours',
    name: '10 часов',
    description: 'Суммарно 10 часов в трекере времени',
    icon: 'Clock',
    condition: { type: 'total_time', hours: 10 },
    xpReward: 150,
    unlockedAt: null,
    createdAt: new Date(0).toISOString(),
    builtin: true,
  },
  {
    id: 'level-5',
    name: 'Пятый уровень',
    description: 'Достигни 5 уровня персонажа',
    icon: 'Star',
    condition: { type: 'level_reached', level: 5 },
    xpReward: 0,
    unlockedAt: null,
    createdAt: new Date(0).toISOString(),
    builtin: true,
  },
  {
    id: 'streak-7',
    name: 'Неделя подряд',
    description: 'Стрик привычки 7 дней',
    icon: 'Flame',
    condition: { type: 'habit_streak', days: 7 },
    xpReward: 100,
    unlockedAt: null,
    createdAt: new Date(0).toISOString(),
    builtin: true,
  },
  {
    id: 'todos-25',
    name: 'Разгребатель дел',
    description: 'Заверши 25 задач',
    icon: 'CheckCheck',
    condition: { type: 'todos_completed', count: 25 },
    xpReward: 80,
    unlockedAt: null,
    createdAt: new Date(0).toISOString(),
    builtin: true,
  },
];

interface GamificationState {
  totalXp: number;
  stats: Record<StatKey, Stat>;
  statDefs: Record<StatKey, StatDef>;
  xpEvents: XpEvent[];
  achievements: Achievement[];

  awardXp: (amount: number, reason: string, allocations?: StatAllocation[]) => void;
  penalize: (amount: number, reason: string, allocations?: StatAllocation[]) => void;
  addStat: (input: { label: string; icon: string }) => StatDef;
  removeStat: (key: StatKey) => void;
  addAchievement: (input: {
    name: string;
    description: string;
    icon: string;
    condition: AchievementCondition;
    xpReward: number;
  }) => void;
  removeAchievement: (id: string) => void;
  unlockAchievement: (id: string) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      stats: emptyStats(BUILTIN_STAT_DEFS),
      statDefs: defsToRecord(BUILTIN_STAT_DEFS),
      xpEvents: [],
      achievements: DEFAULT_ACHIEVEMENTS,

      awardXp: (amount, reason, allocations) => {
        const levelBefore = levelFromXp(get().totalXp).level;
        set((state) => {
          const nextStats = { ...state.stats };
          for (const { statKey, share } of distribute(amount, allocations)) {
            const prev = nextStats[statKey];
            if (!prev) continue; // stat may have been deleted since the allocation was recorded
            const newXp = Math.max(0, prev.xp + share);
            nextStats[statKey] = { ...prev, xp: newXp, level: levelFromXp(newXp).level };
          }
          const event: XpEvent = {
            id: makeId(),
            amount,
            reason,
            statAllocations: allocations,
            createdAt: new Date().toISOString(),
          };
          return {
            totalXp: Math.max(0, state.totalXp + amount),
            stats: nextStats,
            xpEvents: [event, ...state.xpEvents].slice(0, 500),
          };
        });
        const levelAfter = levelFromXp(get().totalXp).level;
        if (levelAfter > levelBefore) {
          useToastStore.getState().push({
            type: 'level-up',
            title: `Новый уровень: ${levelAfter}!`,
            description: reason,
            icon: 'Sparkles',
          });
        }
      },

      penalize: (amount, reason, allocations) => {
        get().awardXp(-Math.abs(amount), reason, allocations);
      },

      addStat: (input) => {
        const def: StatDef = { key: makeId(), label: input.label, icon: input.icon, builtin: false };
        set((state) => ({
          statDefs: { ...state.statDefs, [def.key]: def },
          stats: { ...state.stats, [def.key]: { key: def.key, label: def.label, icon: def.icon, xp: 0, level: 1 } },
        }));
        return def;
      },

      removeStat: (key) => {
        const def = get().statDefs[key];
        if (!def || def.builtin) return;
        set((state) => {
          const nextDefs = { ...state.statDefs };
          const nextStats = { ...state.stats };
          delete nextDefs[key];
          delete nextStats[key];
          return { statDefs: nextDefs, stats: nextStats };
        });
        stripStatFromActivities(key);
        stripStatFromHabits(key);
      },

      addAchievement: (input) => {
        set((state) => ({
          achievements: [
            {
              id: makeId(),
              unlockedAt: null,
              createdAt: new Date().toISOString(),
              ...input,
            },
            ...state.achievements,
          ],
        }));
      },

      removeAchievement: (id) => {
        set((state) => ({ achievements: state.achievements.filter((a) => a.id !== id) }));
      },

      unlockAchievement: (id) => {
        const before = get().achievements.find((a) => a.id === id);
        if (!before || before.unlockedAt) return;

        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a
          ),
        }));

        useToastStore.getState().push({
          type: 'achievement',
          title: 'Ачивка открыта!',
          description: before.name,
          icon: before.icon,
        });

        if (before.xpReward) {
          get().awardXp(before.xpReward, `Ачивка: ${before.name}`);
        }
      },
    }),
    {
      name: 'lifequest-gamification',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as GamificationState;
        if (version < 2 && state?.statDefs) {
          // Legacy shape: statDefs values were `{ label, icon }` without `key`/`builtin`.
          state.statDefs = Object.fromEntries(
            Object.entries(state.statDefs).map(([key, def]) => [
              key,
              { key, builtin: true, label: (def as StatDef).label, icon: (def as StatDef).icon },
            ])
          );
        }
        return state;
      },
    }
  )
);

export function overallLevel(totalXp: number) {
  return levelFromXp(totalXp);
}
