import { Fragment, Node, Slice } from "prosemirror-model";
import { ElementType, ScriptBlock } from "../types";
import { fountainBody } from "../fountain";
import { inline } from "./convert";
import { schema } from "./schema";

// The clipboard in plain text, both ways. Copying within Storia also carries
// ProseMirror's own HTML, which pastes back with every element as it was; these
// are for everywhere else.

const textOf = (node: Node) => {
  let text = "";
  node.forEach(child => { text += child.isText ? child.text ?? "" : "\n"; });
  return text;
};

// out: copied blocks as Fountain, the plain text other screenwriting apps read.
// Words copied from inside one block are just those words
export const sliceToText = (slice: Slice) => {
  const first = slice.content.firstChild;
  if (!first?.isBlock) return textOf(schema.nodes.action.create(null, slice.content));
  const blocks: ScriptBlock[] = [];
  slice.content.forEach(node => blocks.push({id: "", type: node.type.name as ElementType, text: textOf(node)}));
  return fountainBody(blocks);
};

// in: plain text from elsewhere. A single line goes in as words where the caret
// is; more becomes a block of action per paragraph (a blank line between), each
// paragraph's own line breaks kept. The slice is open at both ends, so the first
// paragraph joins the block the caret is in and the last joins what follows it,
// as when pasting into any document
export const textToSlice = (text: string): Slice => {
  const normal = text.replace(/\r\n?/g, "\n");
  if (!normal.includes("\n")) return new Slice(Fragment.from(normal ? schema.text(normal) : []), 0, 0);
  const paragraphs = normal.split(/\n{2,}/).map(part => part.replace(/^\n+|\n+$/g, "")).filter(part => part !== "");
  if (paragraphs.length === 0) return Slice.empty;
  const nodes = paragraphs.map(part => schema.nodes.action.create(null, inline(part)));
  return new Slice(Fragment.from(nodes), 1, 1);
};
