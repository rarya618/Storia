import { ScriptBlock } from "./types";

// "SARAH (V.O.)" and "Sarah" both count as SARAH
export const characterName = (text: string) =>
  text.replace(/\s*\(.*\)\s*$/, "").replace(/\^$/, "").trim().toUpperCase();

// character names used in the script, most frequent first
export const characterNames = (blocks: ScriptBlock[]) => {
  const counts = new Map<string, number>();
  for (const block of blocks) {
    if (block.type !== "character") continue;
    const name = characterName(block.text);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
};

// suggestions for a character cue being typed
export const characterSuggestions = (names: string[], typed: string, limit = 5) => {
  const prefix = typed.trim().toUpperCase();
  if (!prefix) return [];
  return names.filter(name => name.startsWith(prefix) && name !== prefix).slice(0, limit);
};
