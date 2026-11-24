// A project's board: the story planned out on cards before (or beside) the
// script. Each card has a title, some text, the act it falls in, and the groups
// it belongs to (a subplot, a character's arc); its place in the list is its
// place in the story. The board's acts are its own, in order (a draft's act
// breaks can fill them in, but the plan doesn't change when a draft does), and
// the list is always kept act by act, cards in no act first, so a card's number
// reads straight down the board. This file has no UI or Firebase in it: every change is a pure
// function from one board to the next, so a write can apply it to whatever
// copy the database holds when it lands.

import { closesAct, ScriptBlock } from "../screenplay/types";
import { BodyJSON } from "./body";

export type BoardCard = {
  id: string,
  title: string,
  text: string,      // the plain text of its body, for tiles, the rail and older tabs
  body?: BodyJSON,   // the card's page, as a ProseMirror document (see body.ts)
  act?: string,      // the act's id; none means the card isn't in an act yet
  groups?: string[], // group ids, in the order they were given
};

export type BoardGroup = { id: string, name: string };
export type BoardAct = { id: string, name: string };

export type Board = { cards: BoardCard[], groups: BoardGroup[], acts: BoardAct[] };

export const emptyBoard = (): Board => ({cards: [], groups: [], acts: []});

const asString = (value: unknown) => typeof value === "string" ? value : "";

// RTDB hands back an array as an object when it has gaps, and drops empty ones
const asList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : [];

// whatever the database holds, as a board this build can draw: unreadable
// entries go, a repeated id keeps its first card or group, and a card forgets
// any group that no longer exists
// named things in order (groups, acts), each id once, a blank name given a stand-in
const readNamed = (value: unknown, fallback: string) => {
  const named: {id: string, name: string}[] = [];
  const ids = new Set<string>();
  for (const item of asList(value)) {
    const entry = item as {id?: unknown, name?: unknown} | null;
    const id = asString(entry?.id);
    if (!id || ids.has(id)) continue;
    ids.add(id);
    named.push({id, name: asString(entry?.name).trim() || fallback});
  }
  return {named, ids};
};

export const readBoard = (value: unknown): Board => {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

  const {named: groups, ids: groupIds} = readNamed(source.groups, "Untitled group");
  const {named: acts, ids: actIds} = readNamed(source.acts, "Untitled act");

  const cards: BoardCard[] = [];
  const cardIds = new Set<string>();
  for (const item of asList(source.cards)) {
    const card = item as Partial<BoardCard> | null;
    const id = asString(card?.id);
    if (!id || cardIds.has(id)) continue;
    cardIds.add(id);
    const inGroups = [...new Set(asList(card?.groups).map(asString))].filter(groupId => groupIds.has(groupId));
    const act = asString(card?.act);
    cards.push({
      id, title: asString(card?.title), text: asString(card?.text),
      ...(card?.body && typeof card.body === "object" ? {body: card.body} : {}),
      ...(actIds.has(act) ? {act} : {}),
      ...(inGroups.length ? {groups: inGroups} : {}),
    });
  }

  return inActOrder({cards, groups, acts});
};

// the cards sorted act by act (no act first), each act's cards keeping their
// order; the same board when they already are
export const inActOrder = (board: Board): Board => {
  const place = new Map(board.acts.map((act, index) => [act.id, index]));
  const rank = (card: BoardCard) => card.act === undefined ? -1 : place.get(card.act) ?? -1;
  const sorted = board.cards.map((card, index) => ({card, index}))
    .sort((a, b) => rank(a.card) - rank(b.card) || a.index - b.index)
    .map(({card}) => card);
  return sorted.every((card, index) => card === board.cards[index]) ? board : {...board, cards: sorted};
};

// a card's own fields, trimmed, with an empty group list left out (RTDB would drop it anyway)
const tidy = (card: BoardCard): BoardCard => {
  const groups = [...new Set(card.groups ?? [])];
  return {
    id: card.id, title: card.title.trim(), text: card.text.trim(),
    ...(card.body ? {body: card.body} : {}),
    ...(card.act ? {act: card.act} : {}),
    ...(groups.length ? {groups} : {}),
  };
};

export const isBlank = (card: Pick<BoardCard, "title" | "text">) => !card.title.trim() && !card.text.trim();

const clamp = (index: number, length: number) => Math.max(0, Math.min(index, length));

// add a card at the end of its act (or of the cards in no act), or leave the
// board alone if its id is taken
export const addCard = (board: Board, card: BoardCard): Board => {
  if (board.cards.some(existing => existing.id === card.id)) return board;
  return placeCard({...board, cards: [...board.cards, tidy(card)]}, card.id, card.act);
};

// a blank card at the end of an act (or of the cards in no act), ready for its page
export const newCard = (board: Board, id: string, act?: string, groups?: string[]): Board =>
  addCard(board, {id, title: "", text: "", act: act && board.acts.some(existing => existing.id === act) ? act : undefined, groups});

// change a card's words or groups; its act changes through placeCard
export const updateCard = (board: Board, id: string, changes: Partial<Omit<BoardCard, "id" | "act">>): Board => ({
  ...board,
  cards: board.cards.map(card => card.id === id ? tidy({...card, ...changes, act: card.act}) : card),
});

// the board's cards act by act: the ones in no act, then each act in order,
// even an act with no cards yet
export const sections = (board: Board) => [
  {act: undefined as BoardAct | undefined, cards: board.cards.filter(card => !card.act)},
  ...board.acts.map(act => ({act: act as BoardAct | undefined, cards: board.cards.filter(card => card.act === act.id)})),
];

// put a card in an act (undefined for none) at a place among that act's other
// cards (the end if none given), keeping the rest in order
export const placeCard = (board: Board, id: string, act: string | undefined, at?: number): Board => {
  const card = board.cards.find(existing => existing.id === id);
  if (!card) return board;
  const into = act && board.acts.some(existing => existing.id === act) ? act : undefined;
  const moved = tidy({...card, act: into});
  const parts = sections({...board, cards: board.cards.filter(existing => existing.id !== id)});
  const target = parts.find(part => part.act?.id === into) ?? parts[0];
  target.cards.splice(clamp(at ?? target.cards.length, target.cards.length), 0, moved);
  return {...board, cards: parts.flatMap(part => part.cards)};
};

// where a card sits among its act's cards
export const placeInAct = (board: Board, id: string) => {
  const card = board.cards.find(existing => existing.id === id);
  return card ? board.cards.filter(other => other.act === card.act).findIndex(other => other.id === id) : -1;
};

export const removeCard = (board: Board, id: string): Board => ({
  ...board,
  cards: board.cards.filter(card => card.id !== id),
});

export const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

// the id of the group with this name, adding it if there isn't one; undefined for a blank name
export const ensureGroup = (board: Board, name: string, newId: string): {board: Board, id?: string} => {
  const trimmed = name.trim();
  if (!trimmed) return {board};
  const existing = board.groups.find(group => sameName(group.name, trimmed));
  if (existing) return {board, id: existing.id};
  return {board: {...board, groups: [...board.groups, {id: newId, name: trimmed}]}, id: newId};
};

export const renameGroup = (board: Board, id: string, name: string): Board => {
  const trimmed = name.trim();
  if (!trimmed) return board;
  return {...board, groups: board.groups.map(group => group.id === id ? {...group, name: trimmed} : group)};
};

// a group goes, and every card keeps its place and forgets it
export const removeGroup = (board: Board, id: string): Board => ({
  ...board,
  groups: board.groups.filter(group => group.id !== id),
  cards: board.cards.map(card => card.groups?.includes(id) ? tidy({...card, groups: card.groups.filter(groupId => groupId !== id)}) : card),
});

// the cards in a group, in story order, each with its place in the whole board;
// with no group, every card
export const cardsIn = (board: Board, groupId?: string) =>
  board.cards
    .map((card, index) => ({card, number: index + 1}))
    .filter(({card}) => !groupId || (card.groups ?? []).includes(groupId));

// the board's sections with each card numbered by its place in the whole
// board, filtered to a group if one is given. Filtered, an act with none of the
// group's cards is left out
export const sectionsIn = (board: Board, groupId?: string) => {
  const numbers = new Map(board.cards.map((card, index) => [card.id, index + 1]));
  return sections(board)
    .map(({act, cards}) => ({
      act,
      cards: cards
        .filter(card => !groupId || (card.groups ?? []).includes(groupId))
        .map(card => ({card, number: numbers.get(card.id)!})),
    }))
    .filter(({act, cards}) => cards.length > 0 || (act && !groupId));
};

export const countIn = (board: Board, groupId: string) =>
  board.cards.filter(card => (card.groups ?? []).includes(groupId)).length;

// the id of the act with this name, adding it at the end if there isn't one; undefined for a blank name
export const ensureAct = (board: Board, name: string, newId: string): {board: Board, id?: string} => {
  const trimmed = name.trim();
  if (!trimmed) return {board};
  const existing = board.acts.find(act => sameName(act.name, trimmed));
  if (existing) return {board, id: existing.id};
  return {board: {...board, acts: [...board.acts, {id: newId, name: trimmed}]}, id: newId};
};

export const renameAct = (board: Board, id: string, name: string): Board => {
  const trimmed = name.trim();
  if (!trimmed) return board;
  return {...board, acts: board.acts.map(act => act.id === id ? {...act, name: trimmed} : act)};
};

// an act goes; its cards stay, in no act, ahead of the acts
export const removeAct = (board: Board, id: string): Board => inActOrder({
  ...board,
  acts: board.acts.filter(act => act.id !== id),
  cards: board.cards.map(card => card.act === id ? tidy({...card, act: undefined}) : card),
});

// put the acts in this order (ids not on the board are ignored, acts left out
// keep their places after), and the cards follow their acts
export const orderActs = (board: Board, ids: string[]): Board => {
  const listed = ids.flatMap(id => board.acts.filter(act => act.id === id));
  const rest = board.acts.filter(act => !ids.includes(act.id));
  return inActOrder({...board, acts: [...listed, ...rest]});
};

// the acts a script opens, in order, each name once: its act breaks, less the
// ones that close an act ("END OF ACT ONE")
export const actsInScript = (blocks: ScriptBlock[]) => {
  const names: string[] = [];
  for (const block of blocks) {
    const name = block.text.trim();
    if (block.type !== "act" || !name || closesAct(block) || names.some(other => sameName(other, name))) continue;
    names.push(name);
  }
  return names;
};
