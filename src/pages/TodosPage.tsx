import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Inbox, CalendarDays, Tag, Pencil } from 'lucide-react';
import { useTodoStore } from '@/store/todoStore';
import { QuickAddTodo } from '@/components/todos/QuickAddTodo';
import { TodoRow } from '@/components/todos/TodoRow';
import { CreateProjectModal } from '@/components/todos/CreateProjectModal';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { isInboxTodo, isTodayTodo, isUpcomingTodo } from '@/lib/todoViews';
import type { Todo } from '@/types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function byPriority(a: Todo, b: Todo): number {
  const rank: Record<string, number> = { p1: 0, p2: 1, p3: 2, p4: 3 };
  return rank[a.priority] - rank[b.priority];
}

export function TodosPage() {
  const todos = useTodoStore((s) => s.todos);
  const projects = useTodoStore((s) => s.projects);
  const [searchParams] = useSearchParams();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const projectId = searchParams.get('project');
  const label = searchParams.get('label');
  const view = projectId ? 'project' : label ? 'label' : (searchParams.get('view') ?? 'today');

  const incomplete = useMemo(() => todos.filter((t) => !t.completed), [todos]);

  const filtered = useMemo(() => {
    if (view === 'inbox') return incomplete.filter(isInboxTodo).sort(byPriority);
    if (view === 'today') return incomplete.filter(isTodayTodo).sort(byPriority);
    if (view === 'upcoming') return incomplete.filter(isUpcomingTodo);
    if (view === 'project') return incomplete.filter((t) => t.projectId === projectId).sort(byPriority);
    if (view === 'label') return incomplete.filter((t) => t.labels.includes(label ?? '')).sort(byPriority);
    return [];
  }, [incomplete, view, projectId, label]);

  const completedInView = useMemo(() => {
    const done = todos.filter((t) => t.completed);
    if (view === 'inbox') return done.filter((t) => t.projectId === null);
    if (view === 'project') return done.filter((t) => t.projectId === projectId);
    return [];
  }, [todos, view, projectId]);

  const project = projectId ? projects.find((p) => p.id === projectId) : null;
  const quickAddProjectId = view === 'project' ? projectId : view === 'inbox' ? null : null;
  const showQuickAdd = view === 'today' || view === 'inbox' || view === 'project';

  const upcomingGroups = useMemo(() => {
    if (view !== 'upcoming') return [];
    const groups = new Map<string, { date: Date; items: Todo[] }>();
    for (const t of filtered) {
      const d = new Date(t.dueDate!);
      const key = d.toDateString();
      if (!groups.has(key)) groups.set(key, { date: d, items: [] });
      groups.get(key)!.items.push(t);
    }
    return Array.from(groups.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((g) => ({ ...g, items: g.items.sort(byPriority) }));
  }, [filtered, view]);

  const today = new Date();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        {view === 'today' ? (
          <div>
            <h1 className="serif text-4xl font-medium">{capitalize(format(today, 'EEEE, d MMMM', { locale: ru }))}</h1>
            {filtered.length > 0 && (
              <div className="text-sm text-text-2 mt-1.5 tabular-nums">{filtered.length} задач на сегодня</div>
            )}
          </div>
        ) : (
          <h2 className="serif text-2xl font-medium flex items-center gap-2.5">
            {view === 'inbox' && <Inbox size={22} />}
            {view === 'upcoming' && <CalendarDays size={22} />}
            {view === 'label' && <Tag size={22} />}
            {view === 'project' && project && (
              <span className="w-3.5 h-3.5 rounded-full" style={{ background: project.color }} />
            )}
            {view === 'inbox' && 'Входящие'}
            {view === 'upcoming' && 'Предстоящее'}
            {view === 'label' && label}
            {view === 'project' && project?.name}
            {view === 'project' && project && (
              <button
                onClick={() => setEditProjectOpen(true)}
                className="text-text-3 hover:text-accent shrink-0"
              >
                <Pencil size={14} />
              </button>
            )}
          </h2>
        )}
        <button
          onClick={() => setProjectModalOpen(true)}
          className="shrink-0 text-xs text-accent hover:text-accent-hover flex items-center gap-1 font-medium mt-1.5"
        >
          <Plus size={14} /> проект
        </button>
      </div>

      {showQuickAdd && <QuickAddTodo projectId={quickAddProjectId} />}

      {view === 'upcoming' ? (
        upcomingGroups.length > 0 ? (
          <div className="flex flex-col gap-5">
            {upcomingGroups.map((g) => (
              <div key={g.date.toDateString()}>
                <div className="sticky top-0 bg-canvas text-[13px] font-semibold text-text-2 py-1 tabular-nums z-[1]">
                  {isToday(g.date) ? 'Сегодня' : isPast(g.date) ? capitalize(format(g.date, 'd MMM', { locale: ru })) : capitalize(format(g.date, 'EEEE, d MMMM', { locale: ru }))}
                </div>
                <div className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {g.items.map((t) => (
                      <TodoRow key={t.id} todo={t} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ComingSoon icon="CalendarDays" title="Ничего не запланировано" description="Задачи с датой в будущем появятся здесь." />
        )
      ) : filtered.length === 0 && completedInView.length === 0 ? (
        <ComingSoon
          icon={view === 'today' ? 'CircleCheck' : 'ListChecks'}
          title={view === 'today' ? 'На сегодня всё чисто' : 'Пусто'}
          description={
            view === 'today'
              ? 'Ни одной задачи не запланировано. Самое время выдохнуть — или заглянуть в «Предстоящее».'
              : 'Добавь первую задачу выше.'
          }
        />
      ) : (
        <div className="flex flex-col">
          <AnimatePresence initial={false}>
            {filtered.map((t) => (
              <TodoRow key={t.id} todo={t} hideProject={view === 'project'} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {completedInView.length > 0 && (
        <div>
          <button onClick={() => setShowCompleted((v) => !v)} className="text-xs text-text-3 hover:text-text-2 mb-2">
            {showCompleted ? 'Скрыть' : 'Показать'} завершённые ({completedInView.length})
          </button>
          {showCompleted && (
            <div className="flex flex-col">
              <AnimatePresence initial={false}>
                {completedInView.map((t) => (
                  <TodoRow key={t.id} todo={t} hideProject={view === 'project'} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      <CreateProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
      {project && (
        <CreateProjectModal open={editProjectOpen} onClose={() => setEditProjectOpen(false)} project={project} />
      )}
    </div>
  );
}
