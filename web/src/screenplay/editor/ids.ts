import { Plugin } from "prosemirror-state";
import { randomString } from "@storia/core/misc/randomString";

// Every block keeps a unique id. Splitting a block copies its attributes into
// the new half, and pasting can bring ids already in the script, so after any
// change a block with no id, or with one an earlier block already has, gets a
// fresh one. The block that keeps the id is always the first, which is the one
// that was there before.
export const blockIds = () => new Plugin({
  appendTransaction: (transactions, _old, state) => {
    if (!transactions.some(transaction => transaction.docChanged)) return null;
    const seen = new Set<string>();
    const tr = state.tr;
    state.doc.forEach((node, offset) => {
      const id: string | null = node.attrs.id;
      if (id && !seen.has(id)) {
        seen.add(id);
        return;
      }
      const fresh = randomString(8);
      seen.add(fresh);
      tr.setNodeMarkup(offset, undefined, {...node.attrs, id: fresh});
    });
    // the fix joins the change that caused it, so undoing that change undoes both
    return tr.docChanged ? tr : null;
  },
});
