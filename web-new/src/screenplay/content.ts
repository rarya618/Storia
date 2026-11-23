import { ScriptBlock, isElementType } from "./types";
import { randomString } from "../misc/randomString";

// stored content may be an array or (from older writes) an object keyed by index
export const readBlocks = (content: unknown): ScriptBlock[] => {
  const raw = Array.isArray(content) ? content : content && typeof content === "object" ? Object.values(content) : [];
  const blocks = raw
    .filter((block): block is ScriptBlock => Boolean(block) && isElementType(block.type))
    .map(block => ({id: block.id ?? randomString(8), type: block.type, text: block.text ?? ""}));
  return blocks.length > 0 ? blocks : [{id: randomString(8), type: "heading", text: ""}];
};
