import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ListItem, Scene, characterIndex, eighths, headingParts, runtime, sceneSummary, withActs } from "../../screenplay/structure";
import { placeLabel, titleCase } from "./cast";
import StrokeIcon from "./StrokeIcon";

type SceneSidebarProps = {
  scenes: Scene[],
  currentId?: string,
  onSelect: (sceneId: string) => void,
  onAddScene: () => void,
  onCollapse: () => void,
  // the titles of the board's cards about each scene, by the scene's id
  sceneCards?: Map<string, string[]>,
};

type View = "scenes" | "characters";
type Character = [string, {scenes: number[], cues: number}];

const headingOf = (scene: Scene) =>
  scene.heading.trim() ? scene.heading.trim().toUpperCase() : scene.number === 0 ? "Opening" : "Untitled scene";

// number, location, Int/Ext and time in their own column, screen time
const sceneRow = "sw-row grid w-full grid-cols-[18px_minmax(0,1fr)_60px_32px] items-center gap-x-1.5 px-2 py-[5px] text-left";
// the same row under an expanded character, without the length column
// the current scene opens up beneath its row: how it starts, and who is in it
const currentSceneRow = sceneRow + " gap-y-1 pb-[9px]";
const SceneDetail = ({scene, cards = []}: {scene: Scene, cards?: string[]}) => {
  const summary = sceneSummary(scene);
  if (!summary && scene.cast.length === 0 && cards.length === 0) return null;
  return <>
    {/* the scene's own words stay in ink, so they read as the script and not as a label */}
    {summary && <span className="col-span-3 col-start-2 line-clamp-2 text-sm font-normal text-[color:var(--ui)]">{summary}</span>}
    {scene.cast.length > 0 && (
      <span className="sw-row-meta col-span-3 col-start-2 flex min-w-0 items-center gap-1 text-xs">
        <span className="shrink-0" aria-hidden="true"><StrokeIcon name="cast" size={14} /></span>
        <span className="sr-only">With </span>
        <span className="truncate">{scene.cast.map(name => titleCase(name)).join(", ")}</span>
      </span>
    )}
    {cards.length > 0 && (
      <span className="sw-row-meta col-span-3 col-start-2 flex min-w-0 items-center gap-1 text-xs">
        <span className="shrink-0" aria-hidden="true"><StrokeIcon name="board" size={14} /></span>
        <span className="sr-only">On the board as </span>
        <span className="truncate">{cards.join(", ")}</span>
      </span>
    )}
  </>;
};
const nestedSceneRow = "sw-row grid w-full grid-cols-[20px_minmax(0,1fr)_62px] items-center gap-x-2 px-2 py-[5px] text-left";

// long times of day shortened so the column stays narrow
const SHORT_TIMES: Record<string, string> = {"CONTINUOUS": "Cont.", "MOMENTS LATER": "Later", "SAME TIME": "Same", "LATER THAT NIGHT": "Later"};

// "EXT. FERRY DECK - NIGHT" as "Ferry Deck", then "Ext · Night" in a column of its own
const SceneLabel = ({scene, current, onBoard}: {scene: Scene, current?: boolean, onBoard?: boolean}) => {
  const parts = headingParts(scene.heading);
  const meta = [parts.place && placeLabel(parts.place), parts.time && (SHORT_TIMES[parts.time] ?? titleCase(parts.time))].filter(Boolean).join(" · ");
  // a heading with no location yet ("INT.") reads as untitled, its prefix still in the column
  if (!parts.location) return <>
    <span className="truncate text-sm text-[color:var(--muted)]">{scene.number === 0 ? "Opening" : "Untitled scene"}</span>
    <span className="sw-row-meta truncate text-xs">{meta}</span>
  </>;
  return <>
    <span className={"flex min-w-0 items-center gap-1 text-sm" + (current ? " font-bold" : "")}>
      <span className="truncate">{titleCase(parts.location)}</span>
      {/* a scene with a card on the board: a quiet mark, the card named once it's the current scene */}
      {onBoard && <span className="shrink-0 text-[color:var(--muted)]" title="On the board"><StrokeIcon name="board" size={12} /><span className="sr-only"> (on the board)</span></span>}
    </span>
    <span className="sw-row-meta truncate text-xs">{meta}</span>
  </>;
};

// the left sidebar: the script's scenes, or its characters and the scenes they're in
const SceneSidebarView = ({scenes, currentId, onSelect, onAddScene, onCollapse, sceneCards}: SceneSidebarProps) => {
  const [view, setView] = useState<View>("scenes");
  const [filter, setFilter] = useState("");
  const [openCharacter, setOpenCharacter] = useState<string>();
  const currentRef = useRef<HTMLLIElement>(null);

  const query = filter.trim().toLowerCase();
  const currentScene = scenes.find(scene => scene.id === currentId);
  const byNumber = new Map(scenes.map(scene => [scene.number, scene]));

  // characters, the most present first
  const characters: Character[] = [...characterIndex(scenes).entries()]
    .sort(([nameA, a], [nameB, b]) => b.scenes.length - a.scenes.length || b.cues - a.cues || nameA.localeCompare(nameB));

  const shownScenes = query
    ? scenes.filter(scene => headingOf(scene).toLowerCase().includes(query) || scene.cast.some(name => name.toLowerCase().includes(query)))
    : scenes;
  // a filtered list is a search result, so it leaves the acts out
  const listed: ListItem[] = query ? shownScenes.map(scene => ({kind: "scene", scene})) : withActs(scenes);
  const shownCharacters = query ? characters.filter(([name]) => name.toLowerCase().includes(query)) : characters;
  // without a filter, the people in the current scene come first, in their own group
  const here = !query && currentScene && currentScene.cast.length > 0 ? shownCharacters.filter(([name]) => currentScene.cast.includes(name)) : [];
  const others = here.length > 0 ? shownCharacters.filter(([name]) => !currentScene!.cast.includes(name)) : shownCharacters;

  // keep the current scene in view as the writer moves through the script
  useEffect(() => {
    currentRef.current?.scrollIntoView({block: "nearest"});
  }, [currentId, view]);

  const switchView = (next: View) => {
    setView(next);
    setFilter("");
  };

  const characterRow = ([name, entry]: Character) => {
    const isOpen = openCharacter === name;
    return (
      <li key={name}>
        <button
          type="button"
          onClick={() => setOpenCharacter(isOpen ? undefined : name)}
          aria-expanded={isOpen}
          className="sw-row grid w-full grid-cols-[minmax(0,1fr)_14px] items-center gap-x-2 px-2 py-1.5 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{titleCase(name)}</span>
            <span className="sw-row-meta block truncate text-xs">
              {entry.scenes.length} {entry.scenes.length === 1 ? "scene" : "scenes"} · {entry.cues} {entry.cues === 1 ? "speech" : "speeches"} · from scene {entry.scenes[0]}
            </span>
          </span>
          <span className="text-[color:var(--muted)]"><StrokeIcon name={isOpen ? "chevronDown" : "chevronRight"} size={16} /></span>
        </button>
        {isOpen && (
          <ol className="mb-2 ml-3 flex flex-col gap-px border-l border-[color:var(--hair)] pl-1.5 pt-0.5" aria-label={"Scenes with " + titleCase(name)}>
            {entry.scenes.map(number => {
              const scene = byNumber.get(number);
              if (!scene) return null;
              const isCurrent = scene.id === currentId;
              return (
                <li key={scene.id}>
                  <button type="button" onClick={() => onSelect(scene.id)} aria-current={isCurrent ? "location" : undefined} title={headingOf(scene)} className={nestedSceneRow}>
                    <span className="sw-row-meta text-right text-xs">{scene.number}</span>
                    <SceneLabel scene={scene} current={isCurrent} />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </li>
    );
  };

  return (
    <div className="sw-rail flex h-full w-[280px] shrink-0 flex-col border-r">
      {/* the toggle first, then the wordmark: both where the bar keeps them while the rail is hidden */}
      <div className="flex h-16 shrink-0 items-center gap-2 pl-[14px] pr-4">
        <button type="button" className="sw-icon shrink-0" onClick={onCollapse} aria-label="Hide scenes" title="Hide scenes">
          <StrokeIcon name="collapseLeft" />
        </button>
        <Link to="/home" className="logo text-xl leading-none hover:opacity-80">Storia</Link>
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
          <StrokeIcon name="search" size={16} />
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
            {listed.map((item, index) => {
              if (item.kind === "act") return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    title={item.name.toUpperCase()}
                    className={"sw-row grid w-full grid-cols-[minmax(0,1fr)_32px] items-center gap-x-1.5 px-2 py-[5px] text-left" + (index > 0 ? " mt-3" : "")}
                  >
                    <span className="sw-label truncate">{titleCase(item.name) || "Act break"}</span>
                    <span className="sw-row-meta text-right text-xs" aria-label={"About " + runtime(item.lines) + " of screen time"}>{runtime(item.lines)}</span>
                  </button>
                </li>
              );
              const {scene} = item;
              const isCurrent = scene.id === currentId;
              return (
                <li key={scene.id} ref={isCurrent ? currentRef : undefined}>
                  <button
                    type="button"
                    onClick={() => onSelect(scene.id)}
                    aria-current={isCurrent ? "location" : undefined}
                    title={headingOf(scene)}
                    className={isCurrent ? currentSceneRow : sceneRow}
                  >
                    <span className="sw-row-meta text-right text-xs">{scene.number}</span>
                    <SceneLabel scene={scene} current={isCurrent} onBoard={!isCurrent && (sceneCards?.get(scene.id)?.length ?? 0) > 0} />
                    <span className="sw-row-meta text-right text-xs" aria-label={"About " + runtime(scene.lines) + " of screen time, " + eighths(scene.lines) + " pages"}>{runtime(scene.lines)}</span>
                    {isCurrent && <SceneDetail scene={scene} cards={sceneCards?.get(scene.id)} />}
                  </button>
                </li>
              );
            })}
          </ol>
          {shownScenes.length === 0 && (
            <p className="px-2 pt-2 text-sm text-[color:var(--muted)]">No scenes match “{filter.trim()}”.</p>
          )}
          {!query && (
            <button type="button" onClick={onAddScene} className="sw-row mt-1 flex w-full items-center gap-2 px-2 py-[5px] text-sm text-[color:var(--muted)] hover:text-[color:var(--ui)]">
              <span className="flex w-[18px] justify-end"><StrokeIcon name="plus" size={16} /></span>
              New scene
            </button>
          )}
        </> : (
          characters.length === 0 ? (
            <p className="px-2 pt-1 text-sm text-[color:var(--muted)]">Characters appear here once they speak. Press Tab on a new line to add one.</p>
          ) : <>
            {here.length > 0 && <>
              <h3 className="sw-label px-2 pb-1 pt-1">In scene {currentScene!.number}</h3>
              <ul className="flex flex-col gap-px" aria-label={"In scene " + currentScene!.number}>{here.map(characterRow)}</ul>
              {others.length > 0 && <h3 className="sw-label px-2 pb-1 pt-4">Everyone else</h3>}
            </>}
            {others.length > 0 && <ul className="flex flex-col gap-px" aria-label={here.length > 0 ? "Everyone else" : "Characters"}>{others.map(characterRow)}</ul>}
            {shownCharacters.length === 0 && (
              <p className="px-2 pt-2 text-sm text-[color:var(--muted)]">No characters match “{filter.trim()}”.</p>
            )}
          </>
        )}
      </div>

      <p className="shrink-0 border-t border-[color:var(--hair)] px-4 py-3 text-sm text-[color:var(--muted)]">
        {view === "scenes"
          ? scenes.filter(scene => scene.number > 0).length + " scenes"
          : characters.length + (characters.length === 1 ? " character" : " characters")}
      </p>
    </div>
  );
};

// memoised: the editor redraws on every keystroke, this only when its input changes
const SceneSidebar = memo(SceneSidebarView);
export default SceneSidebar;
