import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Scene, characterIndex, eighths } from "../../screenplay/structure";
import { titleCase } from "./cast";
import StrokeIcon from "./StrokeIcon";

type SceneSidebarProps = {
  scenes: Scene[],
  currentId?: string,
  onSelect: (sceneId: string) => void,
  onAddScene: () => void,
  onCollapse: () => void,
};

type View = "scenes" | "characters";

const headingOf = (scene: Scene) =>
  scene.heading.trim() ? scene.heading.trim().toUpperCase() : scene.number === 0 ? "Opening" : "Untitled scene";

const sceneRow = "sw-row grid w-full grid-cols-[22px_1fr_auto] items-center gap-x-2.5 px-2 py-[5px] text-left";

// the left sidebar: the script's scenes, or its characters and the scenes they're in
const SceneSidebar = ({scenes, currentId, onSelect, onAddScene, onCollapse}: SceneSidebarProps) => {
  const [view, setView] = useState<View>("scenes");
  const [filter, setFilter] = useState("");
  const [openCharacter, setOpenCharacter] = useState<string>();
  const currentRef = useRef<HTMLLIElement>(null);

  const query = filter.trim().toLowerCase();
  const currentScene = scenes.find(scene => scene.id === currentId);
  const byNumber = new Map(scenes.map(scene => [scene.number, scene]));

  // characters, the most present first
  const characters = [...characterIndex(scenes).entries()]
    .sort(([nameA, a], [nameB, b]) => b.scenes.length - a.scenes.length || b.cues - a.cues || nameA.localeCompare(nameB));

  const shownScenes = query
    ? scenes.filter(scene => headingOf(scene).toLowerCase().includes(query) || scene.cast.some(name => name.toLowerCase().includes(query)))
    : scenes;
  const shownCharacters = query ? characters.filter(([name]) => name.toLowerCase().includes(query)) : characters;

  // keep the current scene in view as the writer moves through the script
  useEffect(() => {
    currentRef.current?.scrollIntoView({block: "nearest"});
  }, [currentId, view]);

  const switchView = (next: View) => {
    setView(next);
    setFilter("");
  };

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-r border-[color:var(--hair)] bg-[color:var(--tint)]">
      <div className="flex h-11 shrink-0 items-center gap-2 pl-4 pr-2.5">
        <Link to="/home" className="logo mr-auto text-[20px] leading-none text-[color:var(--accent)] hover:opacity-80">Storia</Link>
        <button type="button" className="sw-icon" onClick={onCollapse} aria-label="Hide scenes" title="Hide scenes">
          <StrokeIcon name="collapseLeft" />
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-2 px-3 pb-2">
        <div className="sw-seg" role="tablist" aria-label="Sidebar view">
          {(["scenes", "characters"] as View[]).map(option => (
            <button key={option} type="button" role="tab" aria-selected={view === option} onClick={() => switchView(option)}>
              {option === "scenes" ? "Scenes" : "Characters"}
            </button>
          ))}
        </div>
        <label className="sw-field">
          <StrokeIcon name="search" size={15} />
          <span className="sr-only">{view === "scenes" ? "Filter scenes" : "Filter characters"}</span>
          <input
            type="search"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            onKeyDown={event => { if (event.key === "Escape" && filter) { event.stopPropagation(); setFilter(""); } }}
            placeholder={view === "scenes" ? "Filter by heading or character" : "Filter characters"}
            className="[&::-webkit-search-cancel-button]:hidden"
          />
          {filter && (
            <button type="button" onClick={() => setFilter("")} className="-mr-1 flex h-5 w-5 items-center justify-center rounded hover:text-[color:var(--ui)]" aria-label="Clear filter">
              <StrokeIcon name="close" size={13} />
            </button>
          )}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
        {view === "scenes" ? <>
          <ol className="flex flex-col gap-px" aria-label="Scenes">
            {shownScenes.map(scene => {
              const isCurrent = scene.id === currentId;
              return (
                <li key={scene.id} ref={isCurrent ? currentRef : undefined}>
                  <button
                    type="button"
                    onClick={() => onSelect(scene.id)}
                    aria-current={isCurrent ? "location" : undefined}
                    title={headingOf(scene)}
                    className={sceneRow}
                  >
                    <span className="sw-row-meta text-right text-[12px]">{scene.number || "–"}</span>
                    <span className={"truncate text-[12.5px] leading-[18px]" + (isCurrent ? " font-medium" : "")}>{headingOf(scene)}</span>
                    <span className="sw-row-meta text-[11px]" aria-label={eighths(scene.lines) + " pages"}>{eighths(scene.lines)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {shownScenes.length === 0 && (
            <p className="px-2 pt-2 text-[12.5px] leading-5 text-[color:var(--muted)]">No scenes match “{filter.trim()}”.</p>
          )}
          {!query && (
            <button type="button" onClick={onAddScene} className="sw-row mt-1 flex w-full items-center gap-2.5 px-2 py-[5px] text-[12.5px] text-[color:var(--muted)] hover:text-[color:var(--ui)]">
              <span className="flex w-[22px] justify-end"><StrokeIcon name="plus" size={15} /></span>
              New scene
            </button>
          )}
        </> : (
          characters.length === 0 ? (
            <p className="px-2 pt-1 text-[12.5px] leading-5 text-[color:var(--muted)]">Characters appear here once they speak. Press Tab on a new line to add one.</p>
          ) : <>
            <ul className="flex flex-col gap-px" aria-label="Characters">
              {shownCharacters.map(([name, entry]) => {
                const isOpen = openCharacter === name;
                const inCurrent = currentScene?.cast.includes(name);
                return (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => setOpenCharacter(isOpen ? undefined : name)}
                      aria-expanded={isOpen}
                      className="sw-row grid w-full grid-cols-[16px_1fr_auto] items-center gap-x-2 px-2 py-[5px] text-left"
                    >
                      <span className="text-[color:var(--muted)]"><StrokeIcon name={isOpen ? "chevronDown" : "chevronRight"} size={15} /></span>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[12.5px] font-medium leading-[18px]">{titleCase(name)}</span>
                        {inCurrent && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" title="In the current scene" aria-label="In the current scene" />}
                      </span>
                      <span className="sw-row-meta text-[11px]">{entry.scenes.length} {entry.scenes.length === 1 ? "scene" : "scenes"}</span>
                    </button>
                    {isOpen && (
                      <div className="mb-1.5 ml-[26px] border-l border-[color:var(--hair)] pl-1.5">
                        <p className="px-2 pb-1 pt-1.5 text-[11px] text-[color:var(--muted)]">
                          {entry.cues} {entry.cues === 1 ? "speech" : "speeches"} · first in scene {entry.scenes[0]}
                        </p>
                        <ol className="flex flex-col gap-px">
                          {entry.scenes.map(number => {
                            const scene = byNumber.get(number);
                            if (!scene) return null;
                            const isCurrent = scene.id === currentId;
                            return (
                              <li key={scene.id}>
                                <button type="button" onClick={() => onSelect(scene.id)} aria-current={isCurrent ? "location" : undefined} title={headingOf(scene)} className={sceneRow}>
                                  <span className="sw-row-meta text-right text-[12px]">{scene.number || "–"}</span>
                                  <span className="truncate text-[12px] leading-[18px]">{headingOf(scene)}</span>
                                  <span />
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {shownCharacters.length === 0 && (
              <p className="px-2 pt-2 text-[12.5px] leading-5 text-[color:var(--muted)]">No characters match “{filter.trim()}”.</p>
            )}
          </>
        )}
      </div>

      <p className="shrink-0 border-t border-[color:var(--hair)] px-4 py-2.5 text-[11.5px] text-[color:var(--muted)]">
        {view === "scenes"
          ? scenes.filter(scene => scene.number > 0).length + " scenes"
          : characters.length + (characters.length === 1 ? " character" : " characters")}
      </p>
    </div>
  );
};

export default SceneSidebar;
