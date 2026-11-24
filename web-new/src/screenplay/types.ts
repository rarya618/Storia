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

// a note is the writer's own; it never prints and takes no room on the page
export const prints = (type: ElementType) => type !== "note";

export const elementLabel = (type: ElementType) =>
  ELEMENTS.find(element => element.type === type)?.label ?? type;

export const isElementType = (value: unknown): value is ElementType =>
  ELEMENTS.some(element => element.type === value);
