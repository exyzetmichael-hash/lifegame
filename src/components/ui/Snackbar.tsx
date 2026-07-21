import { AnimatePresence, motion } from 'framer-motion';
import { useSnackbarStore } from '@/store/snackbarStore';

export function Snackbar() {
  const text = useSnackbarStore((s) => s.text);
  const onUndo = useSnackbarStore((s) => s.onUndo);
  const dismiss = useSnackbarStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-20 sm:bottom-6 inset-x-0 flex justify-center z-[60] px-4 pointer-events-none">
      <AnimatePresence>
        {text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-text text-canvas rounded-btn shadow-pop pl-4 pr-3 py-2.5 flex items-center gap-4 text-[13.5px]"
          >
            <span>{text}</span>
            {onUndo && (
              <button
                onClick={() => {
                  onUndo();
                  dismiss();
                }}
                className="text-accent font-semibold shrink-0"
              >
                Отменить
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
