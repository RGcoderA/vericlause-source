import { authConnection, buildAuthorizeUrl, publicOrigin } from "@/lib/auth/authorize";
import { hasAuth0 } from "@/lib/env";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  if (!hasAuth0()) {
    return Response.redirect(new URL("/login?error=config", origin));
  }
  const url = new URL(request.url);
  const screen = url.searchParams.get("screen") === "signup" ? "signup" : "login";
  const connection = authConnection(url.searchParams.get("connection"));
  const state = crypto.randomUUID();
  const jar = await cookies();
  jar.set("vc_auth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
    maxAge: 600,
  });
  const authorize = buildAuthorizeUrl({
    origin,
    domain: process.env.AUTH0_DOMAIN || "",
    clientId: process.env.AUTH0_CLIENT_ID || "",
    state,
    screen,
    connection,
    mfa: process.env.AUTH0_REQUIRE_MFA === "true",
  });
  const hint = url.searchParams.get("login_hint")?.trim() || "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hint) && hint.length <= 200) {
    authorize.searchParams.set("login_hint", hint);
  }
  return Response.redirect(authorize);
}