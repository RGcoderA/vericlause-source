import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { CLEAN_CONTRACT_TEXT, TRAP_CONTRACT_TEXT } from "../src/lib/demo/texts";

async function writePdf(filename: string, title: string, body: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 64;
  const width = pageWidth - margin * 2;
  const fontSize = 11;
  const titleSize = 16;
  const lineHeight = 14;

  const paragraphs = body.split(/\n{2,}/);
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawTitle = () => {
    page.drawText(title, {
      x: margin,
      y,
      size: titleSize,
      font: bold,
      color: rgb(0.07, 0.14, 0.23),
    });
    y -= 28;
  };
  drawTitle();

  const addPage = () => {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  for (const paragraph of paragraphs) {
    const words = paragraph.replace(/\n/g, " ").split(/\s+/).filter(Boolean);
    let line = "";
    const flush = () => {
      if (!line) return;
      if (y < margin + lineHeight) addPage();
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.08, 0.1, 0.12),
      });
      y -= lineHeight;
      line = "";
    };
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, fontSize) > width) {
        flush();
        line = word;
      } else {
        line = next;
      }
    }
    flush();
    y -= 8;
  }

  const bytes = await doc.save();
  const out = path.join(process.cwd(), "public", "demo-contracts", filename);
  await writeFile(out, bytes);
  console.log(`wrote ${out} (${doc.getPageCount()} pages)`);
}

async function main() {
  await mkdir(path.join(process.cwd(), "public", "demo-contracts"), { recursive: true });
  await writePdf(
    "clean-vendor-agreement.pdf",
    "Vendor Services Agreement — balanced form",
    CLEAN_CONTRACT_TEXT
  );
  await writePdf(
    "trap-vendor-agreement.pdf",
    "Vendor Services Agreement — supplier paper",
    TRAP_CONTRACT_TEXT
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
