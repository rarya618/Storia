import { describe, expect, it } from "vitest";
import { addProperty, ensureOption, fitValue, removeOption, removeProperty, renameProperty, setValue, valueLabel, BoardProperty, cardsByScene, toggleCharacter, toggleScene, actsInScript, addCard, cardsIn, countIn, emptyBoard, ensureAct, ensureGroup, inActOrder, isBlank, orderActs, placeCard, placeInAct, readBoard, removeAct, removeCard, removeGroup, renameAct, renameGroup, sectionsIn, updateCard, Board, BoardCard } from "./board";
import { ScriptBlock } from "../screenplay/types";

const card = (id: string, groups?: string[], act?: string): BoardCard => ({id, title: id.toUpperCase(), text: "", ...(act ? {act} : {}), ...(groups ? {groups} : {})});
const board = (ids: string[], groups: string[] = []): Board => ({
  cards: ids.map(id => card(id)),
  groups: groups.map(id => ({id, name: id})),
  acts: [],
  properties: [],
});
// a board with acts one and two: cards given as [id, act?]
const acted = (cards: [string, string?][]): Board => inActOrder({
  cards: cards.map(([id, act]) => card(id, undefined, act)),
  groups: [],
  acts: [{id: "one", name: "Act One"}, {id: "two", name: "Act Two"}],
  properties: [],
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
  it("adds at the end, or at the end of its act", () => {
    expect(ids(addCard(board(["a", "b"]), card("c")))).toEqual(["a", "b", "c"]);
    expect(ids(addCard(acted([["a"], ["b", "one"], ["c", "two"]]), card("d", undefined, "one")))).toEqual(["a", "b", "d", "c"]);
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

  it("moves a card within the cards in no act, counted without it", () => {
    expect(ids(placeCard(board(["a", "b", "c", "d"]), "a", undefined, 2))).toEqual(["b", "c", "a", "d"]);
    expect(ids(placeCard(board(["a", "b", "c", "d"]), "d", undefined, 0))).toEqual(["d", "a", "b", "c"]);
    expect(ids(placeCard(board(["a", "b"]), "a", undefined))).toEqual(["b", "a"]);
    const before = board(["a"]);
    expect(placeCard(before, "missing", undefined, 0)).toBe(before);
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
    const before: Board = {cards: [card("a", ["g", "h"]), card("b", ["g"]), card("c")], groups: [{id: "g", name: "G"}, {id: "h", name: "H"}], acts: [], properties: []};
    const after = removeGroup(before, "g");
    expect(after.groups).toEqual([{id: "h", name: "H"}]);
    expect(after.cards).toEqual([card("a", ["h"]), card("b"), card("c")]);
    expect(after.cards[2]).toBe(before.cards[2]);
  });

  it("filters to a group's cards, each numbered by its place in the whole board", () => {
    const b: Board = {cards: [card("a", ["g"]), card("b"), card("c", ["g"])], groups: [{id: "g", name: "G"}], acts: [], properties: []};
    expect(cardsIn(b, "g").map(({card, number}) => [card.id, number])).toEqual([["a", 1], ["c", 3]]);
    expect(cardsIn(b).length).toBe(3);
    expect(countIn(b, "g")).toBe(2);
  });
});

describe("acts", () => {
  it("reads acts, sorts cards act by act, and forgets acts that are gone", () => {
    const read = readBoard({
      acts: [{id: "one", name: "Act One"}, {id: "two", name: ""}],
      cards: [card("a", undefined, "two"), card("b", undefined, "gone"), card("c", undefined, "one")],
    });
    expect(read.acts).toEqual([{id: "one", name: "Act One"}, {id: "two", name: "Untitled act"}]);
    expect(read.cards.map(c => [c.id, c.act])).toEqual([["b", undefined], ["c", "one"], ["a", "two"]]);
  });

  it("leaves a board already in act order as it is", () => {
    const b = acted([["a"], ["b", "one"], ["c", "two"]]);
    expect(inActOrder(b)).toBe(b);
  });

  it("places a card in an act, at a place among its cards or at the end", () => {
    const b = acted([["a"], ["b", "one"], ["c", "one"], ["d", "two"]]);
    expect(ids(placeCard(b, "a", "one", 1))).toEqual(["b", "a", "c", "d"]);
    expect(ids(placeCard(b, "a", "two"))).toEqual(["b", "c", "d", "a"]);
    expect(ids(placeCard(b, "d", undefined, 0))).toEqual(["d", "a", "b", "c"]);
    expect(placeCard(b, "a", "two").cards.find(c => c.id === "a")?.act).toBe("two");
    expect(placeCard(b, "b", undefined).cards.find(c => c.id === "b")).not.toHaveProperty("act");
    expect(placeCard(b, "a", "unknown").cards.find(c => c.id === "a")).not.toHaveProperty("act");
    expect(placeInAct(b, "c")).toBe(1);
  });

  it("keeps a card's act when its words change", () => {
    const b = acted([["a", "one"]]);
    expect(updateCard(b, "a", {text: "New"}).cards[0]).toEqual({id: "a", title: "A", text: "New", act: "one"});
  });

  it("adds an act once, renames it, and removes it leaving its cards ahead of the acts", () => {
    const added = ensureAct(emptyBoard(), " Act Three ", "three");
    expect(added.board.acts).toEqual([{id: "three", name: "Act Three"}]);
    expect(ensureAct(added.board, "act three", "x").id).toBe("three");
    expect(renameAct(added.board, "three", "Finale").acts[0].name).toBe("Finale");
    const removed = removeAct(acted([["a"], ["b", "one"], ["c", "two"]]), "two");
    expect(removed.acts.map(a => a.id)).toEqual(["one"]);
    expect(removed.cards.map(c => [c.id, c.act])).toEqual([["a", undefined], ["c", undefined], ["b", "one"]]);
  });

  it("reorders acts, and the cards follow", () => {
    const b = orderActs(acted([["b", "one"], ["c", "two"]]), ["two", "one"]);
    expect(b.acts.map(a => a.id)).toEqual(["two", "one"]);
    expect(ids(b)).toEqual(["c", "b"]);
  });

  it("lays out sections with real numbers, keeping empty acts unless filtered", () => {
    const b: Board = {...acted([["a", "one"], ["b", "one"]]), groups: [{id: "g", name: "G"}]};
    b.cards[1] = {...b.cards[1], groups: ["g"]};
    expect(sectionsIn(b).map(({act, cards}) => [act?.id, cards.map(c => c.number)])).toEqual([["one", [1, 2]], ["two", []]]);
    expect(sectionsIn(b, "g").map(({act, cards}) => [act?.id, cards.map(c => c.number)])).toEqual([["one", [2]]]);
  });

  it("reads the acts a script opens, without END OF ACT or repeats", () => {
    const blocks: ScriptBlock[] = [
      {id: "1", type: "act", text: "COLD OPEN"},
      {id: "2", type: "heading", text: "INT. HOUSE - DAY"},
      {id: "3", type: "act", text: "END OF COLD OPEN"},
      {id: "4", type: "act", text: "ACT ONE"},
      {id: "5", type: "act", text: "act one"},
      {id: "6", type: "act", text: " "},
    ];
    expect(actsInScript(blocks)).toEqual(["COLD OPEN", "ACT ONE"]);
  });
});

describe("links to the script", () => {
  it("reads scene links and characters, dropping broken and repeated ones", () => {
    const read = readBoard({cards: [{id: "a", scenes: [{doc: "d", scene: "s"}, {doc: "d"}, {doc: "d", scene: "s"}], characters: ["MAYA", "", "MAYA", "TOM"]}]});
    expect(read.cards[0].scenes).toEqual([{doc: "d", scene: "s"}]);
    expect(read.cards[0].characters).toEqual(["MAYA", "TOM"]);
  });

  it("links and unlinks a scene, leaving out an empty list", () => {
    const linked = toggleScene(board(["a"]), "a", {doc: "d", scene: "s"});
    expect(linked.cards[0].scenes).toEqual([{doc: "d", scene: "s"}]);
    expect(toggleScene(linked, "a", {doc: "d", scene: "s"}).cards[0]).not.toHaveProperty("scenes");
  });

  it("ties and unties a character", () => {
    const tied = toggleCharacter(board(["a"]), "a", "MAYA");
    expect(tied.cards[0].characters).toEqual(["MAYA"]);
    expect(toggleCharacter(tied, "a", "MAYA").cards[0]).not.toHaveProperty("characters");
  });

  it("finds the cards about each scene of a draft", () => {
    let b = toggleScene(board(["a", "b"]), "a", {doc: "d", scene: "s"});
    b = toggleScene(b, "b", {doc: "d", scene: "s"});
    b = toggleScene(b, "b", {doc: "other", scene: "t"});
    expect(cardsByScene(b, "d").get("s")?.map(card => card.id)).toEqual(["a", "b"]);
    expect(cardsByScene(b, "d").has("t")).toBe(false);
  });

  it("keeps its links when its words change", () => {
    const b = toggleScene(board(["a"]), "a", {doc: "d", scene: "s"});
    expect(updateCard(b, "a", {title: "New"}).cards[0].scenes).toEqual([{doc: "d", scene: "s"}]);
  });
});

describe("properties", () => {
  const status: BoardProperty = {id: "st", name: "Status", type: "select", options: [{id: "idea", name: "Idea"}, {id: "done", name: "Done"}]};
  const tags: BoardProperty = {id: "tg", name: "Tags", type: "multi", options: [{id: "x", name: "X"}, {id: "y", name: "Y"}]};
  const withProps = (): Board => ({...board(["a", "b"]), properties: [status, tags, {id: "n", name: "Pages", type: "number"}, {id: "d", name: "Due", type: "date"}, {id: "c", name: "Shot", type: "checkbox"}, {id: "t", name: "Note", type: "text"}]});

  it("reads properties of known types, dropping the rest, and values that don't fit", () => {
    const read = readBoard({
      properties: [status, {id: "bad", name: "Odd", type: "colour"}, {id: "n", name: "Pages", type: "number"}],
      cards: [{id: "a", values: {st: "done", n: "12", bad: "x", gone: 1}}, {id: "b", values: {st: "nope", n: 3}}],
    });
    expect(read.properties.map(p => p.id)).toEqual(["st", "n"]);
    expect(read.cards[0].values).toEqual({st: "done"});
    expect(read.cards[1].values).toEqual({n: 3});
  });

  it("fits values to their type", () => {
    expect(fitValue(tags, ["y", "zz", "y"])).toEqual(["y"]);
    expect(fitValue(tags, [])).toBeUndefined();
    expect(fitValue({id: "d", name: "Due", type: "date"}, "2026-11-25")).toBe("2026-11-25");
    expect(fitValue({id: "d", name: "Due", type: "date"}, "soon")).toBeUndefined();
    expect(fitValue({id: "c", name: "Shot", type: "checkbox"}, false)).toBeUndefined();
    expect(fitValue({id: "t", name: "Note", type: "text"}, "  ")).toBeUndefined();
    expect(fitValue({id: "n", name: "Pages", type: "number"}, NaN)).toBeUndefined();
  });

  it("sets and clears a card's value, leaving out an empty set", () => {
    const set = setValue(withProps(), "a", "st", "idea");
    expect(set.cards[0].values).toEqual({st: "idea"});
    expect(setValue(set, "a", "st", undefined).cards[0]).not.toHaveProperty("values");
    expect(setValue(set, "a", "missing", 1)).toBe(set);
  });

  it("adds a property once, renames it, and removes it with its values", () => {
    const b = addProperty(emptyBoard(), {id: "p", name: " Mood ", type: "text"});
    expect(b.properties).toEqual([{id: "p", name: "Mood", type: "text"}]);
    expect(addProperty(b, {id: "q", name: "mood", type: "number"})).toBe(b);
    expect(renameProperty(b, "p", "Tone").properties[0].name).toBe("Tone");
    const valued = setValue(withProps(), "a", "n", 4);
    expect(removeProperty(valued, "n").cards[0]).not.toHaveProperty("values");
  });

  it("adds options once, and removing one takes it off every card", () => {
    let b = withProps();
    const added = ensureOption(b, "st", "Drafted", "dr");
    expect(added.id).toBe("dr");
    expect(ensureOption(added.board, "st", "drafted", "x2").id).toBe("dr");
    b = setValue(setValue(added.board, "a", "st", "dr"), "b", "tg", ["x", "y"]);
    b = removeOption(removeOption(b, "st", "dr"), "tg", "x");
    expect(b.cards[0]).not.toHaveProperty("values");
    expect(b.cards[1].values).toEqual({tg: ["y"]});
  });

  it("puts values into words", () => {
    expect(valueLabel(status, "done")).toBe("Done");
    expect(valueLabel(tags, ["x", "y"])).toBe("X, Y");
    expect(valueLabel({id: "c", name: "Shot", type: "checkbox"}, true)).toBe("Shot");
    expect(valueLabel({id: "n", name: "Pages", type: "number"}, 3)).toBe("3");
    expect(valueLabel(status, undefined)).toBeUndefined();
  });
});
