import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isSupabaseConfigured } from "./client";

/**
 * Creates a Supabase client for use in Server Components
 * and Server Actions. Returns null when env vars are not configured.
 */
export function createServerSupabaseClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },

        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          } catch {
            // Called from a Server Component - safe to ignore when
            // middleware is refreshing the session.
          }
        },

        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: "",
              ...options,
            });
          } catch {
            // Ignore - see note above.
          }
        },
      },
    }
  );
}