import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEMO_FILES } from "@/config/constants";

export type DemoId = keyof typeof DEMO_FILES;

export async function readDemoPdf(id: DemoId): Promise<{ bytes: Buffer; filename: string }> {
  const filename = DEMO_FILES[id].filename;
  const filePath = path.join(process.cwd(), "public", "demo-contracts", filename);
  const bytes = await readFile(filePath);
  return { bytes, filename };
}
