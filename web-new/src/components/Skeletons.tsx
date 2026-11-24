import { CSSProperties, ReactNode } from "react";
import { cardGrid } from "./Cards";

// Each screen's shape while its content loads, so a screen change lands on its
// own frame rather than a blank one. Bones are Wash shapes (Rail Hover on the
// rail) that share one slow sweep (.sw-bone in world.css); the real content
// replaces them in place, with the screen's usual settle.

const Bone = ({className = "", style}: {className?: string, style?: CSSProperties}) =>
  <span className={"sw-bone " + className} style={style} aria-hidden="true" />;

// a script's rhythm in bones, laid out as the page is (each indent a share of the
// 60-character line): a heading, action, then a cue over its dialogue, twice
const SCRIPT: {left: string, width: string, gap: string}[] = [
  {left: "0", width: "52%", gap: "0"},          // INT. KITCHEN - NIGHT
  {left: "0", width: "100%", gap: "1.2em"},     // action
  {left: "0", width: "88%", gap: "0.35em"},
  {left: "0", width: "64%", gap: "0.35em"},
  {left: "36.667%", width: "16%", gap: "1.2em"}, // MAYA
  {left: "16.667%", width: "58.333%", gap: "0.35em"},
  {left: "16.667%", width: "41%", gap: "0.35em"},
  {left: "0", width: "96%", gap: "1.2em"},      // action
  {left: "0", width: "72%", gap: "0.35em"},
  {left: "36.667%", width: "13%", gap: "1.2em"}, // TOM
  {left: "16.667%", width: "52%", gap: "0.35em"},
];
const ScriptBones = ({lines = SCRIPT.length}: {lines?: number}) => (
  <div aria-hidden="true">
    {SCRIPT.slice(0, lines).map((line, index) => (
      <Bone key={index} className="block !rounded-[3px]" style={{height: "0.8em", marginLeft: line.left, width: line.width, marginTop: line.gap}} />
    ))}
  </div>
);

// the 64px bar: the trail to the page, and a button's place at the right
const BarBones = ({button = true}: {button?: boolean}) => (
  <div className="flex h-16 shrink-0 items-center gap-3 px-4 sm:pr-6">
    <Bone className="h-4 w-20" />
    <Bone className="h-4 w-32" />
    <div className="flex-1" />
    {button && <Bone className="h-10 w-10 !rounded-[8px] sm:w-32" />}
  </div>
);

const HeadingBones = ({wide = "w-64"}: {wide?: string}) => (
  <div className="mb-10">
    <Bone className={"block h-9 max-w-full sm:h-10 " + wide} />
    <Bone className="mt-3 block h-4 w-40" />
  </div>
);

const SectionBone = () => <Bone className="mb-5 block h-5 w-28" />;

// a document's miniature page, blank but for its script's rhythm
const SheetBones = ({large}: {large?: boolean}) => (
  <div className={large ? "w-full sm:w-[340px]" : "w-[calc(50%-8px)] sm:w-[236px]"}>
    <div className={"sw-sheet-bone aspect-[17/22] sm:aspect-auto " + (large ? "sm:h-[360px]" : "sm:h-[300px]")}>
      <div style={{fontSize: large ? 11.5 : 10}}><ScriptBones lines={large ? 11 : 9} /></div>
    </div>
    <Bone className="mt-4 block h-5 w-3/4" />
    <Bone className="mt-3 block h-4 w-1/2" />
  </div>
);

const CardBones = () => (
  <li className="flex">
    <div className="sw-card-bone flex min-h-[120px] flex-1 flex-col px-4 pb-3.5 pt-5">
      <Bone className="block h-5 w-3/5" />
      <Bone className="mt-2 block h-4 w-4/5" />
      <div className="flex-1" />
      <Bone className="mt-4 block h-4 w-2/5" />
    </div>
  </li>
);

const Main = ({children}: {children: ReactNode}) => (
  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
);

// home: the greeting, where you left off, then the projects
export const HomeSkeleton = () => (
  <Main>
    <BarBones />
    <div className="px-4 pt-2 sm:px-8">
      <HeadingBones wide="w-80" />
      <SectionBone />
      <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
        <div className="sw-sheet-bone h-[260px] w-full shrink-0 sm:h-[340px] sm:w-[300px]">
          <div style={{fontSize: 11.5}}><ScriptBones /></div>
        </div>
        <div className="min-w-0 flex-1 sm:pt-1">
          <Bone className="block h-8 w-2/3 max-w-sm" />
          <Bone className="mt-3 block h-4 w-1/2 max-w-xs" />
          <Bone className="mt-6 block h-4 w-3/5 max-w-sm" />
          <Bone className="mt-6 block h-12 w-44 !rounded-[8px]" />
        </div>
      </div>
    </div>
  </Main>
);

// a folder: its heading, then its projects as cards
export const FolderSkeleton = () => (
  <Main>
    <BarBones />
    <div className="px-4 pt-2 sm:px-8">
      <HeadingBones />
      <SectionBone />
      <ul className={cardGrid} aria-hidden="true"><CardBones /><CardBones /><CardBones /></ul>
    </div>
  </Main>
);

// a project: its heading, then the shelf of pages, the latest larger
export const ProjectSkeleton = () => (
  <Main>
    <BarBones />
    <div className="px-4 pt-2 sm:px-8">
      <HeadingBones />
      <SectionBone />
      <div className="flex flex-wrap items-start gap-x-4 gap-y-10 sm:gap-x-8">
        <SheetBones large /><SheetBones /><SheetBones />
      </div>
    </div>
  </Main>
);

// a board: its heading, then its cards
export const BoardSkeleton = () => (
  <Main>
    <BarBones />
    <div className="px-4 pt-2 sm:px-8">
      <HeadingBones wide="w-40" />
      <ul className={cardGrid} aria-hidden="true"><CardBones /><CardBones /><CardBones /><CardBones /></ul>
    </div>
  </Main>
);

const RailRows = ({count, nested}: {count: number, nested?: boolean}) => (
  <div className="flex flex-col gap-2.5 px-4" aria-hidden="true">
    {Array.from({length: count}, (_, index) => (
      <div key={index} className="flex items-center gap-2">
        {nested && <Bone className="h-3 w-3 shrink-0" />}
        <Bone className="h-4" style={{width: [72, 58, 80, 64, 50, 76, 60][index % 7] + "%"}} />
      </div>
    ))}
  </div>
);

// the editor: its rails as they'll open, the bar, and the page on the desk
export const EditorSkeleton = ({left, right}: {left: boolean, right: boolean}) => (
  <div className="flex h-full w-full">
    {left && (
      <div className="sw-rail flex h-full w-[280px] shrink-0 flex-col border-r max-[899px]:hidden">
        <div className="flex h-16 shrink-0 items-center pl-4"><span className="logo text-2xl leading-none">Storia</span></div>
        <div className="flex flex-col gap-2 px-3 pb-4">
          <Bone className="block h-[38px] !rounded-[10px]" />
          <Bone className="block h-9 !rounded-[8px]" />
        </div>
        <RailRows count={7} nested />
      </div>
    )}
    <div className="flex min-w-0 flex-1 flex-col">
      <BarBones button={false} />
      <div className="sw-desk min-h-0 flex-1 overflow-hidden px-4">
        <div className="pt-4">
          <div className="sp-page mx-auto"><ScriptBones /></div>
        </div>
      </div>
    </div>
    {right && (
      <div className="sw-rail flex h-full w-[300px] shrink-0 flex-col border-l max-[899px]:hidden">
        <div className="flex h-16 shrink-0 items-center px-4"><Bone className="h-5 w-32" /></div>
        <div className="flex flex-col gap-2 px-3">
          {[0, 1, 2].map(index => <div key={index} className="sw-card-bone h-[76px]" />)}
        </div>
      </div>
    )}
  </div>
);
