import {
  looksLikeHeading, textForType, typeAfterEnter, typeAfterTab,
  typeOnEmptyBackspace, typeOnEmptyEnter,
} from "@storia/core/screenplay/flow";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";

// The web editor's keys (web-new's screenplay/editor/commands.ts), as changes
// to a list of blocks: on the phone each block is its own text field, so Enter
// and Backspace move between fields where the web editor moves inside one
// document. Each returns the next list and where the caret goes.

export type Caret = {id: string, at: number};
export type Change = {blocks: ScriptBlock[], caret: Caret};
export type Typed = {blocks: ScriptBlock[], caret: Caret | null};

const ID_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const newId = () =>
  Array.from({length: 8}, () => ID_CHARACTERS[Math.floor(Math.random() * ID_CHARACTERS.length)]).join("");

const replace = (blocks: ScriptBlock[], index: number, ...next: ScriptBlock[]) =>
  [...blocks.slice(0, index), ...next, ...blocks.slice(index + 1)];

// the block at index becomes another element; its text follows the element (a
// parenthetical gains or loses its brackets) and the caret keeps its place in the words
export const setType = (blocks: ScriptBlock[], index: number, to: ElementType, caret: number): Change => {
  const block = blocks[index];
  const text = textForType(block.text, block.type, to);
  const shift = text.startsWith("(") && !block.text.startsWith("(") ? 1
    : block.text.startsWith("(") && !text.startsWith("(") ? -1 : 0;
  return {
    blocks: replace(blocks, index, {...block, type: to, text}),
    caret: {id: block.id, at: Math.max(0, Math.min(caret + shift, text.length))},
  };
};

// Tab (the element bar's cycle button, or a hardware keyboard's Tab)
export const cycleType = (blocks: ScriptBlock[], index: number, caret: number) =>
  setType(blocks, index, typeAfterTab(blocks[index].type), caret);

// Enter: on an empty block, change its element; otherwise split it at the caret,
// the new block taking the element that follows. Just inside a parenthetical's
// closing bracket, it finishes the parenthetical instead of splitting the bracket off
export const enter = (blocks: ScriptBlock[], index: number, at: number): Change => {
  const block = blocks[index];
  if (block.text.trim() === "") return setType(blocks, index, typeOnEmptyEnter(block.type), 0);
  if (block.type === "parenthetical" && block.text.slice(at) === ")") at = block.text.length;
  const next: ScriptBlock = {id: newId(), type: typeAfterEnter(block.type), text: block.text.slice(at)};
  return {
    blocks: replace(blocks, index, {...block, text: block.text.slice(0, at)}, next),
    caret: {id: next.id, at: 0},
  };
};

// Backspace at the very start of a block: an empty block falls back to a softer
// element or goes, the caret moving to the end of the block before (or the start
// of the one after); a block with text joins the one before it, which keeps its
// element. Null when there's nothing to do (the first block, or the only one)
export const backspaceAtStart = (blocks: ScriptBlock[], index: number): Change | null => {
  const block = blocks[index];
  if (block.text === "") {
    const fallback = typeOnEmptyBackspace(block.type);
    if (fallback) return setType(blocks, index, fallback, 0);
    if (blocks.length === 1) return null;
    const rest = [...blocks.slice(0, index), ...blocks.slice(index + 1)];
    const caret = index > 0
      ? {id: blocks[index - 1].id, at: blocks[index - 1].text.length}
      : {id: blocks[1].id, at: 0};
    return {blocks: rest, caret};
  }
  if (index === 0) return null;
  const before = blocks[index - 1];
  const joined = {...before, text: before.text + block.text};
  return {
    blocks: [...blocks.slice(0, index - 1), joined, ...blocks.slice(index + 1)],
    caret: {id: before.id, at: before.text.length},
  };
};

// Typing in a block. A line break (a paste, or Return where the field let one
// through) is Enter at that point, and a tab is Tab; INT. at the start of action
// makes a scene heading, and an opening bracket alone in dialogue starts a
// parenthetical with the caret between its brackets. The caret is null when the
// field's own text is all that changed, so it stays where the field put it
export const type = (blocks: ScriptBlock[], index: number, text: string): Typed => {
  const block = blocks[index];
  const typed = {...block, text: text.replace(/\t/g, "")};
  const withText = replace(blocks, index, typed);

  const tab = text.indexOf("\t");
  if (tab !== -1) return cycleType(withText, index, tab);
  const linebreak = text.indexOf("\n");
  if (linebreak !== -1) {
    const before = replace(blocks, index, {...block, text: text.slice(0, linebreak) + text.slice(linebreak + 1)});
    return enter(before, index, linebreak);
  }
  if (block.type === "action" && looksLikeHeading(text)) return setType(withText, index, "heading", text.length);
  if (block.type === "dialogue" && text === "(") {
    return {blocks: replace(blocks, index, {...block, type: "parenthetical", text: "()"}), caret: {id: block.id, at: 1}};
  }
  return {blocks: withText, caret: null};
};
