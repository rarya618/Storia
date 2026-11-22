import { ELEMENTS } from "../../screenplay/types";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

const shortcuts: [string, string][] = [
  ["Enter", "Next line"],
  ["Enter on an empty line", "Change element"],
  ["Tab / Shift+Tab", "Cycle element"],
  ["Shift+Enter", "Line break"],
  ["Backspace at line start", "Join with line above"],
  ["INT. / EXT.", "Start a scene heading"],
  ["( in dialogue", "Start a parenthetical"],
];

const Key = ({children}: {children: string}) => (
  <kbd className="whitespace-nowrap border border-[color:var(--hair)] px-1.5 py-0.5 font-[Courier_Prime,monospace] text-[12px]">{children}</kbd>
);

// keyboard reference for the screenplay editor
const ShortcutHelp = () => {
  return (
    <div className="px-5 py-5">
      <p className="sw-caps sw-ruled mb-4">Keys</p>
      <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2.5 text-[14px]">
        {shortcuts.map(([keys, action]) => (
          <div key={keys} className="contents">
            <dt><Key>{keys}</Key></dt>
            <dd>{action}</dd>
          </div>
        ))}
      </dl>
      <p className="sw-caps sw-ruled mb-4 mt-6">Elements</p>
      <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2.5 text-[14px]">
        {ELEMENTS.map(element => (
          <div key={element.type} className="contents">
            <dt><Key>{mod + "+" + element.shortcut}</Key></dt>
            <dd>{element.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default ShortcutHelp;
