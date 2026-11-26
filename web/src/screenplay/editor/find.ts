import { Command, EditorState, Plugin, PluginKey, TextSelection, Transaction } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { Match, findIn, fitCase } from "@storia/core/screenplay/find";
import { schema } from "./schema";

// Find and replace across the script. The plugin holds the query and its matches
// as document positions, and marks them: every match on Wash, the one selected
// ringed in Ink (.sp-match in screenplay.css). Stepping to a match selects it, so
// closing the find bar leaves the caret there, and each replace is one step for
// undo. The matching itself is @storia/core/screenplay/find.

export type FindState = {query: string, matches: Match[], current: number};

export const findKey = new PluginKey<FindState>("find");

// every match of the query in the document, block by block; a line break counts
// as one character, as it does in the block's text, so offsets map straight to positions
const matchesIn = (doc: Node, query: string): Match[] => {
  if (query === "") return [];
  const matches: Match[] = [];
  doc.forEach((block, pos) => {
    const text = block.textBetween(0, block.content.size, undefined, "\n");
    for (const {from, to} of findIn(text, query)) matches.push({from: pos + 1 + from, to: pos + 1 + to});
  });
  return matches;
};

// the match the selection covers exactly, or -1
const selectedIn = (matches: Match[], state: {selection: {from: number, to: number}}) =>
  matches.findIndex(match => match.from === state.selection.from && match.to === state.selection.to);

export const find = () => new Plugin<FindState>({
  key: findKey,
  state: {
    init: () => ({query: "", matches: [], current: -1}),
    apply: (tr, previous, _old, state) => {
      const query: string | undefined = tr.getMeta(findKey);
      const next = query ?? previous.query;
      const matches = query !== undefined || tr.docChanged ? matchesIn(state.doc, next) : previous.matches;
      return {query: next, matches, current: selectedIn(matches, state)};
    },
  },
  props: {
    decorations: state => {
      const {matches, current} = findKey.getState(state)!;
      if (matches.length === 0) return null;
      return DecorationSet.create(state.doc, matches.map((match, index) =>
        Decoration.inline(match.from, match.to, {class: index === current ? "sp-match sp-match-current" : "sp-match"})));
    },
  },
});

const select = (tr: Transaction, match: Match) =>
  tr.setSelection(TextSelection.create(tr.doc, match.from, match.to)).scrollIntoView();

// the match after the selection (or the one it covers, stepping back), round the end
const stepFrom = (state: EditorState, back: boolean): Match | undefined => {
  const {matches, current} = findKey.getState(state)!;
  if (matches.length === 0) return undefined;
  if (current >= 0) return matches[(current + (back ? -1 : 1) + matches.length) % matches.length];
  const {from} = state.selection;
  if (back) return [...matches].reverse().find(match => match.to <= from) ?? matches[matches.length - 1];
  return matches.find(match => match.from >= from) ?? matches[0];
};

// a new query, selecting the first match from the selection on (so typing more of
// a word keeps the same match), and leaving the selection where it is when nothing matches
export const setQuery = (query: string): Command => (state, dispatch) => {
  if (!dispatch) return true;
  const tr = state.tr.setMeta(findKey, query);
  const {from} = state.selection;
  const matches = matchesIn(state.doc, query);
  const match = matches.find(match => match.from >= from) ?? matches[0];
  dispatch(match ? select(tr, match) : tr);
  return true;
};

export const findNext: Command = (state, dispatch) => {
  const match = stepFrom(state, false);
  if (!match) return false;
  if (dispatch) dispatch(select(state.tr, match));
  return true;
};

export const findPrevious: Command = (state, dispatch) => {
  const match = stepFrom(state, true);
  if (!match) return false;
  if (dispatch) dispatch(select(state.tr, match));
  return true;
};

const replacing = (tr: Transaction, match: Match, replacement: string) => {
  const text = fitCase(replacement, tr.doc.textBetween(match.from, match.to));
  return text === "" ? tr.delete(match.from, match.to) : tr.replaceWith(match.from, match.to, schema.text(text));
};

// replace the selected match and select the next; with none selected, go to the next first
export const replaceCurrent = (replacement: string): Command => (state, dispatch) => {
  const {matches, current} = findKey.getState(state)!;
  if (current < 0) return findNext(state, dispatch);
  if (!dispatch) return true;
  const tr = replacing(state.tr, matches[current], replacement);
  // the replacement's own text could match again, so the next match is looked for after it
  const end = tr.mapping.map(matches[current].to);
  const after = matchesIn(tr.doc, findKey.getState(state)!.query);
  const next = after.find(match => match.from >= end) ?? after[0];
  if (next) select(tr, next);
  else tr.setSelection(TextSelection.create(tr.doc, end)).scrollIntoView();
  dispatch(tr);
  return true;
};

// replace every match, as one step, leaving the caret after the last one replaced
export const replaceAll = (replacement: string): Command => (state, dispatch) => {
  const {matches} = findKey.getState(state)!;
  if (matches.length === 0) return false;
  if (!dispatch) return true;
  const tr = state.tr;
  // from the end back, so the positions still ahead stay true
  for (const match of [...matches].reverse()) replacing(tr, match, replacement);
  tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(matches[matches.length - 1].to))).scrollIntoView();
  dispatch(tr);
  return true;
};
