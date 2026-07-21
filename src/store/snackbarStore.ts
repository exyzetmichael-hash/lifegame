import { create } from 'zustand';

interface SnackbarState {
  text: string | null;
  onUndo: (() => void) | null;
  show: (text: string, onUndo?: () => void) => void;
  dismiss: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useSnackbarStore = create<SnackbarState>()((set) => ({
  text: null,
  onUndo: null,
  show: (text, onUndo) => {
    if (timer) clearTimeout(timer);
    set({ text, onUndo: onUndo ?? null });
    timer = setTimeout(() => set({ text: null, onUndo: null }), 5000);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ text: null, onUndo: null });
  },
}));
