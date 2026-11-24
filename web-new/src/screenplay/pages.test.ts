import { describe, expect, it } from "vitest";
import { paginate } from "./pages";
import { ElementType, ScriptBlock } from "./types";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

describe("paginate", () => {
  // a heading, then forty 70-character action lines: 2 printed lines each, plus a blank before
  const script = [block("h", "heading", "INT. HOUSE - DAY"), ...Array.from({length: 40}, (_, i) => block("a" + i, "action", "x".repeat(70))), block("e", "action", "")];

  it("counts pages at 55 lines", () => {
    expect(paginate(script).pages).toBe(3);
  });

  it("places each block on the page it starts on", () => {
    const {pageOf} = paginate(script);
    expect(pageOf.get("h")).toBe(1);
    expect(pageOf.get("a10")).toBe(1);
    expect(pageOf.get("a39")).toBe(3);
    // an empty block sits where the next line would go
    expect(pageOf.get("e")).toBe(3);
  });

  it("leaves notes off the page", () => {
    const withNote = [...script.slice(0, 5), block("n", "note", "x".repeat(2000)), ...script.slice(5)];
    expect(paginate(withNote).pages).toBe(3);
  });

  it("counts an empty script as no pages", () => {
    expect(paginate([]).pages).toBe(0);
    expect(paginate([block("z", "action", "")]).pages).toBe(0);
  });
});
