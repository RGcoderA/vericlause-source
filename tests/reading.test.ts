import { describe, expect, it } from "vitest";
import { guideReply } from "@/lib/help/faq";
import { LANGUAGES } from "@/lib/i18n/languages";
import { packSections, parseTranslation, type TranslationSection } from "@/lib/i18n/translate";
import { chunkText, spokenScript } from "@/lib/speech/chunks";
import { speechBudget, speechFailure } from "@/lib/speech/playback";

const source: TranslationSection[] = [
  {
    id: "s1",
    title: "Payment",
    plain: "Customer must pay within thirty days.",
    document: "Customer shall pay within thirty (30) days.",
  },
];

describe("reading aids", () => {
  it("keeps a language voice for each choice", () => {
    expect(new Set(LANGUAGES.map((language) => language.id)).size).toBe(LANGUAGES.length);
    expect(LANGUAGES.find((language) => language.id === "fr")?.speech).toBe("fr-CA");
    expect(LANGUAGES.find((language) => language.id === "ar")?.dir).toBe("rtl");
  });

  it("splits spoken text into short pieces", () => {
    const chunks = chunkText("Pay within thirty days. Keep the data private. End the contract with notice.");
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join(" ")).toContain("thirty days");
    expect(chunks.every((chunk) => chunk.length <= 220)).toBe(true);
  });

  it("builds a script from titles and text", () => {
    expect(spokenScript([{ title: "Payment", text: "Pay within thirty days." }])).toContain("Payment");
  });

  it("parses a translation and keeps the source when a field is missing", () => {
    const parsed = parseTranslation(
      JSON.stringify({
        sections: [{ id: "s1", title: "Pago", plain: "El cliente debe pagar en treinta días.", document: "" }],
      }),
      source
    );
    expect(parsed[0]?.title).toBe("Pago");
    expect(parsed[0]?.plain).toContain("treinta");
    expect(parsed[0]?.document).toBe(source[0]?.document);
  });

  it("packs long sections into more than one batch", () => {
    const sections = Array.from({ length: 4 }, (_, index) => ({
      id: `s${index}`,
      title: "Term",
      plain: "word ".repeat(400),
      document: "word ".repeat(400),
    }));
    expect(packSections(sections).length).toBeGreaterThan(1);
  });

  it("keeps reading when Chrome interrupts a chunk, and retries a failed start", () => {
    expect(speechFailure("interrupted")).toBe("ignore");
    expect(speechFailure("canceled")).toBe("ignore");
    expect(speechFailure("synthesis-failed")).toBe("retry");
    expect(speechFailure("not-allowed")).toBe("stop");
    expect(speechBudget("Pay within thirty days.")).toBe(5000);
    expect(speechBudget("x".repeat(5000))).toBe(25000);
  });

  it("answers a question about listening in another language", () => {
    const result = guideReply("Can I listen to the contract in French?");
    expect(result.matched).toBe(true);
    expect(result.reply.toLowerCase()).toContain("read document");
  });
});
