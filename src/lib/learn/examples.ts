import { readFile } from "node:fs/promises";
import path from "node:path";

const FILES = {
  mutual: "04-mutual-nda.md",
  oneway: "05-one-way-nda.md",
  "vendor-clean": "06-vendor-clean.md",
  risky: "07-risky-vendor.md",
} as const;

export type LearnExampleId = keyof typeof FILES;

/** Drop markdown headings and any answer key so a review sees the agreement, not the score sheet. */
export function plainExample(markdown: string): string {
  const cut = markdown.split(/^#\s+ANSWER KEY/m)[0] ?? markdown;
  return cut.replace(/^#{1,6}\s+/gm, "").trim();
}

export async function readLearnExample(id: LearnExampleId): Promise<string> {
  const filePath = path.join(process.cwd(), "learn", "mark", "examples", FILES[id]);
  const raw = await readFile(filePath, "utf8");
  return plainExample(raw);
}
