import { describe, expect, it } from "vitest";
import { findIn, fitCase } from "./find";

const found = (text: string, query: string, wholeWord = true) => findIn(text, query, {wholeWord}).map(({from, to}) => text.slice(from, to));

describe("findIn", () => {
  it("finds every match, ignoring case", () => {
    expect(found("Sam looks at SAM. sam!", "sam")).toEqual(["Sam", "SAM", "sam"]);
    expect(findIn("Sam and Sam", "Sam")).toEqual([{from: 0, to: 3}, {from: 8, to: 11}]);
  });

  it("finds parts of words unless asked for whole ones", () => {
    expect(found("walking walk Walked", "walk", false)).toEqual(["walk", "walk", "Walk"]);
    expect(findIn("Samantha", "sam")).toEqual([{from: 0, to: 3}]);
    expect(found("Samantha", "sam")).toEqual([]);
  });

  it("keeps to whole words", () => {
    expect(found("Samantha, Sam's, Sam", "Sam")).toEqual(["Sam", "Sam"]);
    expect(found("walking walk", "walk")).toEqual(["walk"]);
    expect(found("José and Josély", "José")).toEqual(["José"]);
  });

  it("lets a query's own spaces and marks sit against anything", () => {
    expect(found("INT. KITCHEN", "int.")).toEqual(["INT."]);
    expect(found("(beat)", "(beat")).toEqual(["(beat"]);
    expect(found("a - b", " - ")).toEqual([" - "]);
  });

  it("reads the query as text, not a pattern", () => {
    expect(found("Is it? Yes.", "it?")).toEqual(["it?"]);
    expect(found("a.b axb", "a.b")).toEqual(["a.b"]);
  });

  it("finds nothing for an empty query, and doesn't overlap", () => {
    expect(findIn("anything", "")).toEqual([]);
    expect(found("aaaa", "aa")).toEqual([]);
    expect(found("aaaa", "aa", false)).toEqual(["aa", "aa"]);
    expect(found("aa aa", "aa")).toEqual(["aa", "aa"]);
  });
});

describe("fitCase", () => {
  it("puts a replacement in capitals where the match is", () => {
    expect(fitCase("alex", "SAM")).toBe("ALEX");
  });

  it("capitalises it where the match is", () => {
    expect(fitCase("alex", "Sam")).toBe("Alex");
  });

  it("leaves it as typed where the match is in lower case, or the writer typed a capital", () => {
    expect(fitCase("alex", "sam")).toBe("alex");
    expect(fitCase("McKay", "SAM")).toBe("McKay");
    expect(fitCase("", "SAM")).toBe("");
  });

  it("reads a single capital as capitalised, not shouting", () => {
    expect(fitCase("you", "I")).toBe("You");
  });
});
