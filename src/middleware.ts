import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SESSION_COOKIE } from "@/config/constants";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  let session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    session = crypto.randomUUID();
    requestHeaders.set("x-vc-session", session);
  } else {
    requestHeaders.set("x-vc-session", session);
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          if (!request.cookies.get(SESSION_COOKIE)?.value) {
            response.cookies.set(SESSION_COOKIE, session, {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 14,
            });
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|logo.svg|logo.png|demo-contracts/).*)"],
};
