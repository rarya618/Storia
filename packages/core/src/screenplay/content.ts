import { ScriptBlock, isElementType } from "./types";
import { randomString } from "../misc/randomString";

// stored content may be an array or (from older writes) an object keyed by index
export const readBlocks = (content: unknown): ScriptBlock[] => {
  const raw = Array.isArray(content) ? content : content && typeof content === "object" ? Object.values(content) : [];
  // a type this build doesn't know (written by a newer one) reads as action, so
  // its text survives the next save instead of being dropped
  const blocks = raw
    .filter((block): block is ScriptBlock => Boolean(block) && typeof block === "object")
    .map(block => ({id: block.id ?? randomString(8), type: isElementType(block.type) ? block.type : "action", text: block.text ?? ""}));
  return blocks.length > 0 ? blocks : [{id: randomString(8), type: "heading", text: ""}];
};
