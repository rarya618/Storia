import { ElementType, ScriptBlock } from "./types";
import { layOut } from "./layout";

// characters per line for each element at 12pt Courier (10 characters per inch)
export const LINE_WIDTH: Record<ElementType, number> = {
  heading: 60,
  action: 60,
  character: 38,
  parenthetical: 24,
  dialogue: 35,
  transition: 60,
  shot: 60,
  act: 60,
  lyrics: 35,
  note: 60,
};

// the script as the PDF sets it (layOut): how many pages it runs to, and the
// page each block starts on. A block that doesn't print (empty, or a note)
// sits where the next printed line goes, or on the last page after the end
export const paginate = (blocks: ScriptBlock[]) => {
  const laid = layOut(blocks);
  const firstPage = new Map<string, number>();
  laid.forEach(page => page.lines.forEach(line => {
    if (line?.block && !firstPage.has(line.block)) firstPage.set(line.block, page.number);
  }));

  const pageOf = new Map<string, number>();
  let following = Math.max(1, laid.length);
  for (let index = blocks.length - 1; index >= 0; index--) {
    const block = blocks[index];
    following = firstPage.get(block.id) ?? following;
    pageOf.set(block.id, following);
  }
  return {pages: laid.length, pageOf};
};

// the page count, the way screenwriters estimate running time
export const estimatePages = (blocks: ScriptBlock[]) => paginate(blocks).pages;
