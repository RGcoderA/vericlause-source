import { cleanText } from "./clean-text";

export async function extractPdf(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  const { extractText } = await import("unpdf");
  const result = await extractText(new Uint8Array(buffer), { mergePages: true });
  const raw = Array.isArray(result.text) ? result.text.join("\n\n") : result.text;
  return {
    text: cleanText(raw || ""),
    pageCount: result.totalPages || 1,
  };
}
