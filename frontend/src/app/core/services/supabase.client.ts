import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url  = (import.meta as any).env.VITE_SUPABASE_URL?.trim();
const anon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY?.trim();

if (!url || !anon) {
  console.error('Supabase env missing:', { url, hasAnon: !!anon });
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
