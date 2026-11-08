import type { AgentId } from "@/config/agents.config";
import { SPECIALISTS } from "@/config/agents.config";
import type { Section } from "@/types/contract";

const HEADING =
  /(?:^|\n)\s*(?:(?:ARTICLE|Article|SECTION|Section)\s+)?(\d+(?:\.\d+){0,3})(?:[.)]|:(?=\s)|(?=\s{1,3}[A-Z]))\s+([A-Z][^\n]{2,90})/g;

function slug(number: string): string {
  return `sec-${number.replace(/\./g, "-")}`;
}

export function splitSections(text: string): Section[] {
  const matches = [...text.matchAll(HEADING)];
  if (matches.length < 3) {
    return fallbackChunks(text);
  }

  const sections: Section[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const next = matches[i + 1];
    const start = match.index ?? 0;
    const end = next?.index ?? text.length;
    const number = match[1] ?? String(i + 1);
    const title = (match[2] ?? "Untitled").replace(/\s+/g, " ").trim();
    const body = text.slice(start, end).trim();
    sections.push({
      id: slug(number),
      number,
      title,
      text: body,
      startOffset: start,
      endOffset: end,
    });
  }
  return sections;
}

function fallbackChunks(text: string): Section[] {
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim().length > 40);
  if (blocks.length === 0) {
    return [
      {
        id: "sec-1",
        number: "1",
        title: "Document",
        text,
        startOffset: 0,
        endOffset: text.length,
      },
    ];
  }

  const sections: Section[] = [];
  let cursor = 0;
  blocks.forEach((block, index) => {
    const start = text.indexOf(block, cursor);
    const end = start + block.length;
    cursor = end;
    const firstLine = block.split("\n")[0]?.slice(0, 80) ?? `Section ${index + 1}`;
    sections.push({
      id: slug(String(index + 1)),
      number: String(index + 1),
      title: firstLine.replace(/\s+/g, " ").trim(),
      text: block.trim(),
      startOffset: Math.max(0, start),
      endOffset: end,
    });
  });
  return sections;
}

export function routeSectionsToAgent(
  sections: Section[],
  agentId: AgentId,
  budgetChars: number
): Section[] {
  const agent = SPECIALISTS.find((item) => item.id === agentId);
  if (!agent) return sections.slice(0, 6);

  const scored = sections.map((section) => {
    const hay = `${section.title}\n${section.text}`.toLowerCase();
    const hits = agent.routing.reduce(
      (count, token) => (hay.includes(token) ? count + 1 : count),
      0
    );
    return { section, hits };
  });

  const matched = scored
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((item) => item.section);

  const chosen = matched.length > 0 ? matched : sections;
  const result: Section[] = [];
  let used = 0;
  for (const section of chosen) {
    if (used + section.text.length > budgetChars && result.length > 0) break;
    result.push(section);
    used += section.text.length;
  }
  return result;
}

export function findSectionForQuote(
  sections: Section[],
  quote: string,
  fallbackNumber?: string
): Section | undefined {
  if (fallbackNumber) {
    const exact = sections.find((section) => section.number === fallbackNumber);
    if (exact && exact.text.includes(quote.slice(0, 40))) return exact;
    if (exact) return exact;
  }
  return sections.find((section) => section.text.includes(quote.slice(0, 48)));
}
