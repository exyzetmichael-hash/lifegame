import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { IconRenderer, ACTIVITY_ICON_CHOICES } from '@/components/ui/IconRenderer';
import { useActivityStore, ACTIVITY_COLORS } from '@/store/activityStore';
import { StatAllocationEditor } from '@/components/gamification/StatAllocationEditor';
import type { Activity, StatAllocation } from '@/types';
import clsx from 'clsx';

interface CreateActivityModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (activity: Activity) => void;
  /** When set, the modal edits this activity instead of creating a new one. */
  activity?: Activity | null;
}

const DEFAULT_ALLOCATIONS: StatAllocation[] = [{ statKey: 'mind', percent: 100 }];

export function CreateActivityModal({ open, onClose, onCreated, activity }: CreateActivityModalProps) {
  const addActivity = useActivityStore((s) => s.addActivity);
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const archiveActivity = useActivityStore((s) => s.archiveActivity);
  const isEditing = Boolean(activity);

  const [name, setName] = useState('');
  const [color, setColor] = useState(ACTIVITY_COLORS[0]);
  const [icon, setIcon] = useState(ACTIVITY_ICON_CHOICES[0]);
  const [statAllocations, setStatAllocations] = useState<StatAllocation[]>(DEFAULT_ALLOCATIONS);

  useEffect(() => {
    if (!open) return;
    if (activity) {
      setName(activity.name);
      setColor(activity.color);
      setIcon(activity.icon);
      setStatAllocations(activity.statAllocations);
    } else {
      setName('');
      setColor(ACTIVITY_COLORS[0]);
      setIcon(ACTIVITY_ICON_CHOICES[0]);
      setStatAllocations(DEFAULT_ALLOCATIONS);
    }
  }, [open, activity]);

  function handleSave() {
    if (!name.trim()) return;
    if (activity) {
      updateActivity(activity.id, { name: name.trim(), color, icon, statAllocations });
      onClose();
      return;
    }
    const created = addActivity({ name: name.trim(), color, icon, statAllocations });
    onClose();
    onCreated?.(created);
  }

  function handleArchive() {
    if (!activity) return;
    archiveActivity(activity.id);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Изменить активность' : 'Новая активность'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-text-2 mb-1.5 block">Название</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Медитация"
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div>
          <label className="text-xs text-text-2 mb-1.5 block">Цвет</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx('w-8 h-8 rounded-full border-2', color === c ? 'border-text' : 'border-transparent')}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-text-2 mb-1.5 block">Иконка</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_ICON_CHOICES.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center border transition-colors',
                  icon === ic ? 'border-accent bg-accent/15 text-accent' : 'border-border text-text-2 hover:text-text'
                )}
              >
                <IconRenderer name={ic} size={17} />
              </button>
            ))}
          </div>
        </div>

        <StatAllocationEditor value={statAllocations} onChange={setStatAllocations} />

        <Button variant="primary" size="lg" className="w-full mt-2" disabled={!name.trim()} onClick={handleSave}>
          {isEditing ? 'Сохранить' : 'Создать'}
        </Button>
        {isEditing && (
          <button onClick={handleArchive} className="text-xs text-text-3 hover:text-p1 text-center -mt-1">
            Архивировать активность
          </button>
        )}
      </div>
    </Modal>
  );
}
