import { activeModel } from "@/lib/env";
import { lastRoutedModel } from "@/lib/llm/router";
import { reviewDigest } from "@/lib/sponsors/digest";
import { recordReview } from "@/lib/sponsors/tiger";
import type { Review } from "@/types/review";

export async function attachSponsors(review: Review): Promise<void> {
  const digest = reviewDigest(review);
  review.attribution = {
    model: lastRoutedModel() || activeModel(),
    tigerRecorded: false,
    digest,
  };
  review.attribution.tigerRecorded = await recordReview(review);
}
