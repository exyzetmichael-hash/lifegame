import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTodoStore } from '@/store/todoStore';
import { ACTIVITY_COLORS } from '@/store/activityStore';
import type { Project } from '@/types';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this project instead of creating a new one. */
  project?: Project | null;
}

export function CreateProjectModal({ open, onClose, project }: CreateProjectModalProps) {
  const addProject = useTodoStore((s) => s.addProject);
  const updateProject = useTodoStore((s) => s.updateProject);
  const deleteProject = useTodoStore((s) => s.deleteProject);
  const navigate = useNavigate();
  const isEditing = Boolean(project);

  const [name, setName] = useState('');
  const [color, setColor] = useState(ACTIVITY_COLORS[0]);

  useEffect(() => {
    if (!open) return;
    if (project) {
      setName(project.name);
      setColor(project.color);
    } else {
      setName('');
      setColor(ACTIVITY_COLORS[0]);
    }
  }, [open, project]);

  function handleSave() {
    if (!name.trim()) return;
    if (project) {
      updateProject(project.id, { name: name.trim(), color });
      onClose();
      return;
    }
    addProject({ name: name.trim(), color });
    onClose();
  }

  function handleDelete() {
    if (!project) return;
    deleteProject(project.id);
    onClose();
    navigate('/todos?view=inbox');
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Изменить проект' : 'Новый проект'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-text-3 mb-1.5 block">Название</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Ремонт"
            className="w-full bg-surface border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-accent"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <div>
          <label className="text-xs text-text-3 mb-1.5 block">Цвет</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx('w-[26px] h-[26px] rounded-full border-2', color === c ? 'border-text' : 'border-transparent')}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <Button variant="primary" size="lg" className="w-full mt-1" disabled={!name.trim()} onClick={handleSave}>
          {isEditing ? 'Сохранить' : 'Создать'}
        </Button>
        {isEditing && (
          <button onClick={handleDelete} className="text-xs text-text-3 hover:text-p1 text-center -mt-1">
            Удалить проект
          </button>
        )}
      </div>
    </Modal>
  );
}
