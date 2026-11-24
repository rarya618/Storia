import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Board, BoardCard, countIn, sectionsIn } from "../../board/board";
import { changeBoard } from "../../firebase/database";
import StrokeIcon from "../screenplay/StrokeIcon";
import CardDialog from "./CardDialog";

// one card as the rail shows it, opening the same dialog as on the board screen
const RailCard = ({card, number, board, onOpen}: {card: BoardCard, number: number, board: Board, onOpen: () => void}) => {
  const groups = (card.groups ?? []).flatMap(id => board.groups.filter(group => group.id === id));
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="sw-card w-full px-3 pb-3 pt-2.5 text-left"
        aria-label={"Card " + number + (card.title ? ": " + card.title : "") + ". Edit"}
      >
        <span className="flex items-baseline gap-2">
          {card.title && <span className="sw-card-name line-clamp-2 text-base">{card.title}</span>}
          <span className="ml-auto shrink-0 text-sm tabular-nums text-[color:var(--muted)]">{number}</span>
        </span>
        {card.text && <span className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm">{card.text}</span>}
        {groups.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1">
            {groups.map(group => <span key={group.id} className="sw-tag"><span>{group.name}</span></span>)}
          </span>
        )}
      </button>
    </li>
  );
};

// the board in the editor's project rail, so the plan sits beside the page:
// the cards act by act in story order (filtered by group), each opening the
// same dialog as on the board screen, then New card and a way out to the whole board
const BoardRail = ({projectId, board}: {projectId: string, board?: Board}) => {
  const [groupId, setGroupId] = useState<string>();
  // the card being edited, or, for a new one, the act it starts in
  const [editing, setEditing] = useState<{card?: BoardCard, act?: string}>();

  // a group removed elsewhere stops being the filter
  useEffect(() => {
    if (groupId && board && !board.groups.some(group => group.id === groupId)) setGroupId(undefined);
  }, [board, groupId]);

  if (!board) return <p className="px-4 pt-2 text-sm text-[color:var(--muted)]">Loading the board…</p>;

  const parts = sectionsIn(board, groupId);
  const hasActs = board.acts.length > 0;

  return <>
    {editing && (
      <CardDialog
        board={board}
        card={editing.card}
        startGroup={groupId}
        startAct={editing.act}
        apply={change => changeBoard(projectId, change)}
        onClose={() => setEditing(undefined)}
      />
    )}

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
                <RailCard key={card.id} card={card} number={number} board={board} onOpen={() => setEditing({card})} />
              ))}
            </ol>
            {act && (
              <button type="button" onClick={() => setEditing({act: act.id})} className="sw-card-new h-10 text-sm">
                <StrokeIcon name="plus" size={15} />
                <span className="truncate">New card in {act.name}</span>
              </button>
            )}
          </section>
        );
      })}

      <button type="button" onClick={() => setEditing({})} className="sw-card-new mt-2 h-12 shrink-0 text-sm">
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
