import { useState } from 'react';
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
}

const DEFAULT_ALLOCATIONS: StatAllocation[] = [{ statKey: 'mind', percent: 100 }];

export function CreateActivityModal({ open, onClose, onCreated }: CreateActivityModalProps) {
  const addActivity = useActivityStore((s) => s.addActivity);

  const [name, setName] = useState('');
  const [color, setColor] = useState(ACTIVITY_COLORS[0]);
  const [icon, setIcon] = useState(ACTIVITY_ICON_CHOICES[0]);
  const [statAllocations, setStatAllocations] = useState<StatAllocation[]>(DEFAULT_ALLOCATIONS);

  function reset() {
    setName('');
    setColor(ACTIVITY_COLORS[0]);
    setIcon(ACTIVITY_ICON_CHOICES[0]);
    setStatAllocations(DEFAULT_ALLOCATIONS);
  }

  function handleCreate() {
    if (!name.trim()) return;
    const activity = addActivity({ name: name.trim(), color, icon, statAllocations });
    reset();
    onClose();
    onCreated?.(activity);
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Новая активность">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-text-2 mb-1.5 block">Название</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Медитация"
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
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

        <Button variant="primary" size="lg" className="w-full mt-2" disabled={!name.trim()} onClick={handleCreate}>
          Создать
        </Button>
      </div>
    </Modal>
  );
}
