"use client";

import { useCopy } from "@/components/i18n/useCopy";
import type { AgentStatus } from "@/types/review";

export function AgentActivityPanel({ agents }: { agents: AgentStatus[] }) {
  const copy = useCopy();
  const statusLabel: Record<AgentStatus["status"], string> = {
    idle: copy.reading.queued,
    queued: copy.reading.queued,
    running: copy.reading.running,
    done: copy.reading.done,
    error: copy.reading.agentError,
  };
  return (
    <section className="bg-card p-4">
      <h2 className="font-heading text-base">{copy.reading.progress}</h2>
      <ul className="stagger-rows mt-3 grid gap-2 sm:grid-cols-2">
        {agents.map((agent) => (
          <li key={agent.agentId} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-bold">{agent.name}</span>
            <span className="text-muted-foreground">
              {agent.status === "done" ? `${agent.findingCount} ${copy.reading.found}` : statusLabel[agent.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
