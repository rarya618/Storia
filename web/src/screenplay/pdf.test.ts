import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { ScriptBlock } from "@storia/core/screenplay/types";
import { FontFiles, scriptPdf } from "./pdf";

const font = (name: string) => {
  const file = readFileSync(new URL("./fonts/CourierPrime_" + name + ".ttf", import.meta.url));
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
};
const fonts: FontFiles = {regular: font("400Regular"), bold: font("700Bold"), italic: font("400Regular_Italic"), boldItalic: font("700Bold_Italic")};

const blocks: ScriptBlock[] = [
  {id: "h", type: "heading", text: "INT. HOUSE - DAY"},
  ...Array.from({length: 40}, (_, i): ScriptBlock => ({id: "a" + i, type: "action", text: "A line of action\twith a tab."})),
  {id: "c", type: "character", text: "ANN"},
  {id: "l", type: "lyrics", text: "La la la — café"},
  {id: "t", type: "act", text: "END OF ACT ONE"},
];

describe("scriptPdf", () => {
  it("makes a title page and the script's pages, on US Letter, with the document's details", async () => {
    const bytes = await scriptPdf({blocks, title: "The Long Way", author: "Sam Lee"}, fonts);
    const pdf = await PDFDocument.load(bytes);
    // 41 lines of action with blanks run past one page
    expect(pdf.getPageCount()).toBe(3);
    expect(pdf.getPage(1).getSize()).toEqual({width: 612, height: 792});
    expect(pdf.getTitle()).toBe("The Long Way");
    expect(pdf.getAuthor()).toBe("Sam Lee");
  });

  it("makes a title page alone for an empty script", async () => {
    const pdf = await PDFDocument.load(await scriptPdf({blocks: [], title: ""}, fonts));
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getTitle()).toBe("Untitled");
  });
});
