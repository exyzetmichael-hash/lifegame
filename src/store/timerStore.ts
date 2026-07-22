import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionMode, TimeSession } from '@/types';
import { makeId } from '@/lib/id';
import { useGamificationStore } from '@/store/gamificationStore';
import { getActivity } from '@/store/activityStore';

export type PomodoroPhase = 'work' | 'break' | 'long_break';

export interface ActiveSession {
  id: string;
  activityId: string;
  mode: SessionMode;
  startedAt: string; // ISO, when the whole session began
  /** Total counted (toward totals/XP) seconds accumulated before the current running segment. */
  countedSecondsBeforePause: number;
  /** Seconds elapsed within the *current pomodoro phase* before the current running segment. */
  phaseSecondsBeforePause: number;
  /** ISO timestamp when the current running segment began; null while paused. */
  segmentStartedAt: string | null;
  targetSeconds?: number; // countdown target
  // pomodoro-only:
  phase?: PomodoroPhase;
  cyclesCompleted?: number;
  reminderShownAt?: string | null;
  reminderDismissedAt?: string | null;
}

export interface TimerSettings {
  pomodoroWorkMin: number;
  pomodoroBreakMin: number;
  pomodoroLongBreakMin: number;
  pomodoroCyclesBeforeLongBreak: number;
  reminderAfterMin: number; // show "still going?" after this many minutes of continuous running
  autoStopAfterMin: number; // auto-stop this many minutes after the reminder if unanswered
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoroWorkMin: 25,
  pomodoroBreakMin: 5,
  pomodoroLongBreakMin: 15,
  pomodoroCyclesBeforeLongBreak: 4,
  reminderAfterMin: 90,
  autoStopAfterMin: 20,
};

interface TimerState {
  active: ActiveSession | null;
  sessions: TimeSession[];
  settings: TimerSettings;

  startStopwatch: (activityId: string) => void;
  startCountdown: (activityId: string, targetSeconds: number) => void;
  startPomodoro: (activityId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: (opts?: { autoStopped?: boolean }) => void;
  discard: () => void;
  skipPomodoroPhase: () => void;
  dismissReminder: () => void;
  markReminderShown: () => void;
  addManualEntry: (input: {
    activityId: string;
    startedAt: string;
    endedAt: string;
    note?: string;
  }) => void;
  updateSettings: (patch: Partial<TimerSettings>) => void;
  deleteSession: (id: string) => void;
}

function isWorkSegment(active: ActiveSession): boolean {
  return active.mode !== 'pomodoro' || active.phase === 'work';
}

function runningDeltaSeconds(active: ActiveSession, now: number): number {
  if (!active.segmentStartedAt) return 0;
  return Math.max(0, Math.floor((now - new Date(active.segmentStartedAt).getTime()) / 1000));
}

/** Total seconds counted toward the session total (excludes pomodoro breaks). */
export function totalElapsedSeconds(active: ActiveSession, now: number): number {
  const delta = isWorkSegment(active) ? runningDeltaSeconds(active, now) : 0;
  return active.countedSecondsBeforePause + delta;
}

/** Seconds elapsed within the current pomodoro phase (or whole session for other modes). */
export function phaseElapsedSeconds(active: ActiveSession, now: number): number {
  return active.phaseSecondsBeforePause + runningDeltaSeconds(active, now);
}

export function phaseTargetSeconds(active: ActiveSession, settings: TimerSettings): number {
  if (active.mode !== 'pomodoro') return active.targetSeconds ?? 0;
  if (active.phase === 'break') return settings.pomodoroBreakMin * 60;
  if (active.phase === 'long_break') return settings.pomodoroLongBreakMin * 60;
  return settings.pomodoroWorkMin * 60;
}

function xpForSeconds(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}

function finalizeAndReward(session: ActiveSession, countedSeconds: number, endedAt: string, autoStopped: boolean): TimeSession {
  const activity = getActivity(session.activityId);
  const completed: TimeSession = {
    id: session.id,
    activityId: session.activityId,
    mode: session.mode,
    startedAt: session.startedAt,
    endedAt,
    countedSeconds,
    targetSeconds: session.targetSeconds,
    autoStopped,
  };
  if (countedSeconds > 0) {
    const xp = xpForSeconds(countedSeconds);
    useGamificationStore.getState().awardXp(
      xp,
      `${activity?.name ?? 'Активность'}: ${Math.round(countedSeconds / 60)} мин`,
      activity?.statAllocations
    );
    completed.xpAwarded = xp;
    completed.statAllocations = activity?.statAllocations;
  }
  return completed;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      active: null,
      sessions: [],
      settings: DEFAULT_SETTINGS,

      startStopwatch: (activityId) => {
        if (get().active) return;
        const now = new Date().toISOString();
        set({
          active: {
            id: makeId(),
            activityId,
            mode: 'stopwatch',
            startedAt: now,
            countedSecondsBeforePause: 0,
            phaseSecondsBeforePause: 0,
            segmentStartedAt: now,
            reminderShownAt: null,
          },
        });
      },

      startCountdown: (activityId, targetSeconds) => {
        if (get().active) return;
        const now = new Date().toISOString();
        set({
          active: {
            id: makeId(),
            activityId,
            mode: 'countdown',
            startedAt: now,
            countedSecondsBeforePause: 0,
            phaseSecondsBeforePause: 0,
            segmentStartedAt: now,
            targetSeconds,
            reminderShownAt: null,
          },
        });
      },

      startPomodoro: (activityId) => {
        if (get().active) return;
        const now = new Date().toISOString();
        set({
          active: {
            id: makeId(),
            activityId,
            mode: 'pomodoro',
            startedAt: now,
            countedSecondsBeforePause: 0,
            phaseSecondsBeforePause: 0,
            segmentStartedAt: now,
            phase: 'work',
            cyclesCompleted: 0,
            reminderShownAt: null,
          },
        });
      },

      pause: () => {
        const active = get().active;
        if (!active || !active.segmentStartedAt) return;
        const now = Date.now();
        const delta = runningDeltaSeconds(active, now);
        set({
          active: {
            ...active,
            countedSecondsBeforePause: active.countedSecondsBeforePause + (isWorkSegment(active) ? delta : 0),
            phaseSecondsBeforePause: active.phaseSecondsBeforePause + delta,
            segmentStartedAt: null,
          },
        });
      },

      resume: () => {
        const active = get().active;
        if (!active || active.segmentStartedAt) return;
        set({
          active: {
            ...active,
            segmentStartedAt: new Date().toISOString(),
            reminderShownAt: null,
            reminderDismissedAt: null,
          },
        });
      },

      stop: (opts) => {
        const active = get().active;
        if (!active) return;
        const now = Date.now();
        const counted = totalElapsedSeconds(active, now);
        const endedAt = new Date(now).toISOString();
        const completed = finalizeAndReward(active, counted, endedAt, Boolean(opts?.autoStopped));
        set((state) => ({ active: null, sessions: [completed, ...state.sessions] }));
      },

      discard: () => {
        set({ active: null });
      },

      skipPomodoroPhase: () => {
        const active = get().active;
        if (!active || active.mode !== 'pomodoro') return;
        const now = Date.now();
        const settings = get().settings;
        const delta = runningDeltaSeconds(active, now);
        const wasWork = active.phase === 'work';
        const countedBeforePause = active.countedSecondsBeforePause + (wasWork ? delta : 0);

        const cycles = wasWork ? (active.cyclesCompleted ?? 0) + 1 : active.cyclesCompleted ?? 0;
        const nextPhase: PomodoroPhase = wasWork
          ? cycles % settings.pomodoroCyclesBeforeLongBreak === 0
            ? 'long_break'
            : 'break'
          : 'work';

        set({
          active: {
            ...active,
            countedSecondsBeforePause: countedBeforePause,
            phaseSecondsBeforePause: 0,
            segmentStartedAt: new Date(now).toISOString(),
            phase: nextPhase,
            cyclesCompleted: cycles,
          },
        });
      },

      dismissReminder: () => {
        const active = get().active;
        if (!active) return;
        set({
          active: { ...active, reminderShownAt: null, reminderDismissedAt: new Date().toISOString() },
        });
      },

      markReminderShown: () => {
        const active = get().active;
        if (!active) return;
        set({ active: { ...active, reminderShownAt: new Date().toISOString() } });
      },

      addManualEntry: ({ activityId, startedAt, endedAt, note }) => {
        const seconds = Math.max(
          0,
          Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
        );
        const activity = getActivity(activityId);
        const entry: TimeSession = {
          id: makeId(),
          activityId,
          mode: 'stopwatch',
          startedAt,
          endedAt,
          countedSeconds: seconds,
          manual: true,
          note,
        };
        if (seconds > 0) {
          const xp = xpForSeconds(seconds);
          useGamificationStore.getState().awardXp(
            xp,
            `${activity?.name ?? 'Активность'} (вручную): ${Math.round(seconds / 60)} мин`,
            activity?.statAllocations
          );
          entry.xpAwarded = xp;
          entry.statAllocations = activity?.statAllocations;
        }
        set((state) => ({ sessions: [entry, ...state.sessions] }));
      },

      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }));
      },

      deleteSession: (id) => {
        const session = get().sessions.find((s) => s.id === id);
        if (session?.xpAwarded) {
          const activity = getActivity(session.activityId);
          useGamificationStore.getState().awardXp(
            -session.xpAwarded,
            `Удалена запись: ${activity?.name ?? 'Активность'}`,
            session.statAllocations
          );
        }
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
      },
    }),
    { name: 'lifequest-timer' }
  )
);
