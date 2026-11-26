// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import ActionMenu from "./ActionMenu";
import { itemActions } from "./itemActions";

(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = "";
});

const mount = () => {
  const chosen: string[] = [];
  const place = document.createElement("div");
  document.body.appendChild(place);
  root = createRoot(place);
  act(() => root!.render(
    <ActionMenu label="More for Pilot" actions={itemActions({onEdit: () => chosen.push("edit"), onDelete: () => chosen.push("delete")})} />,
  ));
  const button = place.querySelector<HTMLButtonElement>("button[aria-label='More for Pilot']")!;
  const items = () => [...place.querySelectorAll<HTMLButtonElement>(".sw-menu-item")];
  return {place, button, items, chosen};
};

describe("ActionMenu", () => {
  it("opens on Edit details, then Delete set apart by a rule", () => {
    const {place, button, items} = mount();
    expect(items()).toHaveLength(0);
    act(() => button.click());
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(items().map(item => item.textContent)).toEqual(["Edit details", "Delete"]);
    const rule = place.querySelector("[role=separator]")!;
    expect(rule.nextElementSibling?.textContent).toBe("Delete");
  });

  it("closes on a choice, runs it, and hands focus back to its button", () => {
    const {button, items, chosen} = mount();
    act(() => button.click());
    act(() => items()[1].click());
    expect(chosen).toEqual(["delete"]);
    expect(items()).toHaveLength(0);
    expect(document.activeElement).toBe(button);
  });

  it("closes on Escape and on a click outside", () => {
    const {button, items} = mount();
    act(() => button.click());
    act(() => { items()[0].dispatchEvent(new KeyboardEvent("keydown", {key: "Escape", bubbles: true})); });
    expect(items()).toHaveLength(0);
    act(() => button.click());
    act(() => { document.body.dispatchEvent(new MouseEvent("mousedown", {bubbles: true})); });
    expect(items()).toHaveLength(0);
  });
});
