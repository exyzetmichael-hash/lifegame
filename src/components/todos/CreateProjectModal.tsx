import { useState } from 'react';
import clsx from 'clsx';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTodoStore } from '@/store/todoStore';
import { ACTIVITY_COLORS } from '@/store/activityStore';

export function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addProject = useTodoStore((s) => s.addProject);
  const [name, setName] = useState('');
  const [color, setColor] = useState(ACTIVITY_COLORS[0]);

  function handleCreate() {
    if (!name.trim()) return;
    addProject({ name: name.trim(), color });
    setName('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Новый проект">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Название</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Ремонт"
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Цвет</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx('w-8 h-8 rounded-full', color === c && 'ring-2 ring-offset-2 ring-offset-bg-elevated ring-white')}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <Button variant="primary" size="lg" className="w-full mt-1" disabled={!name.trim()} onClick={handleCreate}>
          Создать
        </Button>
      </div>
    </Modal>
  );
}
