import { create } from 'zustand';

interface UiState {
  paletteOpen: boolean;
  taskPanelId: string | null;
  moreSheetOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  openTaskPanel: (id: string) => void;
  closeTaskPanel: () => void;
  openMoreSheet: () => void;
  closeMoreSheet: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  paletteOpen: false,
  taskPanelId: null,
  moreSheetOpen: false,
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette: () => set((state) => ({ paletteOpen: !state.paletteOpen })),
  openTaskPanel: (id) => set({ taskPanelId: id }),
  closeTaskPanel: () => set({ taskPanelId: null }),
  openMoreSheet: () => set({ moreSheetOpen: true }),
  closeMoreSheet: () => set({ moreSheetOpen: false }),
}));
