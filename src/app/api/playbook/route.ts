import { requireCounsel } from "@/lib/auth/guard";
import { getPlaybook, replacePlaybook, savePlaybook } from "@/lib/cache/review-cache";
import { assertSameOrigin, getSessionId, jsonError } from "@/lib/http";
import { createDefaultPlaybook } from "@/lib/playbook/default-playbook";
import { ruleSchema } from "@/lib/playbook/rule-schema";
import { z } from "zod";

export const runtime = "nodejs";

const saveSchema = z.object({
  rules: z.array(ruleSchema),
  reset: z.boolean().optional(),
});

export async function GET() {
  try {
    const sessionId = await getSessionId();
    return Response.json({ playbook: getPlaybook(sessionId) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCounsel();
    const sessionId = await getSessionId();
    const body = saveSchema.parse(await request.json());
    if (body.reset) {
      return Response.json({ playbook: replacePlaybook(sessionId, createDefaultPlaybook()) });
    }
    const current = getPlaybook(sessionId);
    const playbook = savePlaybook(sessionId, { ...current, rules: body.rules });
    return Response.json({ playbook });
  } catch (error) {
    return jsonError(error);
  }
}
