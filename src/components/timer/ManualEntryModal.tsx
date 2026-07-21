import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { useActivityStore } from '@/store/activityStore';
import { useTimerStore } from '@/store/timerStore';
import clsx from 'clsx';

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ManualEntryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const allActivities = useActivityStore((s) => s.activities);
  const activities = useMemo(() => allActivities.filter((a) => !a.archived), [allActivities]);
  const addManualEntry = useTimerStore((s) => s.addManualEntry);

  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [activityId, setActivityId] = useState(activities[0]?.id ?? '');
  const [start, setStart] = useState(toLocalInputValue(hourAgo));
  const [end, setEnd] = useState(toLocalInputValue(now));
  const [note, setNote] = useState('');

  const startDate = new Date(start);
  const endDate = new Date(end);
  const valid = activityId && endDate.getTime() > startDate.getTime();

  function handleSave() {
    if (!valid) return;
    addManualEntry({
      activityId,
      startedAt: startDate.toISOString(),
      endedAt: endDate.toISOString(),
      note: note.trim() || undefined,
    });
    setNote('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Запись задним числом">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Активность</label>
          <div className="flex flex-wrap gap-2">
            {activities.map((a) => (
              <button
                key={a.id}
                onClick={() => setActivityId(a.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  activityId === a.id ? 'border-transparent text-white' : 'border-border text-text-dim hover:text-text'
                )}
                style={activityId === a.id ? { background: a.color } : undefined}
              >
                <IconRenderer name={a.icon} size={14} />
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Начало</label>
            <input
              type="datetime-local"
              value={start}
              max={end}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-2.5 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Конец</label>
            <input
              type="datetime-local"
              value={end}
              min={start}
              max={toLocalInputValue(now)}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-2.5 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Заметка (необязательно)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Что делал?"
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <Button variant="primary" size="lg" className="w-full mt-1" disabled={!valid} onClick={handleSave}>
          Сохранить запись
        </Button>
      </div>
    </Modal>
  );
}
