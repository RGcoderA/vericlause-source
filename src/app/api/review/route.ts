import { runReviewPipeline, type AgentEvent } from "@/lib/agents";
import {
  getContract,
  getPlaybook,
  getReviewByFingerprint,
  listReviews,
  saveReview,
} from "@/lib/cache/review-cache";
import { fingerprintDocument } from "@/lib/cache/fingerprint";
import {
  assertSameOrigin,
  beginInflight,
  clientIp,
  getSessionId,
  jsonError,
  rateLimit,
} from "@/lib/http";
import type { Review } from "@/types/review";

export const runtime = "nodejs";
export const maxDuration = 90;

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
  try {
    const sessionId = await getSessionId();
    return Response.json({ reviews: listReviews(sessionId) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  let release: (() => void) | undefined;
  try {
    assertSameOrigin(request);
    const ip = clientIp(request);
    rateLimit(`review:${ip}`);
    release = beginInflight(`review:${ip}`);
    const sessionId = await getSessionId();
    const stream = new URL(request.url).searchParams.get("stream") === "1";
    const body = (await request.json()) as { contractId?: string };
    if (!body.contractId) {
      return Response.json({ error: "Missing contractId." }, { status: 400 });
    }
    const contract = getContract(body.contractId);
    if (!contract || contract.sessionId !== sessionId) {
      return Response.json({ error: "Contract not found." }, { status: 404 });
    }

    const playbook = getPlaybook(sessionId);
    const fingerprint = fingerprintDocument(contract.text, playbook);
    const cached = getReviewByFingerprint(sessionId, fingerprint);

    const contractPayload = {
      id: contract.id,
      filename: contract.filename,
      pageCount: contract.pageCount,
      sections: contract.sections,
      text: contract.text,
    };

    if (!stream) {
      if (cached) {
        return Response.json({ review: cached, cached: true, contract: contractPayload });
      }
      const review = await runReviewPipeline({ contract, playbook, sessionId });
      saveReview(review);
      return Response.json({ review, cached: false, contract: contractPayload });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (event: AgentEvent) => {
          controller.enqueue(encoder.encode(sse(event.type, event.payload)));
        };
        try {
          if (cached) {
            controller.enqueue(encoder.encode(sse("complete", { review: cached, cached: true })));
            controller.close();
            return;
          }
          const review = await runReviewPipeline({
            contract,
            playbook,
            sessionId,
            onEvent: send,
          });
          saveReview(review);
          controller.enqueue(encoder.encode(sse("complete", { review, cached: false })));
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Review failed";
          controller.enqueue(encoder.encode(sse("error", { error: message })));
          controller.close();
        } finally {
          release?.();
          release = undefined;
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    release?.();
    release = undefined;
    return jsonError(error);
  } finally {
    if (release) release();
  }
}

export type ReviewResponse = { review: Review; cached: boolean };
