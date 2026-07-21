import { useMemo } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Check, Flame, Minus, Plus } from 'lucide-react';
import type { Habit } from '@/types';
import { useHabitStore } from '@/store/habitStore';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { dateKey } from '@/lib/habitSchedule';
import { calcStreak } from '@/lib/habitStreak';

export function HabitRow({ habit }: { habit: Habit }) {
  const logs = useHabitStore((s) => s.logs);
  const setBinary = useHabitStore((s) => s.setBinary);
  const setNumericValue = useHabitStore((s) => s.setNumericValue);

  const today = new Date();
  const key = dateKey(today);
  const log = useMemo(() => logs.find((l) => l.habitId === habit.id && l.date === key), [logs, habit.id, key]);
  const streak = useMemo(() => calcStreak(habit, logs), [habit, logs]);

  const completed = log?.completed ?? false;
  const value = log?.value ?? 0;
  const target = habit.targetValue ?? 1;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-3.5 py-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${habit.color}22`, color: habit.color }}
      >
        <IconRenderer name={habit.icon} size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{habit.name}</div>
        <div className="text-xs text-text-3 flex items-center gap-1">
          {habit.kind === 'numeric' ? (
            <span>
              {value}/{target} {habit.unit}
            </span>
          ) : (
            <span>{completed ? 'Готово' : 'Не отмечено'}</span>
          )}
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-p2 ml-1">
              <Flame size={11} /> {streak}
            </span>
          )}
        </div>
      </div>

      {habit.kind === 'binary' ? (
        <motion.button
          onClick={() => setBinary(habit.id, today, !completed)}
          whileTap={{ scale: 0.85 }}
          animate={completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.28 }}
          className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors shrink-0',
            completed ? 'border-transparent text-white' : 'border-border text-transparent hover:border-text-3'
          )}
          style={completed ? { background: habit.color } : undefined}
        >
          <Check size={18} />
        </motion.button>
      ) : (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setNumericValue(habit.id, today, Math.max(0, value - 1))}
            className="w-7 h-7 rounded-lg border border-border text-text-2 hover:text-text flex items-center justify-center"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
          <button
            onClick={() => setNumericValue(habit.id, today, value + 1)}
            className={clsx(
              'w-7 h-7 rounded-lg border flex items-center justify-center',
              completed ? 'border-transparent text-white' : 'border-border text-text-2 hover:text-text'
            )}
            style={completed ? { background: habit.color } : undefined}
          >
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
