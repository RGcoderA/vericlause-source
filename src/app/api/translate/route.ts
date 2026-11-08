import { languageById, type LanguageId } from "@/lib/i18n/languages";
import { translateReading, type TranslationSection } from "@/lib/i18n/translate";
import { assertSameOrigin, beginInflight, clientIp, HttpError, jsonError, rateLimit } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  let release: (() => void) | undefined;
  try {
    assertSameOrigin(request);
    const ip = clientIp(request);
    rateLimit(
      `translate:${ip}`,
      8,
      10 * 60 * 1000,
      "Too many translations from this browser. Wait a few minutes."
    );
    release = beginInflight(`translate:${ip}`, 3, "A translation is already running.");
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 80_000) {
      return Response.json({ error: "That document is too long to translate here." }, { status: 400 });
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Choose a language and try again." }, { status: 400 });
    }
    const languageId = typeof (body as { language?: unknown }).language === "string"
      ? (body as { language: string }).language
      : "";
    const language = languageById(languageId);
    if (!language || language.id === "en") {
      return Response.json({ error: "Choose a language other than English." }, { status: 400 });
    }
    const rawSections = (body as { sections?: unknown }).sections;
    if (!Array.isArray(rawSections) || rawSections.length === 0) {
      return Response.json({ error: "There is nothing to translate." }, { status: 400 });
    }
    const sections = rawSections.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as { id?: unknown; title?: unknown; plain?: unknown; document?: unknown };
      if (typeof row.id !== "string" || !row.id.trim()) return [];
      const section: TranslationSection = {
        id: row.id,
        title: typeof row.title === "string" ? row.title : "",
        plain: typeof row.plain === "string" ? row.plain : "",
        document: typeof row.document === "string" ? row.document : "",
      };
      return [section];
    });
    if (sections.length === 0) {
      return Response.json({ error: "There is nothing to translate." }, { status: 400 });
    }
    const translated = await translateReading(sections, language.id as LanguageId);
    return Response.json({ language: language.id, sections: translated });
  } catch (error) {
    if (error instanceof HttpError) return jsonError(error);
    return Response.json(
      { error: "That language could not be loaded. English is still here." },
      { status: 502 }
    );
  } finally {
    release?.();
  }
}
