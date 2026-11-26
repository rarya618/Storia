import { describe, expect, it } from "vitest";
import { CAPITALS, ELEMENTS, capitalise, inCapitals } from "./types";

describe("capitals", () => {
  it("sets headings, cues, transitions, shots and act breaks in capitals, and nothing else", () => {
    expect(ELEMENTS.filter(element => inCapitals(element.type)).map(element => element.type))
      .toEqual(["heading", "character", "transition", "shot", "act"]);
    expect(CAPITALS).not.toContain("dialogue");
  });

  it("capitalises letter for letter", () => {
    expect(capitalise("int. margo's kitchen - day")).toBe("INT. MARGO'S KITCHEN - DAY");
    expect(capitalise("josé (v.o.)")).toBe("JOSÉ (V.O.)");
  });

  it("keeps a letter whose capital is longer, so the length never changes", () => {
    expect(capitalise("straße")).toBe("STRAßE");
    expect(capitalise("straße")).toHaveLength("straße".length);
  });
});
