import { describe, expect, it } from "vitest";
import { toMessage } from "./errors";

const withCode = (message: string, code: string) => Object.assign(new Error(message), {code});

describe("toMessage", () => {
  it("words a refusal the same however the database reports it", () => {
    const words = "You don't have access to this.";
    // a write or a listener: a code
    expect(toMessage(withCode("PERMISSION_DENIED: Permission denied", "PERMISSION_DENIED"))).toBe(words);
    // the native SDKs
    expect(toMessage(withCode("[database/permission-denied] ...", "database/permission-denied"))).toBe(words);
    // get(): the server's words alone
    expect(toMessage(new Error("Permission denied"))).toBe(words);
  });

  it("words a known auth error", () => {
    expect(toMessage(withCode("Firebase: Error (auth/invalid-email).", "auth/invalid-email")))
      .toBe("That doesn't look like a valid email address.");
  });

  it("keeps another error's own message, without Firebase's prefix", () => {
    expect(toMessage(new Error("Firebase: Something broke."))).toBe("Something broke.");
    expect(toMessage("Plain words.")).toBe("Plain words.");
    expect(toMessage({})).toBe("Something went wrong. Please try again.");
  });
});
