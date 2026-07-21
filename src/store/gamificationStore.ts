import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, AchievementCondition, Stat, StatKey, XpEvent } from '@/types';
import { levelFromXp } from '@/lib/leveling';
import { makeId } from '@/lib/id';

const STAT_DEFS: Record<StatKey, { label: string; icon: string }> = {
  body: { label: 'Тело', icon: 'Dumbbell' },
  mind: { label: 'Разум', icon: 'BrainCircuit' },
  focus: { label: 'Фокус', icon: 'Target' },
  discipline: { label: 'Дисциплина', icon: 'ShieldCheck' },
  creativity: { label: 'Креатив', icon: 'Sparkles' },
  social: { label: 'Социум', icon: 'Users' },
};

function emptyStats(): Record<StatKey, Stat> {
  return Object.fromEntries(
    (Object.keys(STAT_DEFS) as StatKey[]).map((key) => [
      key,
      { key, label: STAT_DEFS[key].label, icon: STAT_DEFS[key].icon, xp: 0, level: 1 },
    ])
  ) as Record<StatKey, Stat>;
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
  xpEvents: XpEvent[];
  achievements: Achievement[];

  awardXp: (amount: number, reason: string, statKey?: StatKey) => void;
  penalize: (amount: number, reason: string, statKey?: StatKey) => void;
  addAchievement: (input: {
    name: string;
    description: string;
    icon: string;
    condition: AchievementCondition;
    xpReward: number;
  }) => void;
  removeAchievement: (id: string) => void;
  unlockAchievement: (id: string) => void;
  statDefs: typeof STAT_DEFS;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      stats: emptyStats(),
      xpEvents: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      statDefs: STAT_DEFS,

      awardXp: (amount, reason, statKey) => {
        set((state) => {
          const nextStats = { ...state.stats };
          if (statKey) {
            const prev = nextStats[statKey];
            const newXp = Math.max(0, prev.xp + amount);
            nextStats[statKey] = { ...prev, xp: newXp, level: levelFromXp(newXp).level };
          }
          const event: XpEvent = {
            id: makeId(),
            amount,
            reason,
            statKey,
            createdAt: new Date().toISOString(),
          };
          return {
            totalXp: Math.max(0, state.totalXp + amount),
            stats: nextStats,
            xpEvents: [event, ...state.xpEvents].slice(0, 500),
          };
        });
      },

      penalize: (amount, reason, statKey) => {
        get().awardXp(-Math.abs(amount), reason, statKey);
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
        set((state) => {
          const target = state.achievements.find((a) => a.id === id);
          if (!target || target.unlockedAt) return state;
          const updated = state.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a
          );
          return { achievements: updated };
        });
        const target = get().achievements.find((a) => a.id === id);
        if (target && target.xpReward) {
          get().awardXp(target.xpReward, `Ачивка: ${target.name}`);
        }
      },
    }),
    { name: 'lifequest-gamification' }
  )
);

export function overallLevel(totalXp: number) {
  return levelFromXp(totalXp);
}
