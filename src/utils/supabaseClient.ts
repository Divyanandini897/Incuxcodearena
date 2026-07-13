import { createClient } from '@supabase/supabase-js';

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[supabase] Missing env vars, returning dummy client');
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = getClient();
