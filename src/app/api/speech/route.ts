import { hasGeminiKey, hasGrokKey } from "@/lib/env";
import { assertSameOrigin, clientIp, jsonError, rateLimit } from "@/lib/http";
import { geminiSpeak } from "@/lib/speech/gemini";
import { grokSpeak, spokenForVoice } from "@/lib/speech/grok";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 2000;

function audioResponse(bytes: Uint8Array, type: string): Response {
    const copy = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(copy).set(bytes);
    return new Response(copy, {
        headers: {
            "Content-Type": type,
            "Cache-Control": "no-store",
        },
    });
}

export async function POST(request: Request) {
    try {
        assertSameOrigin(request);
        const ip = clientIp(request);
        rateLimit(`speech:${ip}`, 60, 10 * 60 * 1000, "Too many readings from this browser. Wait a few minutes.");
        if (!hasGeminiKey() && !hasGrokKey()) {
            return Response.json(
                { error: "Add GEMINI_API_KEY or XAI_API_KEY in the Render environment, then redeploy." },
                { status: 503 }
            );
        }

        let body: { text?: unknown; language?: unknown };
        try {
            body = (await request.json()) as { text?: unknown; language?: unknown };
        } catch {
            return Response.json({ error: "There is nothing to read." }, { status: 400 });
        }
        const text = spokenForVoice(typeof body.text === "string" ? body.text : "");
        if (!text) return Response.json({ error: "There is nothing to read." }, { status: 400 });
        if (text.length > MAX_CHARS) {
            return Response.json({ error: "That passage is too long to read in one piece." }, { status: 400 });
        }

        const language = typeof body.language === "string" ? body.language : "en";
        const errors: string[] = [];
        if (hasGeminiKey()) {
            try {
                const audio = await geminiSpeak(text, language);
                return audioResponse(audio.bytes, audio.type);
            } catch (error) {
                errors.push(error instanceof Error ? error.message : "Gemini voice failed.");
            }
        }
        if (hasGrokKey()) {
            try {
                const audio = await grokSpeak(text, language);
                return audioResponse(audio.bytes, audio.type);
            } catch (error) {
                errors.push(error instanceof Error ? error.message : "Grok voice failed.");
            }
        }
        return Response.json({ error: errors.at(-1) || "Reading did not start. Try again." }, { status: 502 });
    } catch (error) {
        return jsonError(error);
    }
}