import { describe, expect, it } from "vitest";
import { diffScripts, diffStats, diffWords } from "./diff";
import { ElementType, ScriptBlock } from "./types";

let next = 0;
const block = (type: ElementType, text: string): ScriptBlock => ({id: "b" + next++, type, text});

const heading = block("heading", "INT. HOUSE - DAY");
const action = block("action", "She waits by the door.");
const cue = block("character", "MAYA");
const line = block("dialogue", "Are you coming?");

describe("diffWords", () => {
  it("marks the words that changed, keeping the rest", () => {
    expect(diffWords("She waits by the door.", "She waits by the window.")).toEqual([
      {text: "She waits by the "},
      {text: "door.", change: "removed"},
      {text: "window.", change: "added"},
    ]);
  });

  it("marks words added at the end", () => {
    expect(diffWords("She waits.", "She waits. And waits.")).toEqual([
      {text: "She waits."},
      {text: " And waits.", change: "added"},
    ]);
  });

  it("leaves an unchanged line whole", () => {
    expect(diffWords("Are you coming?", "Are you coming?")).toEqual([{text: "Are you coming?"}]);
  });
});

describe("diffScripts", () => {
  it("leaves the same script unmarked, even with fresh ids", () => {
    const lines = diffScripts([heading, action], [{...heading, id: "x"}, {...action, id: "y"}]);
    expect(lines.every(line => !line.change)).toBe(true);
    expect(lines.map(line => line.type)).toEqual(["heading", "action"]);
  });

  it("marks added and removed lines in place", () => {
    const lines = diffScripts([heading, action, cue, line], [heading, cue, line, block("transition", "CUT TO:")]);
    expect(lines.map(line => [line.type, line.change])).toEqual([
      ["heading", undefined],
      ["action", "removed"],
      ["character", undefined],
      ["dialogue", undefined],
      ["transition", "added"],
    ]);
  });

  it("shows an edited line as an edit, with its words marked", () => {
    const edited = {...action, id: "z", text: "She waits by the window."};
    const lines = diffScripts([heading, action], [heading, block("action", "Rain."), edited]);
    expect(lines.map(line => line.change)).toEqual([undefined, "added", "changed"]);
    expect(lines[2].segments).toContainEqual({text: "window.", change: "added"});
  });

  it("notes an edit that changed the element", () => {
    const lines = diffScripts([action], [{...action, type: "dialogue"}]);
    expect(lines).toEqual([{type: "dialogue", change: "changed", was: "action", segments: [{text: action.text}]}]);
  });
});

describe("diffStats", () => {
  it("counts the words added and removed and the lines touched", () => {
    const lines = diffScripts([heading, action], [heading, {...action, text: "She waits by the window, alone."}]);
    expect(diffStats(lines)).toEqual({added: 2, removed: 1, changedLines: 1});
  });
});
