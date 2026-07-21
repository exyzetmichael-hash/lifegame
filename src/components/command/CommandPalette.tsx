import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Inbox, CircleDot, CalendarDays, Clock, Flame, BarChart3, Award, Settings,
  Plus, Sun, Moon, Search, Hash,
} from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';
import { useTodoStore } from '@/store/todoStore';

interface PaletteItem {
  label: string;
  icon: typeof Search;
  action: () => void;
}

export function CommandPalette() {
  const paletteOpen = useUiStore((s) => s.paletteOpen);
  const openPalette = useUiStore((s) => s.openPalette);
  const closePalette = useUiStore((s) => s.closePalette);
  const navigate = useNavigate();
  const projects = useTodoStore((s) => s.projects);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useThemeStore((s) => s.theme);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        paletteOpen ? closePalette() : openPalette();
      } else if (e.key === 'Escape' && paletteOpen) {
        closePalette();
      }
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [paletteOpen, openPalette, closePalette]);

  useEffect(() => {
    if (paletteOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [paletteOpen]);

  const items: PaletteItem[] = useMemo(() => {
    const go = (path: string) => () => {
      navigate(path);
      closePalette();
    };
    const base: PaletteItem[] = [
      { label: 'Перейти: Входящие', icon: Inbox, action: go('/todos?view=inbox') },
      { label: 'Перейти: Сегодня', icon: CircleDot, action: go('/todos?view=today') },
      { label: 'Перейти: Предстоящее', icon: CalendarDays, action: go('/todos?view=upcoming') },
      ...projects.map((p) => ({
        label: `Перейти к проекту: ${p.name}`,
        icon: Hash,
        action: go(`/todos?project=${p.id}`),
      })),
      { label: 'Перейти: Таймер', icon: Clock, action: go('/timer') },
      { label: 'Перейти: Привычки', icon: Flame, action: go('/habits') },
      { label: 'Перейти: Дашборд', icon: BarChart3, action: go('/') },
      { label: 'Перейти: Геймификация', icon: Award, action: go('/achievements') },
      { label: 'Перейти: Настройки', icon: Settings, action: go('/settings') },
      {
        label: 'Создать новую задачу',
        icon: Plus,
        action: () => {
          navigate('/todos?view=today');
          closePalette();
          setTimeout(() => document.querySelector<HTMLInputElement>('[data-role="qa-input"]')?.focus(), 50);
        },
      },
      {
        label: 'Переключить тему',
        icon: theme === 'light' ? Moon : Sun,
        action: () => {
          toggleTheme();
          closePalette();
        },
      },
    ];
    return base;
  }, [projects, navigate, closePalette, theme, toggleTheme]);

  const filtered = items.filter((it) => it.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {paletteOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePalette}
          />
          <motion.div
            className="fixed top-16 sm:top-24 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] sm:w-[520px] bg-surface border border-border rounded-md shadow-pop z-[71] overflow-hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
              <Search size={17} className="text-text-3 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelected((s) => Math.min(s + 1, filtered.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelected((s) => Math.max(s - 1, 0));
                  } else if (e.key === 'Enter') {
                    filtered[selected]?.action();
                  }
                }}
                placeholder="Введите команду или перейдите к..."
                autoComplete="off"
                className="flex-1 text-[15px] outline-none bg-transparent"
              />
            </div>
            <div className="max-h-[340px] overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-text-3 text-[13px]">Ничего не найдено</div>
              ) : (
                filtered.map((it, i) => (
                  <button
                    key={it.label}
                    onClick={it.action}
                    onMouseEnter={() => setSelected(i)}
                    className={
                      'flex items-center gap-2.5 w-full text-left px-2.5 py-2.5 rounded-sm text-[13.5px] ' +
                      (i === selected ? 'bg-sunken' : '')
                    }
                  >
                    <it.icon size={15} className="text-text-3 shrink-0" />
                    {it.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
