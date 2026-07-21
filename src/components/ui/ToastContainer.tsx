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
            className="pointer-events-auto bg-surface border border-border shadow-pop rounded-md px-4 py-3 flex items-center gap-3 max-w-sm w-full"
          >
            <div
              className={clsx(
                'w-10 h-10 rounded-btn flex items-center justify-center shrink-0',
                toast.type === 'level-up' ? 'bg-p2/15 text-p2' : 'bg-accent-tint text-accent'
              )}
            >
              <IconRenderer name={toast.icon ?? 'Sparkles'} size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold truncate">{toast.title}</div>
              {toast.description && <div className="text-xs text-text-3 truncate">{toast.description}</div>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-text-3 hover:text-text shrink-0"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
