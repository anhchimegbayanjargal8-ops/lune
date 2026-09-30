import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Checks the `admin_users` table (see supabase/schema.sql) for the given
 * user. Relies entirely on that table's Row Level Security — a signed-in
 * user can only ever see their own row, so this same query is safe to run
 * with the regular anon/session-scoped client (no service-role key needed,
 * here or anywhere else in this app).
 *
 * Kept dependency-free (no next/headers, no next/navigation) so it can be
 * safely imported from src/middleware.ts, which runs in the Edge Runtime.
 */
export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}
