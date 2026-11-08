import { describe, expect, it } from "vitest";
import { chatProviders } from "@/lib/llm/router";
import { authConnection, authErrorCode, buildAuthorizeUrl, publicOrigin } from "@/lib/auth/authorize";
import { COPY } from "@/lib/i18n/copy";
import { LANGUAGES } from "@/lib/i18n/languages";
import { localizedGuide } from "@/lib/help/faq";
import { micFailure, spokenDraft } from "@/lib/help/speech";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => shape(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape((value as Record<string, unknown>)[key])]));
  }
  return typeof value;
}

describe("interface copy", () => {
  it("gives every language the same fields and a different home title", () => {
    const english = shape(COPY.en);
    for (const language of LANGUAGES) {
      expect(shape(COPY[language.id])).toEqual(english);
      expect(COPY[language.id].faqPage.items.map((item) => item.id)).toEqual(COPY.en.faqPage.items.map((item) => item.id));
      if (language.id !== "en") expect(COPY[language.id].home.title).not.toBe(COPY.en.home.title);
    }
  });

  it("uses Grok when Gemini is unavailable", () => {
    const previous = {
      gemini: process.env.GEMINI_API_KEY,
      grok: process.env.XAI_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
    };
    process.env.GEMINI_API_KEY = "test-gemini";
    process.env.XAI_API_KEY = "test-grok";
    process.env.OPENROUTER_API_KEY = "test-openrouter";
    expect(chatProviders()).toEqual(["gemini", "grok", "openrouter"]);
    delete process.env.GEMINI_API_KEY;
    expect(chatProviders()[0]).toBe("grok");
    process.env.GEMINI_API_KEY = previous.gemini;
    process.env.XAI_API_KEY = previous.grok;
    process.env.OPENROUTER_API_KEY = previous.openrouter;
  });

  it("asks Auth0 for a second step and Google only when requested", () => {
    const url = buildAuthorizeUrl({
      origin: "https://vericlause.example",
      domain: "tenant.example",
      clientId: "client",
      state: "state",
      screen: "signup",
      connection: "google-oauth2",
    });
    expect(url.searchParams.get("acr_values")).toContain("multi-factor");
    expect(url.searchParams.get("screen_hint")).toBe("signup");
    expect(url.searchParams.get("connection")).toBe("google-oauth2");
    expect(url.searchParams.get("redirect_uri")).toBe("https://vericlause.example/api/auth/auth0/callback");
    expect(authConnection("google-oauth2")).toBe("google-oauth2");
    expect(authConnection("windowslive")).toBeUndefined();
    expect(authErrorCode("invalid_request", "The connection is not enabled")).toBe("google");
    const request = new Request("http://internal/login", { headers: { "x-forwarded-host": "app.example", "x-forwarded-proto": "https" } });
    expect(publicOrigin(request)).toBe("https://app.example");
  });

  it("keeps a typed prefix when speech fills the help box", () => {
    expect(spokenDraft("What do", "red amber and green mean?")).toBe("What do red amber and green mean?");
    expect(spokenDraft("", "  Which files   can I upload? ")).toBe("Which files can I upload?");
    expect(spokenDraft("a", "b".repeat(20), 5)).toBe("a bbb");
    expect(micFailure("not-allowed")).toBe("denied");
    expect(micFailure("no-speech")).toBe("ignore");
    expect(micFailure("network")).toBe("failed");
  });

  it("answers a French help starter in French", () => {
    const result = localizedGuide("Que veulent dire rouge, ambre et vert ?", "fr", "verdict");
    expect(result.matched).toBe(true);
    expect(result.reply).toContain("Rouge");
    expect(result.reply).not.toContain("deal-breaker");
  });
});