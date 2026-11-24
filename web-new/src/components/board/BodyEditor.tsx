import { useEffect, useRef } from "react";
import { Node as PMNode } from "prosemirror-model";
import { Command, EditorState, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView, NodeView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, chainCommands, setBlockType, splitBlockAs, toggleMark } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { InputRule, inputRules, textblockTypeInputRule, undoInputRule, wrappingInputRule } from "prosemirror-inputrules";
import { liftListItem, sinkListItem, splitListItem } from "prosemirror-schema-list";
import { bodySchema } from "../../board/body";

const {nodes, marks} = bodySchema;

// Notion's shortcuts, typed at the start of a line
const rules = inputRules({rules: [
  textblockTypeInputRule(/^(#{1,3})\s$/, nodes.heading, match => ({level: match[1].length})),
  wrappingInputRule(/^\s*[-*+]\s$/, nodes.bullet_list),
  wrappingInputRule(/^(\d+)\.\s$/, nodes.ordered_list),
  wrappingInputRule(/^\s*>\s$/, nodes.blockquote),
  textblockTypeInputRule(/^\[( |x)?\]\s$/, nodes.todo, match => ({checked: match[1] === "x"})),
  // an em dash from two hyphens, as writers type it
  new InputRule(/--$/, "—"),
]});

// Enter on a checklist line starts another, unticked; on an empty one it ends the checklist
const todoEnter: Command = (state, dispatch) => {
  const {$from, empty} = state.selection;
  if ($from.parent.type !== nodes.todo) return false;
  if (empty && $from.parent.content.size === 0) return setBlockType(nodes.paragraph)(state, dispatch);
  return splitBlockAs(() => ({type: nodes.todo, attrs: {checked: false}}))(state, dispatch);
};

// Backspace at the very start of a heading or checklist line makes it plain text first
const backToParagraph: Command = (state, dispatch) => {
  const {$from, empty} = state.selection;
  if (!empty || $from.parentOffset !== 0) return false;
  const type = $from.parent.type;
  if (type !== nodes.heading && type !== nodes.todo) return false;
  return setBlockType(nodes.paragraph)(state, dispatch);
};

const keys = keymap({
  "Enter": chainCommands(todoEnter, splitListItem(nodes.list_item)),
  "Shift-Enter": (state, dispatch) => {
    dispatch?.(state.tr.replaceSelectionWith(nodes.hard_break.create()).scrollIntoView());
    return true;
  },
  "Backspace": chainCommands(undoInputRule, backToParagraph),
  "Tab": sinkListItem(nodes.list_item),
  "Shift-Tab": liftListItem(nodes.list_item),
  "Mod-z": undo,
  "Mod-Shift-z": redo,
  "Mod-y": redo,
  "Mod-b": toggleMark(marks.strong),
  "Mod-i": toggleMark(marks.em),
  "Mod-Shift-x": toggleMark(marks.strike),
});

// an empty body says what it's for, and how to shape it
const placeholder = (text: string) => new Plugin({
  props: {
    decorations: state => {
      const {doc} = state;
      const only = doc.childCount === 1 ? doc.firstChild : null;
      if (!only || only.type !== nodes.paragraph || only.content.size > 0) return null;
      return DecorationSet.create(doc, [Decoration.node(0, only.nodeSize, {class: "is-empty", "data-placeholder": text})]);
    },
  },
});

// a checklist line: a real checkbox the writer can tick, then the line's text
class TodoView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  private box: HTMLInputElement;

  constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
    this.dom = document.createElement("div");
    this.dom.className = "sw-todo";
    this.box = document.createElement("input");
    this.box.type = "checkbox";
    this.box.className = "sw-check";
    this.box.contentEditable = "false";
    this.box.setAttribute("aria-label", "Done");
    this.box.addEventListener("mousedown", event => event.preventDefault());
    this.box.addEventListener("click", event => {
      event.preventDefault();
      const pos = getPos();
      if (pos === undefined) return;
      const current = view.state.doc.nodeAt(pos);
      if (current) view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, {checked: !current.attrs.checked}));
    });
    this.contentDOM = document.createElement("span");
    this.contentDOM.className = "sw-todo-text";
    this.dom.append(this.box, this.contentDOM);
    this.update(node);
  }

  update(node: PMNode) {
    if (node.type !== nodes.todo) return false;
    this.box.checked = node.attrs.checked;
    this.dom.dataset.checked = String(node.attrs.checked);
    return true;
  }

  // ticking the box is the view's own business, not an edit of the text
  ignoreMutation(mutation: MutationRecord | {type: "selection"}) {
    return mutation.type !== "selection" && !this.contentDOM.contains(mutation.target as Node);
  }
}

type BodyEditorProps = {
  initial: PMNode,
  onChange: (doc: PMNode) => void,
  label: string,
  placeholderText?: string,
  // lets the screen move the caret in from the title
  onReady?: (focus: () => void) => void,
};

// the card's page: mounted once per card (key it by the card's id), so a copy
// arriving from elsewhere never overwrites what's being typed
const BodyEditor = ({initial, onChange, label, placeholderText = "Write anything. Type # for a heading, - for a list, [] for a checklist", onReady}: BodyEditorProps) => {
  const host = useRef<HTMLDivElement>(null);
  const changed = useRef(onChange);
  changed.current = onChange;
  const ready = useRef(onReady);
  ready.current = onReady;

  useEffect(() => {
    if (!host.current) return;
    const view: EditorView = new EditorView(host.current, {
      state: EditorState.create({
        doc: initial,
        plugins: [rules, keys, keymap(baseKeymap), history(), placeholder(placeholderText)],
      }),
      nodeViews: {todo: (node, nodeView, getPos) => new TodoView(node, nodeView, getPos)},
      attributes: {class: "sw-body", "aria-label": label, role: "textbox", "aria-multiline": "true"},
      dispatchTransaction: transaction => {
        const next = view.state.apply(transaction);
        view.updateState(next);
        if (transaction.docChanged) changed.current(next.doc);
      },
    });
    ready.current?.(() => view.focus());
    return () => view.destroy();
    // mounted once: the parent keys this by the card, and later copies of the
    // body are deliberately not pushed in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} />;
};

export default BodyEditor;
