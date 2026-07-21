import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Hash, CalendarDays, Flag, Tag as TagIcon } from 'lucide-react';
import clsx from 'clsx';
import { useTodoStore } from '@/store/todoStore';
import { useUiStore } from '@/store/uiStore';
import { useSnackbarStore } from '@/store/snackbarStore';
import { PRIORITY_COLOR, PRIORITY_ORDER } from '@/lib/priority';
import type { Priority } from '@/types';

function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function TaskDetailPanel() {
  const taskPanelId = useUiStore((s) => s.taskPanelId);
  const closeTaskPanel = useUiStore((s) => s.closeTaskPanel);
  const todos = useTodoStore((s) => s.todos);
  const projects = useTodoStore((s) => s.projects);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const restoreTodo = useTodoStore((s) => s.restoreTodo);
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [labelInput, setLabelInput] = useState('');

  const todo = todos.find((t) => t.id === taskPanelId);
  const open = Boolean(todo);

  function handleDelete() {
    if (!todo) return;
    deleteTodo(todo.id);
    closeTaskPanel();
    showSnackbar(`Задача «${todo.title}» удалена`, () => restoreTodo(todo));
  }

  return (
    <AnimatePresence>
      {open && todo && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTaskPanel}
          />
          <motion.div
            className="fixed sm:absolute top-0 right-0 bottom-0 w-full sm:w-[380px] bg-surface sm:border-l border-border shadow-pop z-50 flex flex-col rounded-t-md sm:rounded-none"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <button onClick={closeTaskPanel} className="w-[30px] h-[30px] flex items-center justify-center rounded-sm text-text-2 hover:bg-sunken">
                <X size={17} />
              </button>
              <button onClick={handleDelete} className="w-[30px] h-[30px] flex items-center justify-center rounded-sm text-text-2 hover:bg-sunken">
                <Trash2 size={17} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <input
                value={todo.title}
                onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
                className="serif text-[22px] font-medium w-full mb-5 leading-snug outline-none bg-transparent"
              />

              <div className="flex items-center gap-2.5 py-2.5 border-b border-border text-[13.5px]">
                <Hash size={15} className="text-text-3 shrink-0" />
                <span className="text-text-3 w-[100px] shrink-0">Проект</span>
                <select
                  value={todo.projectId ?? ''}
                  onChange={(e) => updateTodo(todo.id, { projectId: e.target.value || null })}
                  className="flex-1 bg-transparent outline-none"
                >
                  <option value="">Входящие</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5 py-2.5 border-b border-border text-[13.5px]">
                <CalendarDays size={15} className="text-text-3 shrink-0" />
                <span className="text-text-3 w-[100px] shrink-0">Срок</span>
                <input
                  type="date"
                  value={toDateInputValue(todo.dueDate)}
                  onChange={(e) =>
                    updateTodo(todo.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })
                  }
                  className="flex-1 bg-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-2.5 py-2.5 border-b border-border text-[13.5px]">
                <Flag size={15} className="shrink-0" style={{ color: PRIORITY_COLOR[todo.priority] }} />
                <span className="text-text-3 w-[100px] shrink-0">Приоритет</span>
                <div className="flex gap-1 flex-1">
                  {PRIORITY_ORDER.map((p: Priority) => (
                    <button
                      key={p}
                      onClick={() => updateTodo(todo.id, { priority: p })}
                      className={clsx(
                        'px-2 py-1 rounded-btn text-[11px] font-semibold border transition-colors',
                        todo.priority === p ? 'border-transparent text-white' : 'border-border text-text-2'
                      )}
                      style={todo.priority === p ? { background: PRIORITY_COLOR[p] } : undefined}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2.5 py-2.5 border-b border-border text-[13.5px]">
                <TagIcon size={15} className="text-text-3 shrink-0 mt-0.5" />
                <span className="text-text-3 w-[100px] shrink-0 mt-0.5">Метки</span>
                <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                  {todo.labels.map((l) => (
                    <span
                      key={l}
                      className="flex items-center gap-1 text-[11px] bg-sunken border border-border rounded-full px-2 py-0.5"
                    >
                      {l}
                      <button
                        onClick={() => updateTodo(todo.id, { labels: todo.labels.filter((x) => x !== l) })}
                        className="text-text-3 hover:text-p1"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && labelInput.trim()) {
                        e.preventDefault();
                        if (!todo.labels.includes(labelInput.trim())) {
                          updateTodo(todo.id, { labels: [...todo.labels, labelInput.trim()] });
                        }
                        setLabelInput('');
                      }
                    }}
                    placeholder="+ метка"
                    className="text-[12px] bg-transparent outline-none w-20 text-text-3"
                  />
                </div>
              </div>

              <textarea
                value={todo.notes ?? ''}
                onChange={(e) => updateTodo(todo.id, { notes: e.target.value })}
                placeholder="Добавить описание..."
                rows={4}
                className="w-full min-h-[90px] resize-none mt-4 text-[13.5px] leading-relaxed text-text-2 outline-none bg-transparent placeholder:text-text-3"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
