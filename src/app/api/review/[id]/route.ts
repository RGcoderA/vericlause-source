import { getContract, getReview } from "@/lib/cache/review-cache";
import { getSessionId, jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = await getSessionId();
    const { id } = await context.params;
    const review = getReview(id);
    if (!review) {
      return Response.json({ error: "Review not found." }, { status: 404 });
    }
    if (review.sessionId !== sessionId) {
      return Response.json({ error: "Review not found." }, { status: 404 });
    }
    const contract = getContract(review.contractId);
    return Response.json({
      review,
      contract: contract
        ? {
            id: contract.id,
            filename: contract.filename,
            pageCount: contract.pageCount,
            sections: contract.sections,
            text: contract.text,
          }
        : null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

