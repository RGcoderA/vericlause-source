import { activeModel, hasAuth0, hasGeminiKey, hasTiger } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    host: process.env.VULTR_INSTANCE?.trim() || "local",
    model: activeModel(),
    providers: {
      gemini: hasGeminiKey(),
      tiger: hasTiger(),
      auth0: hasAuth0(),
    },
  });
}
