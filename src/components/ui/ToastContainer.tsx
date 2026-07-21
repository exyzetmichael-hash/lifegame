import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { IconRenderer } from '@/components/ui/IconRenderer';
import clsx from 'clsx';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed top-4 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="pointer-events-auto glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 max-w-sm w-full glow-primary"
          >
            <div
              className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                toast.type === 'level-up' ? 'bg-xp/20 text-xp' : toast.type === 'achievement' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
              )}
            >
              <IconRenderer name={toast.icon ?? 'Sparkles'} size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold font-display truncate">{toast.title}</div>
              {toast.description && <div className="text-xs text-text-dim truncate">{toast.description}</div>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-text-faint hover:text-text shrink-0"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
