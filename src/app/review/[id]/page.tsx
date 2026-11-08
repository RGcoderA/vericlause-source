import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ReviewWorkspace } from "@/components/review/ReviewWorkspace";
import { runReviewPipeline } from "@/lib/agents";
import {
  getContract,
  getPlaybook,
  getReview,
  getReviewByFingerprint,
  saveReview,
} from "@/lib/cache/review-cache";
import { fingerprintDocument } from "@/lib/cache/fingerprint";
import { beginInflight, getSessionId, HttpError, rateLimit } from "@/lib/http";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ contract?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const sessionId = await getSessionId();

  if (id === "run" && query.contract) {
    const contract = getContract(query.contract);
    if (!contract || contract.sessionId !== sessionId) {
      return (
        <p className="text-destructive">
          That contract is not in this session. Go back and start a review.
        </p>
      );
    }
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || sessionId;
    let release: (() => void) | undefined;
    try {
      rateLimit(`review:${ip}`);
      release = beginInflight(`review:${ip}`);
      const playbook = getPlaybook(sessionId);
      const fingerprint = fingerprintDocument(contract.text, playbook);
      const cached = getReviewByFingerprint(sessionId, fingerprint);
      const review =
        cached ??
        saveReview(await runReviewPipeline({ contract, playbook, sessionId }));
      redirect(`/review/${review.id}`);
    } catch (error) {
      release?.();
      if (error instanceof HttpError) {
        return <p className="text-destructive">{error.message}</p>;
      }
      throw error;
    }
  }

  const review = getReview(id);
  if (!review || review.sessionId !== sessionId) notFound();
  const contract = getContract(review.contractId);
  return (
    <ReviewWorkspace
      reviewId={review.id}
      initialReview={review}
      initialContract={
        contract
          ? {
              id: contract.id,
              filename: contract.filename,
              pageCount: contract.pageCount,
              sections: contract.sections,
              text: contract.text,
            }
          : null
      }
    />
  );
}
