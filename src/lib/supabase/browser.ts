"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, anonKey } = requireSupabaseBrowserEnv();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}
