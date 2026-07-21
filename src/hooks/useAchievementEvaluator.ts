import { useEffect } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { useGamificationStore, overallLevel } from '@/store/gamificationStore';

/** Periodically checks unlockable achievement conditions against current totals. Mount once near the app root. */
export function useAchievementEvaluator() {
  useEffect(() => {
    function check() {
      const { sessions } = useTimerStore.getState();
      const { achievements, unlockAchievement, totalXp, stats } = useGamificationStore.getState();
      const totalHours = sessions.reduce((sum, s) => sum + s.countedSeconds, 0) / 3600;
      const { level } = overallLevel(totalXp);

      for (const a of achievements) {
        if (a.unlockedAt) continue;
        const c = a.condition;
        let met = false;
        if (c.type === 'total_time') {
          const relevant = c.activityId
            ? sessions.filter((s) => s.activityId === c.activityId)
            : sessions;
          const hours = c.activityId ? relevant.reduce((sum, s) => sum + s.countedSeconds, 0) / 3600 : totalHours;
          met = hours >= c.hours;
        } else if (c.type === 'level_reached') {
          met = level >= c.level;
        } else if (c.type === 'stat_level') {
          met = (stats[c.statKey]?.level ?? 1) >= c.level;
        }
        if (met) unlockAchievement(a.id);
      }
    }
    check();
    const id = setInterval(check, 4000);
    return () => clearInterval(id);
  }, []);
}
