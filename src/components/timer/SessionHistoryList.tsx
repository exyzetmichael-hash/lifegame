import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Trash2, PencilLine, Zap } from 'lucide-react';
import { useTimerStore } from '@/store/timerStore';
import { useActivityStore } from '@/store/activityStore';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { formatDuration } from '@/lib/format';
import { Card } from '@/components/ui/Card';

export function SessionHistoryList() {
  const sessions = useTimerStore((s) => s.sessions);
  const deleteSession = useTimerStore((s) => s.deleteSession);
  const activities = useActivityStore((s) => s.activities);

  const recent = sessions.slice(0, 30);

  if (recent.length === 0) {
    return (
      <Card className="text-center text-text-dim text-sm py-10">
        Пока нет записей. Запусти таймер или добавь запись вручную.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {recent.map((s) => {
        const activity = activities.find((a) => a.id === s.activityId);
        const started = new Date(s.startedAt);
        const dayLabel = isToday(started) ? 'Сегодня' : isYesterday(started) ? 'Вчера' : format(started, 'd MMM', { locale: ru });
        return (
          <div
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-3.5 py-2.5"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${activity?.color ?? '#7c3aed'}22`, color: activity?.color ?? '#7c3aed' }}
            >
              <IconRenderer name={activity?.icon ?? 'Circle'} size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium truncate">
                {activity?.name ?? 'Удалённая активность'}
                {s.manual && <PencilLine size={12} className="text-text-faint shrink-0" />}
                {s.autoStopped && <Zap size={12} className="text-warning shrink-0" />}
              </div>
              <div className="text-xs text-text-faint">
                {dayLabel} · {format(started, 'HH:mm')}
                {s.note ? ` · ${s.note}` : ''}
              </div>
            </div>
            <div className="text-sm font-display font-medium tabular-nums shrink-0">
              {formatDuration(s.countedSeconds)}
            </div>
            <button
              onClick={() => deleteSession(s.id)}
              className="text-text-faint hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-colors shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
