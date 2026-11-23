import { ScriptBlock } from "../screenplay/types";
import { Counted } from "./Cards";
import StrokeIcon from "./screenplay/StrokeIcon";

// how many of the script's first blocks a sheet shows before it fades out
const SHEET_BLOCKS = 14;
// how many characters a document names before "+n"
const CAST_SHOWN = 4;

// the document's own first page, in miniature. `frame` sizes it; `large` sets
// the script a step bigger and edges the sheet in the selection colour
export const Sheet = ({blocks, large, frame}: {blocks: ScriptBlock[], large?: boolean, frame: string}) => {
  const written = blocks.filter(block => block.text.trim() !== "").slice(0, SHEET_BLOCKS);
  return (
    <div className={"sw-sheet group-hover:border-[color:var(--hair-strong)] group-hover:shadow-[0_1px_3px_rgb(0_0_0/0.07)] " + frame + (large ? " !text-[11.5px] !pl-[34px] !pt-[28px] !border-[color:var(--select-border)]" : "")} aria-hidden="true">
      {written.length > 0
        ? written.map(block => <p key={block.id} className={block.type}>{block.text}</p>)
        : <p className="empty">Nothing written yet</p>}
    </div>
  );
};

// pages, scenes and runtime as one line of figures, the numbers leading
export const Stats = ({pages, scenes, runtime, className = "text-xs"}: {pages: number, scenes: number, runtime: string, className?: string}) => (
  <p className={className + " text-[color:var(--muted)]"}>
    <span className="whitespace-nowrap"><Counted count={pages} one="page" many="pages" /></span>
    {" · "}
    <span className="whitespace-nowrap"><Counted count={scenes} one="scene" many="scenes" /></span>
    {" · "}
    <span className="whitespace-nowrap"><span className="sw-fig">{runtime}</span> runtime</span>
  </p>
);

// who speaks in it, most lines first, behind the two-person icon
export const CastLine = ({cast, className = "text-xs"}: {cast: string[], className?: string}) => cast.length === 0 ? null : (
  <p className={"flex min-w-0 items-center gap-1 text-[color:var(--muted)] " + className}>
    <span className="shrink-0"><StrokeIcon name="cast" size={13} /></span>
    <span className="truncate">{cast.slice(0, CAST_SHOWN).join(", ") + (cast.length > CAST_SHOWN ? " +" + (cast.length - CAST_SHOWN) : "")}</span>
  </p>
);
