import type { Section } from "@/types/contract";

const PHRASES: [RegExp, string][] = [
  [/indemnif(?:y|ies|ied) and hold harmless/gi, "cover the other side's losses and legal costs"],
  [/hold harmless/gi, "cover the other side's losses"],
  [/indemnif(?:y|ies|ied)/gi, "cover the other side's losses"],
  [/notwithstanding anything to the contrary/gi, "even if another clause says otherwise"],
  [/including without limitation/gi, "including"],
  [/consequential damages/gi, "indirect losses, such as lost profits"],
  [/intellectual property/gi, "ideas, software, and other creations"],
  [/confidential information/gi, "information that must be kept private"],
  [/personal data/gi, "information that identifies a person"],
  [/governing law/gi, "which region's law applies"],
  [/auto-?renew(?:s|al|ed)?/gi, "renews by itself"],
  [/terminate for convenience/gi, "end the contract without giving a reason"],
  [/material breach/gi, "a serious break of the contract"],
  [/in perpetuity/gi, "forever"],
  [/sole discretion/gi, "its own choice"],
  [/time is of the essence/gi, "deadlines in this clause are strict"],
  [/force majeure/gi, "events outside either side's control"],
  [/best efforts/gi, "a strong promise to try"],
  [/reasonable efforts/gi, "a fair effort"],
  [/entire agreement/gi, "the whole deal"],
  [/\bhereinafter\b/gi, "from here on"],
  [/\bherein\b/gi, "in this contract"],
  [/\bhereto\b/gi, "to this contract"],
  [/\bhereby\b/gi, ""],
  [/\bthereof\b/gi, "of that"],
  [/\bshall not\b/gi, "must not"],
  [/\bshall\b/gi, "must"],
  [/\bwhereas\b/gi, "Because"],
  [/\bwarrants\b/gi, "promises"],
  [/\bwarrant\b/gi, "promise"],
];

export type PlainSection = {
  id: string;
  number: string;
  title: string;
  text: string;
};

export function toPlainEnglish(text: string): string {
  let plain = text;
  for (const [pattern, replacement] of PHRASES) {
    plain = plain.replace(pattern, replacement);
  }
  return plain.replace(/\s{2,}/g, " ").replace(/\s+([,.;])/g, "$1").trim();
}

export function explainSections(sections: Section[]): PlainSection[] {
  return sections.map((section) => ({
    id: section.id,
    number: section.number,
    title: section.title,
    text: toPlainEnglish(section.text),
  }));
}
