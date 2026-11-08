import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { splitSections } from "@/lib/parsing/split-sections";

const source = readFileSync(
  path.join(__dirname, "fixtures/sample-contract.txt"),
  "utf8"
);

describe("splitSections", () => {
  it("extracts numbered headings including nested 8.2", () => {
    const sections = splitSections(source);
    const numbers = sections.map((section) => section.number);
    expect(numbers).toContain("1");
    expect(numbers).toContain("8.2");
    expect(numbers).toContain("4.2");
    const liability = sections.find((section) => section.number === "8.2");
    expect(liability?.text).toMatch(/shall be unlimited/i);
  });
});
