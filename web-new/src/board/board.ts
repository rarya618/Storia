// A project's board: the story planned out on cards before (or beside) the
// script. Each card has a title, some text and the groups it belongs to (a
// subplot, a character's arc, an act); its place in the list is its place in
// the story. This file has no UI or Firebase in it: every change is a pure
// function from one board to the next, so a write can apply it to whatever
// copy the database holds when it lands.

export type BoardCard = {
  id: string,
  title: string,
  text: string,
  groups?: string[], // group ids, in the order they were given
};

export type BoardGroup = { id: string, name: string };

export type Board = { cards: BoardCard[], groups: BoardGroup[] };

export const emptyBoard = (): Board => ({cards: [], groups: []});

const asString = (value: unknown) => typeof value === "string" ? value : "";

// RTDB hands back an array as an object when it has gaps, and drops empty ones
const asList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : [];

// whatever the database holds, as a board this build can draw: unreadable
// entries go, a repeated id keeps its first card or group, and a card forgets
// any group that no longer exists
export const readBoard = (value: unknown): Board => {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

  const groups: BoardGroup[] = [];
  const groupIds = new Set<string>();
  for (const item of asList(source.groups)) {
    const group = item as Partial<BoardGroup> | null;
    const id = asString(group?.id);
    if (!id || groupIds.has(id)) continue;
    groupIds.add(id);
    groups.push({id, name: asString(group?.name).trim() || "Untitled group"});
  }

  const cards: BoardCard[] = [];
  const cardIds = new Set<string>();
  for (const item of asList(source.cards)) {
    const card = item as Partial<BoardCard> | null;
    const id = asString(card?.id);
    if (!id || cardIds.has(id)) continue;
    cardIds.add(id);
    const inGroups = [...new Set(asList(card?.groups).map(asString))].filter(groupId => groupIds.has(groupId));
    cards.push({id, title: asString(card?.title), text: asString(card?.text), ...(inGroups.length ? {groups: inGroups} : {})});
  }

  return {cards, groups};
};

// a card's own fields, trimmed, with an empty group list left out (RTDB would drop it anyway)
const tidy = (card: BoardCard): BoardCard => {
  const groups = [...new Set(card.groups ?? [])];
  return {id: card.id, title: card.title.trim(), text: card.text.trim(), ...(groups.length ? {groups} : {})};
};

export const isBlank = (card: Pick<BoardCard, "title" | "text">) => !card.title.trim() && !card.text.trim();

const clamp = (index: number, length: number) => Math.max(0, Math.min(index, length));

// put a card in at a place (the end if none), or leave the board alone if its id is taken
export const addCard = (board: Board, card: BoardCard, at = board.cards.length): Board => {
  if (board.cards.some(existing => existing.id === card.id)) return board;
  const cards = [...board.cards];
  cards.splice(clamp(at, cards.length), 0, tidy(card));
  return {...board, cards};
};

export const updateCard = (board: Board, id: string, changes: Partial<Omit<BoardCard, "id">>): Board => ({
  ...board,
  cards: board.cards.map(card => card.id === id ? tidy({...card, ...changes}) : card),
});

export const removeCard = (board: Board, id: string): Board => ({
  ...board,
  cards: board.cards.filter(card => card.id !== id),
});

// move a card to a place in the whole list, counted as if it had already left its own
export const moveCard = (board: Board, id: string, to: number): Board => {
  const from = board.cards.findIndex(card => card.id === id);
  if (from === -1) return board;
  const cards = [...board.cards];
  const [card] = cards.splice(from, 1);
  cards.splice(clamp(to, cards.length), 0, card);
  return {...board, cards};
};

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
  groups: board.groups.filter(group => group.id !== id),
  cards: board.cards.map(card => card.groups?.includes(id) ? tidy({...card, groups: card.groups.filter(groupId => groupId !== id)}) : card),
});

// the cards in a group, in story order, each with its place in the whole board;
// with no group, every card
export const cardsIn = (board: Board, groupId?: string) =>
  board.cards
    .map((card, index) => ({card, number: index + 1}))
    .filter(({card}) => !groupId || (card.groups ?? []).includes(groupId));

export const countIn = (board: Board, groupId: string) =>
  board.cards.filter(card => (card.groups ?? []).includes(groupId)).length;
