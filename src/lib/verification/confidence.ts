import type { MatchType, Verified } from "@/types/finding";
import { matchQuote } from "./match-quote";

export function confidenceFromMatch(matchType: MatchType, score: number): number {
  if (matchType === "exact") return 1;
  if (matchType === "normalized") return 0.95;
  if (matchType === "fuzzy") return Math.round(Math.min(0.92, score) * 100) / 100;
  return 0;
}

export function verifyQuote(source: string, quote: string): Verified {
  const match = matchQuote(source, quote);
  return {
    verified: match.matched,
    confidence: confidenceFromMatch(match.matchType, match.score),
    matchType: match.matchType,
  };
}
