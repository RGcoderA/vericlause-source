import { createHash } from "node:crypto";
import type { Review } from "@/types/review";

export function reviewDigest(review: Pick<Review, "verdict" | "findings" | "filename">): string {
  const quotes = review.findings
    .filter((finding) => finding.verified.verified)
    .map((finding) => `${finding.sectionNumber}:${finding.quote.trim()}`)
    .sort();
  return createHash("sha256")
    .update(JSON.stringify({ filename: review.filename, verdict: review.verdict, quotes }))
    .digest("hex");
}
