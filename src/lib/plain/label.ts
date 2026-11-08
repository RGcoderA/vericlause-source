export function plainLabel(value: string): string {
  const stripped = value.replace(/^\d+(?:\.\d+)*\s*[.:)\-]?\s*/, "").replace(/\.+$/g, "").trim();
  const source = stripped || value.replace(/\.+$/g, "").trim();
  if (!source) return value;
  const lower = source.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
