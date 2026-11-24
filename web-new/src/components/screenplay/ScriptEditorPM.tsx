import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Command, EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import "prosemirror-view/style/prosemirror.css";

import { ScriptBlock } from "../../screenplay/types";
import { blocksToDoc, docToBlocks } from "../../screenplay/editor/convert";
import { blockIds } from "../../screenplay/editor/ids";
import { schema } from "../../screenplay/editor/schema";
import { Caret, ScriptEditorHandle, ScriptEditorProps } from "./ScriptEditor";

// The screenplay editor on ProseMirror, built alongside the textarea one (see
// misc/editorFlag.ts) until it does everything that one does. It takes the same
// props and handle, so DocumentView can use either.
//
// The editor owns the document while you write: every change goes up to
// DocumentView as ScriptBlock[] (unchanged blocks keep their objects, see
// convert.ts), and blocks coming down that it didn't send (a fresher copy on
// load, a new scene, the status bar's element menu) rebuild the document,
// keeping the caret where it was. This round has ProseMirror's basic editing,
// Shift+Enter for a line break and one undo history; the screenplay's own keys
// (Enter and Tab through the elements, Cmd+1–0) come next.

// a line break inside a block
const hardBreak: Command = (state, dispatch) => {
  dispatch?.(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollIntoView());
  return true;
};

const createState = (blocks: ScriptBlock[]) => EditorState.create({
  doc: blocksToDoc(blocks),
  plugins: [
    blockIds(),
    history(),
    keymap({"Mod-z": undo, "Shift-Mod-z": redo, "Mod-y": redo, "Shift-Enter": hardBreak}),
    keymap(baseKeymap),
  ],
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

const ScriptEditorPM = forwardRef<ScriptEditorHandle, ScriptEditorProps>(({blocks, setBlocks, setActiveId}, ref) => {
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView>();
  // the last blocks this editor sent up, so it can tell its own back from new ones
  const sent = useRef<ScriptBlock[]>(blocks);
  const active = useRef<string>();
  const callbacks = useRef({setBlocks, setActiveId});
  callbacks.current = {setBlocks, setActiveId};

  const report = (state: EditorState) => {
    const id = blockIdAt(state);
    if (id !== active.current) {
      active.current = id;
      if (id) callbacks.current.setActiveId(id);
    }
  };

  // the view is made once; DocumentView remounts the editor for another document
  useEffect(() => {
    if (!mount.current) return;
    const editor: EditorView = new EditorView(mount.current, {
      state: createState(sent.current),
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
      handleDOMEvents: {focus: () => { report(editor.state); return false; }},
    });
    view.current = editor;
    // a new, empty script takes the caret straight away
    const only = sent.current.length === 1 && sent.current[0].text === "";
    if (only) editor.focus();
    return () => { editor.destroy(); view.current = undefined; };
  }, []);

  // blocks from outside: rebuild the document from them, the caret staying in its block
  useEffect(() => {
    const editor = view.current;
    if (!editor || blocks === sent.current) return;
    sent.current = blocks;
    const id = blockIdAt(editor.state);
    const block = id ? findBlock(editor.state, id) : undefined;
    const offset = block ? editor.state.selection.head - block.pos - 1 : 0;
    const hadFocus = editor.hasFocus();
    let state = createState(blocks);
    const again = id ? findBlock(state, id) : undefined;
    if (again) state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, caretIn(again, offset))));
    editor.updateState(state);
    if (hadFocus) editor.focus();
    report(state);
  }, [blocks]);

  useImperativeHandle(ref, () => ({
    focusBlock: (id, caret = "end") => {
      const editor = view.current;
      if (!editor) return;
      const block = findBlock(editor.state, id);
      if (!block) return;
      editor.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, caretIn(block, caret))).scrollIntoView());
      editor.focus();
    },
  }), []);

  return <div ref={mount} />;
});

export default ScriptEditorPM;
