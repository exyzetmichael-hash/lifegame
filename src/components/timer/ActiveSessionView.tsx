import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, Square, SkipForward } from 'lucide-react';
import { useTimerStore, totalElapsedSeconds, phaseElapsedSeconds, phaseTargetSeconds } from '@/store/timerStore';
import type { ActiveSession } from '@/store/timerStore';
import { useActivityStore } from '@/store/activityStore';
import { useNow } from '@/hooks/useNow';
import { formatDuration } from '@/lib/format';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { Button } from '@/components/ui/Button';

function phaseLabel(phase: ActiveSession['phase']): string {
  if (phase === 'work') return 'Фокус';
  if (phase === 'break') return 'Короткий перерыв';
  if (phase === 'long_break') return 'Длинный перерыв';
  return '';
}

export function ActiveSessionView() {
  const active = useTimerStore((s) => s.active);
  const settings = useTimerStore((s) => s.settings);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const stop = useTimerStore((s) => s.stop);
  const skipPomodoroPhase = useTimerStore((s) => s.skipPomodoroPhase);
  const activities = useActivityStore((s) => s.activities);
  const now = useNow(1000);
  const chimePlayedForPhaseRef = useRef<string | null>(null);

  const activity = active ? activities.find((a) => a.id === active.activityId) : undefined;

  useEffect(() => {
    if (!active) return;
    if (active.mode === 'pomodoro') {
      const target = phaseTargetSeconds(active, settings);
      const elapsed = phaseElapsedSeconds(active, now);
      const key = `${active.id}-${active.phase}-${active.cyclesCompleted}`;
      if (elapsed >= target && chimePlayedForPhaseRef.current !== key) {
        chimePlayedForPhaseRef.current = key;
        skipPomodoroPhase();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(active.phase === 'work' ? 'Перерыв!' : 'Погнали работать', {
            icon: '/pwa-192.png',
          });
        }
      }
    } else if (active.mode === 'countdown' && active.targetSeconds) {
      const elapsed = totalElapsedSeconds(active, now);
      if (elapsed >= active.targetSeconds) {
        stop();
      }
    }
  }, [active, now, settings, skipPomodoroPhase, stop]);

  if (!active || !activity) return null;

  const isPaused = !active.segmentStartedAt;
  const isPomodoro = active.mode === 'pomodoro';
  const isBreak = active.phase === 'break' || active.phase === 'long_break';

  const target = isPomodoro
    ? phaseTargetSeconds(active, settings)
    : active.mode === 'countdown'
      ? (active.targetSeconds ?? 0)
      : 0;
  const elapsedForDisplay = isPomodoro ? phaseElapsedSeconds(active, now) : totalElapsedSeconds(active, now);
  const remaining = target > 0 ? Math.max(0, target - elapsedForDisplay) : null;
  const displaySeconds = remaining !== null ? remaining : elapsedForDisplay;
  const progress = target > 0 ? Math.min(1, elapsedForDisplay / target) : null;

  const totalSessionSeconds = totalElapsedSeconds(active, now);

  const ringColor = isBreak ? 'var(--color-success)' : activity.color;

  const circumference = 2 * Math.PI * 88;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex items-center gap-2 text-text-2 text-sm">
        <IconRenderer name={activity.icon} size={16} style={{ color: activity.color }} />
        <span>{activity.name}</span>
        {isPomodoro && (
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${isBreak ? 'bg-success/15 text-success' : 'bg-accent/15 text-accent'}`}
          >
            {phaseLabel(active.phase)}
          </span>
        )}
      </div>

      <div className="relative w-56 h-56">
        <svg viewBox="0 0 192 192" className="w-full h-full -rotate-90">
          <circle cx="96" cy="96" r="88" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          {progress !== null ? (
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.4, ease: 'linear' }}
            />
          ) : (
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              opacity={0.85}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="serif text-4xl font-semibold tabular-nums">{formatDuration(displaySeconds)}</span>
          {isPomodoro && (
            <span className="text-xs text-text-3">Всего: {formatDuration(totalSessionSeconds)}</span>
          )}
          {isPaused && <span className="text-xs text-p2 mt-1">На паузе</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="surface" size="lg" className="rounded-full w-14 h-14 p-0" onClick={() => stop()}>
          <Square size={20} />
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="rounded-full w-16 h-16 p-0"
          onClick={() => (isPaused ? resume() : pause())}
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </Button>
        {isPomodoro && (
          <Button variant="ghost" size="lg" className="rounded-full w-14 h-14 p-0" onClick={skipPomodoroPhase}>
            <SkipForward size={20} />
          </Button>
        )}
      </div>

      {isPomodoro && (
        <div className="text-xs text-text-3">Помодоро {(active.cyclesCompleted ?? 0) + 1}</div>
      )}
    </div>
  );
}
