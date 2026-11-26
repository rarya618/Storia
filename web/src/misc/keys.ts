// the modifier the editor's shortcuts use, as this platform writes it
export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
export const modKey = isMac ? "⌘" : "Ctrl+";

// the element shortcuts, ⌥⌘1–0 (Ctrl+Alt+1–0): the browser keeps ⌘1–9 for
// switching tabs and ⌘0 for the zoom, so the page never sees them
export const elementKey = (digit: string) => (isMac ? "⌥⌘" : "Ctrl+Alt+") + digit;
