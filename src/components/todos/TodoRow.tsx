import clsx from 'clsx';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Trash2, CalendarDays, Tag } from 'lucide-react';
import type { Todo } from '@/types';
import { useTodoStore } from '@/store/todoStore';
import { useUiStore } from '@/store/uiStore';
import { useSnackbarStore } from '@/store/snackbarStore';
import { PRIORITY_COLOR } from '@/lib/priority';

export function TodoRow({ todo, hideProject }: { todo: Todo; hideProject?: boolean }) {
  const toggleComplete = useTodoStore((s) => s.toggleComplete);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const restoreTodo = useTodoStore((s) => s.restoreTodo);
  const projects = useTodoStore((s) => s.projects);
  const openTaskPanel = useUiStore((s) => s.openTaskPanel);
  const showSnackbar = useSnackbarStore((s) => s.show);

  const due = todo.dueDate ? new Date(todo.dueDate) : null;
  const overdue = due && !todo.completed && isPast(due) && !isToday(due);
  const project = todo.projectId ? projects.find((p) => p.id === todo.projectId) : null;

  function handleCheckboxClick(e: React.MouseEvent) {
    e.stopPropagation();
    const wasCompleted = todo.completed;
    toggleComplete(todo.id);
    if (!wasCompleted) {
      showSnackbar(`Задача «${todo.title}» выполнена`, () => toggleComplete(todo.id));
    }
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    deleteTodo(todo.id);
    showSnackbar(`Задача «${todo.title}» удалена`, () => restoreTodo(todo));
  }

  return (
    <motion.div
      layout
      initial={false}
      exit={{ height: 0, opacity: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.18 }}
      onClick={() => openTaskPanel(todo.id)}
      className="group flex items-center gap-3 rounded-sm px-2 py-2.5 hover:bg-sunken transition-colors cursor-pointer overflow-hidden"
    >
      <motion.button
        onClick={handleCheckboxClick}
        whileTap={{ scale: 0.8 }}
        animate={todo.completed ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.28 }}
        className={clsx(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          todo.completed ? 'border-transparent' : 'hover:border-text'
        )}
        style={{
          borderColor: todo.completed ? undefined : PRIORITY_COLOR[todo.priority],
          background: todo.completed ? PRIORITY_COLOR[todo.priority] : undefined,
        }}
      />
      <div className="min-w-0 flex-1">
        <div className={clsx('text-[14.5px] truncate', todo.completed && 'line-through text-text-3')}>
          {todo.title}
        </div>
        {(due || (project && !hideProject) || todo.labels.length > 0) && (
          <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
            {due && (
              <span
                className={clsx(
                  'flex items-center gap-1 text-xs',
                  overdue ? 'text-p1' : 'text-text-3'
                )}
              >
                <CalendarDays size={11} />
                {format(due, 'd MMM', { locale: ru })}
              </span>
            )}
            {project && !hideProject && (
              <span className="flex items-center gap-1 text-xs text-text-2">
                <span className="w-2 h-2 rounded-full" style={{ background: project.color }} />
                {project.name}
              </span>
            )}
            {todo.labels.map((l) => (
              <span key={l} className="flex items-center gap-1 text-xs text-text-3">
                <Tag size={11} />
                {l}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleDelete}
        aria-label="Удалить задачу"
        className="opacity-0 group-hover:opacity-100 text-text-3 hover:text-p1 p-1.5 rounded-sm hover:bg-p1/10 transition-opacity shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
