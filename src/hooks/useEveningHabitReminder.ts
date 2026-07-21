import { useEffect } from 'react';
import { format } from 'date-fns';
import { useNotificationStore } from '@/store/notificationStore';
import { useHabitStore } from '@/store/habitStore';
import { isDueOnDate, dateKey } from '@/lib/habitSchedule';

function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/pwa-192.png' });
    } catch {
      // ignore — some mobile browsers reject the constructor outside a service worker
    }
  }
}

/**
 * Fires once a day at the configured local time if there are still
 * unfinished due-today habits. Only works while the app/tab is open —
 * true background push would need a server-side push service, which this
 * offline-first app doesn't have.
 */
export function useEveningHabitReminder() {
  useEffect(() => {
    const check = () => {
      const { eveningReminderEnabled, eveningReminderTime, lastEveningFiredDate, markEveningFired } =
        useNotificationStore.getState();
      if (!eveningReminderEnabled) return;

      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      if (lastEveningFiredDate === today) return;

      const nowHm = format(now, 'HH:mm');
      if (nowHm < eveningReminderTime) return;

      const { habits, logs } = useHabitStore.getState();
      const key = dateKey(now);
      const pending = habits.filter((h) => {
        if (h.archived || h.schedule.type === 'weekly_count') return false;
        if (!isDueOnDate(h, now)) return false;
        const log = logs.find((l) => l.habitId === h.id && l.date === key);
        return !log?.completed;
      });

      markEveningFired(today);
      if (pending.length > 0) {
        notify(
          'Не забудь про привычки',
          pending.length === 1
            ? `Осталось: ${pending[0].name}`
            : `Осталось ${pending.length}: ${pending.map((h) => h.name).join(', ')}`
        );
      }
    };

    check();
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, []);
}
