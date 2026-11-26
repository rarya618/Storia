import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Command, EditorState, Plugin, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import "prosemirror-view/style/prosemirror.css";

import { ElementType, ScriptBlock, elementLabel } from "@storia/core/screenplay/types";
import { blocksToDoc, docToBlocks } from "../../screenplay/editor/convert";
import { blockIds } from "../../screenplay/editor/ids";
import { schema } from "../../screenplay/editor/schema";
import { screenplayKeys, setElement, typingRules } from "../../screenplay/editor/commands";
import { placeholders } from "../../screenplay/editor/decorations";
import { Search, find, findKey, findNext, findPrevious, replaceAll, replaceCurrent, setQuery } from "../../screenplay/editor/find";
import { sliceToText, textToSlice } from "../../screenplay/editor/clipboard";
import { characterNames, characterSuggestions } from "@storia/core/screenplay/characters";
import { randomString } from "@storia/core/misc/randomString";
import { registerView } from "./editorViews";

export type Caret = "start" | "end" | number;

export type ScriptEditorHandle = {
  focusBlock: (id: string, caret?: Caret) => void,
  // the status bar's element menu, for the block holding the caret
  setType: (type: ElementType) => void,
  // "New scene", from the scene rail
  insertScene: () => void,
  // the find bar: a query (empty clears the marks), stepping, and replacing
  find: (search: Search) => void,
  findNext: () => void,
  findPrevious: () => void,
  replace: (replacement: string) => void,
  replaceAll: (replacement: string) => void,
  // back to the script, with the caret on the match the find bar left selected
  focus: () => void,
  // the selected text within one line, to start a find from; empty otherwise
  selectedText: () => string,
};

// what the find bar shows: how many matches, and which is selected (-1 for none)
export type Found = {count: number, current: number};

export type ScriptEditorProps = {
  blocks: ScriptBlock[],
  setBlocks: (update: (blocks: ScriptBlock[]) => ScriptBlock[]) => void,
  activeId?: string,
  setActiveId: (id: string) => void,
  onFound?: (found: Found) => void,
  // room kept clear at the top when the caret or a match is scrolled to, while
  // something floats over the desk there (the find card)
  clearTop?: number,
};

// The screenplay editor, on ProseMirror: the script is one document (schema,
// conversion, keys and the rest in src/screenplay/editor/), so selection, undo
// and find run across the whole script.
//
// The editor owns the document while you write: every change goes up to
// DocumentView as ScriptBlock[] (unchanged blocks keep their objects, see
// convert.ts). Changes DocumentView asks for, the status bar's element menu and
// New scene, come through the handle as edits, so they're in the undo history
// like any other. Only a different script coming down (a fresher copy on load)
// rebuilds the document, keeping the caret in its block; the same script in a
// new array changes nothing.

// the editor's plugins, the first given the chance at a key before the rest (the
// character suggestions, while they're open)
const createState = (blocks: ScriptBlock[], first: Plugin) => EditorState.create({
  doc: blocksToDoc(blocks),
  plugins: [
    first,
    blockIds(),
    typingRules(),
    placeholders(),
    find(),
    history(),
    keymap({"Mod-z": undo, "Shift-Mod-z": redo, "Mod-y": redo}),
    // the screenplay's keys (commands.ts) before ProseMirror's own
    screenplayKeys(),
    keymap(baseKeymap),
  ],
});

// the same script: every block with the same id, element and text, in order
const sameScript = (a: ScriptBlock[], b: ScriptBlock[]) =>
  a.length === b.length && a.every((block, index) => {
    const other = b[index];
    return block === other || (block.id === other.id && block.type === other.type && block.text === other.text);
  });

// the id of the block holding the caret
const blockIdAt = (state: EditorState): string | undefined => state.selection.$head.node(1)?.attrs.id ?? undefined;

// where a block starts in the document, and its node
const findBlock = (state: EditorState, id: string) => {
  let found: {pos: number, size: number} | undefined;
  state.doc.forEach((node, offset) => {
    if (!found && node.attrs.id === id) found = {pos: offset, size: node.content.size};
  });
  return found;
};

// a caret position inside a block: its start, its end, or a character offset
// (a line break counts as one, as "\n" does in the block's text)
const caretIn = (block: {pos: number, size: number}, caret: Caret) =>
  block.pos + 1 + (caret === "start" ? 0 : caret === "end" ? block.size : Math.max(0, Math.min(caret, block.size)));

const LIST_ID = "character-suggestions";

// the nearest ancestor that scrolls up and down (the desk)
const scrollerOf = (element: HTMLElement): HTMLElement | undefined => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const {overflowY} = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
  }
  return undefined;
};

// ProseMirror scrolls to its selection only while the browser's selection is in
// the editor, so a match chosen from the find card's field, which keeps the
// focus, has to be brought into view here. One out of sight comes to the middle
// of the room left under whatever floats at the top (clearTop), with the lines
// around it in view; one already in sight stays put
const reveal = (editor: EditorView, clearTop: number) => {
  const scroller = scrollerOf(editor.dom);
  if (!scroller) return;
  let coords: {top: number, bottom: number};
  try { coords = editor.coordsAtPos(editor.state.selection.from); } catch { return; }
  const frame = scroller.getBoundingClientRect();
  const top = frame.top + clearTop;
  const bottom = frame.bottom - 48;
  if (coords.top >= top && coords.bottom <= bottom) return;
  const middle = (top + bottom) / 2;
  scroller.scrollTop += (coords.top + coords.bottom) / 2 - middle;
};

const ScriptEditor = forwardRef<ScriptEditorHandle, ScriptEditorProps>(({blocks, setBlocks, activeId, setActiveId, onFound, clearTop}, ref) => {
  const mount = useRef<HTMLDivElement>(null);

  // Character suggestions while a cue is written, as in the textarea editor: the
  // script's names, most used first, that start with what's typed. The list sits
  // under the cue; arrows choose, Enter or Tab takes one, Escape puts it away
  // until the cue changes. They're kept in React, and a plugin first in line
  // hands them the keys while they're open
  const activeBlock = blocks.find(block => block.id === activeId);
  const inCue = activeBlock?.type === "character";
  const names = useMemo(() => inCue ? characterNames(blocks) : [], [inCue, blocks]);
  const [dismissedFor, setDismissedFor] = useState<string>();
  const [choice, setChoice] = useState(0);
  const suggestions = inCue && activeBlock && dismissedFor !== activeBlock.text ? characterSuggestions(names, activeBlock.text) : [];
  const chosen = Math.min(choice, Math.max(0, suggestions.length - 1));
  // a new cue, or more typed, starts the list at the top again
  useEffect(() => { setChoice(0); }, [activeBlock?.text, activeId]);

  const accept = (name: string) => {
    const editor = view.current;
    const block = editor && activeId ? findBlock(editor.state, activeId) : undefined;
    if (!editor || !block) return;
    const tr = editor.state.tr.replaceWith(block.pos + 1, block.pos + 1 + block.size, schema.text(name));
    tr.setSelection(TextSelection.create(tr.doc, block.pos + 1 + name.length));
    editor.dispatch(tr.scrollIntoView());
    setDismissedFor(name);
  };

  const suggestionKeys = useRef<(event: KeyboardEvent) => boolean>(() => false);
  suggestionKeys.current = event => {
    if (suggestions.length === 0 || event.isComposing) return false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1;
      setChoice((chosen + step + suggestions.length) % suggestions.length);
      return true;
    }
    if ((event.key === "Enter" || event.key === "Tab") && !event.shiftKey) {
      accept(suggestions[chosen]);
      return true;
    }
    if (event.key === "Escape") {
      setDismissedFor(activeBlock?.text);
      return true;
    }
    return false;
  };
  const first = useMemo(() => new Plugin({
    props: {handleKeyDown: (_view, event) => suggestionKeys.current(event)},
  }), []);

  // where the list goes: just under the cue, at its left edge
  const [listAt, setListAt] = useState<{top: number, left: number}>();
  useLayoutEffect(() => {
    const editor = view.current;
    if (!editor || suggestions.length === 0 || !activeId) return setListAt(undefined);
    const element = editor.dom.querySelector<HTMLElement>("[data-id=\"" + CSS.escape(activeId) + "\"]");
    if (!element) return setListAt(undefined);
    setListAt({top: element.offsetTop + element.offsetHeight + 4, left: element.offsetLeft});
  }, [suggestions.length, activeId, activeBlock?.text]);

  // the element's name in the left margin, beside the block holding the caret.
  // It's drawn here, outside the document, rather than inside the block, where a
  // non-editable element would upset the browser's selection; .sp-gutter places it
  // 2ch left of the line (this wrapper's left edge), and hides it on phones and on
  // a narrow desk
  const [labelTop, setLabelTop] = useState<number>();
  useLayoutEffect(() => {
    const editor = view.current;
    const element = editor && activeId ? editor.dom.querySelector<HTMLElement>("[data-id=\"" + CSS.escape(activeId) + "\"]") : null;
    setLabelTop(element ? element.offsetTop : undefined);
  }, [activeId, activeBlock?.type, blocks]);

  // the editor tells assistive tech about the list, as the textarea's combobox does
  useEffect(() => {
    const root = view.current?.dom;
    if (!root) return;
    const open = suggestions.length > 0;
    if (open) {
      root.setAttribute("aria-controls", LIST_ID);
      root.setAttribute("aria-activedescendant", LIST_ID + "-" + chosen);
      root.setAttribute("aria-expanded", "true");
    } else {
      root.removeAttribute("aria-controls");
      root.removeAttribute("aria-activedescendant");
      root.removeAttribute("aria-expanded");
    }
  });
  const view = useRef<EditorView>();
  // the last blocks this editor sent up, so it can tell its own back from new ones
  const sent = useRef<ScriptBlock[]>(blocks);
  const active = useRef<string>();
  const callbacks = useRef({setBlocks, setActiveId, onFound});
  callbacks.current = {setBlocks, setActiveId, onFound};
  const found = useRef<Found>({count: 0, current: -1});

  const report = (state: EditorState) => {
    const id = blockIdAt(state);
    if (id !== active.current) {
      active.current = id;
      if (id) callbacks.current.setActiveId(id);
    }
    const {matches, current} = findKey.getState(state)!;
    if (matches.length !== found.current.count || current !== found.current.current) {
      found.current = {count: matches.length, current};
      callbacks.current.onFound?.(found.current);
    }
  };

  // the view is made once; DocumentView remounts the editor for another document
  useEffect(() => {
    if (!mount.current) return;
    const editor: EditorView = new EditorView(mount.current, {
      state: createState(sent.current, first),
      // plain text for other apps, Fountain for blocks; plain text pastes in as action (clipboard.ts)
      clipboardTextSerializer: sliceToText,
      clipboardTextParser: text => textToSlice(text),
      // a triple-click selects the whole block's text, and only that
      handleTripleClick: (view, pos) => {
        const $pos = view.state.doc.resolve(pos);
        if ($pos.depth < 1) return false;
        const start = $pos.start(1);
        view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, start, start + $pos.node(1).content.size)));
        return true;
      },
      attributes: {class: "sp-pm", role: "textbox", "aria-multiline": "true", "aria-label": "Screenplay"},
      dispatchTransaction: tr => {
        const next = editor.state.apply(tr);
        editor.updateState(next);
        if (tr.docChanged) {
          const list = docToBlocks(next.doc);
          sent.current = list;
          callbacks.current.setBlocks(() => list);
        }
        report(next);
      },
      handleDOMEvents: {
        focus: () => { report(editor.state); return false; },
        // ProseMirror counts clicks to three; a fourth in the same run would start
        // over as a single click and drop the caret where it landed, throwing the
        // triple-click's selection away. The fourth and later keep it
        mousedown: (_view, event) => {
          if (event.button !== 0 || event.detail < 4) return false;
          event.preventDefault();
          return true;
        },
      },
    });
    view.current = editor;
    registerView(editor);
    // a new, empty script takes the caret straight away
    const only = sent.current.length === 1 && sent.current[0].text === "";
    if (only) editor.focus();
    return () => { editor.destroy(); view.current = undefined; };
    // first is made once (useMemo with no inputs), so this runs once
  }, [first]);

  const clear = useRef(clearTop ?? 0);
  clear.current = clearTop ?? 0;
  useEffect(() => {
    view.current?.setProps({scrollMargin: {top: clearTop ?? 5, right: 5, bottom: 5, left: 5}});
  }, [clearTop]);

  // blocks from outside: rebuild the document from them, the caret staying in its block
  useEffect(() => {
    const editor = view.current;
    if (!editor || blocks === sent.current) return;
    const same = sameScript(blocks, sent.current);
    sent.current = blocks;
    if (same) return;
    const id = blockIdAt(editor.state);
    const block = id ? findBlock(editor.state, id) : undefined;
    const offset = block ? editor.state.selection.head - block.pos - 1 : 0;
    const hadFocus = editor.hasFocus();
    let state = createState(blocks, first);
    // an open find keeps its query over the new script
    const {query, wholeWord} = findKey.getState(editor.state)!;
    if (query) state = state.apply(state.tr.setMeta(findKey, {query, wholeWord}));
    const again = id ? findBlock(state, id) : undefined;
    if (again) state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, caretIn(again, offset))));
    editor.updateState(state);
    if (hadFocus) editor.focus();
    report(state);
  }, [blocks, first]);

  const finding = (command: Command) => {
    const editor = view.current;
    if (!editor) return;
    const before = editor.state.selection;
    command(editor.state, editor.dispatch);
    if (!editor.state.selection.eq(before)) reveal(editor, clear.current);
  };

  useImperativeHandle(ref, () => ({
    focusBlock: (id, caret = "end") => {
      const editor = view.current;
      if (!editor) return;
      const block = findBlock(editor.state, id);
      if (!block) return;
      editor.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, caretIn(block, caret))).scrollIntoView());
      editor.focus();
    },
    // the status bar's element menu: the caret's block becomes that element
    setType: (type: ElementType) => {
      const editor = view.current;
      if (!editor) return;
      setElement(type)(editor.state, editor.dispatch);
      editor.focus();
    },
    // "New scene": an empty scene heading at the end, or the one already waiting
    // there, with the caret in it
    insertScene: () => {
      const editor = view.current;
      if (!editor) return;
      const doc = editor.state.doc;
      const last = doc.lastChild;
      const tr = editor.state.tr;
      if (!(last && last.type.name === "heading" && last.textContent.trim() === "")) {
        tr.insert(doc.content.size, schema.nodes.heading.create({id: randomString(8)}));
      }
      tr.setSelection(TextSelection.create(tr.doc, tr.doc.content.size - 1)).scrollIntoView();
      editor.dispatch(tr);
      editor.focus();
    },
    // the find card's commands, each bringing the match it lands on into view
    find: search => finding(setQuery(search)),
    findNext: () => finding(findNext),
    findPrevious: () => finding(findPrevious),
    replace: replacement => finding(replaceCurrent(replacement)),
    replaceAll: replacement => finding(replaceAll(replacement)),
    focus: () => view.current?.focus(),
    selectedText: () => {
      const editor = view.current;
      if (!editor) return "";
      const {from, to, $from} = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, "\n", "\n");
      return $from.sameParent(editor.state.selection.$to) && !text.includes("\n") ? text : "";
    },
  }), []);

  return (
    <div className="relative">
      {labelTop !== undefined && activeBlock && (
        <span className="sp-gutter hidden sm:block select-none" style={{top: labelTop}} aria-hidden="true">
          <span className="sp-gutter-label sw-label text-[color:var(--muted)]" style={{fontSize: 11}}>{elementLabel(activeBlock.type)}</span>
        </span>
      )}
      <div ref={mount} />
      {listAt && suggestions.length > 0 && (
        <ul
          id={LIST_ID}
          role="listbox"
          aria-label="Characters"
          style={{top: listAt.top, left: listAt.left}}
          className="absolute z-20 min-w-[22ch] overflow-hidden rounded-md border border-[color:var(--hair)] bg-white shadow-[0_4px_16px_rgb(0_0_0/0.06)]"
        >
          {suggestions.map((name, index) => (
            <li
              key={name}
              id={LIST_ID + "-" + index}
              role="option"
              aria-selected={index === chosen}
              // a press here mustn't take focus from the script
              onMouseDown={event => { event.preventDefault(); accept(name); }}
              className={"cursor-pointer px-3 py-1.5 uppercase text-[color:var(--ink)]" + (index === chosen ? " bg-[color:var(--wash)]" : "")}
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
