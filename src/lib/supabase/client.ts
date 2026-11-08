"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
