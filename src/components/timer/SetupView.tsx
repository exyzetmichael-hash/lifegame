import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Plus, Hourglass, Timer as TimerIcon, TimerReset } from 'lucide-react';
import { useActivityStore } from '@/store/activityStore';
import { useTimerStore } from '@/store/timerStore';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { Button } from '@/components/ui/Button';
import { CreateActivityModal } from '@/components/timer/CreateActivityModal';
import type { SessionMode } from '@/types';

const MODES: { key: SessionMode; label: string; icon: typeof TimerIcon; hint: string }[] = [
  { key: 'stopwatch', label: 'Секундомер', icon: TimerIcon, hint: 'Считает всё время до стопа' },
  { key: 'pomodoro', label: 'Помодоро', icon: Hourglass, hint: 'В зачёт идёт только работа' },
  { key: 'countdown', label: 'Обратный отсчёт', icon: TimerReset, hint: 'Таймер на заданное время' },
];

const COUNTDOWN_PRESETS = [10, 15, 20, 30, 45, 60];

export function SetupView() {
  const allActivities = useActivityStore((s) => s.activities);
  const activities = useMemo(() => allActivities.filter((a) => !a.archived), [allActivities]);
  const startStopwatch = useTimerStore((s) => s.startStopwatch);
  const startPomodoro = useTimerStore((s) => s.startPomodoro);
  const startCountdown = useTimerStore((s) => s.startCountdown);

  const [activityId, setActivityId] = useState<string | null>(activities[0]?.id ?? null);
  const [mode, setMode] = useState<SessionMode>('stopwatch');
  const [countdownMin, setCountdownMin] = useState(20);
  const [createOpen, setCreateOpen] = useState(false);

  const canStart = Boolean(activityId);

  function handleStart() {
    if (!activityId) return;
    if (mode === 'stopwatch') startStopwatch(activityId);
    else if (mode === 'pomodoro') startPomodoro(activityId);
    else startCountdown(activityId, countdownMin * 60);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs text-text-2 uppercase tracking-wide">Активность</span>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 font-medium"
          >
            <Plus size={14} /> новая
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.map((a) => (
            <button
              key={a.id}
              onClick={() => setActivityId(a.id)}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all',
                activityId === a.id ? 'border-transparent text-white scale-[1.02]' : 'border-border text-text-2 hover:text-text hover:border-text-3'
              )}
              style={activityId === a.id ? { background: a.color, boxShadow: `0 6px 20px -6px ${a.color}88` } : undefined}
            >
              <IconRenderer name={a.icon} size={16} />
              {a.name}
            </button>
          ))}
          {activities.length === 0 && (
            <button
              onClick={() => setCreateOpen(true)}
              className="text-sm text-text-2 border border-dashed border-border rounded-xl px-4 py-2 hover:border-accent hover:text-accent transition-colors"
            >
              + Создай первую активность
            </button>
          )}
        </div>
      </div>

      <div>
        <span className="text-xs text-text-2 uppercase tracking-wide mb-2.5 block">Режим</span>
        <div className="grid grid-cols-3 gap-2.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={clsx(
                'flex flex-col items-center gap-1.5 rounded-2xl px-3 py-4 border text-center transition-colors',
                mode === m.key ? 'border-accent bg-accent/10 text-text' : 'border-border text-text-2 hover:text-text'
              )}
            >
              <m.icon size={20} className={mode === m.key ? 'text-accent' : ''} />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-text-3 mt-2">{MODES.find((m) => m.key === mode)?.hint}</p>
      </div>

      {mode === 'countdown' && (
        <div>
          <span className="text-xs text-text-2 uppercase tracking-wide mb-2.5 block">Длительность</span>
          <div className="flex flex-wrap gap-2">
            {COUNTDOWN_PRESETS.map((min) => (
              <button
                key={min}
                onClick={() => setCountdownMin(min)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                  countdownMin === min ? 'border-accent bg-accent/15 text-accent' : 'border-border text-text-2 hover:text-text'
                )}
              >
                {min} мин
              </button>
            ))}
            <input
              type="number"
              min={1}
              value={countdownMin}
              onChange={(e) => setCountdownMin(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 bg-surface border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
      )}

      <Button variant="primary" size="lg" className="w-full" disabled={!canStart} onClick={handleStart}>
        Старт
      </Button>

      <CreateActivityModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(a) => setActivityId(a.id)}
      />
    </div>
  );
}
