import { ScriptBlock } from "./types";
import { estimatePages } from "./pages";
import { wordCount } from "./structure";

// Draft history: earlier copies of a script, kept beside it so a bad paste, a
// stale tab or a change of heart can be undone after the editor's own undo is
// gone. Before a save overwrites the stored script, the app keeps that stored
// copy as a version: on the first save each time the script is opened, and
// then at most every VERSION_EVERY_MS while writing. This is the pure part:
// what a version records, whether one is worth keeping, and which to let go.

// what the list of versions shows, without the script itself
export type VersionEntry = {
  // when that copy was saved, in ms
  savedAt: number,
  // tells a copy that's already kept from one that isn't
  hash: string,
  pages: number,
  words: number,
};

export const VERSION_EVERY_MS = 10 * 60 * 1000;
// every version from the last two days is kept; before that, the last of each day
export const KEEP_ALL_FOR_MS = 48 * 60 * 60 * 1000;
export const MAX_VERSIONS = 100;

// FNV-1a over each block's element and words; ids are left out, so the same
// script with fresh ids (a paste, an import) counts as the same
export const scriptHash = (blocks: ScriptBlock[]) => {
  let hash = 0x811c9dc5;
  const text = JSON.stringify(blocks.map(block => [block.type, block.text]));
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

export const describeVersion = (blocks: ScriptBlock[], savedAt: number): VersionEntry => ({
  savedAt,
  hash: scriptHash(blocks),
  pages: estimatePages(blocks),
  words: wordCount(blocks),
});

export type Versions = Record<string, VersionEntry>;

export const newestFirst = (versions: Versions) =>
  Object.entries(versions).sort(([, a], [, b]) => b.savedAt - a.savedAt);

// a copy is worth keeping when it has words in it and isn't the newest version already
export const worthKeeping = (versions: Versions, blocks: ScriptBlock[]) => {
  if (!blocks.some(block => block.text.trim() !== "")) return false;
  const newest = newestFirst(versions)[0];
  return !newest || newest[1].hash !== scriptHash(blocks);
};

const dayOf = (ms: number) => new Date(ms).toDateString();

// the versions to let go: all of the last two days stay, then the newest of
// each earlier day, and never more than MAX_VERSIONS in all (the oldest go first)
export const versionsToDrop = (versions: Versions, now: number) => {
  const drop: string[] = [];
  const keptDays = new Set<string>();
  let kept = 0;
  for (const [id, version] of newestFirst(versions)) {
    const recent = now - version.savedAt < KEEP_ALL_FOR_MS;
    const day = dayOf(version.savedAt);
    if (kept >= MAX_VERSIONS || (!recent && keptDays.has(day))) {
      drop.push(id);
      continue;
    }
    keptDays.add(day);
    kept++;
  }
  return drop;
};
