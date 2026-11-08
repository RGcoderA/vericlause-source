import { hasGrokKey } from "@/lib/env";
import { assertSameOrigin, clientIp, jsonError, rateLimit } from "@/lib/http";
import { GROK_VOICE, grokLanguage, spokenForVoice } from "@/lib/speech/grok";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 2000;

async function requestSpeech(text: string, voice: string, language: string, key: string): Promise<Response> {
    const bodies = [
        {
            text,
            voice_id: voice,
            language,
            text_normalization: true,
            output_format: { codec: "mp3", sample_rate: 24000, bit_rate: 128000 },
        },
        { text, voice_id: voice, language },
    ];
    let lastStatus = 502;
    let lastDetail = "Grok voice did not answer.";
    for (const body of bodies) {
        const response = await fetch("https://api.x.ai/v1/tts", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(55_000),
        });
        if (response.ok) return response;
        lastStatus = response.status;
        lastDetail = await response.text();
        if (response.status === 401 || response.status === 403) break;
    }
    return new Response(lastDetail, { status: lastStatus });
}

async function readAudio(response: Response): Promise<{ bytes: Uint8Array; type: string } | null> {
    const type = response.headers.get("content-type") || "";
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength < 32) return null;
    const looksJson = type.includes("json") || bytes[0] === 123;
    if (!looksJson) return { bytes, type: type.includes("audio/") ? type : "audio/mpeg" };
    try {
        const json = JSON.parse(new TextDecoder().decode(bytes)) as { audio?: string; content_type?: string };
        if (!json.audio) return null;
        return { bytes: Uint8Array.from(Buffer.from(json.audio, "base64")), type: json.content_type || "audio/mpeg" };
    } catch {
        return { bytes, type: "audio/mpeg" };
    }
}

export async function POST(request: Request) {
    try {
        assertSameOrigin(request);
        const ip = clientIp(request);
        rateLimit(`speech:${ip}`, 60, 10 * 60 * 1000, "Too many readings from this browser. Wait a few minutes.");
        if (!hasGrokKey()) {
            return Response.json(
                { error: "Grok's voice needs XAI_API_KEY in .env. Add it, then restart the server." },
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

        const voice = process.env.XAI_VOICE?.trim() || GROK_VOICE;
        const language = grokLanguage(typeof body.language === "string" ? body.language : "en");
        const key = process.env.XAI_API_KEY?.trim() || "";
        const response = await requestSpeech(text, voice, language, key);

        if (!response.ok) {
            const detail = (await response.text()).replace(/xai-[A-Za-z0-9_-]+/g, "").slice(0, 160);
            return Response.json({ error: `Grok voice could not start (${response.status}). ${detail}` }, { status: 502 });
        }

        const audio = await readAudio(response);
        if (!audio) return Response.json({ error: "Grok voice returned no audio." }, { status: 502 });
        const copy = new ArrayBuffer(audio.bytes.byteLength);
        new Uint8Array(copy).set(audio.bytes);
        return new Response(copy, {
            headers: {
                "Content-Type": audio.type,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        return jsonError(error);
    }
}