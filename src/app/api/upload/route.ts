import { DEMO_FILES } from "@/config/constants";
import { CLEAN_CONTRACT_TEXT, TRAP_CONTRACT_TEXT } from "@/lib/demo/texts";
import { readDemoPdf } from "@/lib/demo/load-demo";
import { assertSameOrigin, clientIp, getSessionId, jsonError, rateLimit } from "@/lib/http";
import { ingestBuffer, ingestText } from "@/lib/parsing/ingest";
import { splitSections } from "@/lib/parsing/split-sections";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(`upload:${clientIp(request)}`, 20);
    const sessionId = await getSessionId();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { demo?: "clean" | "trap" };
      if (body.demo !== "clean" && body.demo !== "trap") {
        return Response.json({ error: "Unknown demo contract." }, { status: 400 });
      }
      try {
        const demo = await readDemoPdf(body.demo);
        const contract = await ingestBuffer({
          buffer: demo.bytes,
          filename: demo.filename,
          mimeType: "application/pdf",
          sessionId,
        });
        return Response.json({
          contractId: contract.id,
          filename: contract.filename,
          pageCount: contract.pageCount,
          sectionCount: contract.sections.length,
        });
      } catch {
        const text = body.demo === "trap" ? TRAP_CONTRACT_TEXT : CLEAN_CONTRACT_TEXT;
        const contract = await ingestText({
          text,
          pageCount: Math.max(3, splitSections(text).length > 12 ? 8 : 6),
          filename: DEMO_FILES[body.demo].filename.replace(".pdf", ".txt"),
          mimeType: "text/plain",
          sessionId,
        });
        return Response.json({
          contractId: contract.id,
          filename: contract.filename,
          pageCount: contract.pageCount,
          sectionCount: contract.sections.length,
        });
      }
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a PDF or DOCX file." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const contract = await ingestBuffer({
      buffer,
      filename: file.name || "contract.pdf",
      mimeType: file.type || "application/octet-stream",
      sessionId,
    });
    return Response.json({
      contractId: contract.id,
      filename: contract.filename,
      pageCount: contract.pageCount,
      sectionCount: contract.sections.length,
    });
  } catch (error) {
    return jsonError(error);
  }
}
