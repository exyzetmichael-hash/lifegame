import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { SideNav } from '@/components/layout/SideNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { MoreSheet } from '@/components/layout/MoreSheet';
import { ReminderModal } from '@/components/timer/ReminderModal';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { Snackbar } from '@/components/ui/Snackbar';
import { CommandPalette } from '@/components/command/CommandPalette';
import { TaskDetailPanel } from '@/components/todos/TaskDetailPanel';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { useAchievementEvaluator } from '@/hooks/useAchievementEvaluator';
import { useHabitPenaltySweep } from '@/hooks/useHabitPenaltySweep';
import { useEveningHabitReminder } from '@/hooks/useEveningHabitReminder';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { useSupabaseSync } from '@/lib/sync/bootstrap';
import { useUiStore } from '@/store/uiStore';

export function AppShell({ children }: { children: ReactNode }) {
  useTimerEngine();
  useAchievementEvaluator();
  useHabitPenaltySweep();
  useEveningHabitReminder();
  useApplyTheme();
  useSupabaseSync();
  const location = useLocation();
  const openPalette = useUiStore((s) => s.openPalette);

  return (
    <div className="flex h-full min-h-screen bg-canvas">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0 relative overflow-x-hidden">
        <header className="flex sm:hidden items-center gap-3 px-4 py-3 border-b border-border bg-surface sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+12px)]">
          <span className="w-6 h-6 rounded-md bg-accent text-white flex items-center justify-center text-[11px] font-bold shrink-0">
            L
          </span>
          <span className="text-[13px] font-semibold flex-1">LifeQuest</span>
          <button onClick={openPalette} className="text-text-2 p-1.5 rounded-sm hover:bg-sunken transition-colors">
            <Search size={18} />
          </button>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-6 pb-24 sm:pb-8 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname + location.search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <TaskDetailPanel />
      </div>
      <BottomNav />
      <MoreSheet />
      <ReminderModal />
      <ToastContainer />
      <Snackbar />
      <CommandPalette />
    </div>
  );
}
