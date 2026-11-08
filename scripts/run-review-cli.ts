import { readFile } from "node:fs/promises";
import path from "node:path";
import { runReviewPipeline } from "../src/lib/agents";
import { createDefaultPlaybook } from "../src/lib/playbook/default-playbook";
import { CLEAN_CONTRACT_TEXT, TRAP_CONTRACT_TEXT } from "../src/lib/demo/texts";
import { splitSections } from "../src/lib/parsing/split-sections";
import type { Contract } from "../src/types/contract";

async function loadText(arg?: string): Promise<{ filename: string; text: string }> {
  if (!arg || arg === "trap") {
    return { filename: "trap-vendor-agreement.pdf", text: TRAP_CONTRACT_TEXT };
  }
  if (arg === "clean") {
    return { filename: "clean-vendor-agreement.pdf", text: CLEAN_CONTRACT_TEXT };
  }
  const filePath = path.resolve(arg);
  const text = await readFile(filePath, "utf8");
  return { filename: path.basename(filePath), text };
}

async function main() {
  const { filename, text } = await loadText(process.argv[2]);
  const contract: Contract = {
    id: "cli-contract",
    sessionId: "cli",
    filename,
    mimeType: "text/plain",
    pageCount: Math.max(1, Math.round(text.split(/\s+/).length / 380)),
    text,
    sections: splitSections(text),
    createdAt: new Date().toISOString(),
  };
  const review = await runReviewPipeline({
    contract,
    playbook: createDefaultPlaybook(),
    sessionId: "cli",
    reviewId: "cli-review",
  });
  console.log(
    JSON.stringify(
      {
        verdict: review.verdict,
        durationMs: review.durationMs,
        mode: review.mode,
        summary: review.summary,
        findings: review.findings.map((finding) => ({
          severity: finding.severity,
          title: finding.title,
          section: finding.sectionNumber,
          verified: finding.verified.verified,
          quote: finding.quote,
        })),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
