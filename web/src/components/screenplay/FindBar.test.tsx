// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { createRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import ScriptEditor, { Found, ScriptEditorHandle } from "./ScriptEditor";
import FindBar from "./FindBar";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";

(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});

// the editor with its find bar, as DocumentView holds them
const mount = (initial: ScriptBlock[], text = "") => {
  const handle = createRef<ScriptEditorHandle>();
  const seen: {blocks: ScriptBlock[], closed?: string} = {blocks: initial};
  const Host = () => {
    const [blocks, setBlocks] = useState(initial);
    const [activeId, setActiveId] = useState<string>();
    const [found, setFound] = useState<Found>({count: 0, current: -1});
    const [seed] = useState({text, at: 1});
    seen.blocks = blocks;
    return <>
      <ScriptEditor ref={handle} blocks={blocks} setBlocks={update => setBlocks(update)} activeId={activeId} setActiveId={setActiveId} onFound={setFound} />
      {seen.closed === undefined && <FindBar editor={handle} found={found} seed={seed} wholeWord={false} onClose={search => { seen.closed = search.query; }} />}
    </>;
  };
  const place = document.createElement("div");
  document.body.appendChild(place);
  let root!: Root;
  act(() => { root = createRoot(place); root.render(<Host />); });
  mounted.push(() => { act(() => root.unmount()); place.remove(); });
  const field = (label: string) => place.querySelector<HTMLInputElement>("input[aria-label=\"" + label + "\"]")!;
  const button = (label: string) => Array.from(place.querySelectorAll("button")).find(b => b.textContent === label || b.getAttribute("aria-label") === label)!;
  return {seen, place, field, button};
};

const mounted: (() => void)[] = [];
afterEach(() => { mounted.splice(0).forEach(unmount => unmount()); });

// a controlled field takes typing through the value setter React watches
const type = (input: HTMLInputElement, value: string) => act(() => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", {bubbles: true}));
});
const press = (input: HTMLInputElement, key: string, shiftKey = false) =>
  act(() => { input.dispatchEvent(new KeyboardEvent("keydown", {key, shiftKey, bubbles: true})); });

const script = [block("a", "action", "Sam waits for Samantha."), block("c", "character", "SAM"), block("d", "dialogue", "Hi, sam.")];

// the ticked Whole words only box
const wholeWords = (place: HTMLElement) => act(() => place.querySelector<HTMLInputElement>("input[type=checkbox]")!.click());

describe("FindBar", () => {
  it("opens on its seed, marks every match on the page, parts of words too, and counts them", () => {
    const {place, field} = mount(script, "sam");
    expect(Array.from(place.querySelectorAll(".sp-match")).map(match => match.textContent)).toEqual(["Sam", "Sam", "SAM", "sam"]);
    expect(place.querySelector("#find-count")!.textContent).toBe("1 of 4");
    wholeWords(place);
    expect(field("Find").value).toBe("sam");
    expect(document.activeElement).toBe(field("Find"));
    expect(Array.from(place.querySelectorAll(".sp-match")).map(match => match.textContent)).toEqual(["Sam", "SAM", "sam"]);
    expect(place.querySelector(".sp-match-current")!.textContent).toBe("Sam");
    expect(place.querySelector("#find-count")!.textContent).toBe("1 of 3");
  });

  it("steps with Return and Shift+Return, and says when nothing matches", () => {
    const {place, field} = mount(script, "sam");
    wholeWords(place);
    press(field("Find"), "Enter");
    expect(place.querySelector("#find-count")!.textContent).toBe("2 of 3");
    press(field("Find"), "Enter", true);
    press(field("Find"), "Enter", true);
    expect(place.querySelector("#find-count")!.textContent).toBe("3 of 3");
    type(field("Find"), "nobody");
    expect(place.querySelector("#find-count")!.textContent).toBe("No matches");
    expect(place.querySelector(".sp-match")).toBeNull();
  });

  it("replaces one at a time, or all at once, in each match's case", () => {
    const {seen, place, field, button} = mount(script, "sam");
    wholeWords(place);
    type(field("Replace with"), "alex");
    act(() => button("Replace").click());
    expect(seen.blocks.map(b => b.text)).toEqual(["Alex waits for Samantha.", "SAM", "Hi, sam."]);
    act(() => button("Replace all").click());
    expect(seen.blocks.map(b => b.text)).toEqual(["Alex waits for Samantha.", "ALEX", "Hi, alex."]);
  });

  it("closes on Escape, handing back the query for next time", () => {
    const {seen, field} = mount(script, "sam");
    press(field("Find"), "Escape");
    expect(seen.closed).toBe("sam");
  });
});
