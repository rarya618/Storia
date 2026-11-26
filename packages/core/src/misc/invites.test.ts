import { describe, expect, it } from "vitest";
import { inviteKey } from "./invites";

describe("inviteKey", () => {
  it("turns every dot into a comma, as the database rules do", () => {
    expect(inviteKey("first.last@mail.example.com")).toBe("first,last@mail,example,com");
  });

  it("ignores case and surrounding spaces, which Firebase Auth does too", () => {
    expect(inviteKey("  Writer@Example.COM ")).toBe("writer@example,com");
  });
});
