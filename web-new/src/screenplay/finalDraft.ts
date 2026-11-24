import { ElementType, ScriptBlock } from "./types";
import { randomString } from "../misc/randomString";

// Final Draft's paragraph types, as they appear in an .fdx file; anything else
// (General, Cast List, custom elements) comes in as action
const ELEMENT_FOR: Record<string, ElementType> = {
  "Scene Heading": "heading",
  "Action": "action",
  "Character": "character",
  "Parenthetical": "parenthetical",
  "Dialogue": "dialogue",
  "Transition": "transition",
  "Shot": "shot",
  "New Act": "act",
  "End of Act": "act",
  "Lyrics": "lyrics",
};

// a paragraph's text is spread over <Text> runs, one per change of style
const paragraphText = (paragraph: Element) =>
  Array.from(paragraph.children)
    .filter(child => child.tagName === "Text")
    .map(text => text.textContent ?? "")
    .join("")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .trim();

// read a Final Draft (.fdx) file into script blocks; throws with a message for the writer
export const fromFinalDraft = (xml: string): ScriptBlock[] => {
  const file = new DOMParser().parseFromString(xml, "application/xml");
  const root = file.documentElement;
  if (file.getElementsByTagName("parsererror").length > 0 || root.tagName !== "FinalDraft") {
    throw new Error("This isn't a Final Draft file. Choose an .fdx file saved from Final Draft.");
  }

  // the script is the <Content> directly under <FinalDraft>; the title page has its own
  const content = Array.from(root.children).find(child => child.tagName === "Content");
  const blocks: ScriptBlock[] = [];

  const read = (paragraph: Element) => {
    // dual dialogue nests its two speeches inside a paragraph; they come in one after the other
    const dual = Array.from(paragraph.children).find(child => child.tagName === "DualDialogue");
    if (dual) {
      Array.from(dual.children).filter(child => child.tagName === "Paragraph").forEach(read);
      return;
    }

    const text = paragraphText(paragraph);
    if (!text) return;
    const type = ELEMENT_FOR[paragraph.getAttribute("Type") ?? ""] ?? "action";
    blocks.push({
      id: randomString(8),
      type,
      text: type === "parenthetical" && !text.startsWith("(") ? "(" + text + ")" : text,
    });
  };

  Array.from(content?.children ?? []).filter(child => child.tagName === "Paragraph").forEach(read);

  if (blocks.length === 0) throw new Error("This Final Draft file has no script in it.");
  return blocks;
};
