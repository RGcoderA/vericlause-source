import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabase } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!hasSupabase()) return null;
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_ANON_KEY!;
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            jar.set(name, value, options);
          });
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      },
    },
  });
}
