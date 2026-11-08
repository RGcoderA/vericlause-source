export type Severity = "red" | "amber" | "green";

export type MatchType = "exact" | "normalized" | "fuzzy" | "none";

export type Verified = {
  verified: boolean;
  confidence: number;
  matchType: MatchType;
};

export type Finding = {
  id: string;
  agentId: string;
  title: string;
  summary: string;
  severity: Severity;
  quote: string;
  sectionNumber: string;
  sectionId: string;
  ruleId: string;
  recommendation: string;
  verified: Verified;
};
