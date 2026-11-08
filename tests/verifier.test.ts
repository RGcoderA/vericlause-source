import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { verifyFindings } from "@/lib/agents/verifier";
import { verifyQuote } from "@/lib/verification/confidence";
import { matchQuote } from "@/lib/verification/match-quote";

const source = readFileSync(
  path.join(__dirname, "fixtures/sample-contract.txt"),
  "utf8"
);

describe("quote verifier", () => {
  it("accepts an exact quote from the contract", () => {
    const quote = "Vendor's aggregate liability under this Agreement shall be unlimited.";
    const match = matchQuote(source, quote);
    expect(match.matched).toBe(true);
    expect(match.matchType).toBe("exact");
    const verified = verifyQuote(source, quote);
    expect(verified.verified).toBe(true);
    expect(verified.confidence).toBe(1);
  });

  it("accepts a quote with collapsed whitespace", () => {
    const quote =
      "Vendor's   aggregate   liability  under this Agreement shall be unlimited.";
    const match = matchQuote(source, quote);
    expect(match.matched).toBe(true);
    expect(match.matchType).toBe("normalized");
  });

  it("drops a hallucinated quote that is not in the source", () => {
    const quote =
      "The parties agree that Vendor's liability shall never exceed one month of fees paid under Schedule A.";
    const verified = verifyQuote(source, quote);
    expect(verified.verified).toBe(false);
    expect(verified.matchType).toBe("none");

    const { kept, dropped } = verifyFindings(source, [
      {
        id: "hallucinated",
        agentId: "liability",
        title: "Invented cap",
        summary: "Not in the document",
        severity: "red",
        quote,
        sectionNumber: "8.2",
        sectionId: "sec-8-2",
        ruleId: "liability-cap",
        recommendation: "Ignore",
        verified: { verified: false, confidence: 0, matchType: "none" },
      },
      {
        id: "real",
        agentId: "liability",
        title: "Unlimited liability",
        summary: "In the document",
        severity: "red",
        quote: "Vendor's aggregate liability under this Agreement shall be unlimited.",
        sectionNumber: "8.2",
        sectionId: "sec-8-2",
        ruleId: "liability-cap",
        recommendation: "Cap it",
        verified: { verified: false, confidence: 0, matchType: "none" },
      },
    ]);
    expect(dropped.map((item) => item.id)).toEqual(["hallucinated"]);
    expect(kept.map((item) => item.id)).toEqual(["real"]);
    expect(kept[0]?.verified.verified).toBe(true);
  });
});
