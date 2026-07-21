import { useGamificationStore, overallLevel } from '@/store/gamificationStore';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function XpBar() {
  const totalXp = useGamificationStore((s) => s.totalXp);
  const { level, xpIntoLevel, xpForNext } = overallLevel(totalXp);

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-sm text-white glow-primary">
        {level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between text-xs text-text-dim mb-1">
          <span>Уровень {level}</span>
          <span>
            {xpIntoLevel}/{xpForNext} XP
          </span>
        </div>
        <ProgressBar value={xpIntoLevel / xpForNext} color="linear-gradient(90deg, var(--color-accent), var(--color-primary))" />
      </div>
    </div>
  );
}
