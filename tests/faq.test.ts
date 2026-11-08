import { describe, expect, it } from "vitest";
import { guideReply } from "@/lib/help/faq";

describe("guideReply", () => {
  it("answers a verdict question from the guide", () => {
    const result = guideReply("What does a red verdict mean?");
    expect(result.matched).toBe(true);
    expect(result.reply.toLowerCase()).toContain("deal-breaker");
  });

  it("refuses questions outside the product", () => {
    const result = guideReply("What is the weather in Toronto tomorrow?");
    expect(result.matched).toBe(false);
    expect(result.reply).toContain("FAQ");
  });
});
