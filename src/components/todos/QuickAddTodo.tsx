import { useState } from 'react';
import clsx from 'clsx';
import { Plus, Calendar } from 'lucide-react';
import { useTodoStore } from '@/store/todoStore';
import { PRIORITY_COLOR, PRIORITY_LABEL, PRIORITY_ORDER } from '@/lib/priority';
import type { Priority } from '@/types';

export function QuickAddTodo({ projectId = null }: { projectId?: string | null }) {
  const addTodo = useTodoStore((s) => s.addTodo);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('p4');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);

  function handleSubmit() {
    if (!title.trim()) return;
    addTodo({ title: title.trim(), projectId, priority, dueDate: dueDate || null });
    setTitle('');
    setPriority('p4');
    setDueDate('');
    setExpanded(false);
  }

  return (
    <div className="rounded-xl border border-border bg-surface/50 px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <Plus size={16} className="text-text-faint shrink-0" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Добавить задачу..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-faint"
        />
      </div>
      {expanded && (
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <div className="flex items-center gap-1">
            {PRIORITY_ORDER.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={clsx(
                  'px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors',
                  priority === p ? 'border-transparent text-white' : 'border-border text-text-dim'
                )}
                style={priority === p ? { background: PRIORITY_COLOR[p] } : undefined}
              >
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-text-dim border border-border rounded-md px-2 py-1">
            <Calendar size={12} />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent outline-none"
            />
          </label>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white disabled:opacity-40"
          >
            Добавить
          </button>
        </div>
      )}
    </div>
  );
}
