import { readAuthUser } from "@/lib/auth/session";
import { hasAuth0 } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const user = await readAuthUser();
  return Response.json({
    auth0: hasAuth0(),
    user: user ? { email: user.email, name: user.name, role: user.role } : null,
  });
}
