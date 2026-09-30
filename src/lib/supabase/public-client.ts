import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";

/**
 * A plain Supabase client for PUBLIC, read-only data (products, product
 * variants, product images) that works identically in Server Components,
 * Client Components, and Route Handlers — no cookies, no user session
 * required, since these reads rely only on public RLS policies
 * (`using (true)`). This is what lets Home/Shop/Product Detail/Search read
 * straight from Supabase on the server, not just after client hydration.
 *
 * Do NOT use this for anything that depends on the signed-in user (auth,
 * admin writes, saved measurements) — use src/lib/supabase/client.ts
 * (browser) or src/lib/supabase/server.ts (Server Components, cookie-aware)
 * for those instead. And never a service-role key — this uses the same
 * public anon key as everywhere else in the app.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isSupabaseConfigured || !url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
