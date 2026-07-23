import { create } from 'zustand';

export type SyncState = 'disabled' | 'connecting' | 'ok' | 'error';

interface SyncStatusState {
  state: SyncState;
  lastError: string | null;
  lastSyncAt: string | null;
  setConnecting: () => void;
  reportOk: () => void;
  reportError: (message: string) => void;
}

export const useSyncStatusStore = create<SyncStatusState>()((set) => ({
  state: 'disabled',
  lastError: null,
  lastSyncAt: null,
  setConnecting: () => set((s) => (s.state === 'disabled' ? { state: 'connecting' } : s)),
  reportOk: () => set({ state: 'ok', lastError: null, lastSyncAt: new Date().toISOString() }),
  reportError: (message) => set({ state: 'error', lastError: message }),
}));
