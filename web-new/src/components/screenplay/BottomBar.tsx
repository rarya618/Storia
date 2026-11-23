import { useState } from "react";
import { ELEMENTS, ElementType } from "../../screenplay/types";
import StrokeIcon from "./StrokeIcon";

type BottomBarProps = {
  words: number,
  element?: ElementType,
  onElementChange: (type: ElementType) => void,
  scene: number,
  time: string,
};

// the floating status bar over the page: words, element, scene and running time
const BottomBar = ({words, element, onElementChange, scene, time}: BottomBarProps) => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="sw-float flex h-11 w-11 items-center justify-center rounded-[10px]" aria-label="Show status bar" title="Show status bar">
        <StrokeIcon name="collapseRight" />
      </button>
    );
  }

  return (
    <div className="sw-float flex h-11 items-center gap-1 rounded-[10px] px-[8px] text-[11.5px] text-[color:var(--muted)] sm:gap-[10px] sm:px-[11px]" style={{color: "var(--ui)"}}>
      <span className="hidden whitespace-nowrap px-2 tabular-nums sm:inline">{words} {words === 1 ? "word" : "words"}</span>
      <label htmlFor="element-type" className="sr-only">Element type</label>
      <select
        id="element-type"
        value={element ?? ""}
        disabled={!element}
        onChange={event => onElementChange(event.target.value as ElementType)}
        className="sw-select h-[28px] w-[148px] text-[12px]"
        style={{backgroundPosition: "calc(100% - 16px) 12px, calc(100% - 12px) 12px, 0 0"}}
      >
        {!element && <option value="">Element</option>}
        {ELEMENTS.map(option => <option key={option.type} value={option.type}>{option.label}</option>)}
      </select>
      <span className="whitespace-nowrap px-2">Scene {scene}</span>
      <span className="whitespace-nowrap px-2 tabular-nums" title="Estimated screen time, about a minute a page">{time}</span>
      <button type="button" onClick={() => setOpen(false)} className="sw-icon hidden sm:inline-flex" aria-label="Hide status bar" title="Hide status bar">
        <StrokeIcon name="collapseLeft" />
      </button>
    </div>
  );
};

export default BottomBar;
