import { NextResponse } from "next/server";
import { runReviewPipeline } from "@/lib/agents";
import {
  getPlaybook,
  getReviewByFingerprint,
  saveReview,
} from "@/lib/cache/review-cache";
import { fingerprintDocument } from "@/lib/cache/fingerprint";
import { assertSameOrigin, beginInflight, clientIp, getSessionId, jsonError, rateLimit } from "@/lib/http";
import { ingestBuffer } from "@/lib/parsing/ingest";

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
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a PDF or DOCX file." }, { status: 400 });
    }
    const contract = await ingestBuffer({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: file.name || "contract.pdf",
      mimeType: file.type || "application/octet-stream",
      sessionId,
    });
    const playbook = getPlaybook(sessionId);
    const fingerprint = fingerprintDocument(contract.text, playbook);
    const cached = getReviewByFingerprint(sessionId, fingerprint);
    const review = cached
      ? cached
      : saveReview(await runReviewPipeline({ contract, playbook, sessionId }));
    return new NextResponse(null, {
      status: 303,
      headers: { Location: `/review/${review.id}` },
    });
  } catch (error) {
    return jsonError(error);
  } finally {
    release?.();
  }
}
