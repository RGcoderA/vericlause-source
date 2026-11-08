import {
  PIPELINE_AGENTS,
  SPECIALISTS,
  TOKEN_CAPS,
  type AgentId,
} from "@/config/agents.config";
import { completeJson } from "@/lib/agents/base-agent";
import { groundFindings } from "@/lib/agents/heuristic";
import { scanGoverningLaw } from "@/lib/agents/specialists/governing-law";
import { scanIp } from "@/lib/agents/specialists/ip-confidentiality";
import { scanLiability } from "@/lib/agents/specialists/liability";
import { scanPayment } from "@/lib/agents/specialists/payment";
import { scanPrivacy } from "@/lib/agents/specialists/privacy";
import { scanTermination } from "@/lib/agents/specialists/termination";
import { supervise } from "@/lib/agents/supervisor";
import { verifyFindings } from "@/lib/agents/verifier";
import { fingerprintDocument } from "@/lib/cache/fingerprint";
import { reviewMode } from "@/lib/env";
import { attachSponsors } from "@/lib/sponsors/attach";
import { routeSectionsToAgent } from "@/lib/parsing/split-sections";
import { specialistOutputSchema } from "@/lib/playbook/rule-schema";
import { classifyDocument, learnMarkBrief } from "@/lib/learn/mark";
import { specialistSystemPrompt, specialistUserPrompt } from "@/lib/prompts/specialist.prompt";
import type { Contract, Section } from "@/types/contract";
import type { Finding } from "@/types/finding";
import type { Playbook } from "@/types/playbook";
import type { AgentStatus, Review, TimelineEvent } from "@/types/review";

export type AgentEvent = {
  type: "agent" | "finding" | "verdict" | "done" | "error";
  payload: unknown;
};

const SCANNERS: Record<AgentId, (sections: Section[], playbook: Playbook["rules"]) => Finding[]> = {
  liability: scanLiability,
  payment: scanPayment,
  privacy: scanPrivacy,
  termination: scanTermination,
  "ip-confidentiality": scanIp,
  "governing-law": scanGoverningLaw,
};

function idleStatuses(): AgentStatus[] {
  return PIPELINE_AGENTS.map((agent) => ({
    agentId: agent.id,
    name: agent.name,
    status: "queued" as const,
    findingCount: 0,
  }));
}

async function runSpecialist(args: {
  agentId: AgentId;
  sections: Section[];
  playbook: Playbook;
  sourceText: string;
}): Promise<Finding[]> {
  const agent = SPECIALISTS.find((item) => item.id === args.agentId)!;
  const routed = routeSectionsToAgent(
    args.sections,
    args.agentId,
    TOKEN_CAPS.specialistInputChars
  );
  const rules = args.playbook.rules.filter((rule) => rule.domain === args.agentId && rule.enabled);
  const fallback = SCANNERS[args.agentId](routed, rules);

  if (reviewMode() === "sample") return fallback;

  try {
    const output = await completeJson({
      role: "specialist",
      system: specialistSystemPrompt(agent),
      user: specialistUserPrompt({
        agent,
        rules,
        sections: routed,
        learnMark: learnMarkBrief(classifyDocument(args.sourceText), args.agentId),
      }),
      schema: specialistOutputSchema,
    });
    const modelFindings = output.findings.map((finding) => ({
      id: crypto.randomUUID(),
      agentId: args.agentId,
      title: finding.title,
      summary: finding.summary,
      severity: finding.severity,
      quote: finding.quote,
      sectionNumber: finding.sectionNumber,
      sectionId:
        routed.find((section) => section.number === finding.sectionNumber)?.id || routed[0]?.id || "",
      ruleId: finding.ruleId || "",
      recommendation: finding.recommendation,
      verified: { verified: false, confidence: 0, matchType: "none" as const },
    }));
    return groundFindings(modelFindings, fallback, rules);
  } catch {
    return fallback;
  }
}

export async function runReviewPipeline(args: {
  contract: Contract;
  playbook: Playbook;
  sessionId: string;
  reviewId?: string;
  onEvent?: (event: AgentEvent) => void;
}): Promise<Review> {
  const started = Date.now();
  const timeline: TimelineEvent[] = [];
  const emit = (agentId: string, status: AgentStatus["status"], findingCount = 0, message?: string) => {
    const event: TimelineEvent = { t: Date.now() - started, agentId, status, findingCount, message };
    timeline.push(event);
    args.onEvent?.({ type: "agent", payload: event });
  };

  const statuses = idleStatuses();
  const touch = (agentId: string, patch: Partial<AgentStatus>) => {
    const row = statuses.find((item) => item.agentId === agentId);
    if (row) Object.assign(row, patch);
  };

  for (const specialist of SPECIALISTS) {
    touch(specialist.id, { status: "running" });
    emit(specialist.id, "running");
  }

  const specialistResults = await Promise.all(
    SPECIALISTS.map(async (specialist) => {
      try {
        const findings = await runSpecialist({
          agentId: specialist.id,
          sections: args.contract.sections,
          playbook: args.playbook,
          sourceText: args.contract.text,
        });
        touch(specialist.id, { status: "done", findingCount: findings.length });
        emit(specialist.id, "done", findings.length);
        findings.forEach((finding) => args.onEvent?.({ type: "finding", payload: finding }));
        return findings;
      } catch (error) {
        touch(specialist.id, {
          status: "error",
          message: error instanceof Error ? error.message : "failed",
        });
        emit(specialist.id, "error", 0, error instanceof Error ? error.message : "failed");
        return [] as Finding[];
      }
    })
  );

  touch("verifier", { status: "running" });
  emit("verifier", "running");
  const merged = specialistResults.flat();
  const { kept } = verifyFindings(args.contract.text, merged);
  touch("verifier", { status: "done", findingCount: kept.length });
  emit("verifier", "done", kept.length);

  touch("supervisor", { status: "running" });
  emit("supervisor", "running");
  const supervised = await supervise({
    filename: args.contract.filename,
    pageCount: args.contract.pageCount,
    findings: kept,
  });
  touch("supervisor", { status: "done", findingCount: supervised.findings.length });
  emit("supervisor", "done", supervised.findings.length);

  const review: Review = {
    id: args.reviewId || crypto.randomUUID(),
    sessionId: args.sessionId,
    contractId: args.contract.id,
    filename: args.contract.filename,
    pageCount: args.contract.pageCount,
    durationMs: Date.now() - started,
    status: "complete",
    verdict: supervised.verdict,
    summary: supervised.summary,
    nextSteps: supervised.nextSteps,
    findings: supervised.findings,
    agentStatuses: statuses.map((row) => ({ ...row, status: row.status === "queued" ? "done" : row.status })),
    timeline,
    playbookVersion: args.playbook.version,
    fingerprint: fingerprintDocument(args.contract.text, args.playbook),
    mode: reviewMode(),
    createdAt: new Date().toISOString(),
  };
  await attachSponsors(review);

  args.onEvent?.({
    type: "verdict",
    payload: {
      verdict: review.verdict,
      summary: review.summary,
      durationMs: review.durationMs,
    },
  });
  args.onEvent?.({ type: "done", payload: { reviewId: review.id } });
  return review;
}