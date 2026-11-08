export function cleanText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function excerptAround(text: string, index: number, radius = 220): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  let slice = text.slice(start, end).trim();
  if (start > 0) slice = `…${slice}`;
  if (end < text.length) slice = `${slice}…`;
  return slice;
}

export function sentenceContaining(text: string, index: number): string {
  const from = Math.max(0, text.lastIndexOf(".", index) + 1);
  const next = text.indexOf(".", index);
  const to = next === -1 ? Math.min(text.length, index + 280) : next + 1;
  const sentence = text.slice(from, to).replace(/\s+/g, " ").trim();
  if (sentence.length >= 24) return sentence;
  return text.slice(Math.max(0, index - 80), Math.min(text.length, index + 180)).trim();
}
