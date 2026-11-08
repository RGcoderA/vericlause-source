export function chunkText(text: string, max = 220): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?。！？])\s+/);
  const chunks: string[] = [];
  let current = "";
  const pushLong = (value: string) => {
    for (let index = 0; index < value.length; index += max) {
      const piece = value.slice(index, index + max).trim();
      if (piece) chunks.push(piece);
    }
  };
  for (const sentence of sentences) {
    if (sentence.length > max) {
      if (current) chunks.push(current);
      current = "";
      pushLong(sentence);
      continue;
    }
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > max) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function spokenScript(parts: { title: string; text: string }[]): string {
  return parts
    .map((part) => [part.title, part.text].filter(Boolean).join(". "))
    .filter((part) => part.trim().length > 0)
    .join(" ");
}
