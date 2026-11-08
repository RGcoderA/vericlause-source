import { describe, expect, it } from "vitest";
import { runReviewPipeline } from "@/lib/agents";
import { CLEAN_CONTRACT_TEXT, TRAP_CONTRACT_TEXT } from "@/lib/demo/texts";
import { createDefaultPlaybook } from "@/lib/playbook/default-playbook";
import { splitSections } from "@/lib/parsing/split-sections";
import type { Contract } from "@/types/contract";

function contract(filename: string, text: string): Contract {
  return {
    id: filename,
    sessionId: "test",
    filename,
    mimeType: "text/plain",
    pageCount: 8,
    text,
    sections: splitSections(text),
    createdAt: new Date().toISOString(),
  };
}

describe("review pipeline", () => {
  it("flags planted traps as red and verifies every kept quote", async () => {
    const review = await runReviewPipeline({
      contract: contract("trap.pdf", TRAP_CONTRACT_TEXT),
      playbook: createDefaultPlaybook(),
      sessionId: "test",
    });
    expect(review.verdict).toBe("red");
    expect(review.findings.some((item) => /unlimited/i.test(item.title))).toBe(true);
    expect(review.findings.some((item) => /15-day|auto-renewal/i.test(item.title))).toBe(true);
    for (const finding of review.findings) {
      expect(finding.verified.verified).toBe(true);
      expect(TRAP_CONTRACT_TEXT.toLowerCase()).toContain(
        finding.quote.slice(0, 24).toLowerCase()
      );
    }
  });

  it("scores the clean MSA green against the starter playbook", async () => {
    const review = await runReviewPipeline({
      contract: contract("clean.pdf", CLEAN_CONTRACT_TEXT),
      playbook: createDefaultPlaybook(),
      sessionId: "test",
    });
    expect(review.verdict).toBe("green");
    expect(review.findings.every((item) => item.severity === "green")).toBe(true);
    expect(review.findings.length).toBeGreaterThan(0);
  });
});
