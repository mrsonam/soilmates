import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _browser: SupabaseClient | null | undefined;

/** Browser client for Realtime (anon key). Returns null if env is missing. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (_browser !== undefined) return _browser;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    _browser = null;
    return null;
  }
  _browser = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _browser;
}

export function isSupabaseRealtimeBrowserConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}
