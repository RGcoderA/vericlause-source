import { TOKEN_CAPS } from "@/config/agents.config";
import { completeJson } from "@/lib/agents/base-agent";
import { hasLiveLlm } from "@/lib/env";
import { redlineOutputSchema } from "@/lib/playbook/rule-schema";
import { redlineSystemPrompt, redlineUserPrompt } from "@/lib/prompts/redline.prompt";
import type { Finding } from "@/types/finding";
import type { Rule } from "@/types/playbook";

const TEMPLATES: Record<string, { rewrite: string; note: string }> = {
  "liability-cap": {
    rewrite:
      "Vendor's aggregate liability arising out of or relating to this Agreement shall not exceed the fees paid by Customer during the twelve (12) months immediately preceding the claim. The cap does not apply to fraud, willful misconduct, or infringement of Customer's intellectual property.",
    note: "Ask for a 12-month fee cap as the default. Carve-outs for fraud and IP are market; resist unlimited liability even for indemnity.",
  },
  "broad-indemnity": {
    rewrite:
      "Each party shall indemnify the other solely for third-party intellectual property claims arising from the indemnifying party's materials. Neither party shall indemnify the other for the other party's negligence or willful misconduct.",
    note: "Mutual IP indemnity is standard. A customer indemnity for the vendor's negligence is not — delete it.",
  },
  "auto-renewal-notice": {
    rewrite:
      "Upon expiration of the Initial Term, this Agreement shall renew for successive twelve (12) month periods unless either party gives written notice of non-renewal at least sixty (60) days before the then-current term ends.",
    note: "Fifteen days is a trap. Sixty days is workable; thirty is the floor in the playbook.",
  },
  "unilateral-price": {
    rewrite:
      "Fees are fixed for the Initial Term. Any increase for a renewal term requires ninety (90) days' prior written notice and shall not exceed three percent (3%). No platform, infrastructure, or similar surcharge shall apply unless set out in an Order Form signed by Customer.",
    note: "Kill the 8% platform fee and the 10-day unilateral increase. Price protection for the committed term is a normal ask.",
  },
  "eu-data": {
    rewrite:
      "Customer Data shall be stored and processed solely in the European Economic Area or in a country subject to an adequacy decision under GDPR Article 45. Vendor shall not transfer Customer Data elsewhere without Customer's prior written consent and a valid transfer mechanism.",
    note: "Residency plus named subprocessors is the ask. 'Any jurisdiction Vendor selects' should come out entirely.",
  },
  "breach-notice": {
    rewrite:
      "Vendor shall notify Customer of a personal data breach without undue delay and in any event within seventy-two (72) hours of becoming aware of it, including the nature of the incident, likely consequences, and measures taken.",
    note: "Replace 'commercially reasonable efforts' with a 72-hour clock. This tracks GDPR Article 33.",
  },
  "term-for-convenience": {
    rewrite:
      "Customer may terminate this Agreement for convenience upon thirty (30) days' written notice. Upon termination, Vendor shall provide reasonable exit assistance for up to ninety (90) days at its then-current professional services rates.",
    note: "Without a convenience right you are locked in. Pair it with exit assistance so switching vendors is actually possible.",
  },
  "work-product": {
    rewrite:
      "All work product created specifically for Customer under this Agreement shall be owned by Customer upon payment. Vendor retains ownership of its pre-existing tools and grants Customer a non-exclusive licence to use them as needed to use the deliverables.",
    note: "Customer-owned deliverables, vendor-owned tooling. Do not accept a perpetual licence over Customer Data.",
  },
  "customer-data-license": {
    rewrite:
      "Vendor shall not use Customer Data to train or improve its products except as aggregated, de-identified data that cannot reasonably identify Customer, and only if Customer has not opted out in writing.",
    note: "A perpetual licence to Customer Data is a privacy and commercial giveaway. Opt-out plus de-identification is a common compromise.",
  },
  "governing-law": {
    rewrite:
      "This Agreement is governed by the laws of the State of Delaware, excluding conflict-of-law rules. The parties may bring claims in a court of competent jurisdiction. Neither party waives any right to participate in a class action.",
    note: "Cayman plus a class-action waiver plus exclusive offshore arbitration stacks the deck. Delaware with court access is a fair reset.",
  },
};

export async function suggestRedline(args: {
  finding: Finding;
  rule?: Rule;
}): Promise<{ original: string; rewrite: string; note: string }> {
  const template = TEMPLATES[args.finding.ruleId];
  const fallback = template ?? {
    rewrite: `${args.finding.quote}\n\n[Proposed: ${args.finding.recommendation}]`,
    note: args.finding.recommendation,
  };

  if (!hasLiveLlm()) {
    return { original: args.finding.quote, ...fallback };
  }

  try {
    const output = await completeJson({
      role: "redline",
      system: redlineSystemPrompt(),
      user: redlineUserPrompt({
        title: args.finding.title,
        summary: args.finding.summary,
        quote: args.finding.quote,
        recommendation: args.finding.recommendation,
        rule: args.rule?.description || args.finding.ruleId,
      }),
      schema: redlineOutputSchema,
      maxTokens: TOKEN_CAPS.redlineOutput,
    });
    return {
      original: args.finding.quote,
      rewrite: output.rewrite || fallback.rewrite,
      note: output.note || fallback.note,
    };
  } catch {
    return { original: args.finding.quote, ...fallback };
  }
}
