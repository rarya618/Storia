import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { Line, layOut, layOutTitle } from "@storia/core/screenplay/layout";
import { ScriptBlock } from "@storia/core/screenplay/types";

// The script as a PDF, drawn from the layout in @storia/core: US Letter, 12pt
// Courier Prime at 6 lines an inch, a 1.5in left margin and 1in on the other
// sides, a title page, and each page after the first numbered at its top right.
// It makes the file itself, so every browser gives the same pages, with none of
// a print dialog's headers, footers or scaling.

export type FontFiles = {regular: ArrayBuffer, bold: ArrayBuffer, italic: ArrayBuffer, boldItalic: ArrayBuffer};

const INCH = 72;
const PAGE_SIZE: [number, number] = [8.5 * INCH, 11 * INCH];
const LEFT = 1.5 * INCH;
const TOP = 1 * INCH;
const SIZE = 12;
const LEADING = 12;
const CHAR = 7.2; // 10 characters an inch
// from the top of a 12pt line to its baseline
const BASELINE = 9;

type Fonts = {regular: PDFFont, bold: PDFFont, italic: PDFFont, boldItalic: PDFFont};

// tabs and other control characters have no glyph in the font
const printable = (text: string) =>
  Array.from(text.replace(/\t/g, "    ")).filter(letter => letter >= " " && letter !== "\u007f").join("");

const fontFor = (fonts: Fonts, line: Line) =>
  line.bold ? (line.italic ? fonts.boldItalic : fonts.bold) : (line.italic ? fonts.italic : fonts.regular);

const drawLine = (page: PDFPage, fonts: Fonts, line: Line, row: number) => {
  const text = printable(line.text);
  if (text === "") return;
  const font = fontFor(fonts, line);
  const width = font.widthOfTextAtSize(text, SIZE);
  const start = LEFT + line.indent * CHAR;
  const x = line.align === "right" ? start + line.width * CHAR - width
    : line.align === "center" ? start + (line.width * CHAR - width) / 2
    : start;
  const y = PAGE_SIZE[1] - TOP - row * LEADING - BASELINE;
  page.drawText(text, {x, y, size: SIZE, font, color: rgb(0, 0, 0)});
  if (line.underline) {
    page.drawLine({start: {x, y: y - 1.5}, end: {x: x + width, y: y - 1.5}, thickness: 0.75, color: rgb(0, 0, 0)});
  }
};

export const scriptPdf = async (
  {blocks, title, author}: {blocks: ScriptBlock[], title: string, author?: string},
  files: FontFiles,
): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const [regular, bold, italic, boldItalic] = await Promise.all(
    [files.regular, files.bold, files.italic, files.boldItalic].map(file => pdf.embedFont(file, {subset: true})),
  );
  const fonts = {regular, bold, italic, boldItalic};

  pdf.setTitle(title.trim() || "Untitled");
  if (author?.trim()) pdf.setAuthor(author.trim());
  pdf.setCreator("Storia");
  pdf.setProducer("Storia");

  const titlePage = pdf.addPage(PAGE_SIZE);
  layOutTitle(title, author).forEach((line, row) => line && drawLine(titlePage, fonts, line, row));

  for (const {number, lines} of layOut(blocks)) {
    const page = pdf.addPage(PAGE_SIZE);
    // the first page goes unnumbered, as a screenplay's does
    if (number > 1) {
      const label = number + ".";
      const x = PAGE_SIZE[0] - 1 * INCH - regular.widthOfTextAtSize(label, SIZE);
      page.drawText(label, {x, y: PAGE_SIZE[1] - 0.5 * INCH - BASELINE, size: SIZE, font: regular, color: rgb(0, 0, 0)});
    }
    lines.forEach((line, row) => line && drawLine(page, fonts, line, row));
  }

  return pdf.save();
};
