import { useRef } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { PropsWithSidebar } from "./Home";
import { useBoardScreen } from "../board/useBoardScreen";
import Loading from "../components/Loading";
import { BoardSkeleton } from "../components/Skeletons";
import LoadError from "../components/LoadError";
import Breadcrumb from "../components/Breadcrumb";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import CardDocument from "../components/board/CardDocument";
import ScriptLinks from "../components/board/ScriptLinks";
import { useProjectScripts } from "../board/scripts";
import { changeBoard } from "../firebase/database";
import { useTitle } from "../misc/title";
import "../screenplay/world.css";
import ShowRail from "../components/ShowRail";

// one card as a page of its own, under its project's board, with the cards
// either side of it a click away
const CardView = (props: PropsWithSidebar) => {
  const { id, cardId } = useParams<string>();
  const projectId = id ?? "";
  const {project, board, notFound, loadError, trail} = useBoardScreen(projectId);
  const navigate = useNavigate();
  // a card just made from New card opens with the caret in its title
  const fresh = Boolean((useLocation().state as {fresh?: boolean} | null)?.fresh);
  // set while this page deletes its own card, so it isn't shown as missing on the way out
  const leaving = useRef(false);

  const scripts = useProjectScripts(project?.documents);
  const index = board?.cards.findIndex(card => card.id === cardId) ?? -1;
  const card = index === -1 ? undefined : board!.cards[index];
  useTitle(card ? (card.title || "Untitled card") : "Card");

  if (!sessionStorage.getItem("Auth Token")) return <Navigate to="/" />;

  if (notFound || loadError) {
    return (
      <LoadError
        notFound={notFound}
        title={notFound ? "Project not found" : undefined}
        message={notFound ? "This project doesn't exist, or it was deleted." : loadError!}
      />
    );
  }

  if (!project || !board || (!card && leaving.current)) return <Loading skeleton={<BoardSkeleton />} />;

  const boardPath = "/project/" + projectId + "/board";

  if (!card) {
    return (
      <div role="alert" className="sw sw-rev sw-enter m-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
        <p className="text-lg font-bold">Card not found</p>
        <p className="mb-5 mt-1 text-sm text-[color:var(--muted)]">This card doesn't exist, or it was deleted.</p>
        <Link to={boardPath} className="sw-button sw-button-soft">Back to the board</Link>
      </div>
    );
  }

  const before = board.cards[index - 1];
  const after = board.cards[index + 1];
  const cardPath = (other: {id: string}) => boardPath + "/" + other.id;

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <header className="flex h-16 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
        {!props.isSidebarVisible && (
          <ShowRail label="Show folders" onShow={props.toggleSidebarVisible} />
        )}
        <Breadcrumb trail={[...trail, {label: "Board", to: boardPath}]} current={<span className="truncate font-bold">{card.title || "Untitled"}</span>} />
        <div className="flex-1" />
        <Link to={before ? cardPath(before) : "#"} aria-disabled={!before} tabIndex={before ? undefined : -1} className={"sw-icon" + (before ? "" : " pointer-events-none opacity-35")} aria-label="Previous card" title="Previous card">
          <StrokeIcon name="back" size={18} />
        </Link>
        <Link to={after ? cardPath(after) : "#"} aria-disabled={!after} tabIndex={after ? undefined : -1} className={"sw-icon" + (after ? "" : " pointer-events-none opacity-35")} aria-label="Next card" title="Next card">
          <StrokeIcon name="chevronRight" size={18} />
        </Link>
      </header>

      <div className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-4 sm:px-10">
        <CardDocument
          key={card.id}
          projectId={projectId}
          board={board}
          card={card}
          startInTitle={fresh && !card.title}
          extraRows={
            <ScriptLinks
              card={card}
              scripts={scripts}
              write={change => changeBoard(projectId, change)}
              onOpenScene={(doc, scene) => navigate("/document/" + doc, {state: {scene}})}
            />
          }
          onDeleted={() => { leaving.current = true; navigate(boardPath, {replace: true}); }}
        />
      </div>
    </main>
  );
};

export default CardView;
