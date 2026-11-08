import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertSameOrigin, jsonError } from "@/lib/http";
import { hasSupabase } from "@/lib/env";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!hasSupabase()) {
      return Response.json(
        { error: "Accounts are optional. The app is running in demo mode without Supabase." },
        { status: 400 }
      );
    }
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (body.password.length < 8) {
      return Response.json({ error: "Use at least 8 characters." }, { status: 400 });
    }
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return Response.json({ error: "Supabase is not configured." }, { status: 400 });
    }
    const { error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
