import { describe, expect, it } from "vitest";
import { EditorState, TextSelection } from "prosemirror-state";
import { splitBlock } from "prosemirror-commands";
import { blocksToDoc, docToBlocks } from "./convert";
import { blockIds } from "./ids";
import { ELEMENTS, ElementType, ScriptBlock } from "@storia/core/screenplay/types";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

describe("blocksToDoc and docToBlocks", () => {
  it("round-trips every element with its id and text", () => {
    const blocks = ELEMENTS.map(({type}, index) => block("b" + index, type, type + " text " + index));
    expect(docToBlocks(blocksToDoc(blocks))).toEqual(blocks);
  });

  it("keeps line breaks inside a block, including at the edges and doubled", () => {
    const blocks = [block("a", "lyrics", "Oh the river\nruns slow"), block("b", "action", "\nedge\n\n")];
    const doc = blocksToDoc(blocks);
    expect(doc.child(0).childCount).toBe(3);
    expect(docToBlocks(doc)).toEqual(blocks);
  });

  it("keeps empty blocks empty", () => {
    const blocks = [block("a", "heading", ""), block("b", "action", "")];
    expect(docToBlocks(blocksToDoc(blocks))).toEqual(blocks);
  });

  it("gives an empty script one scene heading", () => {
    const doc = blocksToDoc([]);
    expect(doc.childCount).toBe(1);
    expect(doc.child(0).type.name).toBe("heading");
  });

  it("reads an unknown element as action", () => {
    const doc = blocksToDoc([{id: "x", type: "montage" as ElementType, text: "keep me"}]);
    expect(docToBlocks(doc)).toEqual([block("x", "action", "keep me")]);
  });

  it("converts an unchanged node to the same block object", () => {
    const doc = blocksToDoc([block("a", "action", "one"), block("b", "dialogue", "two")]);
    const first = docToBlocks(doc);
    const second = docToBlocks(doc);
    expect(second[0]).toBe(first[0]);
    expect(second[1]).toBe(first[1]);
  });
});

describe("blockIds", () => {
  const stateOf = (blocks: ScriptBlock[]) => EditorState.create({doc: blocksToDoc(blocks), plugins: [blockIds()]});

  it("gives the second half of a split block an id of its own", () => {
    let state = stateOf([block("a", "action", "hello world")]);
    // the caret after "hello"
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, 6)));
    splitBlock(state, tr => { state = state.apply(tr); });
    const blocks = docToBlocks(state.doc);
    expect(blocks.map(b => b.text)).toEqual(["hello", " world"]);
    expect(blocks[0].id).toBe("a");
    expect(blocks[1].id).not.toBe("a");
    expect(blocks[1].id).toBeTruthy();
  });

  it("renames a pasted copy of an id already in the script, keeping the first", () => {
    let state = stateOf([block("a", "action", "one"), block("b", "action", "two")]);
    const copy = state.schema.nodes.dialogue.create({id: "a"}, state.schema.text("pasted"));
    state = state.apply(state.tr.insert(state.doc.content.size, copy));
    const ids = docToBlocks(state.doc).map(b => b.id);
    expect(ids.slice(0, 2)).toEqual(["a", "b"]);
    expect(new Set(ids).size).toBe(3);
  });
});
