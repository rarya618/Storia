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
// running time. Collapsed, it keeps only the page, so where you are stays in
// view. The rest sits in a grid column that slides between 0fr and 1fr, so it
// opens and shuts smoothly beside the page, which holds its place; while shut
// it's inert, out of reach of the keyboard and screen readers
const BottomBar = ({page, pages, words, element, onElementChange, scene, scenes, time}: BottomBarProps) => {
  const [open, setOpen] = useState(() => readPanel("editorStatusBar", true));
  const toggle = () => {
    setOpen(!open);
    writePanel("editorStatusBar", !open);
  };

  const keys = hasKeyboard();
  const total = Math.max(1, pages);
  const wordsText = words.toLocaleString() + (words === 1 ? " word" : " words");
  // React 18 doesn't know inert, so it's passed as a plain attribute
  const shut = open ? {} : {inert: ""} as Record<string, string>;

  return (
    <div className="sw-float flex h-12 items-center rounded-xl px-2 text-sm sm:px-3" style={{color: "var(--ui)"}}>
      {/* the page: on phones only while collapsed, where it's all the bar shows */}
      <span className={"shrink-0 whitespace-nowrap px-2 tabular-nums" + (open ? " hidden sm:inline" : "")} title={"About " + total + (total === 1 ? " page" : " pages") + ", " + wordsText}>
        {page ? "p. " + page + " of " + total : total + (total === 1 ? " page" : " pages")}
      </span>
      <div className="sw-bar-more" data-open={open || undefined} {...shut}>
        <div>
          <div className="flex items-center gap-1 whitespace-nowrap sm:gap-2 sm:pl-2">
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
          </div>
        </div>
      </div>
      {/* phones keep the bar open (it's their only way to change element), so the
          button shows there only to open a bar that was left shut */}
      <button
        type="button"
        onClick={toggle}
        className={"sw-icon shrink-0 sm:ml-2" + (open ? " hidden sm:inline-flex" : " inline-flex")}
        aria-label={open ? "Hide status bar" : "Show status bar"}
        title={open ? "Hide status bar" : "Show status bar"}
        aria-expanded={open}
      >
        <StrokeIcon name={open ? "collapseLeft" : "collapseRight"} />
      </button>
    </div>
  );
};

export default BottomBar;
