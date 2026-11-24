import { describe, expect, it } from "vitest";
import { Slice } from "prosemirror-model";
import { blocksToDoc, docToBlocks } from "./convert";
import { sliceToText, textToSlice } from "./clipboard";
import { schema } from "./schema";
import { ElementType, ScriptBlock } from "../types";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

describe("copying out as plain text", () => {
  const doc = blocksToDoc([block("h", "heading", "int. bar - night"), block("c", "character", "maya"), block("d", "dialogue", "Again.")]);

  it("writes whole blocks as Fountain", () => {
    const slice = doc.slice(0, doc.content.size);
    expect(sliceToText(slice)).toBe("INT. BAR - NIGHT\n\n@MAYA\nAgain.");
  });

  it("writes words from inside one block as just those words", () => {
    // "BAR" inside the heading: the block's text starts at 1
    const slice = doc.slice(6, 9);
    expect(sliceToText(slice)).toBe("bar");
  });
});

describe("pasting plain text in", () => {
  it("puts a single line in as words at the caret", () => {
    const slice = textToSlice("just words");
    expect([slice.openStart, slice.openEnd]).toEqual([0, 0]);
    expect(slice.content.firstChild?.isText).toBe(true);
  });

  it("makes a block of action per paragraph, open at both ends", () => {
    const slice = textToSlice("First paragraph.\r\n\r\nSecond\nwith a break.\n\n\nThird.");
    expect([slice.openStart, slice.openEnd]).toEqual([1, 1]);
    const parts: string[][] = [];
    slice.content.forEach(node => parts.push([node.type.name, node.textBetween(0, node.content.size, "\n", "\n")]));
    expect(parts).toEqual([["action", "First paragraph."], ["action", "Second\nwith a break."], ["action", "Third."]]);
  });

  it("joins the first paragraph to the block it lands in, which keeps its element", () => {
    const doc = blocksToDoc([block("c", "character", "MA")]);
    // the caret at the end of "MA"
    const pasted = doc.replace(3, 3, textToSlice("YA\n\nShe turns."));
    expect(docToBlocks(pasted).map(b => [b.type, b.text])).toEqual([["character", "MAYA"], ["action", "She turns."]]);
  });

  it("pastes nothing for empty text", () => {
    expect(textToSlice("\n\n\n")).toBe(Slice.empty);
    expect(textToSlice("").content.size).toBe(0);
  });
});

describe("schema sanity", () => {
  it("has a node type per element", () => {
    expect(Object.keys(schema.nodes)).toEqual(expect.arrayContaining(["heading", "action", "character", "parenthetical", "dialogue", "transition", "shot", "act", "lyrics", "note"]));
  });
});
