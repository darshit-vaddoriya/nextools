/**
 * Line-level LCS diff, shared by the code diff checker and the Word document
 * comparison tool. Kept here rather than inside either tool so the two cannot
 * drift apart on what counts as a change.
 */

export type DiffOpType = 'equal' | 'add' | 'remove';
/** One diff step. `ai`/`bi` index back into the original line arrays (-1 when absent). */
export type DiffOp = { type: DiffOpType; ai: number; bi: number };

/**
 * LCS diff over pre-normalised keys, returning index ops so callers can render the
 * original (non-normalised) text. Identical head/tail are trimmed first, which keeps
 * the O(n*m) table small for the common "few edits in a big file" case.
 */
export function lcsDiff(aKeys: string[], bKeys: string[]): DiffOp[] {
  const ops: DiffOp[] = [];
  let start = 0;
  const maxStart = Math.min(aKeys.length, bKeys.length);
  while (start < maxStart && aKeys[start] === bKeys[start]) start++;
  let endA = aKeys.length;
  let endB = bKeys.length;
  while (endA > start && endB > start && aKeys[endA - 1] === bKeys[endB - 1]) { endA--; endB--; }

  for (let k = 0; k < start; k++) ops.push({ type: 'equal', ai: k, bi: k });

  const a = aKeys.slice(start, endA);
  const b = bKeys.slice(start, endB);
  const n = a.length;
  const m = b.length;

  // Guard against pathological memory use on huge unrelated inputs: fall back to a
  // plain "remove everything, add everything" block instead of allocating the table.
  if (n * m > 6_000_000) {
    for (let i = 0; i < n; i++) ops.push({ type: 'remove', ai: start + i, bi: -1 });
    for (let j = 0; j < m; j++) ops.push({ type: 'add', ai: -1, bi: start + j });
  } else {
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ops.push({ type: 'equal', ai: start + i, bi: start + j }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: 'remove', ai: start + i, bi: -1 }); i++; }
      else { ops.push({ type: 'add', ai: -1, bi: start + j }); j++; }
    }
    while (i < n) { ops.push({ type: 'remove', ai: start + i, bi: -1 }); i++; }
    while (j < m) { ops.push({ type: 'add', ai: -1, bi: start + j }); j++; }
  }

  for (let k = 0; k < aKeys.length - endA; k++) ops.push({ type: 'equal', ai: endA + k, bi: endB + k });
  return ops;
}

