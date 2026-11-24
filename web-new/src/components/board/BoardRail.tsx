import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Board, BoardCard, cardTags, countIn, newCard, sectionsIn } from "../../board/board";
import { changeBoard } from "../../firebase/database";
import StrokeIcon from "../screenplay/StrokeIcon";
import { titleCase } from "../screenplay/cast";
import { randomString } from "../../misc/randomString";
import { toMessage } from "../../misc/errors";
import CardPeek from "./CardPeek";
import ScriptLinks from "./ScriptLinks";
import { ProjectScript } from "../../board/scripts";

// one card as the rail shows it, opening the same dialog as on the board screen
const RailCard = ({card, number, board, onOpen}: {card: BoardCard, number: number, board: Board, onOpen: () => void}) => {
  const groups = (card.groups ?? []).flatMap(id => board.groups.filter(group => group.id === id));
  // its own properties' values first, then its groups, all as the same quiet tags
  const tags = [...cardTags(board, card), ...groups.map(group => ({id: group.id, label: group.name}))];
  const scenes = card.scenes?.length ?? 0;
  const cast = (card.characters ?? []).map(titleCase);
  const links = [scenes ? scenes + (scenes === 1 ? " scene" : " scenes") : "", cast.slice(0, 3).join(", ") + (cast.length > 3 ? " +" + (cast.length - 3) : "")].filter(Boolean).join(" · ");
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="sw-card w-full px-3 pb-3 pt-2.5 text-left"
        aria-label={"Card " + number + ": " + (card.title || "Untitled") + ". Open"}
      >
        <span className="flex items-baseline gap-2">
          {card.title
            ? <span className="sw-card-name line-clamp-2 text-base">{card.title}</span>
            : !card.text && <span className="sw-card-name text-base text-[color:var(--muted)]">Untitled</span>}
          <span className="ml-auto shrink-0 text-sm tabular-nums text-[color:var(--muted)]">{number}</span>
        </span>
        {card.text && <span className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm">{card.text}</span>}
        {links && <span className="mt-1 block truncate text-sm text-[color:var(--muted)]">{links}</span>}
        {tags.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1">
            {tags.map(tag => <span key={tag.id} className="sw-tag"><span>{tag.label}</span></span>)}
          </span>
        )}
      </button>
    </li>
  );
};

// the board in the editor's project rail, so the plan sits beside the page:
// the cards act by act in story order (filtered by group), each opening its
// page over the script, then New card and a way out to the whole board
type BoardRailProps = {
  projectId: string,
  board?: Board,
  scripts?: ProjectScript[],
  onOpenScene?: (doc: string, scene: string) => void,
};

const BoardRail = ({projectId, board, scripts, onOpenScene}: BoardRailProps) => {
  const [groupId, setGroupId] = useState<string>();
  // the card open over the script, and whether it was just made
  const [peek, setPeek] = useState<{id: string, fresh?: boolean}>();
  const [error, setError] = useState<string>();

  // a group removed elsewhere stops being the filter
  useEffect(() => {
    if (groupId && board && !board.groups.some(group => group.id === groupId)) setGroupId(undefined);
  }, [board, groupId]);

  if (!board) return <p className="px-4 pt-2 text-sm text-[color:var(--muted)]">Loading the board…</p>;

  const parts = sectionsIn(board, groupId);
  const hasActs = board.acts.length > 0;
  // a new card is a blank page at the end of its act, opened over the script at once
  const create = (act?: string) => {
    const id = randomString(12);
    setError(undefined);
    changeBoard(projectId, current => newCard(current, id, act, groupId ? [groupId] : undefined))
      .catch(failure => { setError("Couldn't add the card: " + toMessage(failure)); setPeek(undefined); });
    setPeek({id, fresh: true});
  };

  return <>
    {peek && (
      <CardPeek
        projectId={projectId}
        board={board}
        cardId={peek.id}
        startInTitle={peek.fresh}
        extraRows={card => (
          <ScriptLinks
            card={card}
            scripts={scripts}
            write={change => changeBoard(projectId, change)}
            onOpenScene={(doc, scene) => { setPeek(undefined); onOpenScene?.(doc, scene); }}
          />
        )}
        onClose={() => setPeek(undefined)}
      />
    )}
    {error && <p role="alert" className="px-4 pb-2 text-sm text-[color:var(--signal)]">{error}</p>}

    {board.groups.length > 0 && (
      <div role="group" aria-label="Show cards in" className="flex shrink-0 flex-wrap gap-1.5 px-3 pb-3">
        <button type="button" className="sw-filter sw-filter-small" aria-pressed={!groupId} onClick={() => setGroupId(undefined)}>
          All <span className="count">{board.cards.length}</span>
        </button>
        {board.groups.map(group => (
          <button key={group.id} type="button" className="sw-filter sw-filter-small" aria-pressed={groupId === group.id} onClick={() => setGroupId(group.id)}>
            <span className="truncate">{group.name}</span> <span className="count">{countIn(board, group.id)}</span>
          </button>
        ))}
      </div>
    )}

    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-6">
      {parts.map(({act, cards}) => {
        const label = act ? act.name : "No act";
        return (
          <section key={act?.id ?? "none"} aria-label={hasActs ? label : undefined} className="flex flex-col gap-2">
            {hasActs && (
              <p className="sw-label flex items-baseline justify-between px-1 pt-2" aria-hidden="true">
                <span className="truncate">{label}</span>
                <span className="tabular-nums">{cards.length}</span>
              </p>
            )}
            <ol className="flex flex-col gap-2" aria-label={groupId ? "Cards in this group, in story order" : "Cards, in story order"}>
              {cards.map(({card, number}) => (
                <RailCard key={card.id} card={card} number={number} board={board} onOpen={() => setPeek({id: card.id})} />
              ))}
            </ol>
            {act && (
              <button type="button" onClick={() => create(act.id)} className="sw-card-new h-10 text-sm">
                <StrokeIcon name="plus" size={15} />
                <span className="truncate">New card in {act.name}</span>
              </button>
            )}
          </section>
        );
      })}

      <button type="button" onClick={() => create()} className="sw-card-new mt-2 h-12 shrink-0 text-sm">
        <StrokeIcon name="plus" size={16} />
        {board.cards.length === 0 ? "Add the first card" : hasActs ? "New card in no act" : groupId ? "New card in this group" : "New card"}
      </button>
      <Link to={"/project/" + projectId + "/board"} className="sw-row mt-1 flex shrink-0 items-center gap-2 px-2.5 py-2 text-sm font-semibold">
        <StrokeIcon name="board" size={16} />
        Open the whole board
      </Link>
    </div>
  </>;
};

export default BoardRail;
