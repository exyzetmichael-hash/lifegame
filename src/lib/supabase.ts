import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Null until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set. The app works
 * fully offline on localStorage until then — see src/store for the local-first
 * persistence layer that this client will sync with once configured.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[LifeQuest] Supabase не настроен — работаем локально (localStorage). ' +
      'Добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env, чтобы включить облачную синхронизацию.'
  );
}
