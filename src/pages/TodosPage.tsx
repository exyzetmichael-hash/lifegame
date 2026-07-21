import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { isPast, isToday } from 'date-fns';
import { Plus } from 'lucide-react';
import { useTodoStore } from '@/store/todoStore';
import { QuickAddTodo } from '@/components/todos/QuickAddTodo';
import { TodoRow } from '@/components/todos/TodoRow';
import { CreateProjectModal } from '@/components/todos/CreateProjectModal';
import { ComingSoon } from '@/components/ui/ComingSoon';

type View = 'inbox' | 'today' | 'upcoming' | string;

export function TodosPage() {
  const todos = useTodoStore((s) => s.todos);
  const projects = useTodoStore((s) => s.projects);
  const [view, setView] = useState<View>('today');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const filtered = useMemo(() => {
    const incomplete = todos.filter((t) => !t.completed);
    if (view === 'inbox') return incomplete.filter((t) => t.projectId === null);
    if (view === 'today') {
      return incomplete.filter((t) => t.dueDate && (isToday(new Date(t.dueDate)) || isPast(new Date(t.dueDate))));
    }
    if (view === 'upcoming') {
      return incomplete.filter((t) => t.dueDate && !isToday(new Date(t.dueDate)) && !isPast(new Date(t.dueDate)));
    }
    return incomplete.filter((t) => t.projectId === view);
  }, [todos, view]);

  const completedInView = useMemo(() => {
    const done = todos.filter((t) => t.completed);
    if (view === 'inbox') return done.filter((t) => t.projectId === null);
    if (view === 'today' || view === 'upcoming') return [];
    return done.filter((t) => t.projectId === view);
  }, [todos, view]);

  const quickAddProjectId = typeof view === 'string' && !['inbox', 'today', 'upcoming'].includes(view) ? view : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Задачи</h1>
        <button
          onClick={() => setProjectModalOpen(true)}
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium"
        >
          <Plus size={14} /> проект
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { key: 'today', label: 'Сегодня' },
          { key: 'upcoming', label: 'Предстоящее' },
          { key: 'inbox', label: 'Инбокс' },
          ...projects.map((p) => ({ key: p.id, label: p.name })),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={clsx(
              'shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              view === tab.key ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-dim hover:text-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <QuickAddTodo projectId={quickAddProjectId} />

      {filtered.length === 0 && completedInView.length === 0 ? (
        <ComingSoon icon="ListChecks" title="Пусто" description="Добавь первую задачу выше." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((t) => (
            <TodoRow key={t.id} todo={t} />
          ))}
        </div>
      )}

      {completedInView.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-xs text-text-dim hover:text-text mb-2"
          >
            {showCompleted ? 'Скрыть' : 'Показать'} завершённые ({completedInView.length})
          </button>
          {showCompleted && (
            <div className="flex flex-col gap-2">
              {completedInView.map((t) => (
                <TodoRow key={t.id} todo={t} />
              ))}
            </div>
          )}
        </div>
      )}

      <CreateProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
    </div>
  );
}
