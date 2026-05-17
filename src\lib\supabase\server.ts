import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export async function getSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseBrowserEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. Server Actions and Route Handlers can.
        }
      }
    }
  });
}
