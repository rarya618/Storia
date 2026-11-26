import { joinBackward } from "prosemirror-commands";
import { Node } from "prosemirror-model";
import { Command, EditorState, Plugin, TextSelection, Transaction } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { ELEMENTS, ElementType } from "@storia/core/screenplay/types";
import {
  looksLikeHeading, textForType, typeAfterEnter, typeAfterTab,
  typeBefore, typeOnEmptyBackspace, typeOnEmptyEnter,
} from "@storia/core/screenplay/flow";
import { inline } from "./convert";
import { schema } from "./schema";

// The screenplay's keys as ProseMirror commands, on the rules in flow.ts that the
// textarea editor follows too: Enter and Tab move through the elements, Backspace
// falls back or joins, Cmd/Ctrl+1–0 picks an element, and typing INT. or ( turns
// a block into a scene heading or a parenthetical. Each acts on the block that
// holds the caret (the selection's head).

// the block holding the caret, where it starts, and the caret's offset into it
const current = (state: EditorState) => {
  const $head = state.selection.$head;
  const node = $head.node(1);
  const pos = $head.before(1);
  return {node, pos, type: node.type.name as ElementType, offset: $head.pos - pos - 1, index: $head.index(0)};
};

// a block's text, line breaks as "\n"
const textOf = (node: Node) => {
  let text = "";
  node.forEach(child => { text += child.isText ? child.text ?? "" : "\n"; });
  return text;
};

// make the block at pos another element, keeping its id. Its text follows the
// element (a parenthetical gains or loses its brackets), and the caret keeps its
// place in the words
export const setElementAt = (tr: Transaction, pos: number, to: ElementType, caret?: number) => {
  const node = tr.doc.nodeAt(pos);
  if (!node) return tr;
  const from = node.type.name as ElementType;
  const text = textOf(node);
  const next = textForType(text, from, to);
  tr.setNodeMarkup(pos, schema.nodes[to], node.attrs);
  if (next !== text) tr.replaceWith(pos + 1, pos + 1 + node.content.size, inline(next));
  if (caret !== undefined) {
    // a bracket added at the start moves the words one along; one taken away, back
    const shift = next.startsWith("(") && !text.startsWith("(") ? 1 : text.startsWith("(") && !next.startsWith("(") ? -1 : 0;
    const size = tr.doc.nodeAt(pos)!.content.size;
    tr.setSelection(TextSelection.create(tr.doc, pos + 1 + Math.max(0, Math.min(caret + shift, size))));
  }
  return tr;
};

// the caret's block becomes another element
export const setElement = (to: ElementType): Command => (state, dispatch) => {
  const block = current(state);
  if (block.type === to) return true;
  dispatch?.(setElementAt(state.tr, block.pos, to, block.offset).scrollIntoView());
  return true;
};

// Tab and Shift+Tab: the next element, or the one before
export const cycleElement = (backwards: boolean): Command => (state, dispatch) => {
  const block = current(state);
  return setElement(backwards ? typeBefore(block.type) : typeAfterTab(block.type))(state, dispatch);
};

// Enter: on an empty block, change its element; otherwise split it there, the
// new half taking the element that follows (a cue's dialogue, dialogue's next
// cue). Just inside a parenthetical's closing bracket, it finishes the
// parenthetical instead of splitting the bracket off
export const enter: Command = (state, dispatch) => {
  let tr = state.tr;
  if (!state.selection.empty) tr = tr.deleteSelection();
  const working = state.apply(tr);
  const block = current(working);
  const text = textOf(block.node);

  if (text.trim() === "") {
    if (dispatch) dispatch(setElementAt(tr, block.pos, typeOnEmptyEnter(block.type), 0).scrollIntoView());
    return true;
  }

  let at = block.offset;
  if (block.type === "parenthetical" && text.slice(at) === ")") at = text.length;
  const splitAt = block.pos + 1 + at;
  const next = schema.nodes[typeAfterEnter(block.type)];
  tr.split(splitAt, 1, [{type: next, attrs: {id: null}}]);
  tr.setSelection(TextSelection.create(tr.doc, splitAt + 2));
  dispatch?.(tr.scrollIntoView());
  return true;
};

// Backspace at the very start of a block: an empty block falls back to a softer
// element (a cue to action, a parenthetical to dialogue) or goes, the caret
// moving to the end of the block before (or the start of the one after); a
// block with text joins the one before it, which keeps its element
export const backspace: Command = (state, dispatch, view) => {
  const selection = state.selection;
  if (!selection.empty) return false;
  const block = current(state);
  if (block.offset !== 0) return false;

  if (block.node.content.size === 0) {
    const fallback = typeOnEmptyBackspace(block.type);
    if (fallback) return setElement(fallback)(state, dispatch);
    if (state.doc.childCount === 1) return true;
    const tr = state.tr.delete(block.pos, block.pos + block.node.nodeSize);
    const caret = block.index > 0 ? block.pos - 1 : block.pos + 1;
    tr.setSelection(TextSelection.create(tr.doc, Math.max(1, Math.min(caret, tr.doc.content.size - 1))));
    dispatch?.(tr.scrollIntoView());
    return true;
  }

  if (block.index === 0) return true;
  return joinBackward(state, dispatch, view);
};

// a line break inside a block
export const hardBreak: Command = (state, dispatch) => {
  dispatch?.(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollIntoView());
  return true;
};

export const screenplayKeys = () => keymap({
  "Enter": enter,
  "Shift-Enter": hardBreak,
  "Tab": cycleElement(false),
  "Shift-Tab": cycleElement(true),
  "Backspace": backspace,
  ...Object.fromEntries(ELEMENTS.map(element => ["Mod-" + element.shortcut, setElement(element.type)])),
});

// Typing that changes the element: INT. (or EXT., EST., I/E.) at the start of
// action makes it a scene heading, and an opening bracket on its own in dialogue
// starts a parenthetical with the caret between its brackets. It looks only at
// the block just typed in, after each change, and joins that change in undo
export const typingRules = () => new Plugin({
  appendTransaction: (transactions, _old, state) => {
    if (!transactions.some(transaction => transaction.docChanged)) return null;
    const block = current(state);
    const text = textOf(block.node);
    if (block.type === "action" && looksLikeHeading(text)) {
      return setElementAt(state.tr, block.pos, "heading", block.offset);
    }
    if (block.type === "dialogue" && text === "(") {
      const tr = state.tr.setNodeMarkup(block.pos, schema.nodes.parenthetical, block.node.attrs);
      tr.replaceWith(block.pos + 1, block.pos + 1 + block.node.content.size, schema.text("()"));
      return tr.setSelection(TextSelection.create(tr.doc, block.pos + 2));
    }
    return null;
  },
});
