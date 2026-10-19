/**
 * Fill a waiver template with booking details. Any placeholder without a value
 * is removed, and label rows that end up empty (e.g. "Booking ID:") are dropped,
 * so guests never see raw {{tags}}.
 */
export function renderWaiverTemplate(
  content: string,
  payload: Record<string, unknown>,
  extras: Record<string, string | null | undefined> = {},
): string {
  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (v !== null && v !== undefined && String(v).trim() !== "") values[k] = String(v);
  }
  for (const [k, v] of Object.entries(extras)) {
    if (v !== null && v !== undefined && String(v).trim() !== "") values[k] = String(v);
  }

  const lines = content.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const hadTag = /\{\{\s*[\w.]+\s*\}\}/.test(line);
    const filled = line.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => values[key] ?? "");
    // Drop "Label:" rows whose only content was an empty placeholder.
    if (hadTag && /^\s*[^:]{1,40}:\s*$/.test(filled)) continue;
    if (hadTag && filled.trim() === "") continue;
    out.push(filled.replace(/\(\s*\)/g, "").replace(/[ \t]{2,}/g, " "));
  }
  return out.join("\n");
}
