import { useState } from "react";
import { Link } from "react-router-dom";

import { CodeColour, Scene, characterIndex, headingParts, runtime, sceneSummary } from "../../screenplay/structure";
import { CastCode, titleCase } from "./cast";
import ScenePulse from "./ScenePulse";
import StrokeIcon from "./StrokeIcon";

type SceneSidebarProps = {
  scenes: Scene[],
  codes: Map<string, [CodeColour, CodeColour]>,
  currentId?: string,
  onSelect: (sceneId: string) => void,
  onAddScene: () => void,
  onCollapse: () => void,
};

const PULSE_WIDTH = 196;

// the left sidebar: the script's scenes (or its characters), the current one open
const SceneSidebar = ({scenes, codes, currentId, onSelect, onAddScene, onCollapse}: SceneSidebarProps) => {
  const [view, setView] = useState<"scenes" | "characters">("scenes");
  const maxLines = Math.max(...scenes.map(scene => scene.lines), 1);
  const characters = [...characterIndex(scenes).entries()];

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-[color:var(--hair)] bg-[color:var(--tint)]">
      <div className="flex h-11 shrink-0 items-center gap-2 px-[15px]">
        <Link to="/home" className="sw-wordmark mr-auto">Storia</Link>
        <label htmlFor="sidebar-view" className="sr-only">Sidebar view</label>
        <select
          id="sidebar-view"
          value={view}
          onChange={event => setView(event.target.value as "scenes" | "characters")}
          className="sw-select h-[26px] w-[100px] bg-[color:var(--paper)] text-[12px]"
          style={{backgroundPosition: "calc(100% - 16px) 11px, calc(100% - 12px) 11px, 0 0"}}
        >
          <option value="scenes">Scenes</option>
          <option value="characters">Characters</option>
        </select>
        <button type="button" className="sw-icon" onClick={onCollapse} aria-label="Hide scenes" title="Hide scenes">
          <StrokeIcon name="collapseLeft" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[15px] pb-6">
        {view === "scenes" ? <>
          <ol className="flex flex-col gap-[2px]">
            {scenes.map(scene => {
              const isCurrent = scene.id === currentId;
              const parts = headingParts(scene.heading);
              const title = scene.number === 0 ? "Untitled" : parts.location ? titleCase(parts.location) : "Untitled scene";

              if (!isCurrent) {
                return (
                  <li key={scene.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(scene.id)}
                      className="sw-scene grid w-full grid-cols-[16px_1fr_auto] items-center gap-x-[14px] rounded-[2px] px-[10px] pt-[7px] pb-[6px] text-left"
                      aria-label={"Scene " + scene.number + ": " + (scene.heading || title)}
                    >
                      <span className="text-right text-[13px] tabular-nums text-[color:var(--muted)]">{scene.number}</span>
                      <span className="truncate text-[13px]">{title}</span>
                      <span className="text-[11px] tabular-nums text-[color:var(--muted)]">{runtime(scene.lines)}</span>
                      <span />
                      <span className="col-span-2 pt-[3px]"><ScenePulse scene={scene} maxLines={maxLines} width={PULSE_WIDTH - 40} amplitude={4} /></span>
                    </button>
                  </li>
                );
              }

              const summary = sceneSummary(scene);
              const tags = [parts.place && parts.place.replace(/\.?$/, "."), parts.time].filter(Boolean) as string[];
              return (
                <li key={scene.id} aria-current="location" className="rounded-[2px] border border-[color:var(--hair)] bg-[color:var(--paper)] px-[10px] pb-[14px] pt-[12px]">
                  <div className="grid grid-cols-[16px_1fr] gap-x-[14px]">
                    <span className="text-right text-[13px] leading-5 tabular-nums" style={{color: "var(--signal)"}}>{scene.number}</span>
                    <div className="min-w-0">
                      <p className="break-words text-[13px] font-medium leading-5">{title}</p>
                      {summary && <p className="mt-1 line-clamp-3 text-[11.5px] leading-[18px] text-[color:var(--muted)]">{summary}</p>}
                      <div className="mt-3"><ScenePulse scene={scene} maxLines={maxLines} width={PULSE_WIDTH - 40} amplitude={9} current /></div>
                      {scene.cast.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1" aria-label="In this scene">
                          {scene.cast.map(name => (
                            <li key={name} className="flex items-center gap-1.5 text-[11px]"><CastCode code={codes.get(name)} />{titleCase(name)}</li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3 flex items-center gap-[5px]">
                        {tags.map(tag => (
                          <span key={tag} className="rounded-full border border-[color:var(--hair)] px-2 py-px text-[9px] font-medium uppercase tracking-[0.04em] text-[color:var(--muted)]">{tag}</span>
                        ))}
                        <span className="ml-auto text-[11px] tabular-nums text-[color:var(--muted)]">{runtime(scene.lines)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <button type="button" onClick={onAddScene} className="sw-add mt-3 h-10 w-full rounded-[2px] text-[14px] font-medium">
            Add more
          </button>
        </> : (
          characters.length === 0 ? (
            <p className="px-[10px] pt-2 text-[12.5px] leading-5 text-[color:var(--muted)]">Characters appear here once they speak. Press Tab on a new line to add one.</p>
          ) : (
            <ul className="flex flex-col gap-[2px]">
              {characters.map(([name, entry]) => (
                <li key={name} className="flex items-center gap-3 px-[10px] py-[9px]">
                  <CastCode code={codes.get(name)} />
                  <span className="min-w-0 flex-1 truncate text-[13px]">{titleCase(name)}</span>
                  <span className="text-[11px] text-[color:var(--muted)]">{entry.scenes.length} {entry.scenes.length === 1 ? "scene" : "scenes"}</span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};

export default SceneSidebar;
