import { ELEMENTS } from "../../screenplay/types";
import { modKey } from "../../misc/keys";


const shortcuts: [string, string][] = [
  ["Enter", "Next line"],
  ["Enter on an empty line", "Change element"],
  ["Tab / Shift+Tab", "Cycle element"],
  ["Shift+Enter", "Line break"],
  ["Backspace at line start", "Join with line above"],
  ["INT. / EXT.", "Start a scene heading"],
  ["( in dialogue", "Start a parenthetical"],
  ["Esc", "Select the block you're in"],
  ["Shift+↑ / ↓ at an edge", "Select blocks"],
  ["Shift+click", "Select from here to there"],
  [modKey + "A twice", "Select the whole script"],
  [modKey + "D", "Duplicate selected blocks"],
  [modKey + "Z", "Undo deleting, pasting or duplicating"],
];

const Key = ({children}: {children: string}) => (
  <kbd className="whitespace-nowrap rounded border border-[color:var(--hair)] bg-[color:var(--wash)] px-1.5 py-0.5 font-[inherit] text-sm text-[color:var(--ui)]">{children}</kbd>
);

// keyboard reference for the screenplay editor
const ShortcutHelp = () => {
  return (
    <div className="px-5 py-5">
      <p className="sw-label mb-3">Keys</p>
      <dl className="grid grid-cols-1 items-baseline gap-x-5 gap-y-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-2.5">
        {shortcuts.map(([keys, action]) => (
          <div key={keys} className="contents">
            <dt><Key>{keys}</Key></dt>
            <dd className="mb-2 sm:mb-0">{action}</dd>
          </div>
        ))}
      </dl>
      <p className="sw-label mb-3 mt-6">Elements</p>
      <dl className="grid grid-cols-1 items-baseline gap-x-5 gap-y-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-2.5">
        {ELEMENTS.map(element => (
          <div key={element.type} className="contents">
            <dt><Key>{modKey + element.shortcut}</Key></dt>
            <dd className="mb-2 sm:mb-0">{element.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default ShortcutHelp;
