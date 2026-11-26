// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { DOMParser as ProseMirrorParser } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { blocksToDoc, docToBlocks } from "./convert";
import { schema } from "./schema";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

describe("the editor's document in the DOM", () => {
  const blocks = [block("h", "heading", "int. kitchen - night"), block("c", "character", "maya"), block("d", "dialogue", "Again.\nAnd again."), block("n", "note", "cut?")];

  it("draws each block as the paragraph screenplay.css lays out", () => {
    const place = document.createElement("div");
    const view = new EditorView(place, {state: EditorState.create({doc: blocksToDoc(blocks)})});
    const paragraphs = Array.from(place.querySelectorAll("p"));
    expect(paragraphs.map(p => p.className)).toEqual(["sp-block sp-heading", "sp-block sp-character", "sp-block sp-dialogue", "sp-block sp-note"]);
    expect(paragraphs.map(p => p.getAttribute("data-id"))).toEqual(["h", "c", "d", "n"]);
    // a line break inside a block is a <br>
    expect(paragraphs[2].querySelectorAll("br")).toHaveLength(1);
    // prose is spellchecked; names and headings aren't
    expect(paragraphs.map(p => p.getAttribute("spellcheck"))).toEqual(["false", "false", "true", "true"]);
    view.destroy();
  });

  it("reads its own HTML back with every element and id, as a paste within Storia does", () => {
    const place = document.createElement("div");
    const view = new EditorView(place, {state: EditorState.create({doc: blocksToDoc(blocks)})});
    const html = place.querySelector(".ProseMirror")!.innerHTML;
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const parsed = ProseMirrorParser.fromSchema(schema).parse(holder);
    expect(docToBlocks(parsed)).toEqual(blocks);
    view.destroy();
  });

  it("reads a plain paragraph from another app as action", () => {
    const holder = document.createElement("div");
    holder.innerHTML = "<p>From somewhere else</p>";
    const parsed = ProseMirrorParser.fromSchema(schema).parse(holder);
    expect(parsed.child(0).type.name).toBe("action");
    expect(parsed.child(0).textContent).toBe("From somewhere else");
  });
});
