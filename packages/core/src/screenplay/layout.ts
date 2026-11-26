import { ElementType, SPEECH, ScriptBlock, capitalise, closesAct, inCapitals, prints } from "./types";

// The script set on pages the way a screenplay prints: 12pt Courier at 10
// characters an inch and 6 lines an inch, on US Letter with a 1.5in left margin
// and 1in on the other three sides, so a page holds 54 lines of 60 characters.
// This is the layout the PDF draws; it's pure, so any app can draw it.

export const PAGE_LINES = 54;
export const PAGE_WIDTH = 60;

export type Align = "left" | "center" | "right";

// one printed line: its words, where it sits on the 60-character line (indent
// and width in characters) and how it's set. block is the script block it came from
export type Line = {
  text: string,
  indent: number,
  width: number,
  align: Align,
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
  block?: string,
};

// a page's lines from the top of its 54, where null is a blank line
export type Page = {number: number, lines: (Line | null)[]};

// how each element sits on the line, as screenplay.css sets it on screen
type Setting = {indent: number, width: number, align: Align, before: number, bold?: boolean, italic?: boolean, underline?: boolean};

const SETTINGS: Record<ElementType, Setting> = {
  heading: {indent: 0, width: 60, align: "left", before: 2, bold: true},
  action: {indent: 0, width: 60, align: "left", before: 1},
  character: {indent: 22, width: 38, align: "left", before: 1},
  parenthetical: {indent: 16, width: 24, align: "left", before: 0},
  dialogue: {indent: 10, width: 35, align: "left", before: 0},
  transition: {indent: 0, width: 60, align: "right", before: 1},
  shot: {indent: 0, width: 60, align: "left", before: 1},
  act: {indent: 0, width: 60, align: "center", before: 2, underline: true},
  lyrics: {indent: 10, width: 35, align: "left", before: 0, italic: true},
  note: {indent: 0, width: 60, align: "left", before: 1},
};

// the fewest lines a block split across a page leaves on either side of the break
const SPLIT_MIN = 2;

// a line of text broken into lines of at most width characters, at spaces
// where it can be, through a word longer than the line where it can't. A line
// the writer left empty stays as a blank line
export const wrap = (text: string, width: number): string[] =>
  text.split("\n").flatMap(paragraph => {
    const lines: string[] = [];
    let line = "";
    for (const word of paragraph.split(" ")) {
      const next = line === "" ? word : line + " " + word;
      if (next.length <= width) { line = next; continue; }
      if (line !== "") lines.push(line.trimEnd());
      let rest = word;
      while (rest.length > width) { lines.push(rest.slice(0, width)); rest = rest.slice(width); }
      line = rest;
    }
    lines.push(line.trimEnd());
    return lines;
  });

const linesOf = (block: ScriptBlock, text = block.text): Line[] => {
  const {indent, width, align, bold, italic, underline} = SETTINGS[block.type];
  const shown = inCapitals(block.type) ? capitalise(text) : text;
  return wrap(shown.trim(), width).map(words => ({
    text: words, indent, width, align, block: block.id,
    ...(bold ? {bold} : {}), ...(italic ? {italic} : {}), ...(underline ? {underline} : {}),
  }));
};

// what the layout places: a run of lines kept or broken as one. A speech is a
// cue with the parentheticals, dialogue and lyrics under it
type Unit =
  | {kind: "speech", before: number, cue: Line[], name: string, parts: {type: ElementType, lines: Line[]}[]}
  | {kind: "block", before: number, type: ElementType, lines: Line[], opensAct: boolean};

const unitsOf = (blocks: ScriptBlock[]): Unit[] => {
  const units: Unit[] = [];
  for (const block of blocks.filter(block => block.text.trim() !== "" && prints(block.type))) {
    const last = units[units.length - 1];
    if (SPEECH.includes(block.type) && last?.kind === "speech") {
      last.parts.push({type: block.type, lines: linesOf(block)});
    } else if (block.type === "character") {
      // the cue as the next page repeats it, without an extension it already has
      const name = capitalise(block.text.trim()).replace(/\s*\(CONT'D\)\s*$/, "");
      units.push({kind: "speech", before: SETTINGS.character.before, cue: linesOf(block), name, parts: []});
    } else {
      units.push({kind: "block", before: SETTINGS[block.type].before, type: block.type, lines: linesOf(block), opensAct: block.type === "act" && !closesAct(block)});
    }
  }
  return units;
};

const unitHeight = (unit: Unit) => unit.kind === "speech"
  ? unit.cue.length + unit.parts.reduce((total, part) => total + part.lines.length, 0)
  : unit.lines.length;

// the lines a unit has to bring onto a page with it: a heading or a shot
// doesn't end a page, so it needs the start of what follows it
const keepWith = (unit: Unit, next: Unit | undefined) => {
  if (unit.kind !== "block" || (unit.type !== "heading" && unit.type !== "shot") || !next) return 0;
  const firstLines = next.kind === "speech" ? next.cue.length + Math.min(SPLIT_MIN, next.parts[0]?.lines.length ?? 0) : Math.min(SPLIT_MIN, next.lines.length);
  return next.before + firstLines;
};

export const layOut = (blocks: ScriptBlock[]): Page[] => {
  const pages: Page[] = [];
  let lines: (Line | null)[] = [];
  const newPage = () => {
    pages.push({number: pages.length + 1, lines});
    lines = [];
  };
  const room = () => PAGE_LINES - lines.length;
  // the blank lines before a unit, which a page's first line goes without
  const blanks = (before: number): null[] => Array(lines.length === 0 ? 0 : before).fill(null);
  const add = (more: (Line | null)[]) => { lines.push(...more); };

  // a run of lines that may break between any two, leaving at least two on
  // each page; false, with nothing placed, when it can't start on this page
  const placeLines = (run: Line[], before: number): boolean => {
    const fits = room() - blanks(before).length;
    if (run.length <= fits) {
      add([...blanks(before), ...run]);
      return true;
    }
    const take = Math.min(fits, run.length - SPLIT_MIN);
    if (take < SPLIT_MIN) return false;
    add([...blanks(before), ...run.slice(0, take)]);
    newPage();
    return placeLines(run.slice(take), 0);
  };

  // a speech breaks between its lines with (MORE) under the last one on the
  // page and the cue again, with (CONT'D), over the rest; never just after a
  // parenthetical, and leaving at least two lines on each page
  const placeSpeech = (head: Line[], speech: {line: Line, type: ElementType}[], before: number, name: string): boolean => {
    const fits = room() - blanks(before).length - head.length;
    if (speech.length <= fits) {
      add([...blanks(before), ...head, ...speech.map(item => item.line)]);
      return true;
    }
    let take = Math.min(fits - 1, speech.length - SPLIT_MIN);
    while (take >= SPLIT_MIN && speech[take - 1].type === "parenthetical") take--;
    if (take < SPLIT_MIN) {
      if (lines.length > 0) return false;
      // a page too short even for this: take what fits
      take = Math.max(1, fits - 1);
    }
    const cue = head[head.length - 1];
    add([...blanks(before), ...head, ...speech.slice(0, take).map(item => item.line), {...cue, text: "(MORE)"}]);
    newPage();
    const contd = wrap(name + " (CONT'D)", SETTINGS.character.width).map(text => ({...cue, text}));
    return placeSpeech(contd, speech.slice(take), 0, name);
  };

  const place = (unit: Unit): boolean => unit.kind === "speech"
    ? placeSpeech(unit.cue, unit.parts.flatMap(part => part.lines.map(line => ({line, type: part.type}))), unit.before, unit.name)
    : placeLines(unit.lines, unit.before);

  const units = unitsOf(blocks);
  units.forEach((unit, index) => {
    // an act starts a page
    if (unit.kind === "block" && unit.opensAct && lines.length > 0) newPage();

    if (blanks(unit.before).length + unitHeight(unit) + keepWith(unit, units[index + 1]) <= room()) {
      add([...blanks(unit.before), ...(unit.kind === "speech" ? [...unit.cue, ...unit.parts.flatMap(part => part.lines)] : unit.lines)]);
      return;
    }
    // action and speech may break here; anything else, or what can't, starts the next page
    const breaks = unit.kind === "speech" || unit.type === "action";
    if (breaks && lines.length > 0 && place(unit)) return;
    if (lines.length > 0) newPage();
    place(unit);
  });

  if (lines.length > 0) newPage();
  return pages;
};

// the title page's lines, from the top of its 54: the title in capitals, then
// Written by and the author, the whole set in the middle of the page
export const layOutTitle = (title: string, author?: string): (Line | null)[] => {
  const centred = (text: string): Line[] => wrap(text, PAGE_WIDTH).map(words => ({text: words, indent: 0, width: PAGE_WIDTH, align: "center" as const}));
  const set: (Line | null)[] = [
    ...centred(capitalise(title.trim() || "Untitled")),
    ...(author?.trim() ? [null, null, ...centred("Written by"), null, ...centred(author.trim())] : []),
  ];
  const top = Math.max(0, Math.floor((PAGE_LINES - set.length) / 2));
  return [...Array(top).fill(null), ...set];
};
