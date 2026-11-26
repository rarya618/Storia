import { Node } from "prosemirror-model";
import { ElementType, ScriptBlock, isElementType } from "@storia/core/screenplay/types";
import { randomString } from "@storia/core/misc/randomString";
import { schema } from "./schema";

// Between the stored script (ScriptBlock[]) and the editor's document. Line
// breaks inside a block are "\n" in the text and hard_break nodes in the document.

// a block's text as inline content: its lines, with a hard break between each
export const inline = (text: string): Node[] =>
  text.split("\n").flatMap((line, index) => [
    ...(index > 0 ? [schema.nodes.hard_break.create()] : []),
    ...(line ? [schema.text(line)] : []),
  ]);

export const blocksToDoc = (blocks: ScriptBlock[]): Node => {
  const children = blocks.map(block =>
    schema.nodes[isElementType(block.type) ? block.type : "action"].create({id: block.id}, inline(block.text)));
  // a document holds at least one block
  return schema.nodes.doc.create(null, children.length > 0 ? children : [schema.nodes.heading.create({id: randomString(8)})]);
};

// Nodes never change once made, so a node seen before converts to the same
// ScriptBlock object as last time. A keystroke then rebuilds only the block it
// touched, and everything memoised on the blocks (scenes, the status bar) stays put.
const converted = new WeakMap<Node, ScriptBlock>();

const blockFrom = (node: Node): ScriptBlock => {
  const known = converted.get(node);
  if (known) return known;
  let text = "";
  node.forEach(child => { text += child.isText ? child.text ?? "" : child.type.name === "hard_break" ? "\n" : ""; });
  const block: ScriptBlock = {
    // ids.ts gives every block one; this is only a guard
    id: node.attrs.id ?? randomString(8),
    type: node.type.name as ElementType,
    text,
  };
  converted.set(node, block);
  return block;
};

export const docToBlocks = (doc: Node): ScriptBlock[] => {
  const blocks: ScriptBlock[] = [];
  doc.forEach(node => { blocks.push(blockFrom(node)); });
  return blocks;
};
