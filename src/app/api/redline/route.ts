import { suggestRedline } from "@/lib/agents/redliner";
import { getPlaybook, getReview } from "@/lib/cache/review-cache";
import { assertSameOrigin, clientIp, getSessionId, jsonError, rateLimit } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(`redline:${clientIp(request)}`, 20);
    const sessionId = await getSessionId();
    const body = (await request.json()) as { reviewId?: string; findingId?: string };
    if (!body.reviewId || !body.findingId) {
      return Response.json({ error: "Missing review or finding." }, { status: 400 });
    }
    const review = getReview(body.reviewId);
    if (!review || review.sessionId !== sessionId) {
      return Response.json({ error: "Review not found." }, { status: 404 });
    }
    const finding = review.findings.find((item) => item.id === body.findingId);
    if (!finding) {
      return Response.json({ error: "Finding not found." }, { status: 404 });
    }
    if (finding.severity === "green") {
      return Response.json({ error: "Green items do not need a redline." }, { status: 400 });
    }
    const playbook = getPlaybook(sessionId);
    const rule = playbook.rules.find((item) => item.id === finding.ruleId);
    const redline = await suggestRedline({ finding, rule });
    return Response.json(redline);
  } catch (error) {
    return jsonError(error);
  }
}
