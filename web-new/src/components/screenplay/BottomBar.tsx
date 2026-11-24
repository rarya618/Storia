import { useState } from "react";
import { ELEMENTS, ElementType } from "../../screenplay/types";
import { modKey } from "../../misc/keys";
import { readPanel, writePanel } from "../../misc/panels";
import StrokeIcon from "./StrokeIcon";

// a touch screen has no shortcuts to teach
const hasKeyboard = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

type BottomBarProps = {
  page?: number,   // the page the caret is on, once it's known
  pages: number,
  words: number,
  element?: ElementType,
  onElementChange: (type: ElementType) => void,
  scene: number,   // 0 before the first scene heading
  scenes: number,
  time: string,
};

// the floating status bar over the page: where the caret is in the script
// (page and scene, each out of the whole), the element it's in, and the
// running time
const BottomBar = ({page, pages, words, element, onElementChange, scene, scenes, time}: BottomBarProps) => {
  const [open, setOpen] = useState(() => readPanel("editorStatusBar", true));
  const toggle = (next: boolean) => {
    setOpen(next);
    writePanel("editorStatusBar", next);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => toggle(true)} className="sw-float flex h-12 w-12 items-center justify-center rounded-xl" aria-label="Show status bar" title="Show status bar">
        <StrokeIcon name="collapseRight" />
      </button>
    );
  }

  const keys = hasKeyboard();
  const total = Math.max(1, pages);
  const wordsText = words.toLocaleString() + (words === 1 ? " word" : " words");

  return (
    <div className="sw-float flex h-12 items-center gap-1 rounded-xl px-2 text-sm sm:gap-2 sm:px-3" style={{color: "var(--ui)"}}>
      <span className="hidden whitespace-nowrap px-2 tabular-nums sm:inline" title={"About " + total + (total === 1 ? " page" : " pages") + ", " + wordsText}>
        {page ? "p. " + page + " of " + total : total + (total === 1 ? " page" : " pages")}
      </span>
      <label htmlFor="element-type" className="sr-only">Element type</label>
      {/* with a keyboard, each element carries its shortcut, so the menu teaches the faster way;
          it sizes to its longest option, which differs between ⌘ and Ctrl. An em
          space keeps the gap, since options collapse ordinary spaces */}
      <select
        id="element-type"
        value={element ?? ""}
        disabled={!element}
        onChange={event => onElementChange(event.target.value as ElementType)}
        className="sw-select"
        title="Element of this line. Tab and Shift+Tab cycle through them"
        style={{backgroundPosition: "calc(100% - 16px) 12px, calc(100% - 12px) 12px, 0 0"}}
      >
        {!element && <option value="">Element</option>}
        {ELEMENTS.map(option => <option key={option.type} value={option.type}>{keys ? option.label + "\u2003" + modKey + option.shortcut : option.label}</option>)}
      </select>
      <span className="whitespace-nowrap px-2 tabular-nums">
        {scene === 0 ? "Opening" : "Scene " + scene}
        {scenes > 0 && <span className="max-sm:hidden"> of {scenes}</span>}
      </span>
      <span className="whitespace-nowrap px-2 tabular-nums" title="Estimated screen time, about a minute a page">{time}</span>
      <button type="button" onClick={() => toggle(false)} className="sw-icon hidden sm:inline-flex" aria-label="Hide status bar" title="Hide status bar">
        <StrokeIcon name="collapseLeft" />
      </button>
    </div>
  );
};

export default BottomBar;
