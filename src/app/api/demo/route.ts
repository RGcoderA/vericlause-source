import { NextResponse } from "next/server";
import { DEMO_FILES } from "@/config/constants";
import { runReviewPipeline } from "@/lib/agents";
import {
  getPlaybook,
  getReviewByFingerprint,
  saveReview,
  shareReviewRun,
} from "@/lib/cache/review-cache";
import { fingerprintDocument } from "@/lib/cache/fingerprint";
import { CLEAN_CONTRACT_TEXT, TRAP_CONTRACT_TEXT } from "@/lib/demo/texts";
import { readLearnExample, type LearnExampleId } from "@/lib/learn/examples";
import { readDemoPdf } from "@/lib/demo/load-demo";
import { assertSameOrigin, beginInflight, clientIp, getSessionId, jsonError, rateLimit } from "@/lib/http";
import { ingestBuffer, ingestText } from "@/lib/parsing/ingest";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = clientIp(request);
    rateLimit(`review:${ip}`);
    const sessionId = await getSessionId();

    const contentType = request.headers.get("content-type") || "";
    const allowed = new Set(Object.keys(DEMO_FILES));
    let demo: keyof typeof DEMO_FILES | null = null;
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { demo?: string };
      demo = body.demo && allowed.has(body.demo) ? (body.demo as keyof typeof DEMO_FILES) : null;
    } else {
      const form = await request.formData();
      const value = String(form.get("demo") || "");
      demo = allowed.has(value) ? (value as keyof typeof DEMO_FILES) : null;
    }
    if (!demo) {
      return NextResponse.json({ error: "Choose a demo contract." }, { status: 400 });
    }

    let contract;
    try {
      const file = await readDemoPdf(demo);
      contract = await ingestBuffer({
        buffer: file.bytes,
        filename: file.filename,
        mimeType: "application/pdf",
        sessionId,
      });
    } catch {
      const text =
        demo === "trap"
          ? TRAP_CONTRACT_TEXT
          : demo === "clean"
            ? CLEAN_CONTRACT_TEXT
            : await readLearnExample(demo as LearnExampleId);
      contract = await ingestText({
        text,
        pageCount: 6,
        filename: DEMO_FILES[demo].filename,
        mimeType: "text/plain",
        sessionId,
      });
    }

    const playbook = getPlaybook(sessionId);
    const fingerprint = fingerprintDocument(contract.text, playbook);
    const cached = getReviewByFingerprint(sessionId, fingerprint);
    const review = cached
      ? cached
      : await shareReviewRun(`${sessionId}:${fingerprint}`, async () => {
        const again = getReviewByFingerprint(sessionId, fingerprint);
        if (again) return again;
        const release = beginInflight(`review:${ip}`);
        try {
          return saveReview(await runReviewPipeline({ contract, playbook, sessionId }));
        } finally {
          release();
        }
      });

    return new NextResponse(null, {
      status: 303,
      headers: { Location: `/review/${review.id}` },
    });
  } catch (error) {
    return jsonError(error);
  }
}