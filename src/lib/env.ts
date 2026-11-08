export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function hasOpenRouterKey(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export function hasGrokKey(): boolean {
  return Boolean(process.env.XAI_API_KEY?.trim());
}

export function hasLiveLlm(): boolean {
  return hasGeminiKey() || hasOpenRouterKey() || hasGrokKey();
}

export function hasTiger(): boolean {
  return Boolean(process.env.TIGER_DATABASE_URL?.trim());
}

export function hasAuth0(): boolean {
  return Boolean(
    process.env.AUTH0_DOMAIN?.trim() &&
      process.env.AUTH0_CLIENT_ID?.trim() &&
      process.env.AUTH0_CLIENT_SECRET?.trim() &&
      process.env.AUTH0_SECRET?.trim()
  );
}

export function activeModel(): string {
  if (hasGeminiKey()) return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  if (hasOpenRouterKey()) return "openrouter";
  if (hasGrokKey()) return process.env.XAI_MODEL?.trim() || "grok-4.7";
  return "sample";
}

export function hasSupabase(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_ANON_KEY?.trim());
}

export function reviewMode(): "live" | "sample" {
  return hasLiveLlm() ? "live" : "sample";
}
