import { authErrorCode, publicOrigin } from "@/lib/auth/authorize";
import { roleFromProfile } from "@/lib/auth/role";
import { writeAuthCookie } from "@/lib/auth/session";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("vc_auth_state")?.value;
  jar.set("vc_auth_state", "", { path: "/", maxAge: 0 });
  const authError = url.searchParams.get("error");
  if (authError) {
    const codeName = authErrorCode(authError, url.searchParams.get("error_description") || "");
    return Response.redirect(new URL(`/login?error=${codeName}`, origin));
  }
  if (!code || !state || !expected || state !== expected) {
    return Response.redirect(new URL("/login?error=auth", origin));
  }
  const redirectUri = `${origin}/api/auth/auth0/callback`;
  const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenResponse.ok) return Response.redirect(new URL("/login?error=auth", origin));
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return Response.redirect(new URL("/login?error=auth", origin));
  const profileResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) return Response.redirect(new URL("/login?error=auth", origin));
  const profile = (await profileResponse.json()) as Record<string, unknown>;
  await writeAuthCookie({
    sub: String(profile.sub || ""),
    email: String(profile.email || ""),
    name: String(profile.name || profile.email || "Signed in"),
    role: roleFromProfile(profile),
  });
  return Response.redirect(new URL("/", origin));
}
