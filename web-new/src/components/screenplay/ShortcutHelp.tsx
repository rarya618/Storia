import { ELEMENTS } from "../../screenplay/types";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

const shortcuts: [string, string][] = [
  ["Enter", "New line, in the element that usually comes next"],
  ["Enter on an empty line", "Switch to another element"],
  ["Tab / Shift+Tab", "Cycle the current line's element"],
  ["Shift+Enter", "Line break within the same element"],
  ["Backspace at line start", "Merge with the line above"],
  ["INT. / EXT.", "Typing either starts a scene heading"],
  ["( in dialogue", "Starts a parenthetical"],
];

// keyboard reference for the screenplay editor
const ShortcutHelp = () => {
  return (
    <div className="px-5 py-4 text-sm">
      <h2 className="text-purple mb-3">Keyboard shortcuts</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        {shortcuts.map(([keys, action]) => (
          <div key={keys} className="contents">
            <dt><kbd className="whitespace-nowrap rounded border border-neutral-300 px-1.5 py-0.5 text-xs text-neutral-700 dark:border-neutral-600 dark:text-neutral-300">{keys}</kbd></dt>
            <dd className="text-neutral-600 dark:text-neutral-400">{action}</dd>
          </div>
        ))}
        {ELEMENTS.map(element => (
          <div key={element.type} className="contents">
            <dt><kbd className="whitespace-nowrap rounded border border-neutral-300 px-1.5 py-0.5 text-xs text-neutral-700 dark:border-neutral-600 dark:text-neutral-300">{mod}+{element.shortcut}</kbd></dt>
            <dd className="text-neutral-600 dark:text-neutral-400">{element.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default ShortcutHelp;
