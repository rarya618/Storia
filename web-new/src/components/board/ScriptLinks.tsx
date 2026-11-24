import { Board, BoardCard, toggleCharacter, toggleScene } from "../../board/board";
import { ProjectScript, sceneName } from "../../board/scripts";
import { titleCase } from "../screenplay/cast";
import StrokeIcon from "../screenplay/StrokeIcon";
import { PropRow } from "./CardDocument";

type ScriptLinksProps = {
  card: BoardCard,
  // the project's drafts, oldest first; undefined while they load
  scripts?: ProjectScript[],
  write: (change: (board: Board) => Board) => Promise<void>,
  onOpenScene: (doc: string, scene: string) => void,
};

// a chip that opens what it names, with its own remove button beside it
const Chip = ({label, title, onOpen, onRemove, removeLabel, faded}: {
  label: string, title?: string, onOpen?: () => void, onRemove: () => void, removeLabel: string, faded?: boolean,
}) => (
  <span className={"sw-chip" + (faded ? " is-faded" : "")}>
    {onOpen
      ? <button type="button" className="sw-chip-open" onClick={onOpen} title={title}>{label}</button>
      : <span className="sw-chip-open" title={title}>{label}</span>}
    <button type="button" className="sw-chip-remove" onClick={onRemove} aria-label={removeLabel} title="Remove">
      <StrokeIcon name="close" size={12} />
    </button>
  </span>
);

// the card's links into the script: the scenes it's about, in any of the
// project's drafts, each opening the editor at that scene, and the characters
// it's about, from the drafts' casts
const ScriptLinks = ({card, scripts, write, onOpenScene}: ScriptLinksProps) => {
  const several = (scripts?.length ?? 0) > 1;
  const linked = card.scenes ?? [];
  const characters = card.characters ?? [];
  const cast = [...new Set((scripts ?? []).flatMap(script => script.cast))].filter(name => !characters.includes(name)).sort();
  const scenesTo = (scripts ?? []).map(script => ({
    script,
    scenes: script.scenes.filter(scene => (scene.number > 0 || scene.blocks.some(block => block.text.trim()))
      && !linked.some(link => link.doc === script.id && link.scene === scene.id)),
  })).filter(({scenes}) => scenes.length > 0);
  const save = (change: (board: Board) => Board) => { write(change).catch(() => {}); };

  return <>
    <PropRow label="Scenes" htmlFor={"card-scene-" + card.id}>
      <div className="flex flex-wrap items-center gap-1.5">
        {linked.map(link => {
          const script = scripts?.find(other => other.id === link.doc);
          const scene = script?.scenes.find(other => other.id === link.scene);
          const unlink = () => save(board => toggleScene(board, card.id, link));
          if (!scripts) return <span key={link.doc + link.scene} className="sw-chip is-faded"><span className="sw-chip-open">Loading…</span></span>;
          if (!script || !scene) return (
            <Chip key={link.doc + link.scene} label="No longer in the script" faded onRemove={unlink} removeLabel="Remove this missing scene" />
          );
          const label = sceneName(scene) + (several ? " (" + script.name + ")" : "");
          return (
            <Chip
              key={link.doc + link.scene}
              label={label}
              title={(scene.heading.trim().toUpperCase() || label) + " — open in the script"}
              onOpen={() => onOpenScene(link.doc, link.scene)}
              onRemove={unlink}
              removeLabel={"Unlink " + label}
            />
          );
        })}
        {scripts === undefined ? (
          linked.length === 0 && <span className="text-[color:var(--muted)]">Loading the drafts…</span>
        ) : scenesTo.length === 0 ? (
          linked.length === 0 && <span className="text-[color:var(--muted)]">{scripts.length ? "No scenes in the drafts yet" : "No drafts in this project yet"}</span>
        ) : (
          <select
            id={"card-scene-" + card.id}
            className="sw-prop-select sw-prop-pick"
            value=""
            aria-label="Link a scene"
            onChange={event => {
              const [doc, scene] = event.target.value.split("|");
              if (doc && scene) save(board => toggleScene(board, card.id, {doc, scene}));
            }}
          >
            <option value="">+ Link a scene</option>
            {scenesTo.map(({script, scenes}) => several ? (
              <optgroup key={script.id} label={script.name}>
                {scenes.map(scene => <option key={scene.id} value={script.id + "|" + scene.id}>{sceneName(scene)}</option>)}
              </optgroup>
            ) : scenes.map(scene => <option key={scene.id} value={script.id + "|" + scene.id}>{sceneName(scene)}</option>))}
          </select>
        )}
      </div>
    </PropRow>

    <PropRow label="Characters" htmlFor={"card-character-" + card.id}>
      <div className="flex flex-wrap items-center gap-1.5">
        {characters.map(name => (
          <Chip key={name} label={titleCase(name)} onRemove={() => save(board => toggleCharacter(board, card.id, name))} removeLabel={"Remove " + titleCase(name)} />
        ))}
        {cast.length > 0 ? (
          <select
            id={"card-character-" + card.id}
            className="sw-prop-select sw-prop-pick"
            value=""
            aria-label="Add a character"
            onChange={event => { const name = event.target.value; if (name) save(board => toggleCharacter(board, card.id, name)); }}
          >
            <option value="">+ Add a character</option>
            {cast.map(name => <option key={name} value={name}>{titleCase(name)}</option>)}
          </select>
        ) : characters.length === 0 && (
          <span className="text-[color:var(--muted)]">{scripts === undefined ? "Loading the drafts…" : "Characters appear here once they speak in a draft"}</span>
        )}
      </div>
    </PropRow>
  </>;
};

export default ScriptLinks;
