import { describe, expect, it } from "vitest";
import { bodyFromText, bodyJSON, bodySchema, isEmptyBody, readBody, textOfBody } from "./body";

const doc = (...blocks: object[]) => ({type: "doc", content: blocks});
const para = (text?: string) => ({type: "paragraph", ...(text ? {content: [{type: "text", text}]} : {})});

describe("card bodies", () => {
  it("makes a paragraph per line of plain text", () => {
    const body = bodyFromText("One\n\nTwo");
    expect(body.childCount).toBe(3);
    expect(textOfBody(body)).toBe("One\n\nTwo");
  });

  it("reads a stored body, with lists RTDB turned into objects", () => {
    const stored = {
      type: "doc",
      content: {
        0: {type: "heading", attrs: {level: 2}, content: {0: {type: "text", text: "Beats"}}},
        1: {type: "bullet_list", content: {0: {type: "list_item", content: {0: para("Maya runs")}}}},
        2: {type: "todo", attrs: {checked: true}, content: {0: {type: "text", text: "Check the timeline"}}},
      },
    };
    const body = readBody(stored, "ignored");
    expect(body.child(0).type.name).toBe("heading");
    expect(body.child(2).attrs.checked).toBe(true);
    expect(textOfBody(body)).toBe("Beats\nMaya runs\nCheck the timeline");
  });

  it("falls back to the card's text when the body can't be read", () => {
    expect(textOfBody(readBody({type: "doc", content: [{type: "nonsense"}]}, "Kept"))).toBe("Kept");
    expect(textOfBody(readBody(undefined, "From text"))).toBe("From text");
  });

  it("reads an empty paragraph whose content RTDB dropped", () => {
    expect(isEmptyBody(readBody(doc(para())))).toBe(true);
  });

  it("round-trips through JSON", () => {
    const body = readBody(doc({type: "blockquote", content: [para("Said once")]}, para("After")));
    expect(bodySchema.nodeFromJSON(body.toJSON()).eq(body)).toBe(true);
  });

  it("gives plain objects for the database, attributes included", () => {
    const json = bodyJSON(readBody(doc({type: "heading", attrs: {level: 2}, content: [{type: "text", text: "Hi"}]})));
    const heading = (json.content as {attrs: object}[])[0];
    expect(Object.getPrototypeOf(heading.attrs)).toBe(Object.prototype);
  });
});
