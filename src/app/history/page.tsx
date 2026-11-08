import { HistoryView } from "@/components/history/HistoryView";
import { listReviews } from "@/lib/cache/review-cache";
import { getSessionId } from "@/lib/http";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const sessionId = await getSessionId();
  const reviews = listReviews(sessionId);
  return (
    <HistoryView
      reviews={reviews.map((review) => ({
        id: review.id,
        verdict: review.verdict,
        filename: review.filename,
        pageCount: review.pageCount,
        findings: review.findings.length,
        playbookVersion: review.playbookVersion,
      }))}
    />
  );
}
