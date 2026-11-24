import { createPortal } from "react-dom";
import { forwardRef, KeyboardEvent, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ELEMENTS, ElementType, ScriptBlock, elementLabel, isElementType } from "../../screenplay/types";
import {
  looksLikeHeading, textForType, typeAfterEnter, typeAfterTab,
  typeBefore, typeOnEmptyBackspace, typeOnEmptyEnter
} from "../../screenplay/flow";
import { characterNames, characterSuggestions } from "../../screenplay/characters";
import { fountainBody } from "../../screenplay/fountain";
import { randomString } from "../../misc/randomString";

export type ScriptEditorHandle = {
  focusBlock: (id: string, caret?: Caret) => void,
  // an editor that makes these changes itself, as edits it can undo (the
  // ProseMirror one); without them DocumentView changes the blocks directly
  setType?: (type: ElementType) => void,
  insertScene?: () => void,
};

export type Caret = "start" | "end" | number;

export type ScriptEditorProps = {
  blocks: ScriptBlock[],
  setBlocks: (update: (blocks: ScriptBlock[]) => ScriptBlock[]) => void,
  activeId?: string,
  setActiveId: (id: string) => void,
};

const newBlock = (type: ElementType, text = ""): ScriptBlock => ({id: randomString(8), type, text});

const isModifier = (event: KeyboardEvent) => event.metaKey || event.ctrlKey;

// blocks copied from Storia also go on the clipboard as this type, so they paste
// back as blocks, each with its element; other apps read the Fountain beside it
const BLOCKS_MIME = "application/x-storia-blocks";

const blocksFromClipboard = (data: DataTransfer): ScriptBlock[] | undefined => {
  try {
    const parsed: unknown = JSON.parse(data.getData(BLOCKS_MIME) || "null");
    if (!Array.isArray(parsed)) return undefined;
    const list = parsed
      .filter((block): block is ScriptBlock => Boolean(block) && isElementType(block.type) && typeof block.text === "string")
      .map(block => newBlock(block.type, block.text));
    return list.length > 0 ? list : undefined;
  } catch {
    return undefined;
  }
};

// plain text pasted over selected blocks: a block of action per paragraph
const blocksFromText = (text: string) =>
  text.replace(/\r\n?/g, "\n").split(/\n{2,}/).map(part => part.trim()).filter(Boolean).map(part => newBlock("action", part));

type Range = {anchor: number, focus: number};
// the script as it was before a change across blocks, and what was selected then
type Snapshot = {blocks: ScriptBlock[], range?: Range};

// where the browser can size a textarea to its text (field-sizing: content, in
// screenplay.css), it does, and the page reflows natively as a rail slides
// beside it; elsewhere each block is measured and set by hand
const nativeFit = typeof CSS !== "undefined" && CSS.supports("field-sizing", "content");

// grow a textarea to fit its text
const autosize = (element: HTMLTextAreaElement | null) => {
  if (!element || nativeFit) return;
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
};

const ScriptEditor = forwardRef<ScriptEditorHandle, ScriptEditorProps>(({blocks, setBlocks, activeId, setActiveId}, ref) => {
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  const [focusRequest, setFocusRequest] = useState<{id: string, caret: Caret}>();

  // A selection of whole blocks, as in Notion, since a browser can't select across
  // textareas. It starts from Escape in a block, a drag out of one, a box drawn
  // from the margin, Shift+click, Shift+arrow at a block's edge, or a second
  // Cmd/Ctrl+A. anchor is where it began, focus where it ends; while there is one,
  // the group has focus and the keys act on the blocks
  const [range, setRange] = useState<Range>();
  const low = range ? Math.max(0, Math.min(range.anchor, range.focus)) : -1;
  const high = range ? Math.min(blocks.length - 1, Math.max(range.anchor, range.focus)) : -1;
  // a press that may become a drag: out of a block's text, or a box from the margin
  const drag = useRef<{kind: "text", from: number, active: boolean} | {kind: "box", x: number, y: number, scroll: number, active: boolean}>();
  // the box being drawn, in viewport coordinates
  const [box, setBox] = useState<{left: number, top: number, width: number, height: number}>();

  // undo and redo for changes across blocks (deleting, cutting, pasting,
  // duplicating). Typing in a block is the textarea's own undo; it also forgets
  // these, so an undo never takes back writing done since
  const undos = useRef<Snapshot[]>([]);
  const redos = useRef<Snapshot[]>([]);
  // whether Cmd+Z in a block should still reach the last change across blocks
  const armed = useRef(false);
  const writing = () => {
    armed.current = false;
    undos.current = [];
    redos.current = [];
  };

  // character autocomplete
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [dismissedFor, setDismissedFor] = useState<string>();

  const activeBlock = blocks.find(block => block.id === activeId);
  // the script's names are only needed while a character cue is being written
  const inCue = activeBlock?.type === "character";
  const names = useMemo(() => inCue ? characterNames(blocks) : [], [inCue, blocks]);
  const suggestions = activeBlock?.type === "character" && dismissedFor !== activeBlock.text
    ? characterSuggestions(names, activeBlock.text)
    : [];

  useImperativeHandle(ref, () => ({
    focusBlock: (id, caret = "end") => setFocusRequest({id, caret}),
  }));

  // move focus and caret after the blocks have re-rendered
  useLayoutEffect(() => {
    if (!focusRequest) return;
    const field = fields.current.get(focusRequest.id);
    if (!field) return;

    const position = focusRequest.caret === "start" ? 0
      : focusRequest.caret === "end" ? field.value.length
      : focusRequest.caret;

    field.focus();
    field.setSelectionRange(position, position);
    field.closest(".sp-block")?.scrollIntoView({block: "nearest"});
    setFocusRequest(undefined);
  }, [focusRequest, blocks]);

  // put the caret in a new, empty script straight away
  useEffect(() => {
    if (blocks.length === 1 && blocks[0].text === "") setFocusRequest({id: blocks[0].id, caret: "start"});
    // only on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // each block fits itself as its text changes (see BlockRow); when the page
  // itself changes width (the window, a sidebar docking) every block refits
  const group = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!group.current) return;
    let width = 0;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      fields.current.forEach(autosize);
    });
    observer.observe(group.current);
    // Courier Prime arriving late changes how lines wrap
    let gone = false;
    document.fonts.ready.then(() => { if (!gone) fields.current.forEach(autosize); });
    return () => { gone = true; observer.disconnect(); };
  }, []);

  const updateBlock = (id: string, changes: Partial<ScriptBlock>) => {
    writing();
    setBlocks(current => current.map(block => block.id === id ? {...block, ...changes} : block));
  };

  const changeType = (block: ScriptBlock, type: ElementType) =>
    updateBlock(block.id, {type, text: textForType(block.text, block.type, type)});

  const onTextChange = (block: ScriptBlock, text: string) => {
    setSuggestionIndex(0);

    if (block.type === "action" && looksLikeHeading(text)) {
      return updateBlock(block.id, {type: "heading", text});
    }
    if (block.type === "dialogue" && text === "(") {
      updateBlock(block.id, {type: "parenthetical", text: "()"});
      return setFocusRequest({id: block.id, caret: 1});
    }
    updateBlock(block.id, {text});
  };

  const acceptSuggestion = (block: ScriptBlock, name: string) => {
    updateBlock(block.id, {text: name});
    setDismissedFor(name);
    setFocusRequest({id: block.id, caret: "end"});
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, block: ScriptBlock, index: number) => {
    // an input method (Japanese, Chinese…) uses Enter, Tab and Backspace while composing
    if (event.nativeEvent.isComposing) return;

    const field = event.currentTarget;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const text = block.text;

    // autocomplete list takes arrow keys, Enter and Tab while it's open
    if (suggestions.length > 0 && block.id === activeId) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        return setSuggestionIndex((suggestionIndex + step + suggestions.length) % suggestions.length);
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        return acceptSuggestion(block, suggestions[suggestionIndex]);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        return setDismissedFor(text);
      }
    }

    // Escape lets go of the text and selects the block itself
    if (event.key === "Escape" && !event.shiftKey) {
      event.preventDefault();
      return selectBlocks(index, index);
    }

    // Shift+arrow past a block's edge goes on to select blocks
    if (event.shiftKey && !isModifier(event) && event.key === "ArrowUp" && start === 0 && (end === 0 || field.selectionDirection === "backward")) {
      event.preventDefault();
      return selectBlocks(index, index);
    }
    if (event.shiftKey && !isModifier(event) && event.key === "ArrowDown" && end === text.length && (start === end || field.selectionDirection !== "backward")) {
      event.preventDefault();
      return selectBlocks(index, index);
    }

    // just after a change across blocks, Cmd+Z here takes it back, since there's
    // nothing in this block's own undo yet
    if (isModifier(event) && event.key.toLowerCase() === "z" && armed.current) {
      event.preventDefault();
      return event.shiftKey ? redo() : undo();
    }

    // Cmd/Ctrl+A selects the block's text first, as usual; again, the whole script
    if (isModifier(event) && !event.altKey && event.key.toLowerCase() === "a" && start === 0 && end === text.length) {
      event.preventDefault();
      return selectBlocks(0, blocks.length - 1);
    }

    // Cmd/Ctrl + 1–6 sets the element type
    if (isModifier(event) && !event.altKey) {
      const element = ELEMENTS.find(element => element.shortcut === event.key);
      if (element) {
        event.preventDefault();
        return changeType(block, element.type);
      }
    }

    if (event.key === "Tab") {
      event.preventDefault();
      return changeType(block, event.shiftKey ? typeBefore(block.type) : typeAfterTab(block.type));
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (text.trim() === "") return changeType(block, typeOnEmptyEnter(block.type));

      let before = text.slice(0, start);
      let after = text.slice(end);

      // Enter just inside a parenthetical's closing bracket finishes it
      if (block.type === "parenthetical" && after === ")") {
        before += ")";
        after = "";
      }

      const next = newBlock(typeAfterEnter(block.type), after);
      writing();
      setBlocks(current => {
        const updated = current.map(other => other.id === block.id ? {...other, text: before} : other);
        updated.splice(index + 1, 0, next);
        return updated;
      });
      return setFocusRequest({id: next.id, caret: "start"});
    }

    if (event.key === "Backspace" && start === 0 && end === 0) {
      if (text === "") {
        const fallback = typeOnEmptyBackspace(block.type);
        if (fallback) {
          event.preventDefault();
          return changeType(block, fallback);
        }
        if (blocks.length === 1) return;

        // delete the empty block
        event.preventDefault();
        const target = index > 0 ? blocks[index - 1] : blocks[index + 1];
        writing();
        setBlocks(current => current.filter(other => other.id !== block.id));
        return setFocusRequest({id: target.id, caret: index > 0 ? "end" : "start"});
      }

      // merge into the previous block
      if (index > 0) {
        event.preventDefault();
        const previous = blocks[index - 1];
        writing();
        setBlocks(current => current
          .filter(other => other.id !== block.id)
          .map(other => other.id === previous.id ? {...other, text: other.text + text} : other));
        return setFocusRequest({id: previous.id, caret: previous.text.length});
      }
    }

    // arrow keys move between blocks at their edges
    if (event.key === "ArrowUp" && start === 0 && end === 0 && index > 0) {
      event.preventDefault();
      return setFocusRequest({id: blocks[index - 1].id, caret: "end"});
    }
    if (event.key === "ArrowDown" && start === text.length && end === text.length && index < blocks.length - 1) {
      event.preventDefault();
      return setFocusRequest({id: blocks[index + 1].id, caret: "start"});
    }
  };

  // select whole blocks from anchor to focus, taking focus off the textareas so the
  // keys below act on the selection
  const selectBlocks = (anchor: number, focus: number) => {
    const field = activeId ? fields.current.get(activeId) : undefined;
    if (field) field.setSelectionRange(field.selectionStart, field.selectionStart);
    const last = blocks.length - 1;
    setRange({anchor: Math.max(0, Math.min(anchor, last)), focus: Math.max(0, Math.min(focus, last))});
    group.current?.focus({preventScroll: true});
  };

  // back to writing, with the caret at the start or end of a block
  const writeIn = (index: number, caret: "start" | "end") => {
    setRange(undefined);
    const block = blocks[index];
    if (block) setFocusRequest({id: block.id, caret});
  };

  // a change across blocks: remembered for undo, then either the given blocks are
  // selected or the caret goes where it's asked
  const changeBlocks = (next: ScriptBlock[], after: {select?: Range, caret?: {id: string, caret: Caret}}) => {
    undos.current.push({blocks, range});
    redos.current = [];
    armed.current = true;
    setBlocks(() => next);
    if (after.select) {
      setRange(after.select);
      group.current?.focus({preventScroll: true});
    } else {
      setRange(undefined);
      if (after.caret) setFocusRequest(after.caret);
    }
  };

  const restore = (from: {current: Snapshot[]}, to: {current: Snapshot[]}) => {
    const snapshot = from.current.pop();
    if (!snapshot) return;
    to.current.push({blocks, range});
    armed.current = true;
    setBlocks(() => snapshot.blocks);
    if (snapshot.range) {
      setRange(snapshot.range);
      group.current?.focus({preventScroll: true});
    } else {
      setRange(undefined);
    }
  };
  const undo = () => restore(undos, redos);
  const redo = () => restore(redos, undos);

  const selected = () => blocks.slice(low, high + 1);

  // the selected blocks go; the caret goes to the end of the block before them,
  // and a script left empty keeps one empty scene heading
  const deleteBlocks = () => {
    if (!range) return;
    const kept = [...blocks.slice(0, low), ...blocks.slice(high + 1)];
    const empty = newBlock("heading");
    const next = kept.length > 0 ? kept : [empty];
    const before = blocks[low - 1];
    changeBlocks(next, {caret: before ? {id: before.id, caret: "end"} : {id: (blocks[high + 1] ?? empty).id, caret: "start"}});
  };

  // the selected blocks give way to pasted ones, which are selected after
  const replaceBlocks = (list: ScriptBlock[]) => {
    if (!range || list.length === 0) return;
    const next = [...blocks.slice(0, low), ...list, ...blocks.slice(high + 1)];
    changeBlocks(next, {select: {anchor: low, focus: low + list.length - 1}});
  };

  // a copy of the selected blocks just after them, selected
  const duplicateBlocks = () => {
    if (!range) return;
    const copies = selected().map(block => newBlock(block.type, block.text));
    const next = [...blocks.slice(0, high + 1), ...copies, ...blocks.slice(high + 1)];
    changeBlocks(next, {select: {anchor: high + 1, focus: high + copies.length}});
  };

  const putOnClipboard = (data: DataTransfer) => {
    data.setData("text/plain", fountainBody(selected()));
    data.setData(BLOCKS_MIME, JSON.stringify(selected().map(({type, text}) => ({type, text}))));
  };

  // keys while blocks are selected, as in Notion: arrows move the selection and
  // Shift+arrows extend it, Enter writes in it, Backspace deletes it, Escape lets
  // go. Letters do nothing, so a stray key can't replace what's selected
  const onGroupKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const mod = isModifier(event);
    const key = event.key.toLowerCase();
    if (mod && key === "z") { event.preventDefault(); return event.shiftKey ? redo() : undo(); }
    if (!range) return;
    if (mod && key === "a") { event.preventDefault(); return selectBlocks(0, blocks.length - 1); }
    if (mod && key === "d") { event.preventDefault(); return duplicateBlocks(); }
    if (mod) return; // copy, cut and paste arrive as their own events
    if (event.key === "Escape") { event.preventDefault(); return setRange(undefined); }
    if (event.key === "Enter") { event.preventDefault(); return writeIn(range.focus, "end"); }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const step = event.key === "ArrowUp" ? -1 : 1;
      if (event.shiftKey) return selectBlocks(range.anchor, range.focus + step);
      const to = step < 0 ? Math.max(0, low - 1) : Math.min(blocks.length - 1, high + 1);
      return selectBlocks(to, to);
    }
    if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); return deleteBlocks(); }
    if (event.key === "Tab") { event.preventDefault(); return; }
  };

  const onGroupPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = blocksFromClipboard(event.clipboardData);
    // over selected blocks: the pasted blocks, or the text as paragraphs of action
    if (range && event.target === event.currentTarget) {
      event.preventDefault();
      return replaceBlocks(pasted ?? blocksFromText(event.clipboardData.getData("text/plain")));
    }
    // blocks copied from Storia, pasted while writing: they go in at the caret,
    // splitting the block there (or taking its place when it's empty)
    const field = event.target as HTMLTextAreaElement;
    const index = Number(field.closest<HTMLElement>(".sp-block")?.dataset.index);
    const block = blocks[index];
    if (!pasted || !block || field.tagName !== "TEXTAREA") return;
    event.preventDefault();
    const before = block.text.slice(0, field.selectionStart);
    const after = block.text.slice(field.selectionEnd);
    const pieces = [
      ...(before.trim() ? [{...block, text: before}] : []),
      ...pasted,
      ...(after.trim() ? [newBlock(block.type, after)] : []),
    ];
    const next = [...blocks.slice(0, index), ...pieces, ...blocks.slice(index + 1)];
    const lastPasted = pasted[pasted.length - 1];
    changeBlocks(next, {caret: {id: lastPasted.id, caret: "end"}});
  };

  // a press in a block's text: Shift+click selects from the block being written to
  // this one; otherwise it may become a drag out of the block
  const onPointerDown = (event: React.MouseEvent<HTMLTextAreaElement>, index: number) => {
    if (event.button !== 0) return;
    const activeIndex = blocks.findIndex(block => block.id === activeId);
    if (event.shiftKey && (range || (activeIndex >= 0 && activeIndex !== index))) {
      event.preventDefault();
      return selectBlocks(range ? range.anchor : activeIndex, index);
    }
    setRange(undefined);
    drag.current = {kind: "text", from: index, active: false};
  };

  // Pointer drags, as in Notion. Out of a block's text, a drag becomes a block
  // selection once the pointer is well inside another block (by height alone, so
  // indents and gaps don't matter). From the margin or the space between blocks,
  // it draws a box and selects the blocks it touches. Either way, near the desk's
  // top or bottom edge it scrolls, faster the closer it gets, and a click outside
  // the script lets go of a selection
  useEffect(() => {
    const EDGE = 56;
    let pointer = {x: 0, y: 0};
    let frame = 0;

    const rows = () => group.current ? Array.from(group.current.querySelectorAll<HTMLElement>(".sp-block[data-index]")) : [];
    // the first block whose bottom is below y, by binary search: blocks run down the page in order
    const blockAt = (y: number) => {
      const list = rows();
      if (list.length === 0) return undefined;
      let lowIndex = 0, highIndex = list.length - 1;
      while (lowIndex < highIndex) {
        const middle = (lowIndex + highIndex) >> 1;
        if (list[middle].getBoundingClientRect().bottom < y) lowIndex = middle + 1;
        else highIndex = middle;
      }
      return {index: lowIndex, element: list[lowIndex]};
    };
    const desk = () => group.current?.closest<HTMLElement>(".sw-desk") ?? undefined;

    const follow = () => {
      const current = drag.current;
      if (!current) return;
      if (current.kind === "text") {
        const found = blockAt(pointer.y);
        if (!found) return;
        if (!current.active) {
          // well inside another block, past the gap above it
          if (found.index === current.from || pointer.y < found.element.getBoundingClientRect().top + 4) return;
          current.active = true;
          document.documentElement.classList.add("sw-selecting");
        }
        return latest.current.selectBlocks(current.from, found.index);
      }
      // the box runs from where the press began (kept in the desk's scroll, so it
      // stretches as the desk scrolls) to the pointer
      const scrolled = (desk()?.scrollTop ?? 0) - current.scroll;
      const startY = current.y - scrolled;
      if (!current.active && Math.hypot(pointer.x - current.x, pointer.y - startY) < 5) return;
      current.active = true;
      document.documentElement.classList.add("sw-selecting");
      const top = Math.min(startY, pointer.y), bottom = Math.max(startY, pointer.y);
      const left = Math.min(current.x, pointer.x), right = Math.max(current.x, pointer.x);
      latest.current.setBox({left, top, width: right - left, height: bottom - top});
      const touched = rows().flatMap((element, index) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom >= top && rect.top <= bottom ? [index] : [];
      });
      if (touched.length > 0) latest.current.selectBlocks(touched[0], touched[touched.length - 1]);
      else latest.current.dropBlocks();
    };

    const autoscroll = () => {
      frame = 0;
      const area = desk();
      if (!drag.current?.active || !area) return;
      const edges = area.getBoundingClientRect();
      const above = edges.top + EDGE - pointer.y, below = pointer.y - (edges.bottom - EDGE);
      const speed = above > 0 ? -Math.min(above, EDGE) / 3 : below > 0 ? Math.min(below, EDGE) / 3 : 0;
      if (speed === 0) return;
      area.scrollTop += speed;
      follow();
      frame = requestAnimationFrame(autoscroll);
    };

    const onMove = (event: MouseEvent) => {
      if (!drag.current) return;
      // released outside the window, where the mouseup never arrived
      if ((event.buttons & 1) === 0) return onUp();
      pointer = {x: event.clientX, y: event.clientY};
      follow();
      if (drag.current?.active && !frame) frame = requestAnimationFrame(autoscroll);
    };
    function onUp() {
      const current = drag.current;
      drag.current = undefined;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      document.documentElement.classList.remove("sw-selecting");
      latest.current.setBox(undefined);
      // a click in the margin, not a drag, lets go of a selection
      if (current?.kind === "box" && !current.active) latest.current.dropBlocks();
    }
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const area = desk();
      if (!group.current || group.current.contains(target) && target.closest("textarea, button, select, a, li")) return;
      // a press on the desk, off any text (and off its scrollbar): the start of a box
      const onScrollbar = area ? event.clientX >= area.getBoundingClientRect().left + area.clientWidth : false;
      if (event.button === 0 && area?.contains(target) && !onScrollbar && !target.closest("textarea, button, select, a, input, li")) {
        event.preventDefault();
        drag.current = {kind: "box", x: event.clientX, y: event.clientY, scroll: area.scrollTop, active: false};
        pointer = {x: event.clientX, y: event.clientY};
        return;
      }
      // anywhere else outside the script lets go
      if (!group.current.contains(target)) latest.current.dropBlocks();
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("blur", onUp);
    return () => {
      onUp();
      window.removeEventListener("blur", onUp);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  // rows are memoised, so they get handlers that never change and always
  // reach this render's state; typing then re-renders only the row it's in
  const dropBlocks = () => setRange(undefined);
  const latest = useRef({onTextChange, onKeyDown, acceptSuggestion, setActiveId, selectBlocks, onPointerDown, dropBlocks, setBox});
  latest.current = {onTextChange, onKeyDown, acceptSuggestion, setActiveId, selectBlocks, onPointerDown, dropBlocks, setBox};
  const handlers = useMemo<RowHandlers>(() => ({
    focus: id => { setRange(undefined); latest.current.setActiveId(id); },
    pointerDown: (event, index) => latest.current.onPointerDown(event, index),
    change: (block, text) => latest.current.onTextChange(block, text),
    keyDown: (event, block, index) => latest.current.onKeyDown(event, block, index),
    accept: (block, name) => latest.current.acceptSuggestion(block, name),
  }), []);
  const register = useCallback((id: string, element: HTMLTextAreaElement | null) => {
    if (element) fields.current.set(id, element);
    else fields.current.delete(id);
  }, []);

  return (
    <div
      ref={group}
      role="group"
      aria-label="Screenplay"
      tabIndex={-1}
      className="sp-script"
      onKeyDown={onGroupKeyDown}
      onCopy={event => { if (!range || event.target !== event.currentTarget) return; event.preventDefault(); putOnClipboard(event.clipboardData); }}
      onCut={event => { if (!range || event.target !== event.currentTarget) return; event.preventDefault(); putOnClipboard(event.clipboardData); deleteBlocks(); }}
      onPaste={onGroupPaste}
    >
      {/* the box drawn from the margin, on the body: the page is a size container,
          which would otherwise be what its fixed position is measured from */}
      {box && createPortal(<div className="sp-marquee" style={box} aria-hidden="true" />, document.body)}
      {blocks.map((block, index) => {
        const isActive = block.id === activeId;
        return (
          <BlockRow
            key={block.id}
            block={block}
            index={index}
            isActive={isActive}
            alone={blocks.length === 1}
            suggestions={isActive && suggestions.length > 0 ? suggestions : undefined}
            suggestionIndex={isActive ? suggestionIndex : 0}
            handlers={handlers}
            register={register}
            selected={index >= low && index <= high}
          />
        );
      })}
      {/* says how much is selected, for screen readers; last, so the first block
          stays the group's first child and keeps no space above it */}
      <span className="sr-only" role="status">{range ? (high - low + 1) + (high === low ? " block selected" : " blocks selected") : ""}</span>
    </div>
  );
});

type RowHandlers = {
  focus: (id: string) => void,
  pointerDown: (event: React.MouseEvent<HTMLTextAreaElement>, index: number) => void,
  change: (block: ScriptBlock, text: string) => void,
  keyDown: (event: KeyboardEvent<HTMLTextAreaElement>, block: ScriptBlock, index: number) => void,
  accept: (block: ScriptBlock, name: string) => void,
};

type BlockRowProps = {
  block: ScriptBlock,
  index: number,
  isActive: boolean,
  // the only block in the script, which always shows its placeholder
  alone: boolean,
  suggestions?: string[],
  suggestionIndex: number,
  handlers: RowHandlers,
  register: (id: string, element: HTMLTextAreaElement | null) => void,
  // in the block selection
  selected: boolean,
};

const BlockRow = memo(({block, index, isActive, alone, suggestions, suggestionIndex, handlers, register, selected}: BlockRowProps) => {
  const field = useRef<HTMLTextAreaElement | null>(null);
  const listId = "suggestions-" + block.id;
  const showSuggestions = Boolean(suggestions);

  // fit this block to its text; its type sets its width, so that refits it too
  useLayoutEffect(() => {
    autosize(field.current);
  }, [block.text, block.type]);

  return (
    <div className={"sp-block sp-" + block.type + (selected ? " is-selected" : "")} data-index={index}>
      {isActive && (
        <span className="sp-gutter hidden sm:block select-none" aria-hidden="true">
          <span className="sp-gutter-label sw-label text-[color:var(--muted)]" style={{fontSize: 11}}>{elementLabel(block.type)}</span>
        </span>
      )}
      <textarea
        ref={element => {
          field.current = element;
          register(block.id, element);
        }}
        rows={1}
        value={block.text}
        className="sp-field"
        aria-label={elementLabel(block.type)}
        placeholder={isActive || alone ? elementLabel(block.type) : undefined}
        spellCheck={["action", "dialogue", "lyrics", "note"].includes(block.type)}
        onFocus={() => handlers.focus(block.id)}
        onMouseDown={event => handlers.pointerDown(event, index)}
        onChange={event => handlers.change(block, event.target.value)}
        onKeyDown={event => handlers.keyDown(event, block, index)}
        role={block.type === "character" ? "combobox" : undefined}
        aria-autocomplete={block.type === "character" ? "list" : undefined}
        aria-expanded={block.type === "character" ? showSuggestions : undefined}
        aria-controls={showSuggestions ? listId : undefined}
        aria-activedescendant={showSuggestions ? listId + "-" + suggestionIndex : undefined}
      />
      {suggestions && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Characters"
          className="absolute left-0 top-full z-20 mt-1 min-w-[22ch] overflow-hidden rounded-md border border-[color:var(--hair)] bg-white shadow-[0_4px_16px_rgb(0_0_0/0.06)]"
        >
          {suggestions.map((name, suggestion) => (
            <li
              key={name}
              id={listId + "-" + suggestion}
              role="option"
              aria-selected={suggestion === suggestionIndex}
              onMouseDown={event => { event.preventDefault(); handlers.accept(block, name); }}
              className={"cursor-pointer px-3 py-1.5 uppercase " + (suggestion === suggestionIndex ? "bg-[color:var(--wash)] text-[color:var(--ink)]" : "text-[color:var(--ink)]")}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default ScriptEditor;
