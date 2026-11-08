import { requireCounsel } from "@/lib/auth/guard";
import { compilePlaybookRule } from "@/lib/agents/playbook-compiler";
import { getPlaybook, savePlaybook } from "@/lib/cache/review-cache";
import { assertSameOrigin, clientIp, getSessionId, jsonError, rateLimit } from "@/lib/http";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

const bodySchema = z.object({
  text: z.string().min(8).max(500),
  add: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCounsel();
    rateLimit(`compile:${clientIp(request)}`, 20);
    const sessionId = await getSessionId();
    const body = bodySchema.parse(await request.json());
    const compiled = await compilePlaybookRule(body.text);
    const rule = {
      ...compiled,
      id: crypto.randomUUID(),
      enabled: true,
    };
    if (!body.add) {
      return Response.json({ rule });
    }
    const current = getPlaybook(sessionId);
    const playbook = savePlaybook(sessionId, {
      ...current,
      rules: [rule, ...current.rules],
    });
    return Response.json({ rule, playbook });
  } catch (error) {
    return jsonError(error);
  }
}
