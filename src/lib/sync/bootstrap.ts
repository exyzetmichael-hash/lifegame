import { useEffect, useRef } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { bindCollectionSync } from '@/lib/sync/collectionSync';
import { bindSingletonSync } from '@/lib/sync/singletonSync';
import {
  activityRow,
  budgetRow,
  sessionRow,
  habitRow,
  habitLogRow,
  projectRow,
  todoRow,
  achievementRow,
  xpEventRow,
} from '@/lib/sync/mappers';
import { useActivityStore } from '@/store/activityStore';
import { useTimerStore } from '@/store/timerStore';
import { useHabitStore } from '@/store/habitStore';
import { useTodoStore } from '@/store/todoStore';
import { useGamificationStore } from '@/store/gamificationStore';

/**
 * One-time hydration + ongoing bidirectional-ish sync (local is authoritative
 * between pulls; every local change is pushed, debounced) with Supabase.
 * No-op entirely when VITE_SUPABASE_URL/ANON_KEY aren't set — the app stays
 * fully local in that case. Mount once near the app root.
 */
export function useSupabaseSync() {
  const started = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured || started.current) return;
    started.current = true;

    let unsubs: Array<() => void> = [];
    let cancelled = false;

    (async () => {
      const results = await Promise.all([
        bindCollectionSync({
          table: 'activities',
          store: useActivityStore,
          getItems: (s) => s.activities,
          setItems: (items) => useActivityStore.setState({ activities: items }),
          ...activityRow,
        }),
        bindCollectionSync({
          table: 'time_budgets',
          store: useActivityStore,
          getItems: (s) => s.budgets,
          setItems: (items) => useActivityStore.setState({ budgets: items }),
          ...budgetRow,
        }),
        bindCollectionSync({
          table: 'time_sessions',
          store: useTimerStore,
          getItems: (s) => s.sessions,
          setItems: (items) => useTimerStore.setState({ sessions: items }),
          ...sessionRow,
        }),
        bindCollectionSync({
          table: 'habits',
          store: useHabitStore,
          getItems: (s) => s.habits,
          setItems: (items) => useHabitStore.setState({ habits: items }),
          ...habitRow,
        }),
        bindCollectionSync({
          table: 'habit_logs',
          store: useHabitStore,
          getItems: (s) => s.logs,
          setItems: (items) => useHabitStore.setState({ logs: items }),
          ...habitLogRow,
        }),
        bindCollectionSync({
          table: 'projects',
          store: useTodoStore,
          getItems: (s) => s.projects,
          setItems: (items) => useTodoStore.setState({ projects: items }),
          ...projectRow,
        }),
        bindCollectionSync({
          table: 'todos',
          store: useTodoStore,
          getItems: (s) => s.todos,
          setItems: (items) => useTodoStore.setState({ todos: items }),
          ...todoRow,
        }),
        bindCollectionSync({
          table: 'achievements',
          store: useGamificationStore,
          getItems: (s) => s.achievements,
          setItems: (items) => useGamificationStore.setState({ achievements: items }),
          ...achievementRow,
        }),
        bindCollectionSync({
          table: 'xp_events',
          store: useGamificationStore,
          getItems: (s) => s.xpEvents,
          setItems: (items) => useGamificationStore.setState({ xpEvents: items }),
          ...xpEventRow,
        }),
        bindSingletonSync(),
      ]);
      if (cancelled) {
        results.forEach((unsub) => unsub());
      } else {
        unsubs = results;
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((unsub) => unsub());
    };
  }, []);
}
