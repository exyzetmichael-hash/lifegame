import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  eveningReminderEnabled: boolean;
  eveningReminderTime: string; // HH:mm
  lastEveningFiredDate: string | null; // yyyy-MM-dd
  setEveningReminderEnabled: (enabled: boolean) => void;
  setEveningReminderTime: (time: string) => void;
  markEveningFired: (date: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      eveningReminderEnabled: false,
      eveningReminderTime: '20:00',
      lastEveningFiredDate: null,
      setEveningReminderEnabled: (enabled) => set({ eveningReminderEnabled: enabled }),
      setEveningReminderTime: (time) => set({ eveningReminderTime: time }),
      markEveningFired: (date) => set({ lastEveningFiredDate: date }),
    }),
    { name: 'lifequest-notifications' }
  )
);
