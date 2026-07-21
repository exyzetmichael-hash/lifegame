import { useNavigate } from 'react-router-dom';
import { useGamificationStore, overallLevel } from '@/store/gamificationStore';

export function XpBar() {
  const navigate = useNavigate();
  const totalXp = useGamificationStore((s) => s.totalXp);
  const { level, xpIntoLevel, xpForNext } = overallLevel(totalXp);
  const pct = Math.round((xpIntoLevel / xpForNext) * 100);

  return (
    <button
      onClick={() => navigate('/achievements')}
      className="flex items-center gap-2.5 p-2 rounded-sm w-full text-left hover:bg-sunken transition-colors"
    >
      <span className="w-[34px] h-[34px] shrink-0 rounded-full border-[1.5px] border-accent flex items-center justify-center serif font-medium text-[13px] text-accent tabular-nums">
        {level}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex justify-between text-[11px] text-text-3 mb-1">
          <span>Уровень</span>
          <span className="tabular-nums">
            {xpIntoLevel} / {xpForNext} XP
          </span>
        </span>
        <span className="block h-1 bg-border rounded-full overflow-hidden">
          <span
            className="block h-full bg-accent rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </span>
      </span>
    </button>
  );
}
