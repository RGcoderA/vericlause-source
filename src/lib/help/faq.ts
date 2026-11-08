import { faqAnswer } from "@/lib/i18n/copy";
import type { LanguageId } from "@/lib/i18n/languages";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
};

export const FAQ: FaqEntry[] = [
  {
    id: "what",
    question: "What does VeriClause do?",
    answer:
      "VeriClause reviews a vendor contract against your playbook. Six specialists read liability, payment, privacy, termination, IP, and governing law. A code verifier drops any quote it cannot find in the document, and a supervisor returns a Red, Amber, or Green verdict. It is decision support for counsel, not legal advice.",
    tags: ["about", "product", "verdict", "specialists"],
  },
  {
    id: "upload",
    question: "Which files can I upload?",
    answer:
      "Upload a PDF or DOCX with selectable text, up to 4 MB. Scanned pages without a text layer are not read. You can also start from the two Harborline demos: the trap draft plants known problems, and the balanced draft should pass the starter playbook.",
    tags: ["upload", "pdf", "docx", "demo", "file"],
  },
  {
    id: "verdict",
    question: "What do Red, Amber, and Green mean?",
    answer:
      "Red means the draft breaks a rule you treat as a deal-breaker. Amber means a warning that still needs a decision. Green means the enabled rules did not fail. Open a finding and choose Show in contract to jump to the quoted clause.",
    tags: ["red", "amber", "green", "verdict", "severity"],
  },
  {
    id: "verifier",
    question: "How do I know a quote is real?",
    answer:
      "Every finding shows the sentence it relied on. The verifier checks that sentence against the extracted text and attaches a Verified badge with a confidence score. Quotes it cannot locate are dropped and never appear in the report.",
    tags: ["verified", "quote", "hallucination", "confidence", "badge"],
  },
  {
    id: "playbook",
    question: "How do I change a rule?",
    answer:
      "Only a signed-in counsel account can change the playbook. Open Playbook, type a rule in plain English, and compile it. Everyone else can still run reviews against the rules that are already there.",
    tags: ["playbook", "rule", "rerun", "counsel", "auth0"],
  },
  {
    id: "redline",
    question: "What is Suggest fix?",
    answer:
      "On a Red or Amber finding, Suggest fix opens the original clause beside a safer rewrite and a short note you can send the vendor. Treat the rewrite as a starting point for counsel, not a signed clause.",
    tags: ["redline", "rewrite", "suggest", "fix", "negotiate"],
  },
  {
    id: "time",
    question: "How long does a review take?",
    answer:
      "A demo review usually finishes in well under two minutes. Live model reviews take longer than the offline sample reviewers because several specialists read in parallel. The verdict card shows the page count and the time taken.",
    tags: ["time", "slow", "minutes", "speed", "duration"],
  },
  {
    id: "keys",
    question: "Does VeriClause work without API keys?",
    answer:
      "Yes. Without a model key, sample specialists still quote the source and pass the verifier. Gemini is tried first. If it does not answer, the review uses Grok, then OpenRouter. Tiger Data, Auth0, and Supabase are optional.",
    tags: ["api", "key", "gemini", "openrouter", "sample"],
  },
  {
    id: "privacy",
    question: "Where are my contracts stored?",
    answer:
      "During a session, the review stays with that browser session. If Tiger Data is configured, each finished review is also recorded as an event: verdict, duration, and finding counts. Supabase storage is optional and is not required to run a review.",
    tags: ["privacy", "storage", "tiger", "supabase", "data"],
  },
  {
    id: "signin",
    question: "How do I sign in?",
    answer:
      "Choose Sign in, then Continue with email. Continue with Google when this Auth0 application allows it. Auth0 asks for a second step when multi-factor is on. Only an explicit counsel role can edit the playbook. A missing role is treated as business, which can run reviews but cannot change rules.",
    tags: ["sign in", "login", "auth0", "account", "counsel"],
  },
  {
    id: "advice",
    question: "Is this legal advice?",
    answer:
      "No. VeriClause is decision support for a lawyer in the loop. It is not a law firm and it does not replace counsel. Have a lawyer review any rewrite before it is sent or signed.",
    tags: ["legal", "advice", "lawyer", "counsel"],
  },
  {
    id: "plain",
    question: "Where is the plain English translation?",
    answer:
      "Open a finished review and choose Simple terms beside the document. Each section is restated in everyday words. Pick a language and both the simple terms and the document reading change, then use Read simple terms or Read document to listen. This is a reading aid, not a certified translation or legal advice.",
    tags: ["plain", "english", "translation", "language", "audio", "nda", "understand"],
  },
  {
    id: "audio",
    question: "Can I listen to the contract in another language?",
    answer:
      "Yes. On a finished review, choose a language. The reading changes to that language, then use Read document or Read simple terms to listen. Audio plays in that browser. French, Spanish, Portuguese, German, Chinese, Hindi, and Arabic are available along with English. This is a reading aid, not a certified translation or legal advice.",
    tags: ["audio", "listen", "read", "aloud", "speech", "language", "french", "spanish", "translate", "translation"],
  },
  {
    id: "help",
    question: "What can this help chat answer?",
    answer:
      "This chat answers questions about using VeriClause: uploads, verdicts, the verifier, the playbook, redlines, sign-in, and where reviews are stored. It does not review a contract for you. Upload the file from the Review page for that.",
    tags: ["help", "chat", "support", "faq"],
  },
];

const STOP = new Set([
  "the", "and", "for", "you", "your", "this", "that", "with", "from", "are", "not", "can",
  "how", "what", "does", "did", "why", "when", "where", "who", "which", "about", "into",
]);

export function rankFaq(question: string): { entry: FaqEntry; score: number }[] {
  const words = new Set(
    question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP.has(word))
  );
  return FAQ.map((entry) => {
    const haystack = `${entry.question} ${entry.answer} ${entry.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const word of words) {
      if (haystack.includes(word)) score += entry.tags.some((tag) => tag.includes(word)) ? 2 : 1;
    }
    return { entry, score };
  }).sort((left, right) => right.score - left.score);
}

export function guideReply(question: string): { reply: string; matched: boolean; ids: string[] } {
  const ranked = rankFaq(question);
  const best = ranked[0];
  if (!best || best.score < 2) {
    return {
      matched: false,
      ids: [],
      reply:
        "I can help with uploads, Red / Amber / Green verdicts, the verifier, the playbook, redlines, and sign-in. I do not review a contract in this chat. Open FAQ for the full list, or ask one of those topics.",
    };
  }
  const second = ranked[1];
  const ids = [best.entry.id];
  const extra = second && second.score >= 2 && second.entry.id !== best.entry.id ? ` ${second.entry.answer}` : "";
  if (extra) ids.push(second.entry.id);
  return { matched: true, ids, reply: `${best.entry.answer}${extra}` };
}

export function localizedGuide(question: string, language: LanguageId, faqId?: string): { reply: string; matched: boolean } {
  if (faqId) {
    const answer = faqAnswer(language, faqId);
    if (answer) return { reply: answer, matched: true };
  }
  const result = guideReply(question);
  if (!result.matched || language === "en") return { reply: result.reply, matched: result.matched };
  const parts = result.ids.map((id) => faqAnswer(language, id)).filter((item): item is string => Boolean(item));
  return { reply: parts.join(" ") || result.reply, matched: true };
}
