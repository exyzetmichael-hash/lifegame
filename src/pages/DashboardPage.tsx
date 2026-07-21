import { useMemo, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import clsx from 'clsx';
import { useTimerStore } from '@/store/timerStore';
import { useActivityStore } from '@/store/activityStore';
import { useGamificationStore, overallLevel } from '@/store/gamificationStore';
import {
  periodRange,
  sessionsInRange,
  totalsByActivity,
  dailySeriesSeconds,
  totalsByWeekday,
  type Period,
} from '@/lib/dashboardStats';
import { formatHoursMinutes } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { ProgressBar } from '@/components/ui/ProgressBar';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
];

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>('day');
  const sessions = useTimerStore((s) => s.sessions);
  const activities = useActivityStore((s) => s.activities);
  const budgets = useActivityStore((s) => s.budgets);
  const totalXp = useGamificationStore((s) => s.totalXp);
  const { level } = overallLevel(totalXp);

  const { start, end } = periodRange(period);
  const inRange = useMemo(() => sessionsInRange(sessions, start, end), [sessions, start.getTime(), end.getTime()]);
  const byActivity = useMemo(() => totalsByActivity(inRange), [inRange]);
  const series = useMemo(() => dailySeriesSeconds(sessions, start, end), [sessions, start.getTime(), end.getTime()]);

  const totalSeconds = inRange.reduce((sum, s) => sum + s.countedSeconds, 0);
  const sortedActivities = [...byActivity.entries()].sort((a, b) => b[1] - a[1]);
  const maxActivitySeconds = sortedActivities[0]?.[1] ?? 1;

  const weekdayTotals = useMemo(() => totalsByWeekday(sessions), [sessions]);
  const maxWeekdaySeconds = Math.max(1, ...weekdayTotals);

  const { start: weekStart, end: weekEnd } = periodRange('week');
  const thisWeekSessions = useMemo(
    () => sessionsInRange(sessions, weekStart, weekEnd),
    [sessions, weekStart.getTime(), weekEnd.getTime()]
  );
  const thisWeekByActivity = useMemo(() => totalsByActivity(thisWeekSessions), [thisWeekSessions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="serif text-2xl font-medium flex items-center gap-2.5">
          <IconRenderer name="BarChart3" size={24} />
          Дашборд
        </h1>
        <div className="flex gap-0.5 bg-sunken border border-border rounded-btn p-0.5 w-fit">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={clsx(
                'px-3.5 py-1.5 rounded-sm text-sm transition-colors',
                period === p.key ? 'bg-surface text-text font-semibold shadow-pop' : 'text-text-2 hover:text-text'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-text-3 mb-1.5">Время</div>
          <div className="serif text-[28px] font-medium tabular-nums">{formatHoursMinutes(totalSeconds)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-3 mb-1.5">Сессий</div>
          <div className="serif text-[28px] font-medium tabular-nums">{inRange.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-3 mb-1.5">Уровень</div>
          <div className="serif text-[28px] font-medium tabular-nums">{level}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-3 mb-1.5">Всего XP</div>
          <div className="serif text-[28px] font-medium tabular-nums">{totalXp}</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-[13px] font-semibold text-text-2 mb-4">Активность по дням</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-3)', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-sunken)' }}
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(value) => [formatHoursMinutes(Number(value) || 0), 'Время']}
                labelFormatter={() => ''}
              />
              <Bar dataKey="seconds" radius={[4, 4, 2, 2]}>
                {series.map((entry) => (
                  <Cell key={entry.date} fill="var(--color-accent)" fillOpacity={entry.seconds > 0 ? 1 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="text-[13px] font-semibold text-text-2 mb-1">Когда я продуктивнее</h2>
        <p className="text-xs text-text-3 mb-4">По дням недели, за всё время</p>
        <div className="flex items-end gap-2 h-28">
          {weekdayTotals.map((seconds, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="w-full rounded-[4px] transition-all"
                style={{
                  height: `${Math.max(4, (seconds / maxWeekdaySeconds) * 100)}%`,
                  background: seconds > 0 ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              />
              <span className="text-[11px] text-text-3">{WEEKDAY_LABELS[idx]}</span>
            </div>
          ))}
        </div>
      </Card>

      {budgets.length > 0 && (
        <Card>
          <h2 className="text-[13px] font-semibold text-text-2 mb-1">Цели по времени</h2>
          <p className="text-xs text-text-3 mb-4">На этой неделе</p>
          <div className="flex flex-col gap-3">
            {budgets.map((b) => {
              const activity = activities.find((a) => a.id === b.activityId);
              if (!activity) return null;
              const doneSeconds = thisWeekByActivity.get(b.activityId) ?? 0;
              const targetSeconds = b.targetHoursPerWeek * 3600;
              const pct = targetSeconds > 0 ? doneSeconds / targetSeconds : 0;
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-1.5 text-text-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: activity.color }} />
                      {activity.name}
                    </span>
                    <span className="text-text-2 tabular-nums">
                      {formatHoursMinutes(doneSeconds)} / {b.targetHoursPerWeek} ч
                    </span>
                  </div>
                  <ProgressBar value={pct} color={pct >= 1 ? 'var(--color-success)' : activity.color} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-[13px] font-semibold text-text-2 mb-4">По категориям</h2>
        {sortedActivities.length === 0 ? (
          <p className="text-sm text-text-3">За этот период пока пусто.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedActivities.map(([activityId, seconds]) => {
              const activity = activities.find((a) => a.id === activityId);
              return (
                <div key={activityId} className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[13px] text-text-2 w-[110px] shrink-0 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: activity?.color ?? 'var(--color-accent)' }} />
                    <span className="truncate">{activity?.name ?? 'Удалено'}</span>
                  </span>
                  <div className="flex-1">
                    <ProgressBar value={seconds / maxActivitySeconds} color={activity?.color ?? 'var(--color-accent)'} className="h-2" trackClassName="h-2" />
                  </div>
                  <span className="text-[13px] text-text-2 tabular-nums w-[52px] text-right shrink-0">
                    {formatHoursMinutes(seconds)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
