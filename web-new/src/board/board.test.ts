import { describe, expect, it } from "vitest";
import { addCard, cardsIn, countIn, emptyBoard, ensureGroup, isBlank, moveCard, readBoard, removeCard, removeGroup, renameGroup, updateCard, Board } from "./board";

const card = (id: string, groups?: string[]) => ({id, title: id.toUpperCase(), text: "", ...(groups ? {groups} : {})});
const board = (ids: string[], groups: string[] = []): Board => ({
  cards: ids.map(id => card(id)),
  groups: groups.map(id => ({id, name: id})),
});
const ids = (b: Board) => b.cards.map(c => c.id);

describe("readBoard", () => {
  it("reads nothing as an empty board", () => {
    expect(readBoard(null)).toEqual(emptyBoard());
    expect(readBoard("nonsense")).toEqual(emptyBoard());
  });

  it("reads lists RTDB returns as objects, in key order", () => {
    const read = readBoard({cards: {0: card("a"), 2: card("b")}, groups: {0: {id: "g", name: "Act one"}}});
    expect(ids(read)).toEqual(["a", "b"]);
    expect(read.groups).toEqual([{id: "g", name: "Act one"}]);
  });

  it("drops entries without ids and keeps the first of a repeated id", () => {
    const read = readBoard({cards: [card("a"), {title: "no id"}, {...card("a"), title: "again"}, null]});
    expect(read.cards).toEqual([card("a")]);
  });

  it("fills in missing text, names blank groups, and forgets groups that are gone", () => {
    const read = readBoard({
      cards: [{id: "a", groups: ["g", "gone", "g"]}],
      groups: [{id: "g", name: "  "}],
    });
    expect(read.cards).toEqual([{id: "a", title: "", text: "", groups: ["g"]}]);
    expect(read.groups).toEqual([{id: "g", name: "Untitled group"}]);
  });

  it("leaves out an empty group list", () => {
    expect(readBoard({cards: [{id: "a", groups: ["gone"]}]}).cards[0]).not.toHaveProperty("groups");
  });
});

describe("cards", () => {
  it("adds at the end, or at a place", () => {
    expect(ids(addCard(board(["a", "b"]), card("c")))).toEqual(["a", "b", "c"]);
    expect(ids(addCard(board(["a", "b"]), card("c"), 1))).toEqual(["a", "c", "b"]);
    expect(ids(addCard(board(["a"]), card("c"), 99))).toEqual(["a", "c"]);
  });

  it("won't add a second card with the same id", () => {
    const before = board(["a"]);
    expect(addCard(before, card("a"))).toBe(before);
  });

  it("trims what's written and leaves out an empty group list", () => {
    const added = addCard(emptyBoard(), {id: "a", title: "  Opening ", text: " The bus. \n", groups: []});
    expect(added.cards[0]).toEqual({id: "a", title: "Opening", text: "The bus."});
  });

  it("updates one card and leaves the others alone", () => {
    const before = board(["a", "b"]);
    const after = updateCard(before, "b", {text: "Changed", groups: ["g", "g"]});
    expect(after.cards[0]).toBe(before.cards[0]);
    expect(after.cards[1]).toEqual({id: "b", title: "B", text: "Changed", groups: ["g"]});
  });

  it("removes a card", () => {
    expect(ids(removeCard(board(["a", "b", "c"]), "b"))).toEqual(["a", "c"]);
  });

  it("moves a card to a place counted without it", () => {
    expect(ids(moveCard(board(["a", "b", "c", "d"]), "a", 2))).toEqual(["b", "c", "a", "d"]);
    expect(ids(moveCard(board(["a", "b", "c", "d"]), "d", 0))).toEqual(["d", "a", "b", "c"]);
    expect(ids(moveCard(board(["a", "b"]), "a", 99))).toEqual(["b", "a"]);
    const before = board(["a"]);
    expect(moveCard(before, "missing", 0)).toBe(before);
  });

  it("calls a card blank only when it has neither title nor text", () => {
    expect(isBlank({title: " ", text: "\n"})).toBe(true);
    expect(isBlank({title: "", text: "Something"})).toBe(false);
  });
});

describe("groups", () => {
  it("adds a group once, matching names without case or spaces", () => {
    const first = ensureGroup(emptyBoard(), " Act one ", "g1");
    expect(first.id).toBe("g1");
    expect(first.board.groups).toEqual([{id: "g1", name: "Act one"}]);
    const again = ensureGroup(first.board, "act ONE", "g2");
    expect(again.id).toBe("g1");
    expect(again.board).toBe(first.board);
    expect(ensureGroup(emptyBoard(), "  ", "g3").id).toBeUndefined();
  });

  it("renames a group, but not to nothing", () => {
    expect(renameGroup(board([], ["g"]), "g", " B plot ").groups).toEqual([{id: "g", name: "B plot"}]);
    expect(renameGroup(board([], ["g"]), "g", " ").groups).toEqual([{id: "g", name: "g"}]);
  });

  it("removes a group from the board and from every card, keeping the cards in place", () => {
    const before: Board = {cards: [card("a", ["g", "h"]), card("b", ["g"]), card("c")], groups: [{id: "g", name: "G"}, {id: "h", name: "H"}]};
    const after = removeGroup(before, "g");
    expect(after.groups).toEqual([{id: "h", name: "H"}]);
    expect(after.cards).toEqual([card("a", ["h"]), card("b"), card("c")]);
    expect(after.cards[2]).toBe(before.cards[2]);
  });

  it("filters to a group's cards, each numbered by its place in the whole board", () => {
    const b: Board = {cards: [card("a", ["g"]), card("b"), card("c", ["g"])], groups: [{id: "g", name: "G"}]};
    expect(cardsIn(b, "g").map(({card, number}) => [card.id, number])).toEqual([["a", 1], ["c", 3]]);
    expect(cardsIn(b).length).toBe(3);
    expect(countIn(b, "g")).toBe(2);
  });
});
