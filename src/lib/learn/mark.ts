import type { AgentId } from "@/config/agents.config";

export const DOCUMENT_KINDS = [
  "mutual-nda",
  "one-way-nda",
  "vendor-agreement",
  "terms",
  "privacy",
  "other",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export type LearnMark = {
  id: string;
  kinds: DocumentKind[];
  domain: AgentId | "general";
  title: string;
  clean: string;
  flag: string;
};

export const KIND_LABEL: Record<DocumentKind, string> = {
  "mutual-nda": "Mutual NDA",
  "one-way-nda": "One-way NDA",
  "vendor-agreement": "Vendor agreement",
  terms: "Terms of service",
  privacy: "Privacy policy",
  other: "General contract",
};

/** Saved from the legal pack. A reading aid, not legal advice. */
export const LEARN_MARKS: LearnMark[] = [
  {
    id: "nda-purpose",
    kinds: ["mutual-nda", "one-way-nda"],
    domain: "ip-confidentiality",
    title: "Use is limited to the purpose",
    clean: "The clean NDAs allow use only for the stated purpose, and only with people who need to know.",
    flag: "A duty to share secrets for any purpose, or with no need-to-know limit.",
  },
  {
    id: "nda-exclusions",
    kinds: ["mutual-nda", "one-way-nda"],
    domain: "ip-confidentiality",
    title: "Ordinary exclusions are present",
    clean: "Public information, prior knowledge, a third party, and independent development are excluded.",
    flag: "No exclusions, or a definition that covers information the receiver already knew.",
  },
  {
    id: "nda-term",
    kinds: ["mutual-nda", "one-way-nda"],
    domain: "termination",
    title: "The duty ends",
    clean: "The mutual example lasts two years from disclosure. The one-way example lasts three. Read the number that is written.",
    flag: "Confidentiality that lasts forever, or a term that is missing.",
  },
  {
    id: "nda-return",
    kinds: ["mutual-nda", "one-way-nda"],
    domain: "termination",
    title: "Materials can be returned",
    clean: "On request, the receiver returns or destroys the information, with a narrow backup exception.",
    flag: "No return or destruction, or a right to keep using the information after the talks end.",
  },
  {
    id: "nda-no-licence",
    kinds: ["mutual-nda", "one-way-nda"],
    domain: "ip-confidentiality",
    title: "Disclosure is not a licence",
    clean: "Sharing information does not grant intellectual property rights.",
    flag: "The receiver is given a licence, or assignment, just by receiving the information.",
  },
  {
    id: "nda-one-way",
    kinds: ["one-way-nda"],
    domain: "ip-confidentiality",
    title: "Only the discloser is sharing",
    clean: "One party discloses and the other protects. The duties are not swapped.",
    flag: "The recipient must also hand over its own secrets, or the discloser has no duty at all while the recipient is bound forever.",
  },
  {
    id: "vendor-scope",
    kinds: ["vendor-agreement"],
    domain: "general",
    title: "The service is fixed",
    clean: "The clean vendor example describes the services and does not let one side rewrite them at will.",
    flag: "Services can be changed at will, with no fixed scope.",
  },
  {
    id: "vendor-renewal",
    kinds: ["vendor-agreement"],
    domain: "termination",
    title: "Renewal can be stopped",
    clean: "Auto-renewal is acceptable only with a real chance to opt out, at least 30 days in writing.",
    flag: "A long lock-in, a 12-month notice, or notice that must be sent by registered mail.",
  },
  {
    id: "vendor-pay",
    kinds: ["vendor-agreement"],
    domain: "payment",
    title: "Payment is not punitive",
    clean: "The clean example gives time to pay a real invoice and a way to dispute it.",
    flag: "Pay in advance, a very short due date, high interest, a flat penalty, or instant suspension with no dispute.",
  },
  {
    id: "vendor-price",
    kinds: ["vendor-agreement"],
    domain: "payment",
    title: "Prices do not move without notice",
    clean: "A price change needs prior notice and a limit.",
    flag: "Unlimited unilateral price increases, or fees that can never be refunded or set off.",
  },
  {
    id: "vendor-data",
    kinds: ["vendor-agreement"],
    domain: "privacy",
    title: "Customer data stays the customer's",
    clean: "Data is used to provide the service, with a place it may be stored and a breach notice.",
    flag: "A perpetual licence to customer data, use for AI training, selling insights, or sharing with any partner for their own purposes.",
  },
  {
    id: "vendor-ip",
    kinds: ["vendor-agreement"],
    domain: "ip-confidentiality",
    title: "The customer keeps its own IP",
    clean: "The customer does not assign its own work just by signing. Publicity can be stopped.",
    flag: "Assignment of the customer's own IP or feedback, or a perpetual right to use its logo.",
  },
  {
    id: "vendor-liability",
    kinds: ["vendor-agreement"],
    domain: "liability",
    title: "Liability is mutual and capped",
    clean: "A cap tied to fees, and no duty to cover the other side's own negligence.",
    flag: "A token cap for the vendor, unlimited liability for the customer, or an indemnity that covers the vendor's own negligence.",
  },
  {
    id: "vendor-exit",
    kinds: ["vendor-agreement"],
    domain: "termination",
    title: "The customer can leave",
    clean: "Either side can end for breach, and data is returned rather than deleted on the spot.",
    flag: "Only the vendor can terminate, all future fees fall due, or data is deleted immediately.",
  },
  {
    id: "vendor-changes",
    kinds: ["vendor-agreement", "terms"],
    domain: "governing-law",
    title: "Changes are signed",
    clean: "The clean examples change only by a writing both sides accept.",
    flag: "One side can change the terms by posting them, and silence counts as acceptance.",
  },
  {
    id: "terms-ownership",
    kinds: ["terms"],
    domain: "ip-confidentiality",
    title: "The user keeps the document",
    clean: "Uploading grants a limited licence to process the file, not ownership of it.",
    flag: "The service takes ownership of uploaded contracts or may use them for any purpose.",
  },
  {
    id: "terms-training",
    kinds: ["terms", "privacy"],
    domain: "privacy",
    title: "Training use is stated",
    clean: "The terms say, in plain words, whether uploads are used to train models.",
    flag: "A silent or broad right to train on the uploaded contract.",
  },
  {
    id: "terms-advice",
    kinds: ["terms"],
    domain: "general",
    title: "It does not claim to be a lawyer",
    clean: "A reading product says it is not legal advice and a green result is not a promise the contract is safe to sign.",
    flag: "Claims such as lawyer-approved, legally verified, or guaranteed safe to sign.",
  },
  {
    id: "privacy-share",
    kinds: ["privacy"],
    domain: "privacy",
    title: "Sharing is listed",
    clean: "The policy names what is collected from an upload and who receives it.",
    flag: "No list of recipients, or a right to share the file with anyone.",
  },
  {
    id: "privacy-keep",
    kinds: ["privacy"],
    domain: "privacy",
    title: "Retention and deletion are stated",
    clean: "The policy says how long the file is kept and how to ask for deletion.",
    flag: "Files kept forever, or no way to delete them.",
  },
  {
    id: "general-law",
    kinds: ["other", "vendor-agreement", "mutual-nda", "one-way-nda", "terms"],
    domain: "governing-law",
    title: "The law is named",
    clean: "The clean samples name Ontario and Canadian federal law. Read the law that is actually written.",
    flag: "A clause that bars a claim in the reader's own country, or names no law at all.",
  },
];

export function classifyDocument(text: string): DocumentKind {
  const opening = text.slice(0, 900).toLowerCase();
  const sample = text.slice(0, 5000).toLowerCase();
  if (/\bprivacy policy\b/.test(opening)) return "privacy";
  if (/terms of service|terms and conditions/.test(opening)) return "terms";
  if (/vendor services|services agreement|master service|this vendor/.test(opening)) return "vendor-agreement";
  if (/mutual non-disclosure|mutual confidentiality/.test(opening)) return "mutual-nda";
  if (/one-way|the discloser|disclosing party/.test(opening) && /non-disclosure|confidential/.test(opening)) {
    return "one-way-nda";
  }
  if (/non-disclosure agreement|confidentiality agreement/.test(opening)) return "mutual-nda";
  if (/vendor|services agreement/.test(sample)) return "vendor-agreement";
  if (/\bnda\b|non-disclosure/.test(sample)) return "mutual-nda";
  return "other";
}

export function marksFor(kind: DocumentKind, domain?: AgentId): LearnMark[] {
  return LEARN_MARKS.filter((mark) => {
    const kindMatch = mark.kinds.includes(kind) || (kind === "other" && mark.kinds.includes("other"));
    if (!kindMatch) return false;
    if (!domain) return true;
    return mark.domain === domain || mark.domain === "general";
  });
}

export function learnMarkBrief(kind: DocumentKind, domain?: AgentId): string {
  const marks = marksFor(kind, domain);
  if (marks.length === 0) return "";
  const lines = marks.map((mark) => `- ${mark.title}. Clean: ${mark.clean} Flag: ${mark.flag}`);
  return `Learn mark for a ${KIND_LABEL[kind]}, saved from the example pack. It is a reading aid, not legal advice.\n${lines.join("\n")}`;
}
