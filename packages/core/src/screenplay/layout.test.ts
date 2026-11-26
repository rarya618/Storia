import { describe, expect, it } from "vitest";
import { Line, PAGE_LINES, Page, layOut, layOutTitle, wrap } from "./layout";
import { ElementType, ScriptBlock } from "./types";

let next = 0;
const block = (type: ElementType, text: string): ScriptBlock => ({id: "b" + next++, type, text});
const texts = (page: Page) => page.lines.map(line => line?.text ?? "");
const action = (count: number) => Array.from({length: count}, (_, i) => block("action", "Line " + i + "."));

describe("wrap", () => {
  it("breaks at spaces within the width", () => {
    expect(wrap("the quick brown fox jumps", 10)).toEqual(["the quick", "brown fox", "jumps"]);
  });

  it("breaks a word longer than the line through it", () => {
    expect(wrap("abcdefghijkl", 5)).toEqual(["abcde", "fghij", "kl"]);
  });

  it("keeps the writer's line breaks, empty lines too", () => {
    expect(wrap("one\n\ntwo", 10)).toEqual(["one", "", "two"]);
  });
});

describe("layOut", () => {
  it("sets each element at its indent and in its style", () => {
    const [page] = layOut([
      block("heading", "int. house - day"),
      block("character", "Ann"),
      block("parenthetical", "(quietly)"),
      block("dialogue", "Hello."),
      block("transition", "cut to:"),
      block("act", "Act two"),
    ]);
    const lines = page.lines.filter((line): line is Line => line !== null);
    expect(lines.map(line => [line.text, line.indent, line.align])).toEqual([
      ["INT. HOUSE - DAY", 0, "left"],
      ["ANN", 22, "left"],
      ["(quietly)", 16, "left"],
      ["Hello.", 10, "left"],
      ["CUT TO:", 0, "right"],
    ]);
    expect(lines[0].bold).toBe(true);
  });

  it("spaces elements apart, speech without blank lines, and a page starts without them", () => {
    const [page] = layOut([block("action", "A man walks."), block("heading", "EXT. STREET - DAY"), block("character", "ANN"), block("dialogue", "Hi.")]);
    expect(texts(page)).toEqual(["A man walks.", "", "", "EXT. STREET - DAY", "", "ANN", "Hi."]);
  });

  it("leaves notes and empty blocks off the page", () => {
    const [page] = layOut([block("action", "One."), block("note", "mine"), block("action", "  "), block("action", "Two.")]);
    expect(texts(page)).toEqual(["One.", "", "Two."]);
  });

  it("fills pages of 54 lines", () => {
    // each action line takes 2 with the blank before it: 27 to a page
    const pages = layOut(action(60));
    expect(pages.map(page => page.lines.length)).toEqual([53, 53, 11]);
    expect(pages.every(page => page.lines.length <= PAGE_LINES)).toBe(true);
    expect(texts(pages[1])[0]).toBe("Line 27.");
    expect(pages.map(page => page.number)).toEqual([1, 2, 3]);
  });

  it("doesn't leave a scene heading at the foot of a page", () => {
    const pages = layOut([...action(26), block("heading", "INT. HOUSE - DAY"), ...action(2)]);
    expect(texts(pages[0]).at(-1)).toBe("Line 25.");
    expect(texts(pages[1])[0]).toBe("INT. HOUSE - DAY");
  });

  it("breaks a long speech with (MORE) and the cue again", () => {
    const speech = "Word ".repeat(7 * 20).trim(); // 20 lines of dialogue
    const pages = layOut([...action(20), block("character", "ann (cont'd)"), block("dialogue", speech)]);
    const first = texts(pages[0]);
    expect(first.at(-1)).toBe("(MORE)");
    expect(pages[0].lines.length).toBe(PAGE_LINES);
    expect(texts(pages[1])[0]).toBe("ANN (CONT'D)");
    expect(pages[1].lines[0]!.indent).toBe(22);
    // every line of dialogue printed once
    const dialogue = pages.flatMap(page => page.lines).filter(line => line?.indent === 10);
    expect(dialogue.length).toBe(20);
  });

  it("moves a speech that can't leave two lines on each page to the next", () => {
    // 51 lines of action leave room for a blank, the cue and one line
    const pages = layOut([...action(26), block("character", "ANN"), block("dialogue", "One.\nTwo.\nThree.")]);
    expect(pages[0].lines.length).toBe(51);
    expect(texts(pages[1])).toEqual(["ANN", "One.", "Two.", "Three."]);
  });

  it("doesn't end a page on a parenthetical", () => {
    const parts = [block("character", "ANN"), block("dialogue", "One."), block("dialogue", "Two."), block("dialogue", "Three."), block("parenthetical", "(beat)"), block("dialogue", "Four."), block("dialogue", "Five."), block("dialogue", "Six.")];
    // 47 lines of action, a blank and the cue leave room for four lines and (MORE)
    const pages = layOut([...action(24), ...parts]);
    expect(texts(pages[0]).slice(-2)).toEqual(["Three.", "(MORE)"]);
    expect(texts(pages[1])).toEqual(["ANN (CONT'D)", "(beat)", "Four.", "Five.", "Six."]);
  });

  it("breaks long action between lines, leaving two on each page", () => {
    const long = "Word ".repeat(12 * 10).trim(); // 10 lines
    const pages = layOut([...action(25), block("action", long)]);
    // 49 lines used, a blank: 4 lines fit
    expect(pages[0].lines.length).toBe(PAGE_LINES);
    expect(pages[1].lines.length).toBe(6);
  });

  it("starts each act on a new page, but not the first", () => {
    const pages = layOut([block("act", "ACT ONE"), ...action(2), block("act", "END OF ACT ONE"), block("act", "ACT TWO"), ...action(1)]);
    expect(pages.length).toBe(2);
    expect(texts(pages[0])).toEqual(["ACT ONE", "", "Line 0.", "", "Line 1.", "", "", "END OF ACT ONE"]);
    expect(texts(pages[1])[0]).toBe("ACT TWO");
    expect(pages[1].lines[0]!.underline).toBe(true);
  });

  it("lays out nothing for an empty script", () => {
    expect(layOut([])).toEqual([]);
  });

  it("never runs a page past 54 lines, even for a block longer than a page", () => {
    const huge = Array.from({length: 130}, (_, i) => "Line " + i).join("\n");
    const pages = layOut([block("heading", "INT. HOUSE"), block("action", huge), block("character", "ANN"), block("dialogue", Array(80).fill("Yes.").join("\n"))]);
    expect(pages.every(page => page.lines.length <= PAGE_LINES)).toBe(true);
    expect(pages.flatMap(page => page.lines).filter(line => line?.indent === 10).length).toBe(80);
  });
});

describe("layOutTitle", () => {
  it("centres the title in capitals with the author under it", () => {
    const lines = layOutTitle("The Long Way", "Sam Lee");
    const set = lines.filter((line): line is Line => line !== null);
    expect(set.map(line => line.text)).toEqual(["THE LONG WAY", "Written by", "Sam Lee"]);
    expect(set.every(line => line.align === "center")).toBe(true);
    const top = lines.findIndex(line => line !== null);
    expect(top).toBe(Math.floor((PAGE_LINES - (lines.length - top)) / 2));
  });

  it("leaves off Written by without an author", () => {
    expect(layOutTitle("Draft").filter(line => line !== null).map(line => line!.text)).toEqual(["DRAFT"]);
  });
});
