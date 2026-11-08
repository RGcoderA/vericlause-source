import { cookies } from "next/headers";

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  role: "counsel" | "business";
};

const COOKIE = "vc_user";

function bytesToBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function writeAuthCookie(user: AuthUser): Promise<void> {
  const secret = process.env.AUTH0_SECRET?.trim();
  if (!secret) return;
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const token = `${payload}.${await hmac(payload, secret)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function readAuthUser(): Promise<AuthUser | null> {
  const secret = process.env.AUTH0_SECRET?.trim();
  if (!secret) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = await hmac(payload, secret);
  if (expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  if (mismatch !== 0) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthUser;
    if (!parsed.email || (parsed.role !== "counsel" && parsed.role !== "business")) return null;
    return parsed;
  } catch {
    return null;
  }
}
