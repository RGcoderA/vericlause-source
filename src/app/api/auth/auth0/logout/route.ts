import { publicOrigin } from "@/lib/auth/authorize";
import { clearAuthCookie } from "@/lib/auth/session";
import { hasAuth0 } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  await clearAuthCookie();
  if (!hasAuth0()) return Response.redirect(new URL("/", origin));
  const logout = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  logout.searchParams.set("client_id", process.env.AUTH0_CLIENT_ID || "");
  logout.searchParams.set("returnTo", `${origin}/`);
  return Response.redirect(logout);
}
