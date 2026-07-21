import clsx from 'clsx';
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import type { Todo } from '@/types';
import { useTodoStore } from '@/store/todoStore';
import { PRIORITY_COLOR } from '@/lib/priority';

export function TodoRow({ todo }: { todo: Todo }) {
  const toggleComplete = useTodoStore((s) => s.toggleComplete);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);

  const due = todo.dueDate ? new Date(todo.dueDate) : null;
  const overdue = due && !todo.completed && isPast(due) && !isToday(due);

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-3.5 py-2.5">
      <button
        onClick={() => toggleComplete(todo.id)}
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
        <div className={clsx('text-sm', todo.completed && 'line-through text-text-faint')}>{todo.title}</div>
        {due && (
          <div className={clsx('text-xs mt-0.5', overdue ? 'text-danger' : 'text-text-faint')}>
            {format(due, 'd MMM', { locale: ru })}
          </div>
        )}
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-text-faint hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-opacity shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
