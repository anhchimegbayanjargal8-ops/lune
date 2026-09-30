import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUserAdmin } from "./is-admin";

export { isUserAdmin };

/**
 * Server Component guard for the /admin section. `src/middleware.ts` is the
 * primary gate (it runs before every request and redirects unauthenticated
 * or non-admin visitors), but the admin layout calls this too as a second,
 * independent check — so every route under /admin stays protected even if
 * the middleware matcher is ever changed.
 *
 * This file (unlike ./is-admin.ts) uses next/headers via
 * createServerSupabaseClient, so it must only be imported from Server
 * Components / Route Handlers — never from src/middleware.ts.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    redirect("/account/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const isAdmin = await isUserAdmin(supabase, user.id);
  if (!isAdmin) {
    redirect("/account");
  }

  return user;
}
