import { forwardRef, KeyboardEvent, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ELEMENTS, ElementType, ScriptBlock, elementLabel } from "../../screenplay/types";
import {
  looksLikeHeading, textForType, typeAfterEnter, typeAfterTab,
  typeBefore, typeOnEmptyBackspace, typeOnEmptyEnter
} from "../../screenplay/flow";
import { characterNames, characterSuggestions } from "../../screenplay/characters";
import { fountainBody } from "../../screenplay/fountain";
import { randomString } from "../../misc/randomString";

export type ScriptEditorHandle = {
  focusBlock: (id: string, caret?: Caret) => void,
};

type Caret = "start" | "end" | number;

type ScriptEditorProps = {
  blocks: ScriptBlock[],
  setBlocks: (update: (blocks: ScriptBlock[]) => ScriptBlock[]) => void,
  activeId?: string,
  setActiveId: (id: string) => void,
};

const newBlock = (type: ElementType, text = ""): ScriptBlock => ({id: randomString(8), type, text});

const isModifier = (event: KeyboardEvent) => event.metaKey || event.ctrlKey;

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

  // a selection across whole blocks, which a browser can't make across textareas:
  // from a drag between blocks, Shift+click, or a second Cmd/Ctrl+A. anchor is
  // where it began, focus where it ends; while there is one, the group has focus
  const [range, setRange] = useState<{anchor: number, focus: number}>();
  const low = range ? Math.max(0, Math.min(range.anchor, range.focus)) : -1;
  const high = range ? Math.min(blocks.length - 1, Math.max(range.anchor, range.focus)) : -1;
  const drag = useRef<{from: number, active: boolean}>();

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

  const updateBlock = (id: string, changes: Partial<ScriptBlock>) =>
    setBlocks(current => current.map(block => block.id === id ? {...block, ...changes} : block));

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
        setBlocks(current => current.filter(other => other.id !== block.id));
        return setFocusRequest({id: target.id, caret: index > 0 ? "end" : "start"});
      }

      // merge into the previous block
      if (index > 0) {
        event.preventDefault();
        const previous = blocks[index - 1];
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
    setRange({anchor, focus});
    group.current?.focus({preventScroll: true});
  };

  const clearBlocks = (caretAt?: "start" | "end") => {
    if (!range) return;
    setRange(undefined);
    if (caretAt) {
      const block = blocks[caretAt === "start" ? low : high];
      if (block) setFocusRequest({id: block.id, caret: caretAt});
    }
  };

  // the selected blocks give way to one block holding text (from typing or a
  // paste), of the first block's type; with no text, to nothing, leaving an empty
  // block only if the script would otherwise be empty
  const replaceBlocks = (text?: string) => {
    if (!range) return;
    const first = blocks[low];
    setRange(undefined);
    if (text !== undefined) {
      const replacement = newBlock(first?.type ?? "action", text);
      setBlocks(current => [...current.slice(0, low), replacement, ...current.slice(high + 1)]);
      return setFocusRequest({id: replacement.id, caret: "end"});
    }
    const before = blocks[low - 1];
    const empty = newBlock("heading");
    setBlocks(current => {
      const kept = [...current.slice(0, low), ...current.slice(high + 1)];
      return kept.length > 0 ? kept : [empty];
    });
    if (before) setFocusRequest({id: before.id, caret: "end"});
    else setFocusRequest({id: blocks[high + 1]?.id ?? empty.id, caret: "start"});
  };

  const selectionText = () => fountainBody(blocks.slice(low, high + 1));

  // keys while blocks are selected
  const onGroupKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!range || event.target !== event.currentTarget) return;
    const mod = isModifier(event);
    if (mod && event.key.toLowerCase() === "a") {
      event.preventDefault();
      return selectBlocks(0, blocks.length - 1);
    }
    if (mod) return; // copy and cut arrive as their own events; the rest pass
    if (event.key === "Escape") { event.preventDefault(); return clearBlocks("end"); }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); return clearBlocks("start"); }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); return clearBlocks("end"); }
    if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); return replaceBlocks(); }
    if (event.key === "Enter" || event.key === "Tab") { event.preventDefault(); return clearBlocks("end"); }
    if (event.key.length === 1 && !event.altKey) { event.preventDefault(); return replaceBlocks(event.key); }
  };

  // a mousedown in a block: Shift+click extends from the block being written to
  // this one; otherwise it may start a drag, which becomes a block selection the
  // moment the pointer crosses into another block
  const onPointerDown = (event: React.MouseEvent<HTMLTextAreaElement>, index: number) => {
    if (event.button !== 0) return;
    const activeIndex = blocks.findIndex(block => block.id === activeId);
    if (event.shiftKey && activeIndex >= 0 && activeIndex !== index) {
      event.preventDefault();
      return selectBlocks(range ? range.anchor : activeIndex, index);
    }
    setRange(undefined);
    drag.current = {from: index, active: false};
  };

  // a drag across blocks. Which block the pointer is over goes by its height alone,
  // so indents and the gaps between blocks don't matter (a gap belongs to the
  // block below it). It becomes a block selection only once the pointer is well
  // inside another block, so drifting a little while selecting text doesn't flip
  // it; after that it follows the pointer, and near the desk's top or bottom
  // edge it scrolls, faster the closer it gets
  useEffect(() => {
    const EDGE = 56;
    let pointerY = 0;
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

    const scroller = () => group.current?.closest<HTMLElement>(".sw-desk") ?? undefined;

    const follow = () => {
      const current = drag.current;
      if (!current) return;
      const found = blockAt(pointerY);
      if (!found) return;
      if (!current.active) {
        // well inside another block, past the gap above it
        const top = found.element.getBoundingClientRect().top;
        if (found.index === current.from || pointerY < top + 4) return;
        current.active = true;
        document.documentElement.classList.add("sw-selecting");
      }
      latest.current.selectBlocks(current.from, found.index);
    };

    const autoscroll = () => {
      frame = 0;
      const current = drag.current;
      const desk = scroller();
      if (!current?.active || !desk) return;
      const box = desk.getBoundingClientRect();
      const above = box.top + EDGE - pointerY, below = pointerY - (box.bottom - EDGE);
      const speed = above > 0 ? -Math.min(above, EDGE) / 3 : below > 0 ? Math.min(below, EDGE) / 3 : 0;
      if (speed === 0) return;
      desk.scrollTop += speed;
      follow();
      frame = requestAnimationFrame(autoscroll);
    };

    const onMove = (event: MouseEvent) => {
      if (!drag.current) return;
      // released outside the window, where the mouseup never arrived
      if ((event.buttons & 1) === 0) return onUp();
      pointerY = event.clientY;
      follow();
      if (drag.current.active && !frame) frame = requestAnimationFrame(autoscroll);
    };
    const onUp = () => {
      drag.current = undefined;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      document.documentElement.classList.remove("sw-selecting");
    };
    // a click anywhere outside the script lets go of a block selection
    const onDown = (event: MouseEvent) => {
      if (group.current && !group.current.contains(event.target as Node)) latest.current.dropBlocks();
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
  const latest = useRef({onTextChange, onKeyDown, acceptSuggestion, setActiveId, selectBlocks, onPointerDown, dropBlocks});
  latest.current = {onTextChange, onKeyDown, acceptSuggestion, setActiveId, selectBlocks, onPointerDown, dropBlocks};
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
      className="outline-none"
      onKeyDown={onGroupKeyDown}
      onCopy={event => { if (!range) return; event.preventDefault(); event.clipboardData.setData("text/plain", selectionText()); }}
      onCut={event => { if (!range) return; event.preventDefault(); event.clipboardData.setData("text/plain", selectionText()); replaceBlocks(); }}
      onPaste={event => { if (!range || event.target !== event.currentTarget) return; event.preventDefault(); replaceBlocks(event.clipboardData.getData("text/plain")); }}
    >
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
            selectionStart={index === low}
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
  // in the block selection, and whether it's the first block of it
  selected: boolean,
  selectionStart: boolean,
};

const BlockRow = memo(({block, index, isActive, alone, suggestions, suggestionIndex, handlers, register, selected, selectionStart}: BlockRowProps) => {
  const field = useRef<HTMLTextAreaElement | null>(null);
  const listId = "suggestions-" + block.id;
  const showSuggestions = Boolean(suggestions);

  // fit this block to its text; its type sets its width, so that refits it too
  useLayoutEffect(() => {
    autosize(field.current);
  }, [block.text, block.type]);

  return (
    <div className={"sp-block sp-" + block.type + (selected ? " is-selected" + (selectionStart ? " is-selection-start" : "") : "")} data-index={index}>
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
