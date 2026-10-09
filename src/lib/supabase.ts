import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from either Vite (VITE_) or Next.js (NEXT_PUBLIC_) env variables
const supabaseUrl = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (import.meta.env?.VITE_SUPABASE_URL as string) ||
  'https://demo-cuansiswa.supabase.co';

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ||
  'demo-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY)
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
