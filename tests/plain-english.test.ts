import { describe, expect, it } from "vitest";
import { toPlainEnglish } from "@/lib/plain/explain";

describe("toPlainEnglish", () => {
  it("turns common contract phrases into everyday words", () => {
    const plain = toPlainEnglish(
      "Vendor shall indemnify and hold harmless Customer for consequential damages."
    );
    expect(plain.toLowerCase()).toContain("must cover the other side's losses");
    expect(plain.toLowerCase()).toContain("indirect losses");
    expect(plain.toLowerCase()).not.toContain("shall");
  });
});
