import { useMemo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Search } from 'lucide-react';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { XpBar } from '@/components/layout/XpBar';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@/components/layout/nav';
import { useTodoStore } from '@/store/todoStore';
import { useUiStore } from '@/store/uiStore';
import { isInboxTodo, isTodayTodo, isUpcomingTodo } from '@/lib/todoViews';

export function SideNav() {
  const location = useLocation();
  const todos = useTodoStore((s) => s.todos);
  const projects = useTodoStore((s) => s.projects);
  const openPalette = useUiStore((s) => s.openPalette);

  const searchParams = new URLSearchParams(location.search);
  const currentView = location.pathname === '/todos' ? (searchParams.get('view') ?? null) : null;
  const currentProject = location.pathname === '/todos' ? searchParams.get('project') : null;
  const currentLabel = location.pathname === '/todos' ? searchParams.get('label') : null;

  const counts: Record<string, number> = {
    '/todos?view=inbox': todos.filter(isInboxTodo).length,
    '/todos?view=today': todos.filter(isTodayTodo).length,
    '/todos?view=upcoming': todos.filter(isUpcomingTodo).length,
  };

  const labels = useMemo(
    () => Array.from(new Set(todos.flatMap((t) => t.labels ?? []))).sort(),
    [todos]
  );

  return (
    <nav className="hidden sm:flex flex-col w-62 shrink-0 bg-sunken border-r border-border p-3 gap-1">
      <div className="flex items-center gap-2 px-2 py-2 mb-3">
        <span className="w-5 h-5 rounded-md bg-accent text-white flex items-center justify-center text-[11px] font-bold shrink-0">
          L
        </span>
        <span className="text-[13px] font-semibold flex-1">LifeQuest</span>
      </div>

      <button
        onClick={openPalette}
        className="flex items-center gap-2 px-2.5 py-2 rounded-sm border border-border bg-surface text-text-3 text-[13px] mb-3 hover:border-text-3 transition-colors"
      >
        <Search size={15} />
        Поиск
        <kbd className="ml-auto text-[11px] bg-sunken border border-border rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      <div className="flex flex-col gap-px">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const view = new URLSearchParams(item.to.split('?')[1]).get('view');
          const active = currentView === view;
          const count = counts[item.to];
          return (
            <Link
              key={item.to}
              to={item.to}
              className={clsx(
                'relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-sm transition-colors',
                active ? 'bg-accent-tint text-text font-semibold' : 'text-text-2 hover:bg-border/60'
              )}
            >
              <IconRenderer name={item.icon} size={16} className={active ? 'text-accent' : 'text-text-3'} />
              {item.label}
              {count > 0 && <span className="ml-auto text-xs text-text-3 tabular-nums">{count}</span>}
              {active && <span className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] bg-accent rounded-full" />}
            </Link>
          );
        })}
      </div>

      <div className="h-px bg-border my-3 mx-0.5" />

      <div className="flex flex-col gap-px">
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-sm transition-colors',
                isActive ? 'bg-accent-tint text-text font-semibold' : 'text-text-2 hover:bg-border/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <IconRenderer name={item.icon} size={16} className={isActive ? 'text-accent' : 'text-text-3'} />
                {item.label}
                {isActive && <span className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] bg-accent rounded-full" />}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {projects.length > 0 && (
        <>
          <div className="h-px bg-border my-3 mx-0.5" />
          <div className="text-[11px] uppercase tracking-wide text-text-3 px-2.5 pt-1 pb-1">Проекты</div>
          <div className="flex flex-col gap-px">
            {projects.map((p) => {
              const count = todos.filter((t) => !t.completed && t.projectId === p.id).length;
              const active = currentProject === p.id;
              return (
                <Link
                  key={p.id}
                  to={`/todos?project=${p.id}`}
                  className={clsx(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-sm transition-colors',
                    active ? 'bg-accent-tint text-text font-semibold' : 'text-text-2 hover:bg-border/60'
                  )}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  {p.name}
                  {count > 0 && <span className="ml-auto text-xs text-text-3 tabular-nums">{count}</span>}
                </Link>
              );
            })}
          </div>
        </>
      )}

      {labels.length > 0 && (
        <>
          <div className="h-px bg-border my-3 mx-0.5" />
          <div className="text-[11px] uppercase tracking-wide text-text-3 px-2.5 pt-1 pb-1">Метки</div>
          <div className="flex flex-col gap-px">
            {labels.map((l) => (
              <Link
                key={l}
                to={`/todos?label=${encodeURIComponent(l)}`}
                className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-sm transition-colors',
                  currentLabel === l ? 'bg-accent-tint text-text font-semibold' : 'text-text-2 hover:bg-border/60'
                )}
              >
                <IconRenderer name="Tag" size={14} className="text-text-3" />
                {l}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-auto pt-3 border-t border-border flex flex-col gap-1">
        <XpBar />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-sm transition-colors',
              isActive ? 'bg-accent-tint text-text font-semibold' : 'text-text-2 hover:bg-border/60'
            )
          }
        >
          <IconRenderer name="Settings" size={16} className="text-text-3" />
          Настройки
        </NavLink>
      </div>
    </nav>
  );
}
