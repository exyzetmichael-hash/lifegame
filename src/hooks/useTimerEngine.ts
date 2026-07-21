import { useEffect } from 'react';
import { useTimerStore } from '@/store/timerStore';

function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/pwa-192.png' });
    } catch {
      // Notification constructor can throw on some mobile browsers; ignore.
    }
  }
}

/**
 * Global watcher: while a session is running, checks whether it's been going
 * long enough to warrant a "still here?" reminder, and auto-stops it if the
 * reminder goes unanswered for too long. Mount once near the app root.
 */
export function useTimerEngine() {
  const active = useTimerStore((s) => s.active);
  const settings = useTimerStore((s) => s.settings);
  const markReminderShown = useTimerStore((s) => s.markReminderShown);
  const stop = useTimerStore((s) => s.stop);

  useEffect(() => {
    const id = setInterval(() => {
      const current = useTimerStore.getState().active;
      if (!current || !current.segmentStartedAt) return;
      if (current.mode === 'pomodoro' && current.phase !== 'work') return;

      const now = Date.now();
      const baseline = current.reminderDismissedAt
        ? new Date(current.reminderDismissedAt).getTime()
        : new Date(current.segmentStartedAt).getTime();
      const minutesRunning = (now - baseline) / 60000;

      if (!current.reminderShownAt && minutesRunning >= settings.reminderAfterMin) {
        markReminderShown();
        notify('Всё ещё занимаешься?', 'Таймер идёт уже долго — подтверди, что ты в процессе.');
      } else if (current.reminderShownAt) {
        const minutesSinceReminder = (now - new Date(current.reminderShownAt).getTime()) / 60000;
        if (minutesSinceReminder >= settings.autoStopAfterMin) {
          stop({ autoStopped: true });
          notify('Таймер остановлен', 'Не получили ответа — сессия завершена автоматически.');
        }
      }
    }, 5000);
    return () => clearInterval(id);
  }, [settings.reminderAfterMin, settings.autoStopAfterMin, markReminderShown, stop]);

  useEffect(() => {
    if (active && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [active]);
}
