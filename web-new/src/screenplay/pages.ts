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

// rough page count, the way screenwriters estimate running time
export const estimatePages = (blocks: ScriptBlock[]) => {
  const written = blocks.filter(block => block.text.trim() !== "");
  if (written.length === 0) return 0;

  const lines = written.reduce((total, block, index) =>
    total + (index === 0 ? 0 : SPACE_BEFORE[block.type]) + linesFor(block.text, LINE_WIDTH[block.type]), 0);

  return Math.max(1, Math.ceil(lines / LINES_PER_PAGE));
};
