import type { Stat } from '@/types';

interface StatRadarChartProps {
  stats: Stat[];
  /** Level value that reaches the outer ring. Purely a visual scale cap — stats keep leveling past it. */
  maxLevel?: number;
}

export function StatRadarChart({ stats, maxLevel = 20 }: StatRadarChartProps) {
  const cx = 110;
  const cy = 110;
  const R = 82;
  const n = stats.length;

  function point(i: number, r: number): [number, number] {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  const rings = [0.33, 0.66, 1].map((f, idx) => (
    <polygon
      key={idx}
      points={Array.from({ length: n }, (_, i) => point(i, R * f).join(',')).join(' ')}
      fill="none"
      stroke="var(--color-border)"
      strokeWidth={1}
    />
  ));

  const dataPoints = stats.map((s, i) => point(i, R * Math.min(1, s.level / maxLevel)));

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[280px] block mx-auto">
      {rings}
      <polygon
        points={dataPoints.map((p) => p.join(',')).join(' ')}
        fill="var(--color-accent)"
        fillOpacity={0.1}
        stroke="var(--color-accent)"
        strokeWidth={1.5}
      />
      {stats.map((s, i) => {
        const [x, y] = point(i, R + 22);
        return (
          <text
            key={s.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10.5}
            fill="var(--color-text-3)"
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}
