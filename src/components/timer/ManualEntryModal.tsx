import { useEffect, useMemo, useState } from 'react';
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

  const [activityId, setActivityId] = useState(activities[0]?.id ?? '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');

  // Reset the form to fresh defaults every time the modal opens, and self-heal the
  // activity pick if it's stale (e.g. the previously picked activity got archived).
  useEffect(() => {
    if (!open) return;
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    setStart(toLocalInputValue(hourAgo));
    setEnd(toLocalInputValue(now));
    setNote('');
    setActivityId((prev) => (activities.some((a) => a.id === prev) ? prev : activities[0]?.id ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const valid = Boolean(activityId && startDate && endDate && endDate.getTime() > startDate.getTime());

  function handleSave() {
    if (!valid || !startDate || !endDate) return;
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
        {activities.length === 0 ? (
          <p className="text-sm text-text-2">
            Сначала создай хотя бы одну активность на экране таймера — иначе некуда записывать время.
          </p>
        ) : (
          <div>
            <label className="text-xs text-text-2 mb-1.5 block">Активность</label>
            <div className="flex flex-wrap gap-2">
              {activities.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActivityId(a.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    activityId === a.id ? 'border-transparent text-white' : 'border-border text-text-2 hover:text-text'
                  )}
                  style={activityId === a.id ? { background: a.color } : undefined}
                >
                  <IconRenderer name={a.icon} size={14} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-2 mb-1.5 block">Начало</label>
            <input
              type="datetime-local"
              value={start}
              max={end}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-2.5 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-2 mb-1.5 block">Конец</label>
            <input
              type="datetime-local"
              value={end}
              min={start}
              max={toLocalInputValue(new Date())}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-2.5 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-text-2 mb-1.5 block">Заметка (необязательно)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Что делал?"
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <Button variant="primary" size="lg" className="w-full mt-1" disabled={!valid} onClick={handleSave}>
          Сохранить запись
        </Button>
      </div>
    </Modal>
  );
}
