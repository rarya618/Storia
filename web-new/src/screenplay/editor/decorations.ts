import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { ElementType, elementLabel } from "../types";

// A placeholder naming the element in an empty block, while it holds the caret
// or when it's the script's only block (.is-empty in screenplay.css). It's a
// class and an attribute on the block, drawn by CSS, so no element sits inside
// the text: a non-editable element inside an editable line upsets the browser's
// selection (a triple-click would select it and then lose the selection). The
// margin's element label is drawn outside the document for the same reason
// (ScriptEditorPM).
export const placeholders = () => new Plugin({
  props: {
    decorations: state => {
      const $head = state.selection.$head;
      const active = $head.depth >= 1 ? $head.before(1) : -1;
      const alone = state.doc.childCount === 1;
      const decorations: Decoration[] = [];
      state.doc.forEach((node, pos) => {
        if (node.content.size === 0 && (pos === active || alone)) {
          decorations.push(Decoration.node(pos, pos + node.nodeSize, {class: "is-empty", "data-placeholder": elementLabel(node.type.name as ElementType)}));
        }
      });
      return DecorationSet.create(state.doc, decorations);
    },
  },
});
