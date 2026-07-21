import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTodoStore } from '@/store/todoStore';
import { parseQuickAdd, dueToIsoDate } from '@/lib/quickAddParser';
import { PRIORITY_COLOR } from '@/lib/priority';

export function QuickAddTodo({ projectId = null }: { projectId?: string | null }) {
  const addTodo = useTodoStore((s) => s.addTodo);
  const projects = useTodoStore((s) => s.projects);
  const [value, setValue] = useState('');
  const [expanded, setExpanded] = useState(false);

  const parsed = parseQuickAdd(value, projects);

  function handleSubmit() {
    const title = parsed.title.trim();
    if (!title) return;
    addTodo({
      title,
      projectId: parsed.projectId ?? projectId,
      priority: parsed.priority ?? 'p4',
      dueDate: dueToIsoDate(parsed.due),
    });
    setValue('');
    setExpanded(false);
  }

  return (
    <div className="rounded-sm border border-border bg-surface px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <Plus size={16} className="text-accent shrink-0" />
        <input
          data-role="qa-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setExpanded(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='Добавить задачу... "завтра 18:00 #работа p1"'
          autoComplete="off"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-3"
        />
      </div>
      {expanded && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {parsed.priority && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: PRIORITY_COLOR[parsed.priority] }}
            >
              {parsed.priority.toUpperCase()}
            </span>
          )}
          {parsed.due && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-tint text-accent">
              {parsed.due === 'today' ? 'Сегодня' : 'Завтра'}
            </span>
          )}
          {parsed.projectId && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-tint text-accent">
              {projects.find((p) => p.id === parsed.projectId)?.name}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setValue('');
                setExpanded(false);
              }}
              className="px-2.5 py-1.5 rounded-btn text-[13px] text-text-2 hover:bg-sunken transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={!parsed.title.trim()}
              className="px-3 py-1.5 rounded-btn text-[13px] font-semibold bg-accent hover:bg-accent-hover text-white disabled:opacity-40 transition-colors"
            >
              Добавить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
