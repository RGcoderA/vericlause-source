import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { CLEAN_CONTRACT_TEXT } from "@/lib/demo/texts";
import { plainExample } from "@/lib/learn/examples";
import { classifyDocument, learnMarkBrief, marksFor } from "@/lib/learn/mark";

const mutual = `MUTUAL NON-DISCLOSURE AGREEMENT
The Parties wish to discuss a possible partnership.
Confidential Information means non-public information.`;

const oneway = `NON-DISCLOSURE AGREEMENT (ONE-WAY)
The Discloser will share confidential information with the Recipient.`;

const terms = `Terms of Service
VeriClause is a contract reading aid. It is not a law firm.`;

describe("learn mark", () => {
  it("names an NDA, a one-way NDA, and terms of service", () => {
    expect(classifyDocument(mutual)).toBe("mutual-nda");
    expect(classifyDocument(oneway)).toBe("one-way-nda");
    expect(classifyDocument(terms)).toBe("terms");
    expect(classifyDocument(CLEAN_CONTRACT_TEXT)).toBe("vendor-agreement");
  });

  it("gives the mutual NDA a finite term and the terms a training check", () => {
    expect(learnMarkBrief("mutual-nda", "termination").toLowerCase()).toContain("two years");
    expect(marksFor("terms").some((mark) => mark.id === "terms-training")).toBe(true);
  });

  it("keeps the risky answer key out of the file a review can upload", async () => {
    const raw = await readFile("learn/mark/examples/07-risky-vendor.md", "utf8");
    expect(raw.toLowerCase()).not.toContain("answer key");
    expect(plainExample(`${raw}\n# ANSWER KEY\nsecret score`)).not.toContain("secret score");
  });
});
