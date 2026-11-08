import { createHash } from "node:crypto";
import { parseJsonPayload } from "@/lib/agents/base-agent";
import { languageById, type LanguageId } from "@/lib/i18n/languages";
import { routedChat } from "@/lib/llm/router";

export type TranslationSection = {
  id: string;
  title: string;
  plain: string;
  document: string;
};

const cache = new Map<string, TranslationSection[]>();
const FIELD_LIMIT = 1400;
const BATCH_LIMIT = 2800;

export function clipField(value: string, max = FIELD_LIMIT): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

export function packSections(sections: TranslationSection[], maxChars = BATCH_LIMIT): TranslationSection[][] {
  const batches: TranslationSection[][] = [];
  let current: TranslationSection[] = [];
  let size = 0;
  for (const section of sections) {
    const weight = section.title.length + section.plain.length + section.document.length;
    if (current.length > 0 && size + weight > maxChars) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(section);
    size += weight;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

export function parseTranslation(raw: string, sources: TranslationSection[]): TranslationSection[] {
  const payload = parseJsonPayload(raw) as { sections?: unknown };
  const rows = Array.isArray(payload.sections) ? payload.sections : [];
  return sources.map((source) => {
    const match = rows.find((row) => {
      if (!row || typeof row !== "object") return false;
      return (row as { id?: unknown }).id === source.id;
    }) as { title?: unknown; plain?: unknown; document?: unknown } | undefined;
    return {
      id: source.id,
      title: textOr(match?.title, source.title),
      plain: textOr(match?.plain, source.plain),
      document: textOr(match?.document, source.document),
    };
  });
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index];
      if (item === undefined) return;
      results[index] = await worker(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

function textOr(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function prepare(sections: TranslationSection[]): TranslationSection[] {
  return sections.slice(0, 40).map((section) => ({
    id: section.id.slice(0, 80),
    title: clipField(section.title, 180),
    plain: clipField(section.plain),
    document: clipField(section.document),
  }));
}

export async function translateReading(
  sections: TranslationSection[],
  languageId: LanguageId
): Promise<TranslationSection[]> {
  const language = languageById(languageId);
  if (!language || language.id === "en") {
    throw new Error("Choose a language other than English.");
  }
  const prepared = prepare(sections).filter((section) => section.plain || section.document);
  if (prepared.length === 0) return [];
  const key = createHash("sha256")
    .update(language.id)
    .update(JSON.stringify(prepared))
    .digest("hex");
  const cached = cache.get(key);
  if (cached) return cached;

  const batches = packSections(prepared);
  const translatedBatches = await mapPool(batches, 3, async (batch) => {
    const content = await routedChat({
      role: "translate",
      maxTokens: 2400,
      messages: [
        {
          role: "system",
          content: [
            "You translate a contract reading aid.",
            'Return only JSON: {"sections":[{"id":"","title":"","plain":"","document":""}]}',
            `Language: ${language.name}.`,
            "Keep every id unchanged.",
            "Translate title, plain, and document.",
            "plain is everyday wording. Keep it everyday.",
            "document is the contract sentence. Translate it faithfully.",
            "Do not add advice, warnings, or section numbers.",
            "Keep names and defined terms that should stay as they are.",
          ].join(" "),
        },
        { role: "user", content: JSON.stringify({ sections: batch }) },
      ],
    });
    return parseTranslation(content, batch);
  });
  const translated = translatedBatches.flat();

  cache.set(key, translated);
  if (cache.size > 40) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  return translated;
}
