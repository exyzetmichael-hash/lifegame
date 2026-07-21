import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Priority, Project, Todo } from '@/types';
import { makeId } from '@/lib/id';
import { useGamificationStore } from '@/store/gamificationStore';

const PRIORITY_XP: Record<Priority, number> = { p1: 25, p2: 15, p3: 10, p4: 5 };

interface TodoState {
  projects: Project[];
  todos: Todo[];

  addProject: (input: { name: string; color: string }) => Project;
  deleteProject: (id: string) => void;

  addTodo: (input: {
    title: string;
    notes?: string;
    projectId: string | null;
    priority: Priority;
    dueDate: string | null;
    labels?: string[];
  }) => Todo;
  updateTodo: (id: string, patch: Partial<Omit<Todo, 'id'>>) => void;
  toggleComplete: (id: string) => void;
  deleteTodo: (id: string) => void;
  restoreTodo: (todo: Todo) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      projects: [],
      todos: [],

      addProject: (input) => {
        const project: Project = { id: makeId(), createdAt: new Date().toISOString(), ...input };
        set((state) => ({ projects: [...state.projects, project] }));
        return project;
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          todos: state.todos.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
        }));
      },

      addTodo: (input) => {
        const todo: Todo = {
          id: makeId(),
          createdAt: new Date().toISOString(),
          completed: false,
          completedAt: null,
          labels: [],
          ...input,
        };
        set((state) => ({ todos: [todo, ...state.todos] }));
        return todo;
      },

      updateTodo: (id, patch) => {
        set((state) => ({ todos: state.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
      },

      toggleComplete: (id) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo) return;
        const completed = !todo.completed;
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null } : t
          ),
        }));
        const xp = PRIORITY_XP[todo.priority];
        if (completed) {
          useGamificationStore.getState().awardXp(xp, `Задача: ${todo.title}`);
        } else {
          useGamificationStore.getState().awardXp(-xp, `Отмена задачи: ${todo.title}`);
        }
      },

      deleteTodo: (id) => {
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
      },

      restoreTodo: (todo) => {
        set((state) => ({ todos: [todo, ...state.todos] }));
      },
    }),
    { name: 'lifequest-todos' }
  )
);
