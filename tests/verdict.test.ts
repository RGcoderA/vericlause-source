import { describe, expect, it } from "vitest";
import { verdictFromFindings } from "@/lib/scoring/verdict";
import type { Finding } from "@/types/finding";

function finding(severity: Finding["severity"]): Finding {
  return {
    id: crypto.randomUUID(),
    agentId: "liability",
    title: severity,
    summary: "",
    severity,
    quote: "x",
    sectionNumber: "1",
    sectionId: "sec-1",
    ruleId: "r",
    recommendation: "",
    verified: { verified: true, confidence: 1, matchType: "exact" },
  };
}

describe("verdictFromFindings", () => {
  it("is red if any issue is red", () => {
    expect(verdictFromFindings([finding("green"), finding("amber"), finding("red")])).toBe(
      "red"
    );
  });

  it("is amber if the worst issue is amber", () => {
    expect(verdictFromFindings([finding("green"), finding("amber")])).toBe("amber");
  });

  it("is green when only confirmations remain", () => {
    expect(verdictFromFindings([finding("green")])).toBe("green");
    expect(verdictFromFindings([])).toBe("green");
  });
});
