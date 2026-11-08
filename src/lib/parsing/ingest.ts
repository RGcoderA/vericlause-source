import { LIMITS } from "@/config/agents.config";
import { HttpError } from "@/lib/http";
import { extractDocx } from "@/lib/parsing/extract-docx";
import { extractPdf } from "@/lib/parsing/extract-pdf";
import { splitSections } from "@/lib/parsing/split-sections";
import { saveContract } from "@/lib/cache/review-cache";
import { uploadContractFile } from "@/lib/supabase/storage";
import type { Contract } from "@/types/contract";

export async function ingestBuffer(args: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  sessionId: string;
}): Promise<Contract> {
  if (args.buffer.byteLength > LIMITS.maxUploadBytes) {
    throw new HttpError(413, "File is larger than 4 MB.");
  }

  const lower = args.filename.toLowerCase();
  const isPdf = args.mimeType.includes("pdf") || lower.endsWith(".pdf");
  const isDocx =
    args.mimeType.includes("wordprocessingml") ||
    args.mimeType.includes("msword") ||
    lower.endsWith(".docx");

  if (!isPdf && !isDocx) {
    throw new HttpError(415, "Upload a PDF or DOCX contract.");
  }

  const extracted = isPdf ? await extractPdf(args.buffer) : await extractDocx(args.buffer);
  return ingestText({
    text: extracted.text,
    pageCount: extracted.pageCount,
    filename: args.filename,
    mimeType: args.mimeType,
    sessionId: args.sessionId,
    buffer: args.buffer,
  });
}

export async function ingestText(args: {
  text: string;
  pageCount: number;
  filename: string;
  mimeType: string;
  sessionId: string;
  buffer?: Buffer;
}): Promise<Contract> {
  if (!args.text.trim()) {
    throw new HttpError(422, "Could not extract text from that file.");
  }
  if (args.text.length > LIMITS.maxTextChars) {
    throw new HttpError(413, "Contract text is too long for a single review.");
  }

  const contract: Contract = {
    id: crypto.randomUUID(),
    sessionId: args.sessionId,
    filename: args.filename,
    mimeType: args.mimeType,
    pageCount: args.pageCount,
    text: args.text,
    sections: splitSections(args.text),
    createdAt: new Date().toISOString(),
  };

  if (args.buffer) {
    await uploadContractFile(
      `${args.sessionId}/${contract.id}/${args.filename}`,
      args.buffer,
      args.mimeType
    );
  }

  return saveContract(contract);
}
