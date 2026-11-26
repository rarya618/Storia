import { describe, expect, it } from "vitest";
import { Command, EditorState, TextSelection } from "prosemirror-state";
import { history, undo } from "prosemirror-history";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";
import { blocksToDoc, docToBlocks } from "./convert";
import { find, findKey, findNext, findPrevious, replaceAll, replaceCurrent, setQuery } from "./find";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});
const script = [
  block("h", "heading", "int. kitchen - night"),
  block("a", "action", "Sam waits. Samantha doesn't."),
  block("c", "character", "SAM"),
  block("d", "dialogue", "Again.\nsam, again."),
];

const start = () => EditorState.create({doc: blocksToDoc(script), plugins: [find(), history()]});

const run = (state: EditorState, command: Command) => {
  let next = state;
  command(state, tr => { next = state.apply(tr); });
  return next;
};

const selected = (state: EditorState) => state.doc.textBetween(state.selection.from, state.selection.to);
const texts = (state: EditorState) => docToBlocks(state.doc).map(block => block.text);

describe("find", () => {
  it("finds the query's whole words in every block, and selects the first", () => {
    const state = run(start(), setQuery({query: "sam", wholeWord: true}));
    const {matches, current} = findKey.getState(state)!;
    expect(matches.map(match => state.doc.textBetween(match.from, match.to))).toEqual(["Sam", "SAM", "sam"]);
    expect(current).toBe(0);
    expect(selected(state)).toBe("Sam");
  });

  it("steps through the matches, round the end and back", () => {
    let state = run(start(), setQuery({query: "sam", wholeWord: true}));
    state = run(state, findNext);
    expect(findKey.getState(state)!.current).toBe(1);
    state = run(state, findNext);
    state = run(state, findNext);
    expect(findKey.getState(state)!.current).toBe(0);
    state = run(state, findPrevious);
    expect(findKey.getState(state)!.current).toBe(2);
  });

  it("finds parts of words unless asked for whole ones", () => {
    let state = run(start(), setQuery({query: "sam"}));
    expect(findKey.getState(state)!.matches).toHaveLength(4);
    state = run(state, setQuery({query: "sam", wholeWord: true}));
    expect(findKey.getState(state)!.matches).toHaveLength(3);
  });

  it("starts from the caret", () => {
    let state = start();
    const cue = state.doc.child(0).nodeSize + state.doc.child(1).nodeSize;
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, cue)));
    state = run(state, setQuery({query: "sam", wholeWord: true}));
    expect(findKey.getState(state)!.current).toBe(1);
  });

  it("keeps up with typing, and clears with an empty query", () => {
    let state = run(start(), setQuery({query: "sam", wholeWord: true}));
    state = state.apply(state.tr.insertText("Sam, ", 1));
    expect(findKey.getState(state)!.matches).toHaveLength(4);
    state = run(state, setQuery({query: ""}));
    expect(findKey.getState(state)!.matches).toEqual([]);
  });

  it("leaves the selection where it is when nothing matches", () => {
    const state = run(start(), setQuery({query: "nobody"}));
    expect(findKey.getState(state)!.matches).toEqual([]);
    expect(state.selection.empty).toBe(true);
    expect(findNext(state)).toBe(false);
  });
});

describe("replace", () => {
  it("replaces the selected match in its case and selects the next", () => {
    let state = run(start(), setQuery({query: "sam", wholeWord: true}));
    state = run(state, replaceCurrent("alex"));
    expect(texts(state)[1]).toBe("Alex waits. Samantha doesn't.");
    expect(selected(state)).toBe("SAM");
    state = run(state, replaceCurrent("alex"));
    expect(texts(state)[2]).toBe("ALEX");
  });

  it("goes to a match first when none is selected", () => {
    let state = run(start(), setQuery({query: "sam", wholeWord: true}));
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, 1)));
    state = run(state, replaceCurrent("alex"));
    expect(texts(state)).toEqual(script.map(block => block.text));
    expect(selected(state)).toBe("Sam");
  });

  it("doesn't find its own replacement again", () => {
    let state = run(start(), setQuery({query: "sam", wholeWord: true}));
    state = run(state, replaceCurrent("Sam Jones"));
    expect(texts(state)[1]).toBe("Sam Jones waits. Samantha doesn't.");
    expect(selected(state)).toBe("SAM");
  });

  it("replaces every match as one step to undo", () => {
    let state = run(start(), setQuery({query: "sam", wholeWord: true}));
    state = run(state, replaceAll("alex"));
    expect(texts(state)).toEqual(["int. kitchen - night", "Alex waits. Samantha doesn't.", "ALEX", "Again.\nalex, again."]);
    expect(findKey.getState(state)!.matches).toEqual([]);
    state = run(state, undo);
    expect(texts(state)).toEqual(script.map(block => block.text));
  });

  it("deletes the matches for an empty replacement", () => {
    let state = run(start(), setQuery({query: "again"}));
    state = run(state, replaceAll(""));
    expect(texts(state)[3]).toBe(".\nsam, .");
  });
});
