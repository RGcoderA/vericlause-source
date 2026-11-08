import { describe, expect, it } from "vitest";
import { roleFromProfile } from "@/lib/auth/role";
import { reviewDigest } from "@/lib/sponsors/digest";
import type { Finding } from "@/types/finding";

function finding(quote: string, section: string): Finding {
  return {
    id: section,
    agentId: "liability",
    title: "t",
    summary: "",
    severity: "red",
    quote,
    sectionNumber: section,
    sectionId: section,
    ruleId: "r",
    recommendation: "",
    verified: { verified: true, confidence: 1, matchType: "exact" },
  };
}

describe("reviewDigest", () => {
  it("is stable when findings are reordered", () => {
    const left = reviewDigest({
      filename: "msa.pdf",
      verdict: "red",
      findings: [finding("shall be unlimited", "8.2"), finding("fifteen days", "4.2")],
    });
    const right = reviewDigest({
      filename: "msa.pdf",
      verdict: "red",
      findings: [finding("fifteen days", "4.2"), finding("shall be unlimited", "8.2")],
    });
    expect(left).toBe(right);
    expect(left).toHaveLength(64);
  });

  it("changes when the verdict changes", () => {
    const red = reviewDigest({ filename: "msa.pdf", verdict: "red", findings: [finding("cap", "8")] });
    const green = reviewDigest({ filename: "msa.pdf", verdict: "green", findings: [finding("cap", "8")] });
    expect(red).not.toBe(green);
  });
});

describe("roleFromProfile", () => {
  it("treats an explicit counsel claim as counsel and everything else as business", () => {
    expect(roleFromProfile({ "https://vericlause.app/role": "business" })).toBe("business");
    expect(roleFromProfile({ role: "counsel" })).toBe("counsel");
    expect(roleFromProfile({})).toBe("business");
  });
});
