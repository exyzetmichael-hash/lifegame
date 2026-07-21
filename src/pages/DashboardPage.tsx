import { useMemo, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import clsx from 'clsx';
import { useTimerStore } from '@/store/timerStore';
import { useActivityStore } from '@/store/activityStore';
import { useGamificationStore, overallLevel } from '@/store/gamificationStore';
import { periodRange, sessionsInRange, totalsByActivity, dailySeriesSeconds, type Period } from '@/lib/dashboardStats';
import { formatHoursMinutes } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { ProgressBar } from '@/components/ui/ProgressBar';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
];

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>('day');
  const sessions = useTimerStore((s) => s.sessions);
  const activities = useActivityStore((s) => s.activities);
  const totalXp = useGamificationStore((s) => s.totalXp);
  const stats = useGamificationStore((s) => s.stats);
  const statDefs = useGamificationStore((s) => s.statDefs);
  const { level } = overallLevel(totalXp);

  const { start, end } = periodRange(period);
  const inRange = useMemo(() => sessionsInRange(sessions, start, end), [sessions, start.getTime(), end.getTime()]);
  const byActivity = useMemo(() => totalsByActivity(inRange), [inRange]);
  const series = useMemo(() => dailySeriesSeconds(sessions, start, end), [sessions, start.getTime(), end.getTime()]);

  const totalSeconds = inRange.reduce((sum, s) => sum + s.countedSeconds, 0);
  const sortedActivities = [...byActivity.entries()].sort((a, b) => b[1] - a[1]);
  const maxActivitySeconds = sortedActivities[0]?.[1] ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              period === p.key ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-dim hover:text-text'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-text-dim mb-1">Время</div>
          <div className="font-display text-xl font-semibold">{formatHoursMinutes(totalSeconds)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-dim mb-1">Сессий</div>
          <div className="font-display text-xl font-semibold">{inRange.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-dim mb-1">Уровень</div>
          <div className="font-display text-xl font-semibold">{level}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-dim mb-1">Всего XP</div>
          <div className="font-display text-xl font-semibold">{totalXp}</div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display font-semibold mb-4">Активность по дням</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-faint)', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-surface-hover)' }}
                contentStyle={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value) => [formatHoursMinutes(Number(value) || 0), 'Время']}
                labelFormatter={() => ''}
              />
              <Bar dataKey="seconds" radius={[6, 6, 6, 6]}>
                {series.map((entry) => (
                  <Cell key={entry.date} fill="var(--color-primary)" fillOpacity={entry.seconds > 0 ? 1 : 0.25} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-4">По категориям</h2>
        {sortedActivities.length === 0 ? (
          <p className="text-sm text-text-dim">За этот период пока пусто.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedActivities.map(([activityId, seconds]) => {
              const activity = activities.find((a) => a.id === activityId);
              return (
                <div key={activityId} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${activity?.color ?? '#7c3aed'}22`, color: activity?.color ?? '#7c3aed' }}
                  >
                    <IconRenderer name={activity?.icon ?? 'Circle'} size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">{activity?.name ?? 'Удалено'}</span>
                      <span className="text-text-dim shrink-0 ml-2">{formatHoursMinutes(seconds)}</span>
                    </div>
                    <ProgressBar value={seconds / maxActivitySeconds} color={activity?.color ?? 'var(--color-primary)'} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-4">Статы персонажа</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(stats).map((stat) => (
            <div key={stat.key} className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5">
              <IconRenderer name={statDefs[stat.key].icon} size={18} className="text-accent shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-text-dim truncate">{stat.label}</div>
                <div className="font-display font-semibold text-sm">Ур. {stat.level}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
