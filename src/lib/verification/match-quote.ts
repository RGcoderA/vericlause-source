import type { MatchType } from "@/types/finding";

export type QuoteMatch = {
  matched: boolean;
  matchType: MatchType;
  score: number;
  index: number;
};

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripQuotes(value: string): string {
  return value.replace(/^[“”"']+|[“”"']+$/g, "").trim();
}

export function normalizeForMatch(value: string): string {
  return collapseWhitespace(stripQuotes(value))
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
}

function findNormalized(haystack: string, needle: string): number {
  const normHay = normalizeForMatch(haystack);
  const normNeedle = normalizeForMatch(needle);
  if (!normNeedle || normNeedle.length < 12) return -1;
  return normHay.indexOf(normNeedle);
}

function tokenSet(value: string): Set<string> {
  return new Set(
    normalizeForMatch(value)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const token of a) {
    if (b.has(token)) inter += 1;
  }
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function fuzzyWindowScore(source: string, quote: string): { score: number; index: number } {
  const normSource = normalizeForMatch(source);
  const normQuote = normalizeForMatch(quote);
  const quoteTokens = tokenSet(normQuote);
  if (quoteTokens.size < 4) return { score: 0, index: -1 };

  const words = normSource.split(" ");
  const windowSize = Math.max(quoteTokens.size + 4, 12);
  let best = 0;
  let bestIndex = -1;
  for (let i = 0; i < words.length; i += 3) {
    const slice = words.slice(i, i + windowSize).join(" ");
    const score = jaccard(quoteTokens, tokenSet(slice));
    if (score > best) {
      best = score;
      bestIndex = source.toLowerCase().indexOf(words[i] ?? "");
    }
  }
  return { score: best, index: bestIndex };
}

export function matchQuote(source: string, quote: string): QuoteMatch {
  const cleaned = stripQuotes(quote);
  if (!cleaned || cleaned.length < 16) {
    return { matched: false, matchType: "none", score: 0, index: -1 };
  }

  const exactIndex = source.indexOf(cleaned);
  if (exactIndex >= 0) {
    return { matched: true, matchType: "exact", score: 1, index: exactIndex };
  }

  const collapsedSource = collapseWhitespace(source);
  const collapsedQuote = collapseWhitespace(cleaned);
  if (collapsedSource.includes(collapsedQuote)) {
    return { matched: true, matchType: "normalized", score: 0.96, index: 0 };
  }

  const normalizedIndex = findNormalized(source, cleaned);
  if (normalizedIndex >= 0) {
    return { matched: true, matchType: "normalized", score: 0.94, index: 0 };
  }

  const fuzzy = fuzzyWindowScore(source, cleaned);
  if (fuzzy.score >= 0.86) {
    return {
      matched: true,
      matchType: "fuzzy",
      score: fuzzy.score,
      index: fuzzy.index,
    };
  }

  return { matched: false, matchType: "none", score: fuzzy.score, index: -1 };
}
