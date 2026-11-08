import { TOKEN_CAPS } from "@/config/agents.config";
import { completeJson } from "@/lib/agents/base-agent";
import { hasLiveLlm } from "@/lib/env";
import { supervisorOutputSchema } from "@/lib/playbook/rule-schema";
import { supervisorSystemPrompt, supervisorUserPrompt } from "@/lib/prompts/supervisor.prompt";
import { sortFindings, verdictFromFindings } from "@/lib/scoring/verdict";
import type { Finding } from "@/types/finding";
import type { Verdict } from "@/types/review";

function heuristicSummary(args: {
  filename: string;
  pageCount: number;
  findings: Finding[];
  verdict: Verdict;
}): { summary: string; nextSteps: string[] } {
  const issues = args.findings.filter((finding) => finding.severity !== "green");
  const reds = issues.filter((finding) => finding.severity === "red");
  const ambers = issues.filter((finding) => finding.severity === "amber");
  const greens = args.findings.filter((finding) => finding.severity === "green");

  const verdictLabel = args.verdict.toUpperCase();
  let summary = `${args.filename} (${args.pageCount} pages) scores ${verdictLabel}. `;
  if (reds.length) {
    summary += `Deal-breakers: ${reds.map((item) => item.title).join("; ")}. `;
  }
  if (ambers.length) {
    summary += `Negotiate: ${ambers.map((item) => item.title).join("; ")}. `;
  }
  if (greens.length && !reds.length) {
    summary += `Playbook-aligned: ${greens.map((item) => item.title).join("; ")}. `;
  }
  summary +=
    "This is decision support for counsel — not a substitute for legal advice. Every issue below quotes the source and passed the Verifier.";

  const nextSteps = [
    reds[0]
      ? `Open the ${reds[0].title} finding and generate a redline before commercial sign-off.`
      : "Skim the green confirmations and file the report with the deal memo.",
    "Check the playbook: add any company-specific rule in plain English and rerun.",
    "Keep a lawyer in the loop for the remaining redlines and any jurisdiction-specific issues.",
  ];
  return { summary: summary.trim(), nextSteps };
}

export async function supervise(args: {
  filename: string;
  pageCount: number;
  findings: Finding[];
}): Promise<{ findings: Finding[]; summary: string; nextSteps: string[]; verdict: Verdict }> {
  const findings = sortFindings(args.findings);
  const verdict = verdictFromFindings(findings);
  const fallback = heuristicSummary({ ...args, findings, verdict });

  if (!hasLiveLlm()) {
    return { findings, ...fallback, verdict };
  }

  try {
    const output = await completeJson({
      role: "supervisor",
      system: supervisorSystemPrompt(),
      user: supervisorUserPrompt({
        filename: args.filename,
        pageCount: args.pageCount,
        findingsJson: JSON.stringify(
          findings.map((finding) => ({
            id: finding.id,
            title: finding.title,
            severity: finding.severity,
            sectionNumber: finding.sectionNumber,
            summary: finding.summary,
          }))
        ),
      }),
      schema: supervisorOutputSchema,
      maxTokens: TOKEN_CAPS.supervisorOutput,
    });
    const dropped = new Set(output.droppedFindingIds);
    const kept = findings.filter((finding) => !dropped.has(finding.id));
    return {
      findings: sortFindings(kept),
      summary: output.summary || fallback.summary,
      nextSteps: output.nextSteps.length ? output.nextSteps : fallback.nextSteps,
      verdict: verdictFromFindings(kept),
    };
  } catch {
    return { findings, ...fallback, verdict };
  }
}
