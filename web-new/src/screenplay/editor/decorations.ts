import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { ElementType, elementLabel } from "../types";

// What the editor shows beside the words, without being part of them:
// - the element's name in the left margin of the block holding the caret, drawn
//   the way the textarea editor draws it (.sp-gutter in screenplay.css, hidden on
//   phones and on a narrow desk)
// - a placeholder naming the element in an empty block, while it holds the caret
//   or when it's the script's only block (.is-empty in screenplay.css)

const gutter = (type: ElementType) => () => {
  const outer = document.createElement("span");
  outer.className = "sp-gutter hidden sm:block select-none";
  outer.setAttribute("aria-hidden", "true");
  outer.contentEditable = "false";
  const label = document.createElement("span");
  label.className = "sp-gutter-label sw-label text-[color:var(--muted)]";
  label.style.fontSize = "11px";
  label.textContent = elementLabel(type);
  outer.appendChild(label);
  return outer;
};

export const marginNotes = () => new Plugin({
  props: {
    decorations: state => {
      const $head = state.selection.$head;
      const active = $head.depth >= 1 ? $head.before(1) : -1;
      const alone = state.doc.childCount === 1;
      const decorations: Decoration[] = [];
      state.doc.forEach((node, pos) => {
        const type = node.type.name as ElementType;
        const isActive = pos === active;
        if (isActive) {
          // keyed by element, so the label is redrawn only when it changes
          decorations.push(Decoration.widget(pos + 1, gutter(type), {side: -1, key: "gutter-" + type, ignoreSelection: true}));
        }
        if (node.content.size === 0 && (isActive || alone)) {
          decorations.push(Decoration.node(pos, pos + node.nodeSize, {class: "is-empty", "data-placeholder": elementLabel(type)}));
        }
      });
      return DecorationSet.create(state.doc, decorations);
    },
  },
});
