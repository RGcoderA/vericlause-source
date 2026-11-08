export const AGENT_IDS = [
  "liability",
  "payment",
  "privacy",
  "termination",
  "ip-confidentiality",
  "governing-law",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export type AgentDef = {
  id: AgentId;
  name: string;
  shortName: string;
  focus: string;
  routing: string[];
};

export const SPECIALISTS: AgentDef[] = [
  {
    id: "liability",
    name: "Liability & Indemnity",
    shortName: "Liability",
    focus: "Unlimited liability, broad indemnification, liability caps",
    routing: [
      "liability",
      "indemnif",
      "damages",
      "limitation of",
      "hold harmless",
      "consequential",
    ],
  },
  {
    id: "payment",
    name: "Payment & Commercial",
    shortName: "Payment",
    focus: "Hidden fees, auto-renewal, payment terms, price increases",
    routing: [
      "payment",
      "fees",
      "price",
      "renew",
      "invoice",
      "term and",
      "charges",
      "tax",
    ],
  },
  {
    id: "privacy",
    name: "Data Privacy & Security",
    shortName: "Privacy",
    focus: "GDPR/CCPA, data location, security obligations, breach notice",
    routing: [
      "data",
      "privacy",
      "gdpr",
      "ccpa",
      "security",
      "breach",
      "personal",
      "subprocessor",
    ],
  },
  {
    id: "termination",
    name: "Termination & Lock-in",
    shortName: "Termination",
    focus: "Notice periods, termination for convenience, exit assistance",
    routing: [
      "terminat",
      "convenience",
      "lock-in",
      "exit",
      "wind down",
      "survival",
    ],
  },
  {
    id: "ip-confidentiality",
    name: "IP & Confidentiality",
    shortName: "IP",
    focus: "Work product ownership, licence scope, non-disclosure",
    routing: [
      "intellectual",
      "work product",
      "confidential",
      "license",
      "licence",
      "ownership",
      "deliverable",
    ],
  },
  {
    id: "governing-law",
    name: "Governing Law & Disputes",
    shortName: "Disputes",
    focus: "Jurisdiction, arbitration, class-action waivers",
    routing: [
      "governing",
      "jurisdiction",
      "arbitration",
      "class action",
      "dispute",
      "venue",
      "waiver",
    ],
  },
];

export const PIPELINE_AGENTS = [
  ...SPECIALISTS,
  {
    id: "verifier" as const,
    name: "Verifier",
    shortName: "Verifier",
    focus: "Quote must exist in the source text",
  },
  {
    id: "supervisor" as const,
    name: "Supervisor",
    shortName: "Supervisor",
    focus: "Merge findings, resolve conflicts, assign verdict",
  },
];

export const MODELS = {
  gemini: "gemini-2.5-flash",
  specialist: "openai/gpt-4o-mini",
  compiler: "openai/gpt-4o-mini",
  fallback: "google/gemini-2.0-flash-001",
  supervisor: "grok-4.7",
  redline: "grok-4.7",
};

export const TOKEN_CAPS = {
  specialistOutput: 900,
  compilerOutput: 500,
  supervisorOutput: 1200,
  redlineOutput: 900,
  specialistInputChars: 12000,
};

export const LIMITS = {
  maxUploadBytes: 4 * 1024 * 1024,
  maxTextChars: 100_000,
  maxReviewsPerWindow: 8,
  reviewWindowMs: 10 * 60 * 1000,
  specialistTimeoutMs: 45_000,
  pipelineTimeoutMs: 90_000,
};
