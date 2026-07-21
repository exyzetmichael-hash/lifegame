import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  hideCloseButton?: boolean;
}

export function Modal({ open, onClose, title, children, hideCloseButton }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={hideCloseButton ? undefined : onClose}
          />
          <motion.div
            className="relative w-full sm:max-w-md bg-surface border border-border shadow-pop rounded-t-md sm:rounded-md p-6 max-h-[90vh] overflow-y-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between mb-4">
                {title && <h2 className="text-[19px] font-medium serif">{title}</h2>}
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto text-text-2 hover:text-text rounded-full p-1 hover:bg-sunken transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
