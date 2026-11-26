import { ElementType, ScriptBlock } from "./types";

// What changed between two copies of a script, for draft history: line by line
// (a block is a line), and within a line that was edited, word by word.

export type Change = "added" | "removed";
export type Segment = {text: string, change?: Change};
export type DiffLine = {
  type: ElementType,
  // added or removed whole, or edited ("changed") with its words marked
  change?: Change | "changed",
  // an edited line's element before, when the edit changed it
  was?: ElementType,
  segments: Segment[],
};

// past this many comparisons the middle of two copies is too different to be
// worth lining up, and counts as removed and added whole
const MAX_CELLS = 4_000_000;

// the pairs of indices (in order) that two lists have in common: their common
// start and end, then the longest common subsequence of what's between
const align = <T>(a: T[], b: T[], same: (x: T, y: T) => boolean): [number, number][] => {
  let start = 0;
  while (start < a.length && start < b.length && same(a[start], b[start])) start++;
  let end = 0;
  while (end < a.length - start && end < b.length - start && same(a[a.length - 1 - end], b[b.length - 1 - end])) end++;

  const pairs: [number, number][] = [];
  for (let i = 0; i < start; i++) pairs.push([i, i]);
  const n = a.length - start - end, m = b.length - start - end;
  if (n > 0 && m > 0 && n * m <= MAX_CELLS) {
    // table[i][j]: the longest common run of a[start + i...] and b[start + j...]
    const width = m + 1;
    const table = new Uint32Array((n + 1) * width);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        table[i * width + j] = same(a[start + i], b[start + j])
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
      }
    }
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (same(a[start + i], b[start + j])) { pairs.push([start + i, start + j]); i++; j++; }
      else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) i++;
      else j++;
    }
  }
  for (let k = end; k > 0; k--) pairs.push([a.length - k, b.length - k]);
  return pairs;
};

// adjacent segments of the same kind run together
const push = (segments: Segment[], text: string, change?: Change) => {
  if (!text) return;
  const last = segments[segments.length - 1];
  if (last && last.change === change) last.text += text;
  else segments.push(change ? {text, change} : {text});
};

// words and the spaces between them, so a diff keeps the line's own spacing
const tokens = (text: string) => text.split(/(\s+)/).filter(token => token !== "");

export const diffWords = (before: string, after: string): Segment[] => {
  const a = tokens(before), b = tokens(after);
  const segments: Segment[] = [];
  let i = 0, j = 0;
  for (const [pi, pj] of [...align(a, b, (x, y) => x === y), [a.length, b.length] as [number, number]]) {
    push(segments, a.slice(i, pi).join(""), "removed");
    push(segments, b.slice(j, pj).join(""), "added");
    if (pi < a.length) push(segments, a[pi]);
    i = pi + 1;
    j = pj + 1;
  }
  return segments;
};

const words = (text: string) => new Set(text.toLowerCase().split(/\s+/).filter(Boolean));

// whether an added line reads as an edit of a removed one: at least half their words shared
const similar = (a: ScriptBlock, b: ScriptBlock) => {
  const x = words(a.text), y = words(b.text);
  if (x.size === 0 || y.size === 0) return x.size === y.size && a.type === b.type;
  let shared = 0;
  for (const word of x) if (y.has(word)) shared++;
  return shared / Math.max(x.size, y.size) >= 0.5;
};

const whole = (block: ScriptBlock, change: Change): DiffLine =>
  ({type: block.type, change, segments: block.text ? [{text: block.text, change}] : []});

// the lines between two unchanged ones: each removed line that an added one
// edits is shown as that edit, the rest as removed or added, in order
const between = (removed: ScriptBlock[], added: ScriptBlock[]): DiffLine[] => {
  const lines: DiffLine[] = [];
  let next = 0;
  for (const old of removed) {
    const match = added.findIndex((block, index) => index >= next && similar(old, block));
    if (match === -1) { lines.push(whole(old, "removed")); continue; }
    for (const block of added.slice(next, match)) lines.push(whole(block, "added"));
    const edit = added[match];
    lines.push({
      type: edit.type,
      change: "changed",
      ...(old.type !== edit.type ? {was: old.type} : {}),
      segments: diffWords(old.text, edit.text),
    });
    next = match + 1;
  }
  for (const block of added.slice(next)) lines.push(whole(block, "added"));
  return lines;
};

// the later copy, line by line, with what the earlier one had marked in it
export const diffScripts = (before: ScriptBlock[], after: ScriptBlock[]): DiffLine[] => {
  const lines: DiffLine[] = [];
  let i = 0, j = 0;
  const pairs = align(before, after, (x, y) => x.type === y.type && x.text === y.text);
  for (const [pi, pj] of [...pairs, [before.length, after.length] as [number, number]]) {
    lines.push(...between(before.slice(i, pi), after.slice(j, pj)));
    if (pj < after.length) lines.push({type: after[pj].type, segments: after[pj].text ? [{text: after[pj].text}] : []});
    i = pi + 1;
    j = pj + 1;
  }
  return lines;
};

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

// how many words a diff adds and removes, and how many lines it touches
export const diffStats = (lines: DiffLine[]) => {
  let added = 0, removed = 0, changedLines = 0;
  for (const line of lines) {
    if (line.change) changedLines++;
    for (const segment of line.segments) {
      if (segment.change === "added") added += countWords(segment.text);
      if (segment.change === "removed") removed += countWords(segment.text);
    }
  }
  return {added, removed, changedLines};
};
