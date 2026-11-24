// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { createRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { undo } from "prosemirror-history";
import ScriptEditorPM from "./ScriptEditorPM";
import { viewOf } from "./editorViews";
import { ScriptEditorHandle } from "./ScriptEditor";
import { ElementType, ScriptBlock } from "../../screenplay/types";

(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

// DocumentView in miniature: it owns the blocks and the active id, and the test
// can reach in to set the blocks from outside, as a fresher copy on load does
const mountEditor = (initial: ScriptBlock[]) => {
  const handle = createRef<ScriptEditorHandle>();
  const seen: {blocks: ScriptBlock[], activeId?: string, setOutside?: (blocks: ScriptBlock[]) => void} = {blocks: initial};
  const Host = () => {
    const [blocks, setBlocks] = useState(initial);
    const [activeId, setActiveId] = useState<string>();
    seen.blocks = blocks;
    seen.activeId = activeId;
    seen.setOutside = setBlocks;
    return <ScriptEditorPM ref={handle} blocks={blocks} setBlocks={update => setBlocks(update)} activeId={activeId} setActiveId={setActiveId} />;
  };
  const place = document.createElement("div");
  document.body.appendChild(place);
  let root!: Root;
  act(() => { root = createRoot(place); root.render(<Host />); });
  const view = () => viewOf(place.querySelector(".ProseMirror"))!;
  mounted.push(() => { act(() => root.unmount()); place.remove(); });
  return {handle, seen, view, place};
};

const mounted: (() => void)[] = [];
afterEach(() => { mounted.splice(0).forEach(unmount => unmount()); });

const shape = (blocks: ScriptBlock[]) => blocks.map(b => [b.type, b.text]);

describe("ScriptEditorPM", () => {
  it("sends each change up as blocks, keeping the objects of blocks it didn't touch", () => {
    const initial = [block("a", "action", "One."), block("b", "action", "Two.")];
    const {handle, seen, view} = mountEditor(initial);
    act(() => handle.current!.focusBlock("b", "end"));
    act(() => { view().dispatch(view().state.tr.insertText(" More.")); });
    expect(shape(seen.blocks)).toEqual([["action", "One."], ["action", "Two. More."]]);
    expect(seen.activeId).toBe("b");
    // another keystroke in "b": the untouched "a" is the very same object as before
    const before = seen.blocks;
    act(() => { view().dispatch(view().state.tr.insertText("!")); });
    expect(seen.blocks[0]).toBe(before[0]);
    expect(seen.blocks[1]).not.toBe(before[1]);
  });

  it("changes the caret's block from the status bar's menu, as an edit undo can take back", () => {
    const {handle, seen, view} = mountEditor([block("a", "action", "maya")]);
    act(() => handle.current!.focusBlock("a", "end"));
    act(() => handle.current!.setType!("character"));
    expect(shape(seen.blocks)).toEqual([["character", "maya"]]);
    act(() => { undo(view().state, view().dispatch); });
    expect(shape(seen.blocks)).toEqual([["action", "maya"]]);
  });

  it("adds a scene at the end, or uses the empty one already there", () => {
    const {handle, seen} = mountEditor([block("a", "action", "Text.")]);
    act(() => handle.current!.insertScene!());
    expect(shape(seen.blocks)).toEqual([["action", "Text."], ["heading", ""]]);
    act(() => handle.current!.insertScene!());
    expect(seen.blocks).toHaveLength(2);
    expect(seen.activeId).toBe(seen.blocks[1].id);
  });

  it("ignores the same script in a new array, keeping its undo history", () => {
    const {handle, seen, view} = mountEditor([block("a", "action", "One.")]);
    act(() => handle.current!.focusBlock("a", "end"));
    act(() => { view().dispatch(view().state.tr.insertText(" Two.")); });
    act(() => seen.setOutside!([...seen.blocks]));
    act(() => { undo(view().state, view().dispatch); });
    expect(shape(seen.blocks)).toEqual([["action", "One."]]);
  });

  it("suggests the script's names under a cue, and Enter takes the one chosen", () => {
    const {handle, seen, view, place} = mountEditor([block("c1", "character", "MAYA"), block("d", "dialogue", "Hi."), block("c2", "character", "")]);
    act(() => handle.current!.focusBlock("c2", "end"));
    act(() => { view().dispatch(view().state.tr.insertText("MA")); });
    const options = () => Array.from(place.querySelectorAll("[role=option]")).map(option => option.textContent);
    expect(options()).toEqual(["MAYA"]);
    expect(view().dom.getAttribute("aria-activedescendant")).toBe("character-suggestions-0");
    act(() => { view().dom.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", bubbles: true, cancelable: true})); });
    expect(seen.blocks[2].text).toBe("MAYA");
    // taken, so the list goes, and Enter isn't also a new block
    expect(options()).toEqual([]);
    expect(seen.blocks).toHaveLength(3);
  });

  it("puts the suggestions away on Escape until the cue changes", () => {
    const {handle, view, place} = mountEditor([block("c1", "character", "MAYA"), block("c2", "character", "")]);
    act(() => handle.current!.focusBlock("c2", "end"));
    act(() => { view().dispatch(view().state.tr.insertText("M")); });
    expect(place.querySelectorAll("[role=option]")).toHaveLength(1);
    act(() => { view().dom.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape", bubbles: true, cancelable: true})); });
    expect(place.querySelectorAll("[role=option]")).toHaveLength(0);
    act(() => { view().dispatch(view().state.tr.insertText("A")); });
    expect(place.querySelectorAll("[role=option]")).toHaveLength(1);
  });

  it("takes in a different script from outside, keeping the caret in its block", () => {
    const {handle, seen, view} = mountEditor([block("a", "action", "Old."), block("b", "action", "Here.")]);
    act(() => handle.current!.focusBlock("b", 2));
    act(() => seen.setOutside!([block("a", "action", "New."), block("b", "action", "Here.")]));
    expect(view().state.doc.child(0).textContent).toBe("New.");
    expect(view().state.selection.$head.index(0)).toBe(1);
    expect(view().state.selection.$head.parentOffset).toBe(2);
  });
});
