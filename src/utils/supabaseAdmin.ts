import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("==========================================");
console.log("--- DEBUGGING ENV VARIABLES ---");
console.log("URL READ BY NEXT.JS:", supabaseUrl);
console.log("SERVICE KEY FOUND?:", !!supabaseServiceKey);
console.log("==========================================");

if (!supabaseUrl) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceKey) {
  throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY — get it from Supabase Dashboard → Project Settings → API → service_role key');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});