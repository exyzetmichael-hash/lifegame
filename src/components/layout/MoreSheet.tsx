import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Inbox, CalendarDays, Award, Settings, Sun, Moon } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';

export function MoreSheet() {
  const open = useUiStore((s) => s.moreSheetOpen);
  const close = useUiStore((s) => s.closeMoreSheet);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const items = [
    { label: 'Входящие', icon: Inbox, to: '/todos?view=inbox' },
    { label: 'Предстоящее', icon: CalendarDays, to: '/todos?view=upcoming' },
    { label: 'Геймификация', icon: Award, to: '/achievements' },
    { label: 'Настройки', icon: Settings, to: '/settings' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-[54] sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed left-0 right-0 bottom-0 bg-surface border-t border-border rounded-t-md z-[55] p-3 pb-8 sm:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={close}
                className="flex items-center gap-3 px-2.5 py-3 rounded-sm text-[15px] text-text-2"
              >
                <item.icon size={18} className="text-text-3" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                toggleTheme();
                close();
              }}
              className="flex items-center gap-3 px-2.5 py-3 rounded-sm text-[15px] text-text-2 w-full text-left"
            >
              {theme === 'light' ? <Moon size={18} className="text-text-3" /> : <Sun size={18} className="text-text-3" />}
              Переключить тему
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
