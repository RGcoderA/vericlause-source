import { localizedGuide } from "@/lib/help/faq";
import { languageById, type LanguageId } from "@/lib/i18n/languages";
import { assertSameOrigin, clientIp, HttpError, jsonError, rateLimit } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(`help:${clientIp(request)}`, 30, 10 * 60 * 1000);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Ask a short question about VeriClause." }, { status: 400 });
    }
    const question = typeof (body as { question?: unknown }).question === "string"
      ? (body as { question: string }).question.trim()
      : "";
    if (question.length < 2) {
      return Response.json({ error: "Ask a short question about VeriClause." }, { status: 400 });
    }
    if (question.length > 500) {
      return Response.json({ error: "Keep the question under 500 characters." }, { status: 400 });
    }
    const requested = typeof (body as { language?: unknown }).language === "string" ? (body as { language: string }).language : "en";
    const language = (languageById(requested)?.id ?? "en") as LanguageId;
    const faqId = typeof (body as { faqId?: unknown }).faqId === "string" ? (body as { faqId: string }).faqId : undefined;
    const result = localizedGuide(question, language, faqId);
    return Response.json({ reply: result.reply, source: "guide" });
  } catch (error) {
    if (error instanceof HttpError) return jsonError(error);
    return Response.json({ error: "Help is unavailable right now. Open the FAQ page." }, { status: 500 });
  }
}
