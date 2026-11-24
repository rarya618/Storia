import { ElementType, ScriptBlock } from "./types";

// characters per line for each element at 12pt Courier (10 characters per inch)
export const LINE_WIDTH: Record<ElementType, number> = {
  heading: 60,
  action: 60,
  character: 38,
  parenthetical: 24,
  dialogue: 35,
  transition: 60,
};

// blank lines printed before each element
const SPACE_BEFORE: Record<ElementType, number> = {
  heading: 2,
  action: 1,
  character: 1,
  parenthetical: 0,
  dialogue: 0,
  transition: 1,
};

const LINES_PER_PAGE = 55;

const linesFor = (text: string, width: number) =>
  text.split("\n").reduce((total, line) => total + Math.max(1, Math.ceil(line.length / width)), 0);

// the script laid out the way it would print, roughly: how many pages it runs
// to, and the page each block starts on (an empty block sits where the next
// written line would go)
export const paginate = (blocks: ScriptBlock[]) => {
  const pageOf = new Map<string, number>();
  let lines = 0;
  let first = true;

  blocks.forEach(block => {
    const written = block.text.trim() !== "";
    const before = written && !first ? SPACE_BEFORE[block.type] : 0;
    pageOf.set(block.id, Math.floor((lines + before) / LINES_PER_PAGE) + 1);
    if (!written) return;
    lines += before + linesFor(block.text, LINE_WIDTH[block.type]);
    first = false;
  });

  const pages = lines === 0 ? 0 : Math.max(1, Math.ceil(lines / LINES_PER_PAGE));
  // a block at the very foot of the last page still counts as on it
  if (pages > 0) pageOf.forEach((page, id) => { if (page > pages) pageOf.set(id, pages); });
  return {pages, pageOf};
};

// rough page count, the way screenwriters estimate running time
export const estimatePages = (blocks: ScriptBlock[]) => paginate(blocks).pages;
