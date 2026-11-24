import { ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { Board, BoardCard } from "../../board/board";
import { useModal } from "../../misc/modal";
import StrokeIcon from "../screenplay/StrokeIcon";
import CardDocument from "./CardDocument";

type CardPeekProps = {
  projectId: string,
  board: Board,
  cardId: string,
  startInTitle?: boolean,
  extraRows?: (card: BoardCard) => ReactNode,
  onClose: () => void,
};

// a card's page opened over the editor from the right, Notion's side peek, so
// the script stays where it was; Escape or the scrim closes it
const CardPeek = ({projectId, board, cardId, startInTitle, extraRows, onClose}: CardPeekProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModal(dialogRef, onClose);
  const card = board.cards.find(other => other.id === cardId);

  return (
    <dialog
      ref={dialogRef}
      aria-label={card ? (card.title || "Untitled card") : "Card"}
      className="sw sw-rev sw-dialog sw-peek"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="flex h-14 shrink-0 items-center gap-1 px-3">
        <button type="button" className="sw-icon" onClick={onClose} aria-label="Close card" title="Close">
          <StrokeIcon name="collapseRight" />
        </button>
        <Link to={"/project/" + projectId + "/board/" + cardId} className="sw-row flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-semibold">
          Open as page
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-16 pt-2 sm:px-10">
        {card ? (
          <CardDocument
            key={card.id}
            projectId={projectId}
            board={board}
            card={card}
            startInTitle={startInTitle}
            extraRows={extraRows?.(card)}
            onDeleted={onClose}
          />
        ) : (
          <p className="pt-8 text-center text-sm text-[color:var(--muted)]">This card was deleted.</p>
        )}
      </div>
    </dialog>
  );
};

export default CardPeek;
