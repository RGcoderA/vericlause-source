import { runReviewPipeline } from "@/lib/agents";
import { getContract, getPlaybook, getReview, saveReview } from "@/lib/cache/review-cache";
import { fingerprintDocument } from "@/lib/cache/fingerprint";
import {
  assertSameOrigin,
  beginInflight,
  clientIp,
  getSessionId,
  jsonError,
  rateLimit,
} from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  let release: (() => void) | undefined;
  try {
    assertSameOrigin(request);
    const ip = clientIp(request);
    rateLimit(`review:${ip}`);
    release = beginInflight(`review:${ip}`);
    const sessionId = await getSessionId();
    const body = (await request.json()) as { reviewId?: string; contractId?: string };
    const existing = body.reviewId ? getReview(body.reviewId) : undefined;
    const contractId = body.contractId || existing?.contractId;
    if (!contractId) {
      return Response.json({ error: "Nothing to rerun." }, { status: 400 });
    }
    const contract = getContract(contractId);
    if (!contract || contract.sessionId !== sessionId) {
      return Response.json({ error: "Contract not found." }, { status: 404 });
    }
    const playbook = getPlaybook(sessionId);
    const fingerprint = fingerprintDocument(contract.text, playbook);
    if (existing && existing.fingerprint === fingerprint && existing.status === "complete") {
      return Response.json({ review: existing, cached: true });
    }
    const review = await runReviewPipeline({
      contract,
      playbook,
      sessionId,
      reviewId: crypto.randomUUID(),
    });
    saveReview(review);
    return Response.json({ review, cached: false });
  } catch (error) {
    release?.();
    release = undefined;
    return jsonError(error);
  } finally {
    if (release) release();
  }
}
