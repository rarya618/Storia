// screenplay element types, in the order they appear in the type picker
export type ElementType = "heading" | "action" | "character" | "parenthetical" | "dialogue" | "transition"
  | "shot" | "act" | "lyrics" | "note";

export type ScriptBlock = {
  id: string,
  type: ElementType,
  text: string,
};

export const ELEMENTS: {type: ElementType, label: string, shortcut: string}[] = [
  {type: "heading", label: "Scene heading", shortcut: "1"},
  {type: "action", label: "Action", shortcut: "2"},
  {type: "character", label: "Character", shortcut: "3"},
  {type: "parenthetical", label: "Parenthetical", shortcut: "4"},
  {type: "dialogue", label: "Dialogue", shortcut: "5"},
  {type: "transition", label: "Transition", shortcut: "6"},
  {type: "shot", label: "Shot", shortcut: "7"},
  {type: "act", label: "Act break", shortcut: "8"},
  {type: "lyrics", label: "Lyrics", shortcut: "9"},
  {type: "note", label: "Note", shortcut: "0"},
];

// speech: the lines under a character cue, printed without a blank line between them
export const SPEECH: ElementType[] = ["dialogue", "parenthetical", "lyrics"];

// an act break that closes an act ("END OF ACT ONE") rather than opening one
export const closesAct = (block: ScriptBlock) => block.type === "act" && /^\s*end\b/i.test(block.text);

// a note is the writer's own; it never prints and takes no room on the page
export const prints = (type: ElementType) => type !== "note";

// the elements set in capitals. web-new draws them so (text-transform in
// screenplay.css) over the text as typed; mobile's fields can't, so it stores them in capitals
export const CAPITALS: ElementType[] = ["heading", "character", "transition", "shot", "act"];
export const inCapitals = (type: ElementType) => CAPITALS.includes(type);

// text in capitals, letter for letter: a letter whose capital is longer (ß, ŉ)
// stays as it is, so the text keeps its length and a caret in it keeps its place
export const capitalise = (text: string) =>
  Array.from(text, letter => {
    const capital = letter.toUpperCase();
    return capital.length === letter.length ? capital : letter;
  }).join("");

export const elementLabel = (type: ElementType) =>
  ELEMENTS.find(element => element.type === type)?.label ?? type;

export const isElementType = (value: unknown): value is ElementType =>
  ELEMENTS.some(element => element.type === value);
