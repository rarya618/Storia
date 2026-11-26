import { EditorView } from "prosemirror-view";

// each mounted ProseMirror editor's view by its element, so tests can drive it as
// a writer would
const views = new WeakMap<Element, EditorView>();

export const registerView = (view: EditorView) => { views.set(view.dom, view); };
export const viewOf = (element: Element | null) => element ? views.get(element) : undefined;
