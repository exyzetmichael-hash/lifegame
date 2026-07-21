import { useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';

/** Runs the missed-habit penalty sweep on load and periodically. Mount once near the app root. */
export function useHabitPenaltySweep() {
  useEffect(() => {
    useHabitStore.getState().runPenaltySweep();
    const id = setInterval(() => useHabitStore.getState().runPenaltySweep(), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
}
