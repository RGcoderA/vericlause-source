import { verifyQuote } from "@/lib/verification/confidence";
import type { Finding } from "@/types/finding";

export function verifyFindings(source: string, findings: Finding[]): {
  kept: Finding[];
  dropped: Finding[];
} {
  const kept: Finding[] = [];
  const dropped: Finding[] = [];
  for (const finding of findings) {
    const verified = verifyQuote(source, finding.quote);
    const next = { ...finding, verified };
    if (verified.verified) kept.push(next);
    else dropped.push(next);
  }
  return { kept, dropped };
}
