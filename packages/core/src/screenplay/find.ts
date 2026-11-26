// Find and replace in a script's text, one block at a time (a match never runs
// from one block into the next).
//
// Matching ignores case, since cues and headings are drawn in capitals whatever
// was typed, and finds parts of words ("walk" in "walking"). With wholeWord it
// keeps to whole words, so "Sam" finds "Sam" and "Sam's" but not "Samantha", for
// renaming a character. "Whole" applies only at the query's own edges: a query
// that starts or ends with a space or a mark can sit against anything there.

export type Match = {from: number, to: number};

// a letter or a digit, in any script
const WORD = /[\p{L}\p{N}]/u;
const isWordChar = (char: string | undefined) => char !== undefined && WORD.test(char);

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// where the query falls in the text, as character offsets, none overlapping
export const findIn = (text: string, query: string, {wholeWord = false} = {}): Match[] => {
  if (query === "") return [];
  const pattern = new RegExp(escape(query), "giu");
  const startsWord = wholeWord && isWordChar(query[0]);
  const endsWord = wholeWord && isWordChar(query[query.length - 1]);
  const matches: Match[] = [];
  for (const found of text.matchAll(pattern)) {
    const from = found.index;
    const to = from + found[0].length;
    if (startsWord && isWordChar(text[from - 1])) continue;
    if (endsWord && isWordChar(text[to])) continue;
    matches.push({from, to});
  }
  return matches;
};

// the replacement as it should stand in place of what it replaces: a match in
// capitals (a cue typed as "SAM") takes the replacement in capitals, and a
// capitalised one ("Sam", starting a sentence) takes it capitalised. Anything
// else, and any replacement already holding a capital, goes in as typed
export const fitCase = (replacement: string, matched: string) => {
  const letters = matched.replace(/[^\p{L}]/gu, "");
  if (letters === "" || /\p{Lu}/u.test(replacement)) return replacement;
  if (letters.length > 1 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()) return replacement.toUpperCase();
  const first = letters[0];
  if (first !== first.toLowerCase()) return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  return replacement;
};
