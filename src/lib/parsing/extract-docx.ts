import mammoth from "mammoth";
import { cleanText } from "./clean-text";

export async function extractDocx(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  const result = await mammoth.extractRawText({ buffer });
  const text = cleanText(result.value || "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return {
    text,
    pageCount: Math.max(1, Math.round(words / 380)),
  };
}
