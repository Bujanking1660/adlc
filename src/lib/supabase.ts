import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Cek konfigurasi valid untuk mode klien (Frontend)
export const isSupabaseClientConfigured =
  supabaseUrl !== '' &&
  supabaseUrl !== 'your-supabase-project-url' &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'your-supabase-anon-key';

// Cek konfigurasi valid untuk mode server (Backend Admin Route)
export const isSupabaseServerConfigured =
  supabaseUrl !== '' &&
  supabaseUrl !== 'your-supabase-project-url' &&
  supabaseServiceKey !== '' &&
  supabaseServiceKey !== 'your-supabase-service-role-key';

// Klien untuk digunakan di Komponen Klien React (Browser)
export const createClientBrowser = () => {
  if (!isSupabaseClientConfigured) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Klien Admin (Service Role) untuk digunakan KHUSUS di Route Handlers (Server)
export const createAdminClient = () => {
  if (!isSupabaseServerConfigured) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
