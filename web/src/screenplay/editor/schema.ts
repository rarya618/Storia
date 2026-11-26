import { NodeSpec, Schema } from "prosemirror-model";
import { ELEMENTS, ElementType } from "@storia/core/screenplay/types";

// The screenplay as a ProseMirror document: one node type per element, each a
// line of plain text (Shift+Enter puts a hard_break inside one). There are no
// marks: a screenplay's look comes from its elements, not from styled text.
// Each block keeps the id it has as a ScriptBlock, so scenes, the active block
// and focusBlock keep working across edits (ids.ts gives new blocks theirs).

// the elements spellchecked as prose; headings, cues and the rest are names and terms
const SPELLCHECKED = new Set<ElementType>(["action", "dialogue", "lyrics", "note"]);

const element = (type: ElementType): NodeSpec => ({
  group: "block",
  content: "inline*",
  defining: true,
  attrs: {id: {default: null}},
  // the class names are the ones the textarea editor uses, so screenplay.css lays
  // both out alike; data-id carries the block's id through copy and paste
  parseDOM: [
    {tag: "p.sp-" + type, getAttrs: dom => ({id: (dom as HTMLElement).getAttribute("data-id")})},
    // a plain paragraph from another app's HTML comes in as action, after every
    // element's own rule has had its chance (the default priority is 50)
    ...(type === "action" ? [{tag: "p", priority: 10}] : []),
  ],
  toDOM: node => ["p", {
    class: "sp-block sp-" + type,
    "data-id": node.attrs.id,
    spellcheck: SPELLCHECKED.has(type) ? "true" : "false",
  }, 0],
});

export const schema = new Schema({
  nodes: {
    doc: {content: "block+"},
    ...Object.fromEntries(ELEMENTS.map(({type}) => [type, element(type)])),
    text: {group: "inline"},
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{tag: "br"}],
      toDOM: () => ["br"],
    },
  },
});
