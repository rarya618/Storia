import { ELEMENTS, ElementType } from "./types";

// Enter at the end of a block with text: the type of the new block
export const typeAfterEnter = (type: ElementType): ElementType => {
  switch (type) {
    case "heading": return "action";
    case "character": return "dialogue";
    case "parenthetical": return "dialogue";
    case "dialogue": return "character";
    case "transition": return "heading";
    default: return "action";
  }
};

// Enter on an empty block switches its type instead of adding a block
export const typeOnEmptyEnter = (type: ElementType): ElementType => {
  switch (type) {
    case "action": return "heading";
    case "heading": return "action";
    case "character": return "action";
    case "parenthetical": return "dialogue";
    case "dialogue": return "action";
    case "transition": return "heading";
  }
};

// Tab cycles the current block's type
export const typeAfterTab = (type: ElementType): ElementType => {
  switch (type) {
    case "character": return "transition";
    case "dialogue": return "parenthetical";
    case "parenthetical": return "dialogue";
    case "transition": return "action";
    default: return "character";
  }
};

// Shift+Tab steps back through the type list
export const typeBefore = (type: ElementType): ElementType => {
  const index = ELEMENTS.findIndex(element => element.type === type);
  return ELEMENTS[(index - 1 + ELEMENTS.length) % ELEMENTS.length].type;
};

// Backspace on an empty block: a softer type to fall back to, or null to delete the block
export const typeOnEmptyBackspace = (type: ElementType): ElementType | null => {
  switch (type) {
    case "character": return "action";
    case "parenthetical": return "dialogue";
    case "transition": return "character";
    default: return null;
  }
};

// typing INT. / EXT. / EST. / I/E. at the start of an action line makes it a scene heading
export const looksLikeHeading = (text: string) =>
  /^(int|ext|est|i\/e|int\.\/ext)\.\s?$/i.test(text);

// keep parentheses consistent when moving in and out of parentheticals
export const textForType = (text: string, from: ElementType, to: ElementType) => {
  if (to === "parenthetical" && from !== "parenthetical") {
    const trimmed = text.trim();
    return trimmed.startsWith("(") ? trimmed : "(" + trimmed + ")";
  }
  if (from === "parenthetical" && to !== "parenthetical") {
    return text.replace(/^\(/, "").replace(/\)$/, "");
  }
  return text;
};
