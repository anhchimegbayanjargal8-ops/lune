import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isUserAdmin } from "@/lib/admin/is-admin";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // No Supabase configured yet — skip session refresh so local
  // preview still works without env vars set. Admin routes fail closed:
  // with no way to authenticate anyone, they're not reachable at all.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute) {
    // Not signed in at all — send to the existing login page.
    if (!user) {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }
    // Signed in, but not in admin_users (see supabase/schema.sql) — a
    // normal customer account must never reach admin pages.
    const isAdmin = await isUserAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
