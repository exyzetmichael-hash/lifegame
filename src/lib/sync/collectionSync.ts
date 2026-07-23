import type { StoreApi } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useSyncStatusStore } from '@/store/syncStatusStore';

interface CollectionSyncOptions<T extends { id: string }, S> {
  table: string;
  store: StoreApi<S>;
  /** Reads the synced array out of the store state. */
  getItems: (state: S) => T[];
  /** Replaces the synced array in the store state (used when hydrating from remote). */
  setItems: (items: T[]) => void;
  toRow: (item: T) => Record<string, unknown>;
  fromRow: (row: Record<string, unknown>) => T;
  debounceMs?: number;
}

/** One-time hydration: pushes local rows up if the remote table is empty, otherwise pulls remote down. */
async function hydrate<T extends { id: string }, S>(opts: CollectionSyncOptions<T, S>): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.from(opts.table).select('*');
  if (error) {
    console.error(`[LifeQuest sync] fetch ${opts.table} failed:`, error.message);
    useSyncStatusStore.getState().reportError(`${opts.table}: ${error.message}`);
    // Remote state is unknown (not confirmed empty) — leave local alone and don't push,
    // to avoid clobbering good local data or inserting on top of rows we just couldn't see.
    return;
  }
  useSyncStatusStore.getState().reportOk();
  const remote = (data ?? []).map(opts.fromRow);
  if (remote.length > 0) {
    opts.setItems(remote);
    return;
  }
  const local = opts.getItems(opts.store.getState());
  if (local.length > 0) {
    const { error: insertError } = await supabase.from(opts.table).insert(local.map(opts.toRow));
    if (insertError) {
      console.error(`[LifeQuest sync] initial push ${opts.table} failed:`, insertError.message);
      useSyncStatusStore.getState().reportError(`${opts.table}: ${insertError.message}`);
    }
  }
}

/** Subscribes to local store changes and mirrors them to Supabase (debounced upsert + delete-diff). */
function watch<T extends { id: string }, S>(opts: CollectionSyncOptions<T, S>): () => void {
  if (!supabase) return () => {};
  let knownIds = new Set(opts.getItems(opts.store.getState()).map((i) => i.id));
  let timer: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = opts.store.subscribe((state) => {
    const items = opts.getItems(state);
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!supabase) return;
      const ids = new Set(items.map((i) => i.id));
      const toDelete = [...knownIds].filter((id) => !ids.has(id));
      knownIds = ids;

      if (items.length > 0) {
        const { error } = await supabase.from(opts.table).upsert(items.map(opts.toRow));
        if (error) {
          console.error(`[LifeQuest sync] push ${opts.table} failed:`, error.message);
          useSyncStatusStore.getState().reportError(`${opts.table}: ${error.message}`);
        } else {
          useSyncStatusStore.getState().reportOk();
        }
      }
      if (toDelete.length > 0) {
        const { error } = await supabase.from(opts.table).delete().in('id', toDelete);
        if (error) {
          console.error(`[LifeQuest sync] delete ${opts.table} failed:`, error.message);
          useSyncStatusStore.getState().reportError(`${opts.table}: ${error.message}`);
        }
      }
    }, opts.debounceMs ?? 800);
  });

  return unsubscribe;
}

export async function bindCollectionSync<T extends { id: string }, S>(
  opts: CollectionSyncOptions<T, S>
): Promise<() => void> {
  await hydrate(opts);
  return watch(opts);
}
