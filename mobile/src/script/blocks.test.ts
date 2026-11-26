import { describe, expect, it } from "vitest";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";
import { backspaceAtStart, cycleType, enter, setType, type } from "./blocks";
import { sampleScript } from "./sample";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});
const shape = (blocks: ScriptBlock[]) => blocks.map(({type, text}) => [type, text]);

describe("enter", () => {
  it("splits at the caret, the new block taking the next element", () => {
    const {blocks, caret} = enter([block("a", "character", "MARGO")], 0, 5);
    expect(shape(blocks)).toEqual([["character", "MARGO"], ["dialogue", ""]]);
    expect(caret).toEqual({id: blocks[1].id, at: 0});
  });

  it("carries the words after the caret into the new block", () => {
    const {blocks} = enter([block("a", "action", "Rain falls. She waits.")], 0, 12);
    expect(shape(blocks)).toEqual([["action", "Rain falls. "], ["action", "She waits."]]);
  });

  it("changes an empty block's element instead of adding one", () => {
    const {blocks, caret} = enter([block("a", "dialogue", "")], 0, 0);
    expect(shape(blocks)).toEqual([["action", ""]]);
    expect(caret).toEqual({id: "a", at: 0});
  });

  it("finishes a parenthetical from just inside its closing bracket", () => {
    const {blocks} = enter([block("a", "parenthetical", "(beat)")], 0, 5);
    expect(shape(blocks)).toEqual([["parenthetical", "(beat)"], ["dialogue", ""]]);
  });
});

describe("backspace at the start of a block", () => {
  it("joins a block with text to the one before, which keeps its element", () => {
    const {blocks, caret} = backspaceAtStart([block("a", "action", "Rain."), block("b", "dialogue", " Again.")], 1)!;
    expect(shape(blocks)).toEqual([["action", "Rain. Again."]]);
    expect(caret).toEqual({id: "a", at: 5});
  });

  it("softens an empty cue to action before removing it", () => {
    const {blocks} = backspaceAtStart([block("a", "action", "Rain."), block("b", "character", "")], 1)!;
    expect(shape(blocks)).toEqual([["action", "Rain."], ["action", ""]]);
  });

  it("removes an empty block with no softer element, the caret going to the end of the one before", () => {
    const {blocks, caret} = backspaceAtStart([block("a", "action", "Rain."), block("b", "action", "")], 1)!;
    expect(shape(blocks)).toEqual([["action", "Rain."]]);
    expect(caret).toEqual({id: "a", at: 5});
  });

  it("does nothing on the first block or the only one", () => {
    expect(backspaceAtStart([block("a", "action", "Rain."), block("b", "action", "")], 0)).toBeNull();
    expect(backspaceAtStart([block("a", "action", "")], 0)).toBeNull();
  });
});

describe("changing the element", () => {
  it("adds a parenthetical's brackets and keeps the caret in the words", () => {
    const {blocks, caret} = setType([block("a", "dialogue", "beat")], 0, "parenthetical", 2);
    expect(shape(blocks)).toEqual([["parenthetical", "(beat)"]]);
    expect(caret).toEqual({id: "a", at: 3});
  });

  it("cycles with Tab as the web editor does", () => {
    expect(cycleType([block("a", "action", "")], 0, 0).blocks[0].type).toBe("character");
    expect(cycleType([block("a", "dialogue", "")], 0, 0).blocks[0].type).toBe("parenthetical");
  });
});

describe("typing", () => {
  it("leaves the caret to the field when only the text changed", () => {
    const {blocks, caret} = type([block("a", "action", "Rai")], 0, "Rain");
    expect(shape(blocks)).toEqual([["action", "Rain"]]);
    expect(caret).toBeNull();
  });

  it("makes INT. at the start of action a scene heading", () => {
    expect(type([block("a", "action", "INT")], 0, "INT.").blocks[0].type).toBe("heading");
  });

  it("starts a parenthetical from an opening bracket in empty dialogue", () => {
    const {blocks, caret} = type([block("a", "dialogue", "")], 0, "(");
    expect(shape(blocks)).toEqual([["parenthetical", "()"]]);
    expect(caret).toEqual({id: "a", at: 1});
  });

  it("treats a line break that gets through as Enter there", () => {
    const {blocks} = type([block("a", "character", "MARGO")], 0, "MARGO\n");
    expect(shape(blocks)).toEqual([["character", "MARGO"], ["dialogue", ""]]);
  });

  it("treats a tab as Tab, dropping the tab itself", () => {
    const {blocks} = type([block("a", "action", "")], 0, "\t");
    expect(shape(blocks)).toEqual([["character", ""]]);
  });
});

describe("the sample script", () => {
  it("runs to a feature's length", () => {
    const blocks = sampleScript();
    expect(blocks.length).toBeGreaterThan(1500);
    expect(new Set(blocks.map(block => block.id)).size).toBe(blocks.length);
  });
});
