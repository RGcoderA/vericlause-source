import type { Finding, Severity } from "./finding";

export type Verdict = Severity;

export type AgentRunStatus = "idle" | "queued" | "running" | "done" | "error";

export type AgentStatus = {
  agentId: string;
  name: string;
  status: AgentRunStatus;
  findingCount: number;
  message?: string;
};

export type ReviewStatus = "running" | "complete" | "error";

export type TimelineEvent = {
  t: number;
  agentId: string;
  status: AgentRunStatus;
  findingCount: number;
  message?: string;
};

export type Review = {
  id: string;
  sessionId: string;
  contractId: string;
  filename: string;
  pageCount: number;
  durationMs: number;
  status: ReviewStatus;
  verdict: Verdict;
  summary: string;
  nextSteps: string[];
  findings: Finding[];
  agentStatuses: AgentStatus[];
  timeline: TimelineEvent[];
  playbookVersion: number;
  fingerprint: string;
  mode: "live" | "sample";
  attribution?: {
    model: string;
    tigerRecorded: boolean;
    digest: string;
  };
  error?: string;
  createdAt: string;
};
