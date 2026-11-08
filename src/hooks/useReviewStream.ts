"use client";

import { useCallback, useRef, useState } from "react";
import type { Section } from "@/types/contract";
import type { Finding } from "@/types/finding";
import type { AgentStatus, Review } from "@/types/review";

export type ContractPayload = {
  id: string;
  filename: string;
  pageCount: number;
  sections: Section[];
  text: string;
};
import { PIPELINE_AGENTS } from "@/config/agents.config";

function idleAgents(): AgentStatus[] {
  return PIPELINE_AGENTS.map((agent) => ({
    agentId: agent.id,
    name: agent.name,
    status: "queued",
    findingCount: 0,
  }));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useReviewStream() {
  const [review, setReview] = useState<Review | null>(null);
  const [agents, setAgents] = useState<AgentStatus[]>(idleAgents);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [contract, setContract] = useState<ContractPayload | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setReview(null);
    setAgents(idleAgents());
    setFindings([]);
    setError(null);
    setCached(false);
    setContract(null);
  }, []);

  const replay = useCallback(async (next: Review) => {
    const specialists = next.agentStatuses.filter((agent) =>
      !["verifier", "supervisor"].includes(agent.agentId)
    );
    setAgents(
      next.agentStatuses.map((agent) =>
        ["verifier", "supervisor"].includes(agent.agentId)
          ? { ...agent, status: "queued", findingCount: 0 }
          : { ...agent, status: "running" }
      )
    );
    await sleep(500);
    setAgents((current) =>
      current.map((agent) => {
        const done = specialists.find((item) => item.agentId === agent.agentId);
        return done ? { ...done, status: "done" } : agent;
      })
    );
    await sleep(280);
    const verifier = next.agentStatuses.find((agent) => agent.agentId === "verifier");
    if (verifier) {
      setAgents((current) =>
        current.map((agent) => (agent.agentId === "verifier" ? { ...verifier, status: "done" } : agent))
      );
    }
    await sleep(220);
    const supervisor = next.agentStatuses.find((agent) => agent.agentId === "supervisor");
    if (supervisor) {
      setAgents((current) =>
        current.map((agent) =>
          agent.agentId === "supervisor" ? { ...supervisor, status: "done" } : agent
        )
      );
    }
    setFindings(next.findings);
    setReview(next);
    setAgents(next.agentStatuses);
  }, []);

  const start = useCallback(async (contractId: string): Promise<Review | null> => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setRunning(true);
    setError(null);
    setReview(null);
    setFindings([]);
    setAgents(
      idleAgents().map((agent) =>
        ["verifier", "supervisor"].includes(agent.agentId)
          ? agent
          : { ...agent, status: "running" }
      )
    );
    setCached(false);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
        signal: abort.signal,
      });
      const body = (await response.json()) as {
        review?: Review;
        contract?: ContractPayload;
        cached?: boolean;
        error?: string;
      };
      if (!response.ok || !body.review) {
        throw new Error(body.error || "Review failed to start.");
      }
      setCached(Boolean(body.cached));
      if (body.contract) setContract(body.contract);
      await replay(body.review);
      return body.review;
    } catch (err) {
      if ((err as Error).name === "AbortError") return null;
      const message = err instanceof Error ? err.message : "Review failed.";
      setError(message);
      setAgents(idleAgents());
      return null;
    } finally {
      setRunning(false);
    }
  }, [replay]);

  return {
    review,
    agents,
    findings,
    running,
    error,
    cached,
    contract,
    start,
    reset,
    setReview,
    setContract,
  };
}

export { idleAgents };
