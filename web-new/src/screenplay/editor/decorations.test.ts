// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { blocksToDoc } from "./convert";
import { marginNotes } from "./decorations";
import { ElementType, ScriptBlock } from "../types";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

// a view with the caret in block `at`
const viewAt = (blocks: ScriptBlock[], at: number) => {
  let state = EditorState.create({doc: blocksToDoc(blocks), plugins: [marginNotes()]});
  let pos = 1;
  state.doc.forEach((_node, start, index) => { if (index === at) pos = start + 1; });
  state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, pos)));
  return new EditorView(document.createElement("div"), {state});
};

describe("margin notes", () => {
  it("names the caret's element in the margin, and only there", () => {
    const view = viewAt([block("a", "action", "Text."), block("c", "character", "MAYA")], 1);
    const labels = Array.from(view.dom.querySelectorAll(".sp-gutter-label")).map(label => label.textContent);
    expect(labels).toEqual(["Character"]);
    expect(view.dom.querySelectorAll("p")[1].querySelector(".sp-gutter")).not.toBeNull();
    view.destroy();
  });

  it("shows a placeholder in the empty block holding the caret, but not in other empty blocks", () => {
    const view = viewAt([block("a", "action", ""), block("d", "dialogue", ""), block("t", "transition", "Text")], 1);
    const paragraphs = view.dom.querySelectorAll("p");
    expect(paragraphs[1].classList.contains("is-empty")).toBe(true);
    expect(paragraphs[1].getAttribute("data-placeholder")).toBe("Dialogue");
    expect(paragraphs[0].classList.contains("is-empty")).toBe(false);
    view.destroy();
  });

  it("shows the placeholder in a script's only block, as a new script opens", () => {
    const state = EditorState.create({doc: blocksToDoc([block("h", "heading", "")]), plugins: [marginNotes()]});
    const view = new EditorView(document.createElement("div"), {state});
    expect(view.dom.querySelector("p")!.getAttribute("data-placeholder")).toBe("Scene heading");
    view.destroy();
  });
});
