// A card's body: a short rich document, the page behind the card. It's a
// ProseMirror document stored as its JSON, with a plain-text copy kept on the
// card (its `text`) for the board's tiles, the rail and older tabs. Notion-like
// in what it holds (headings, lists, a checklist, quotes, bold, italic and
// strike), and no more. No UI in here, so it can be tested on its own.

import { Node as PMNode, Schema } from "prosemirror-model";
import type { BodyJSON } from "@storia/core/board/board";

export const bodySchema = new Schema({
  nodes: {
    doc: {content: "block+"},
    paragraph: {
      group: "block",
      content: "inline*",
      parseDOM: [{tag: "p"}],
      toDOM: () => ["p", 0],
    },
    heading: {
      group: "block",
      content: "inline*",
      attrs: {level: {default: 1}},
      defining: true,
      parseDOM: [1, 2, 3].map(level => ({tag: "h" + level, attrs: {level}})),
      toDOM: node => ["h" + node.attrs.level, 0],
    },
    blockquote: {
      group: "block",
      content: "paragraph+",
      defining: true,
      parseDOM: [{tag: "blockquote"}],
      toDOM: () => ["blockquote", 0],
    },
    bullet_list: {
      group: "block",
      content: "list_item+",
      parseDOM: [{tag: "ul"}],
      toDOM: () => ["ul", 0],
    },
    ordered_list: {
      group: "block",
      content: "list_item+",
      parseDOM: [{tag: "ol"}],
      toDOM: () => ["ol", 0],
    },
    list_item: {
      content: "paragraph (paragraph | bullet_list | ordered_list)*",
      defining: true,
      parseDOM: [{tag: "li"}],
      toDOM: () => ["li", 0],
    },
    // a checklist line: one line of text with a box before it
    todo: {
      group: "block",
      content: "inline*",
      attrs: {checked: {default: false}},
      defining: true,
      parseDOM: [{tag: "div.sw-todo", getAttrs: dom => ({checked: (dom as HTMLElement).dataset.checked === "true"})}],
      toDOM: node => ["div", {class: "sw-todo", "data-checked": String(node.attrs.checked)}, ["span", {class: "sw-todo-text"}, 0]],
    },
    text: {group: "inline"},
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{tag: "br"}],
      toDOM: () => ["br"],
    },
  },
  marks: {
    strong: {parseDOM: [{tag: "strong"}, {tag: "b"}], toDOM: () => ["strong", 0]},
    em: {parseDOM: [{tag: "em"}, {tag: "i"}], toDOM: () => ["em", 0]},
    strike: {parseDOM: [{tag: "s"}, {tag: "del"}], toDOM: () => ["s", 0]},
  },
});

// the stored shape is shared, so it is defined beside the board in @storia/core
export type { BodyJSON };

// a body from plain text: each line its own paragraph (a card's text from before bodies)
export const bodyFromText = (text: string): PMNode => {
  const lines = text.split("\n");
  return bodySchema.node("doc", null, lines.map(line =>
    bodySchema.node("paragraph", null, line ? [bodySchema.text(line)] : [])));
};

// RTDB keeps a list as an object when it has gaps and drops empty ones, so a
// stored body's lists come back as objects or not at all
const fromDatabase = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(fromDatabase);
  if (!value || typeof value !== "object") return value;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 0 && entries.every(([key]) => /^\d+$/.test(key)))
    return entries.sort(([a], [b]) => Number(a) - Number(b)).map(([, item]) => fromDatabase(item));
  return Object.fromEntries(entries.map(([key, item]) => [key, fromDatabase(item)]));
};

// the card's body as a document: the stored one when it reads, or else the
// card's plain text, so nothing written is lost
export const readBody = (body: unknown, text = ""): PMNode => {
  if (body && typeof body === "object") {
    try {
      const doc = bodySchema.nodeFromJSON(fromDatabase(body));
      doc.check();
      return doc;
    } catch {
      // fall back to the text below
    }
  }
  return bodyFromText(text);
};

// the plain text of a body: a line per block, list items and checklist lines included
export const textOfBody = (doc: PMNode): string => {
  const lines: string[] = [];
  doc.descendants(node => {
    if (node.isTextblock) {
      lines.push(node.textContent);
      return false;
    }
    return true;
  });
  // the text a tile shows: no blank lines at either end
  return lines.join("\n").trim();
};

// a body as plain JSON for the database: ProseMirror builds its attributes as
// objects with no prototype, which Firebase's validation can't handle
export const bodyJSON = (doc: PMNode): BodyJSON => JSON.parse(JSON.stringify(doc.toJSON()));

// whether a body says anything at all
export const isEmptyBody = (doc: PMNode) => textOfBody(doc) === "";
