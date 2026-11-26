import { Revision, revisionStyle } from "../screenplay/revisions";
import { ScriptBlock, prints } from "@storia/core/screenplay/types";
import { Counted } from "./Cards";
import StrokeIcon from "./screenplay/StrokeIcon";

// how many of the script's first blocks a sheet shows before it fades out
const SHEET_BLOCKS = 14;
// how many characters a document names before "+n"
const CAST_SHOWN = 4;

// the document's own first page, in miniature, on its revision's colour. `frame`
// sizes it; `large` sets the script a step bigger and edges the sheet in ink
export const Sheet = ({blocks, large, frame, revision}: {blocks: ScriptBlock[], large?: boolean, frame: string, revision?: Revision}) => {
  const written = blocks.filter(block => block.text.trim() !== "" && prints(block.type)).slice(0, SHEET_BLOCKS);
  return (
    <div style={revisionStyle(revision)} className={"sw-sheet group-hover:shadow-[0_2px_8px_rgb(27_27_31/0.1)] " + frame + (revision ? " !border-[color:var(--edge)]" : " group-hover:border-[color:var(--hair-strong)]") + (large ? " !text-[11.5px] !pl-[34px] !pt-[28px]" : "")} aria-hidden="true">
      {written.length > 0
        ? written.map(block => <p key={block.id} className={block.type}>{block.text}</p>)
        : <p className="empty">Nothing written yet</p>}
    </div>
  );
};

// pages, scenes and runtime as one line of figures, the numbers leading
export const Stats = ({pages, scenes, runtime, className = "text-sm"}: {pages: number, scenes: number, runtime: string, className?: string}) => (
  <p className={className + " text-[color:var(--muted)]"}>
    <span className="whitespace-nowrap"><Counted count={pages} one="page" many="pages" /></span>
    {" · "}
    <span className="whitespace-nowrap"><Counted count={scenes} one="scene" many="scenes" /></span>
    {" · "}
    <span className="whitespace-nowrap"><span className="sw-fig">{runtime}</span> runtime</span>
  </p>
);

// who speaks in it, most lines first, behind the two-person icon
export const CastLine = ({cast, className = "text-sm"}: {cast: string[], className?: string}) => cast.length === 0 ? null : (
  <p className={"flex min-w-0 items-center gap-1 text-[color:var(--muted)] " + className}>
    <span className="shrink-0"><StrokeIcon name="cast" size={15} /></span>
    <span className="truncate">{cast.slice(0, CAST_SHOWN).join(", ") + (cast.length > CAST_SHOWN ? " +" + (cast.length - CAST_SHOWN) : "")}</span>
  </p>
);
