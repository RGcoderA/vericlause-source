import { LIMITS } from "@/config/agents.config";
import { SESSION_COOKIE } from "@/config/constants";
import { cookies, headers } from "next/headers";

const hits = new Map<string, number[]>();
const inflight = new Map<string, { count: number; started: number }>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function canonicalOrigin(value: string): string {
  const url = new URL(value);
  const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  return `${url.protocol}//${host}:${port}`;
}

export function assertSameOrigin(request: Request): void {
  const expected = request.headers.get("x-forwarded-host")
    ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("x-forwarded-host")}`
    : new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin) {
    if (canonicalOrigin(origin) !== canonicalOrigin(expected)) {
      throw new HttpError(403, "Cross-origin requests are not allowed.");
    }
    return;
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "none") return;
  throw new HttpError(403, "Cross-origin requests are not allowed.");
}

export function rateLimit(
  key: string,
  limit = LIMITS.maxReviewsPerWindow,
  windowMs = LIMITS.reviewWindowMs,
  message = "Too many reviews from this client. Wait a few minutes and try again."
) {
  const now = Date.now();
  const existing = (hits.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (existing.length >= limit) {
    throw new HttpError(429, message);
  }
  existing.push(now);
  hits.set(key, existing);
}

export function beginInflight(key: string, max = 2, message = "A review is already running for this session.") {
  const now = Date.now();
  const current = inflight.get(key);
  const count =
    current && now - current.started < LIMITS.pipelineTimeoutMs ? current.count : 0;
  if (count >= max) {
    throw new HttpError(429, message);
  }
  inflight.set(key, { count: count + 1, started: now });
  return () => {
    const latest = inflight.get(key);
    const next = Math.max(0, (latest?.count || 1) - 1);
    if (next === 0) inflight.delete(key);
    else inflight.set(key, { count: next, started: latest?.started || now });
  };
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const fromMiddleware = (await headers()).get("x-vc-session");
  if (fromMiddleware) return fromMiddleware;
  const id = crypto.randomUUID();
  try {
    jar.set(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  } catch {
    // Server Components cannot set cookies; middleware stamps the session.
  }
  return id;
}

export function jsonError(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json({ error: message }, { status: 500 });
}
