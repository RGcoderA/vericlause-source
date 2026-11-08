import type { Playbook, Rule } from "@/types/playbook";

export const DEFAULT_RULES: Rule[] = [
  {
    id: "liability-cap",
    name: "Liability capped at 12 months of fees",
    description:
      "We never accept unlimited liability. Vendor liability must be capped at fees paid in the prior 12 months.",
    domain: "liability",
    severity: "red",
    condition: "liability_cap_months <= 12 and not unlimited",
    keywords: ["unlimited", "liability", "cap", "aggregate", "limitation"],
    patterns: [
      "unlimited\\s+liability",
      "liability[\\s\\S]{0,80}shall be unlimited",
      "no\\s+limitation\\s+of\\s+liability",
    ],
    enabled: true,
  },
  {
    id: "broad-indemnity",
    name: "No indemnity for the vendor's own negligence",
    description:
      "Customer must not indemnify the vendor for the vendor's own negligence or for all claims without limit.",
    domain: "liability",
    severity: "red",
    condition: "no customer indemnity of vendor negligence",
    keywords: ["indemnify", "hold harmless", "negligence", "any and all claims"],
    patterns: [
      "own negligence",
      "any and all claims",
      "indemnify[\\s\\S]{0,60}vendor",
    ],
    enabled: true,
  },
  {
    id: "auto-renewal-notice",
    name: "Auto-renewal requires 30 days' notice",
    description:
      "Automatic renewal is only acceptable if we can opt out with at least 30 days' written notice. Shorter windows are a red flag.",
    domain: "payment",
    severity: "red",
    condition: "non_renewal_notice_days >= 30",
    keywords: ["automatically renews", "auto-renew", "non-renewal", "successive"],
    patterns: [
      "automatically renews[\\s\\S]{0,220}fifteen",
      "automatically renews",
    ],
    enabled: true,
  },
  {
    id: "unilateral-price",
    name: "No surprise fees or unilateral price increases",
    description:
      "Vendor may not add hidden platform fees or raise prices on less than 60 days' notice during a committed term.",
    domain: "payment",
    severity: "amber",
    condition: "no unilateral increase under 60 days; no hidden platform fee",
    keywords: ["increase fees", "platform", "infrastructure fee", "surcharge"],
    patterns: [
      "increase fees",
      "platform infrastructure fee",
      "eight percent",
    ],
    enabled: true,
  },
  {
    id: "eu-data",
    name: "Customer data stays in the EEA",
    description:
      "Personal data must be stored and processed in the EEA or a country with a GDPR adequacy decision. Open-ended 'any jurisdiction' language fails.",
    domain: "privacy",
    severity: "red",
    condition: "data_residency in EEA or adequacy country",
    keywords: [
      "any jurisdiction",
      "stored",
      "processed",
      "adequacy",
      "european economic area",
    ],
    patterns: [
      "any jurisdiction vendor selects",
      "not the subject of an adequacy",
      "stored, processed, and transferred",
    ],
    enabled: true,
  },
  {
    id: "breach-notice",
    name: "Breach notice within 72 hours",
    description:
      "Security incidents involving personal data must be notified within 72 hours. 'Commercially reasonable efforts' is not enough.",
    domain: "privacy",
    severity: "amber",
    condition: "breach_notice_hours <= 72",
    keywords: ["security incident", "breach", "commercially reasonable", "seventy-two"],
    patterns: ["commercially reasonable efforts to notify"],
    enabled: true,
  },
  {
    id: "term-for-convenience",
    name: "Termination for convenience",
    description:
      "We require a right to terminate for convenience on no more than 30 days' notice, plus reasonable exit assistance.",
    domain: "termination",
    severity: "red",
    condition: "termination_for_convenience exists",
    keywords: ["terminate", "convenience", "exit assistance"],
    patterns: [
      "may not terminate this agreement for convenience",
      "terminate this agreement for convenience",
    ],
    enabled: true,
  },
  {
    id: "exit-assist",
    name: "Exit assistance on termination",
    description:
      "Vendor must provide transition assistance for at least 30 days after termination so we are not locked in.",
    domain: "termination",
    severity: "amber",
    condition: "exit_assistance_days >= 30",
    keywords: ["exit assistance", "no obligation", "transition"],
    patterns: ["no obligation to provide exit assistance"],
    enabled: true,
  },
  {
    id: "work-product",
    name: "Customer owns work product",
    description:
      "Deliverables created for us must be owned by the customer on payment. Vendor ownership of work product is a red flag.",
    domain: "ip-confidentiality",
    severity: "red",
    condition: "customer owns work product",
    keywords: ["work product", "owned exclusively", "deliverables", "intellectual property"],
    patterns: [
      "owned exclusively by vendor",
      "perpetual, irrevocable license to use customer data",
    ],
    enabled: true,
  },
  {
    id: "customer-data-license",
    name: "No perpetual license to customer data",
    description:
      "Vendor must not take a perpetual licence to use customer data to improve its products.",
    domain: "ip-confidentiality",
    severity: "amber",
    condition: "no perpetual vendor license to customer data",
    keywords: ["perpetual", "customer data", "improve"],
    patterns: ["perpetual, irrevocable license"],
    enabled: true,
  },
  {
    id: "governing-law",
    name: "Acceptable governing law and venue",
    description:
      "Prefer Delaware or the customer's home courts. Offshore exclusive venues and class-action waivers should be flagged.",
    domain: "governing-law",
    severity: "amber",
    condition: "not offshore exclusive venue; flag class-action waiver",
    keywords: ["cayman", "class action", "arbitration", "delaware", "governing"],
    patterns: [
      "cayman islands",
      "waives any right to participate in a class action",
    ],
    enabled: true,
  },
];

export function createDefaultPlaybook(): Playbook {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    rules: DEFAULT_RULES.map((rule) => ({ ...rule })),
  };
}
