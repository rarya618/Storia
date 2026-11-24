// Which script editor this browser uses while the ProseMirror one is being built
// alongside the textarea one: ?editor=prosemirror or ?editor=textarea on any
// editor URL switches it and remembers the choice here. Storage can be
// unavailable, so it falls back to the textarea editor.
const KEY = "storia:editor";

export const readEditorFlag = () => {
  try {
    const asked = new URLSearchParams(window.location.search).get("editor");
    if (asked === "prosemirror" || asked === "textarea") localStorage.setItem(KEY, asked);
    return localStorage.getItem(KEY) === "prosemirror";
  } catch {
    return false;
  }
};
