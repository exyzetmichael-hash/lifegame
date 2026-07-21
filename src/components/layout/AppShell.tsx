import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SideNav } from '@/components/layout/SideNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { XpBar } from '@/components/layout/XpBar';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { ReminderModal } from '@/components/timer/ReminderModal';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { useAchievementEvaluator } from '@/hooks/useAchievementEvaluator';
import { useHabitPenaltySweep } from '@/hooks/useHabitPenaltySweep';
import { useEveningHabitReminder } from '@/hooks/useEveningHabitReminder';
import { useSupabaseSync } from '@/lib/sync/bootstrap';

export function AppShell({ children }: { children: ReactNode }) {
  useTimerEngine();
  useAchievementEvaluator();
  useHabitPenaltySweep();
  useEveningHabitReminder();
  useSupabaseSync();
  const location = useLocation();

  return (
    <div className="flex h-full min-h-screen">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 sm:px-8 py-3 border-b border-border sticky top-0 z-30 bg-bg/80 backdrop-blur-md">
          <div className="sm:hidden flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent glow-primary" />
          </div>
          <div className="flex-1 max-w-sm">
            <XpBar />
          </div>
          <Link
            to="/settings"
            className="hidden sm:inline-flex text-text-dim hover:text-text p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <IconRenderer name="Settings" size={18} />
          </Link>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-6 pb-24 sm:pb-8 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
      <ReminderModal />
      <ToastContainer />
    </div>
  );
}
