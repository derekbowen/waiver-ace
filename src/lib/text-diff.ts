export type DiffOp = "equal" | "add" | "remove";

export interface DiffLine {
  op: DiffOp;
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

/**
 * Line-level diff using a standard LCS table.
 * Inputs are template bodies (typically a few hundred lines), so O(n*m) is fine.
 */
export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = (oldText || "").split("\n");
  const b = (newText || "").split("\n");

  const n = a.length;
  const m = b.length;
  // lcs[i][j] = length of LCS of a[i..], b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ op: "equal", text: a[i], oldLine: i + 1, newLine: j + 1 });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ op: "remove", text: a[i], oldLine: i + 1, newLine: null });
      i++;
    } else {
      out.push({ op: "add", text: b[j], oldLine: null, newLine: j + 1 });
      j++;
    }
  }
  while (i < n) out.push({ op: "remove", text: a[i], oldLine: ++i, newLine: null });
  while (j < m) out.push({ op: "add", text: b[j], oldLine: null, newLine: ++j });

  return out;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export function diffStats(lines: DiffLine[]): DiffStats {
  return lines.reduce<DiffStats>(
    (acc, l) => {
      if (l.op === "add") acc.added++;
      else if (l.op === "remove") acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 },
  );
}

/** Collapse long runs of unchanged lines, keeping `context` lines around each change. */
export function collapseUnchanged(
  lines: DiffLine[],
  context = 3,
): Array<DiffLine | { op: "skip"; count: number }> {
  const keep = new Array(lines.length).fill(false);
  lines.forEach((l, idx) => {
    if (l.op === "equal") return;
    for (let k = Math.max(0, idx - context); k <= Math.min(lines.length - 1, idx + context); k++) {
      keep[k] = true;
    }
  });

  const out: Array<DiffLine | { op: "skip"; count: number }> = [];
  let skipped = 0;
  lines.forEach((l, idx) => {
    if (keep[idx]) {
      if (skipped > 0) {
        out.push({ op: "skip", count: skipped });
        skipped = 0;
      }
      out.push(l);
    } else {
      skipped++;
    }
  });
  if (skipped > 0) out.push({ op: "skip", count: skipped });
  return out;
}
