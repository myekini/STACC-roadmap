import { createBrowserClient } from '@supabase/ssr';

export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!hasSupabaseEnv && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.warn('Supabase env missing — running in localStorage demo mode.');
}

// Untyped client on purpose: RPC arg/return shapes are asserted at the call
// sites in useUserData, and the generated Database generic would require the
// full supabase-js codegen format. Revisit when CLI typegen is wired up.
// createBrowserClient stores the session (and the PKCE code verifier) in
// cookies instead of localStorage — required for the OAuth code exchange in
// src/app/auth/callback/route.ts to reliably find the verifier server-side.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
