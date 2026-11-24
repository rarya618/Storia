import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Board, BoardCard, cardsIn, countIn } from "../../board/board";
import { changeBoard } from "../../firebase/database";
import StrokeIcon from "../screenplay/StrokeIcon";
import CardDialog from "./CardDialog";

// the board in the editor's project rail, so the plan sits beside the page:
// the cards in story order (filtered by group), each opening the same dialog
// as on the board screen, then New card and a way out to the whole board
const BoardRail = ({projectId, board}: {projectId: string, board?: Board}) => {
  const [groupId, setGroupId] = useState<string>();
  const [editing, setEditing] = useState<BoardCard | "new">();

  // a group removed elsewhere stops being the filter
  useEffect(() => {
    if (groupId && board && !board.groups.some(group => group.id === groupId)) setGroupId(undefined);
  }, [board, groupId]);

  if (!board) return <p className="px-4 pt-2 text-sm text-[color:var(--muted)]">Loading the board…</p>;

  const shown = cardsIn(board, groupId);

  return <>
    {editing && (
      <CardDialog
        board={board}
        card={editing === "new" ? undefined : editing}
        startGroup={groupId}
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

    <ol className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-6" aria-label={groupId ? "Cards in this group, in story order" : "Cards, in story order"}>
      {shown.map(({card, number}) => {
        const groups = (card.groups ?? []).flatMap(id => board.groups.filter(group => group.id === id));
        return (
          <li key={card.id}>
            <button
              type="button"
              onClick={() => setEditing(card)}
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
      })}
      <li>
        <button type="button" onClick={() => setEditing("new")} className="sw-card-new h-12 text-sm">
          <StrokeIcon name="plus" size={16} />
          {board.cards.length === 0 ? "Add the first card" : groupId ? "New card in this group" : "New card"}
        </button>
      </li>
      <li className="pt-1">
        <Link to={"/project/" + projectId + "/board"} className="sw-row flex items-center gap-2 px-2.5 py-2 text-sm font-semibold">
          <StrokeIcon name="board" size={16} />
          Open the whole board
        </Link>
      </li>
    </ol>
  </>;
};

export default BoardRail;
