import { supabase } from '@/lib/supabase';
import { useGamificationStore } from '@/store/gamificationStore';
import { useTimerStore } from '@/store/timerStore';
import { useNotificationStore } from '@/store/notificationStore';

interface AppSettingsRow {
  id: number;
  total_xp: number;
  stats: unknown;
  stat_defs: unknown;
  timer_settings: unknown;
  notification_settings: unknown;
}

function isDefaultGamification(totalXp: number): boolean {
  return totalXp === 0;
}

/** Syncs gamification totals + timer/notification settings via the single `app_settings` row. */
export async function bindSingletonSync(): Promise<() => void> {
  if (!supabase) return () => {};

  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
  if (error) {
    console.error('[LifeQuest sync] fetch app_settings failed:', error.message);
  }
  const remote = data as AppSettingsRow | null;

  const localTotalXp = useGamificationStore.getState().totalXp;
  const remoteLooksEmpty = !remote || isDefaultGamification(remote.total_xp);

  if (remoteLooksEmpty && localTotalXp > 0) {
    await pushToRemote();
  } else if (remote) {
    useGamificationStore.setState({
      totalXp: remote.total_xp,
      stats: remote.stats as ReturnType<typeof useGamificationStore.getState>['stats'],
      ...(remote.stat_defs && Object.keys(remote.stat_defs as object).length > 0
        ? { statDefs: remote.stat_defs as ReturnType<typeof useGamificationStore.getState>['statDefs'] }
        : {}),
    });
    if (remote.timer_settings && Object.keys(remote.timer_settings as object).length > 0) {
      useTimerStore.setState({
        settings: { ...useTimerStore.getState().settings, ...(remote.timer_settings as object) },
      });
    }
    if (remote.notification_settings && Object.keys(remote.notification_settings as object).length > 0) {
      useNotificationStore.setState((remote.notification_settings as object) as Partial<ReturnType<typeof useNotificationStore.getState>>);
    }
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  const push = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(pushToRemote, 800);
  };

  const unsub1 = useGamificationStore.subscribe(push);
  const unsub2 = useTimerStore.subscribe(push);
  const unsub3 = useNotificationStore.subscribe(push);

  return () => {
    unsub1();
    unsub2();
    unsub3();
  };
}

async function pushToRemote() {
  if (!supabase) return;
  const gam = useGamificationStore.getState();
  const timerSettings = useTimerStore.getState().settings;
  const notif = useNotificationStore.getState();
  const { error } = await supabase.from('app_settings').upsert({
    id: 1,
    total_xp: gam.totalXp,
    stats: gam.stats,
    stat_defs: gam.statDefs,
    timer_settings: timerSettings,
    notification_settings: {
      eveningReminderEnabled: notif.eveningReminderEnabled,
      eveningReminderTime: notif.eveningReminderTime,
      lastEveningFiredDate: notif.lastEveningFiredDate,
    },
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('[LifeQuest sync] push app_settings failed:', error.message);
}
