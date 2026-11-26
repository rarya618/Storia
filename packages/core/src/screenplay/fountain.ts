import { SPEECH, ScriptBlock } from "./types";

// a run of script blocks as Fountain (https://fountain.io), the plain text other
// screenwriting apps read; also what copying a selection of blocks puts on the clipboard
export const fountainBody = (blocks: ScriptBlock[]) => {
  const lines: string[] = [];
  blocks.forEach((block, index) => {
    const text = block.text.trim();
    if (!text) return;

    const previous = blocks.slice(0, index).reverse().find(other => other.text.trim() !== "");
    const continuesSpeech = SPEECH.includes(block.type) &&
      previous && (previous.type === "character" || SPEECH.includes(previous.type));

    if (lines.length > 0 && !continuesSpeech) lines.push("");

    switch (block.type) {
      case "heading": {
        const upper = text.toUpperCase();
        // force headings Fountain wouldn't recognise on its own
        lines.push(/^(INT|EXT|EST|INT\.\/EXT|INT\/EXT|I\/E)[ .]/.test(upper) ? upper : "." + upper);
        break;
      }
      case "character":
        lines.push("@" + text.toUpperCase());
        break;
      case "parenthetical":
        lines.push(text.startsWith("(") ? text : "(" + text + ")");
        break;
      case "dialogue":
        lines.push(text);
        break;
      case "transition": {
        const upper = text.toUpperCase();
        lines.push(upper.endsWith("TO:") ? upper : "> " + upper);
        break;
      }
      case "act":
        // Fountain's centred text
        lines.push(">" + text.toUpperCase() + "<");
        break;
      case "lyrics":
        lines.push(...text.split("\n").map(line => "~" + line));
        break;
      case "note":
        lines.push("[[" + text + "]]");
        break;
      case "shot":
        // Fountain has no shot; it's capitalised action, forced so it isn't read as a cue
        lines.push("!" + text.toUpperCase());
        break;
      default: {
        // an all-caps action line would be read as a character cue, so force it
        const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
        lines.push(isAllCaps ? "!" + text : text);
      }
    }
  });

  return lines.join("\n");
};

// the whole script as a Fountain file, title page first
export const toFountain = (blocks: ScriptBlock[], title: string, author?: string) => {
  const titlePage = ["Title: " + title, ...(author ? ["Author: " + author] : [])].join("\n");
  return titlePage + "\n\n" + fountainBody(blocks) + "\n";
};
