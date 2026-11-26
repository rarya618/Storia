import { describe, expect, it } from "vitest";
import { Command, EditorState, TextSelection } from "prosemirror-state";
import { history } from "prosemirror-history";
import { undo } from "prosemirror-history";
import { blocksToDoc, docToBlocks } from "./convert";
import { blockIds } from "./ids";
import { backspace, cycleElement, elementForKey, enter, hardBreak, setElement, typingRules } from "./commands";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

// a state with the caret in block `at`, `offset` characters in ("end" for its end)
const stateAt = (blocks: ScriptBlock[], at: number, offset: number | "end") => {
  let state = EditorState.create({doc: blocksToDoc(blocks), plugins: [blockIds(), typingRules(), history()]});
  let pos = 0;
  state.doc.forEach((node, start, index) => { if (index === at) pos = start + 1 + (offset === "end" ? node.content.size : offset); });
  state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, pos)));
  return state;
};

const run = (state: EditorState, command: Command) => {
  let next = state;
  const handled = command(state, tr => { next = state.apply(tr); });
  return {state: next, handled};
};

const shape = (state: EditorState) => docToBlocks(state.doc).map(b => [b.type, b.text]);
const caretBlock = (state: EditorState) => state.selection.$head.index(0);
const caretOffset = (state: EditorState) => state.selection.$head.parentOffset;

const typeText = (state: EditorState, text: string) => {
  const tr = state.tr.insertText(text);
  return state.apply(tr);
};

describe("Enter", () => {
  it("after a cue starts its dialogue", () => {
    const {state} = run(stateAt([block("c", "character", "MAYA")], 0, "end"), enter);
    expect(shape(state)).toEqual([["character", "MAYA"], ["dialogue", ""]]);
    expect(caretBlock(state)).toBe(1);
  });

  it("after dialogue starts the next cue, and after a heading starts action", () => {
    expect(shape(run(stateAt([block("d", "dialogue", "Hi.")], 0, "end"), enter).state)).toEqual([["dialogue", "Hi."], ["character", ""]]);
    expect(shape(run(stateAt([block("h", "heading", "INT. BAR")], 0, "end"), enter).state)).toEqual([["heading", "INT. BAR"], ["action", ""]]);
  });

  it("in the middle of a block splits it there, the second half taking the next element", () => {
    const {state} = run(stateAt([block("a", "action", "She runs. He waits.")], 0, 9), enter);
    expect(shape(state)).toEqual([["action", "She runs."], ["action", " He waits."]]);
    expect([caretBlock(state), caretOffset(state)]).toEqual([1, 0]);
  });

  it("on an empty block changes its element instead of adding one", () => {
    const {state} = run(stateAt([block("a", "action", "Text."), block("d", "dialogue", "")], 1, 0), enter);
    expect(shape(state)).toEqual([["action", "Text."], ["action", ""]]);
  });

  it("just inside a parenthetical's closing bracket finishes it", () => {
    const {state} = run(stateAt([block("p", "parenthetical", "(beat)")], 0, 5), enter);
    expect(shape(state)).toEqual([["parenthetical", "(beat)"], ["dialogue", ""]]);
  });

  it("gives the new block an id of its own", () => {
    const {state} = run(stateAt([block("c", "character", "MAYA")], 0, "end"), enter);
    const ids = docToBlocks(state.doc).map(b => b.id);
    expect(ids[0]).toBe("c");
    expect(ids[1]).not.toBe("c");
  });
});

describe("Tab and the element shortcuts", () => {
  it("Tab moves to the next element and Shift+Tab back, keeping the id", () => {
    const tabbed = run(stateAt([block("a", "action", "")], 0, 0), cycleElement(false)).state;
    expect(shape(tabbed)).toEqual([["character", ""]]);
    expect(docToBlocks(tabbed.doc)[0].id).toBe("a");
    expect(shape(run(tabbed, cycleElement(true)).state)).toEqual([["action", ""]]);
  });

  it("making a block a parenthetical adds its brackets and keeps the caret on the words", () => {
    const {state} = run(stateAt([block("d", "dialogue", "beat")], 0, 2), setElement("parenthetical"));
    expect(shape(state)).toEqual([["parenthetical", "(beat)"]]);
    expect(caretOffset(state)).toBe(3);
  });

  it("taking a block out of a parenthetical removes them", () => {
    const {state} = run(stateAt([block("p", "parenthetical", "(beat)")], 0, "end"), setElement("dialogue"));
    expect(shape(state)).toEqual([["dialogue", "beat"]]);
  });
});

describe("the element keys", () => {
  const key = (code: string, mods: Partial<Record<"metaKey" | "ctrlKey" | "altKey" | "shiftKey", boolean>>) =>
    ({code, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...mods});

  it("on a Mac, ⌥⌘ and a digit pick an element, whatever character ⌥ makes of it", () => {
    expect(elementForKey(key("Digit1", {metaKey: true, altKey: true}), true)).toBe("heading");
    expect(elementForKey(key("Digit0", {metaKey: true, altKey: true}), true)).toBe("note");
  });

  it("elsewhere, Ctrl+Alt and a digit do", () => {
    expect(elementForKey(key("Digit5", {ctrlKey: true, altKey: true}), false)).toBe("dialogue");
  });

  it("leaves ⌘ and a digit alone, which the browser keeps for its tabs", () => {
    expect(elementForKey(key("Digit1", {metaKey: true}), true)).toBeUndefined();
    expect(elementForKey(key("Digit1", {ctrlKey: true}), false)).toBeUndefined();
    expect(elementForKey(key("Digit1", {metaKey: true, altKey: true, shiftKey: true}), true)).toBeUndefined();
    expect(elementForKey(key("KeyA", {metaKey: true, altKey: true}), true)).toBeUndefined();
  });
});

describe("Backspace at a block's start", () => {
  it("on an empty cue falls back to action", () => {
    const {state} = run(stateAt([block("a", "action", "Text."), block("c", "character", "")], 1, 0), backspace);
    expect(shape(state)).toEqual([["action", "Text."], ["action", ""]]);
  });

  it("on an empty block with nothing softer deletes it, the caret at the end of the one before", () => {
    const {state} = run(stateAt([block("a", "action", "Text."), block("b", "action", "")], 1, 0), backspace);
    expect(shape(state)).toEqual([["action", "Text."]]);
    expect([caretBlock(state), caretOffset(state)]).toEqual([0, 5]);
  });

  it("keeps the only block in the script", () => {
    const {state, handled} = run(stateAt([block("a", "action", "")], 0, 0), backspace);
    expect(handled).toBe(true);
    expect(shape(state)).toEqual([["action", ""]]);
  });

  it("joins a block with text onto the one before, which keeps its element", () => {
    const {state} = run(stateAt([block("c", "character", "MAYA"), block("d", "dialogue", "hi")], 1, 0), backspace);
    expect(shape(state)).toEqual([["character", "MAYAhi"]]);
  });

  it("leaves the caret alone anywhere but a block's start", () => {
    expect(run(stateAt([block("a", "action", "Text.")], 0, 2), backspace).handled).toBe(false);
  });
});

describe("Shift+Enter", () => {
  it("breaks the line inside the block", () => {
    const {state} = run(stateAt([block("l", "lyrics", "Oh the river")], 0, "end"), hardBreak);
    expect(shape(typeText(state, "runs slow"))).toEqual([["lyrics", "Oh the river\nruns slow"]]);
  });
});

describe("typing rules", () => {
  it("INT. at the start of action makes it a scene heading", () => {
    const state = typeText(stateAt([block("a", "action", "")], 0, 0), "INT.");
    expect(shape(state)).toEqual([["heading", "INT."]]);
  });

  it("an opening bracket alone in dialogue starts a parenthetical with the caret inside", () => {
    const state = typeText(stateAt([block("d", "dialogue", "")], 0, 0), "(");
    expect(shape(state)).toEqual([["parenthetical", "()"]]);
    expect(caretOffset(state)).toBe(1);
  });

  it("one undo takes back both the typing and the change it caused", () => {
    const typed = typeText(stateAt([block("a", "action", "")], 0, 0), "INT.");
    let state = typed;
    undo(typed, tr => { state = typed.apply(tr); });
    expect(shape(state)).toEqual([["action", ""]]);
  });
});
