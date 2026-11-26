import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";
import { randomString } from "@storia/core/misc/randomString";
import { readZipEntry } from "../misc/unzip";

// A WriterDuet (.wdz) file is a ZIP holding script.json. The script isn't stored as text: each
// branch (draft) keeps a history `h` of edits, keyed by push ids that sort in time order, and the
// script is what replaying them gives. Edits address paths like `data/{lineId}/type`,
// `data/{lineId}/removed`, or `data/{lineId}/.c/…` for the line's text, whose ops insert or delete
// at an offset, or undo / redo the line's last edit. Lines read in the order of their ids.

type Line = {type?: string, text: string, removed: boolean, undo: Edit[][], redo: Edit[][]};
type Edit = {insert: string, at: number} | {remove: number, at: number};
type HistoryEntry = {a?: string, l?: string, v?: string | null};

// WriterDuet's line types
const ELEMENT_FOR: Record<string, ElementType> = {
  Slugline: "heading",
  Action: "action",
  Text: "action",
  EditDialogName: "character",
  EditDialogParen: "parenthetical",
  EditDialogContent: "dialogue",
  Transition: "transition",
  Shot: "shot",
  Act: "act",
  EndAct: "act",
  Lyrics: "lyrics",
  Note: "note",
};
// outline lines are planning, not script, so they stay behind
const UNPRINTED = ["Outline"];

const parse = (value: string | null | undefined): unknown => {
  try { return value == null ? null : JSON.parse(value); } catch { return null; }
};

// apply one edit and return the edit that undoes it
const apply = (line: Line, edit: Edit): Edit => {
  const {text} = line;
  if ("insert" in edit) {
    line.text = text.slice(0, edit.at) + edit.insert + text.slice(edit.at);
    return {remove: edit.insert.length, at: edit.at};
  }
  line.text = text.slice(0, edit.at) + text.slice(edit.at + edit.remove);
  return {insert: text.slice(edit.at, edit.at + edit.remove), at: edit.at};
};

// run a group of edits, giving back the group that reverses it
const applyAll = (line: Line, edits: Edit[]) => edits.map(edit => apply(line, edit)).reverse();

// one text change from the history: [clock, [[op, [clock, version, offset, argument]], …], time]
const changeText = (line: Line, value: unknown) => {
  if (!Array.isArray(value) || !Array.isArray(value[1])) return;
  const edits: Edit[] = [];
  for (const op of value[1]) {
    if (!Array.isArray(op) || !Array.isArray(op[1])) continue;
    const [kind, [, , at, argument]] = op;
    if (kind === "i" && typeof at === "number" && typeof argument === "string") edits.push({insert: argument, at});
    else if (kind === "d" && typeof at === "number" && typeof argument === "number") edits.push({remove: argument, at});
    else if (kind === "u") {
      const group = line.undo.pop();
      if (group) line.redo.push(applyAll(line, group));
    } else if (kind === "r") {
      const group = line.redo.pop();
      if (group) line.undo.push(applyAll(line, group));
    }
  }
  if (edits.length > 0) {
    line.undo.push(applyAll(line, edits));
    line.redo = [];
  }
};

type Script = {
  extras?: {active_branch_id?: string},
  encryption?: unknown,
  b?: Record<string, {details?: {name?: string, branchType?: string}, h?: Record<string, HistoryEntry>}>,
};

// the draft the writer last had open, or else the first one that's a script
const pickBranch = (script: Script) => {
  const branches = script.b ?? {};
  const active = script.extras?.active_branch_id;
  if (active && branches[active]) return branches[active];
  return Object.entries(branches).find(([id, branch]) =>
    id !== "titlePage" && branch.details?.name !== "Graveyard" && branch.details?.branchType !== "empty")?.[1];
};

// read a WriterDuet (.wdz) file into script blocks; throws with a message for the writer
export const fromWriterDuet = async (file: ArrayBuffer): Promise<ScriptBlock[]> => {
  const notWriterDuet = new Error("This isn't a WriterDuet file. Choose a .wdz file exported from WriterDuet.");

  let script: Script;
  try {
    const json = await readZipEntry(file, "script.json");
    if (!json) throw notWriterDuet;
    script = JSON.parse(new TextDecoder().decode(json));
  } catch {
    throw notWriterDuet;
  }
  if (script.encryption) throw new Error("This WriterDuet file is encrypted. Turn off encryption in WriterDuet and export it again.");

  const history = pickBranch(script)?.h;
  if (!history) throw notWriterDuet;

  const lines = new Map<string, Line>();
  const lineFor = (id: string) => {
    let line = lines.get(id);
    if (!line) lines.set(id, line = {text: "", removed: false, undo: [], redo: []});
    return line;
  };
  let customTypes: Record<string, {behaves_like?: string}> = {};

  for (const key of Object.keys(history).sort()) {
    const {a: action, l: path = "", v: raw} = history[key];
    const value = parse(raw);

    // the opening snapshot seeds the formatting and any starting lines
    if (action === "s" && path === "" && value && typeof value === "object") {
      const snapshot = value as {formatting?: {custom_line_types?: {list?: typeof customTypes}}, data?: Record<string, {type?: string}>};
      customTypes = snapshot.formatting?.custom_line_types?.list ?? {};
      for (const [id, line] of Object.entries(snapshot.data ?? {})) lineFor(id).type = line?.type;
      continue;
    }

    if (!path.startsWith("data/")) continue;
    const [, id, ...rest] = path.split("/");
    const field = rest.join("/");
    const line = lineFor(id);

    if (field === "" && value && typeof value === "object" && "type" in value) line.type = String(value.type);
    else if (field === "type" && typeof value === "string") line.type = value;
    else if (field === "removed") line.removed = Boolean(value);
    else if (field.startsWith(".c/")) changeText(line, value);
  }

  const blocks: ScriptBlock[] = [];
  for (const id of [...lines.keys()].sort()) {
    const line = lines.get(id)!;
    const text = line.text.replace(/\r\n?/g, "\n").replace(/\t/g, " ").trim();
    if (line.removed || !text || !line.type) continue;

    const behavesLike = customTypes[line.type]?.behaves_like;
    if (UNPRINTED.includes(line.type) || (behavesLike && UNPRINTED.includes(behavesLike))) continue;
    const type = ELEMENT_FOR[line.type] ?? ELEMENT_FOR[behavesLike ?? ""] ?? "action";

    blocks.push({
      id: randomString(8),
      type,
      text: type === "parenthetical" && !text.startsWith("(") ? "(" + text + ")"
        : text,
    });
  }

  if (blocks.length === 0) throw new Error("This WriterDuet file has no script in it.");
  return blocks;
};
