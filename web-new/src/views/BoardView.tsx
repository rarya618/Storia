import { DragEvent, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { PropsWithSidebar } from "./Home";
import { changeBoard } from "../firebase/database";
import { Board, BoardCard, cardTags, countIn, newCard, placeCard, placeInAct, sectionsIn } from "@storia/core/board/board";
import { useBoardScreen } from "../board/useBoardScreen";
import { randomString } from "@storia/core/misc/randomString";

import Loading from "../components/Loading";
import { BoardSkeleton } from "../components/Skeletons";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import Breadcrumb from "../components/Breadcrumb";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { titleCase } from "@storia/core/screenplay/cast";
import { cardGrid } from "../components/Cards";
import GroupsDialog from "../components/board/GroupsDialog";
import ActsDialog from "../components/board/ActsDialog";
import PropertiesDialog from "../components/board/PropertiesDialog";
import { rememberBoard } from "../misc/seen";
import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";
import ShowRail from "../components/ShowRail";
import Bar from "../components/Bar";

const plural = (count: number, one: string, many: string) => count + " " + (count === 1 ? one : many);

// one card as the board shows it: its number in the story, its title and text,
// and the groups it's filed under. Dragging it onto another card moves it there
const BoardCardTile = ({card, number, board, dragging, target, onOpen, drag}: {
  card: BoardCard, number: number, board: Board, dragging: boolean, target: boolean,
  onOpen: () => void,
  drag: {onDragStart: (event: DragEvent) => void, onDragEnd: () => void, onDragOver: (event: DragEvent) => void, onDragLeave: () => void, onDrop: (event: DragEvent) => void},
}) => {
  const groups = (card.groups ?? []).flatMap(id => board.groups.filter(group => group.id === id));
  // its own properties' values first, then its groups, all as the same quiet tags
  const tags = [...cardTags(board, card), ...groups.map(group => ({id: group.id, label: group.name}))];
  const scenes = card.scenes?.length ?? 0;
  const cast = (card.characters ?? []).map(titleCase);
  const links = [scenes ? scenes + (scenes === 1 ? " scene" : " scenes") : "", cast.slice(0, 3).join(", ") + (cast.length > 3 ? " +" + (cast.length - 3) : "")].filter(Boolean).join(" · ");
  return (
    <li className="flex" draggable {...drag}>
      <button
        type="button"
        onClick={onOpen}
        className={"sw-card sw-board-card px-4 pb-3.5 pt-3.5" + (dragging ? " is-dragging" : "") + (target ? " is-target" : "")}
        aria-label={"Card " + number + ": " + (card.title || "Untitled") + ". Open"}
      >
        <span className="flex items-baseline justify-between gap-3">
          {card.title
            ? <span className="sw-card-name line-clamp-2 text-base">{card.title}</span>
            : !card.text && <span className="sw-card-name text-base text-[color:var(--muted)]">Untitled</span>}
          <span className="ml-auto shrink-0 text-sm tabular-nums text-[color:var(--muted)]">{number}</span>
        </span>
        {card.text && <span className="mt-1.5 line-clamp-6 whitespace-pre-wrap break-words text-sm">{card.text}</span>}
        <span className="min-h-3 flex-1" />
        {links && <span className="mt-1.5 truncate text-sm text-[color:var(--muted)]">{links}</span>}
        {tags.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-1.5">
            {tags.map(tag => <span key={tag.id} className="sw-tag"><span>{tag.label}</span></span>)}
          </span>
        )}
      </button>
    </li>
  );
};

// a project's board: the story laid out on cards, in order, filed in groups
const BoardView = (props: PropsWithSidebar) => {
  const { id } = useParams<string>();
  const projectId = id ?? "";

  const {project, board, setBoard, notFound, loadError, trail} = useBoardScreen(projectId);
  const [saveError, setSaveError] = useState<string>();
  const navigate = useNavigate();

  const [groupId, setGroupId] = useState<string>();
  const [showGroups, setShowGroups] = useState(false);
  const [showActs, setShowActs] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [dragId, setDragId] = useState<string>();
  const [overId, setOverId] = useState<string>();

  // a group that's been removed (here or in another tab) stops being the filter
  useEffect(() => {
    if (groupId && board && !board.groups.some(group => group.id === groupId)) setGroupId(undefined);
  }, [board, groupId]);

  useTitle(project ? "Board · " + project.name : "Board");

  if (!sessionStorage.getItem("Auth Token")) return <Navigate to="/account/login" />;

  if (notFound || loadError) {
    return (
      <LoadError
        notFound={notFound}
        title={notFound ? "Project not found" : undefined}
        message={notFound ? "This project doesn't exist, or it was deleted." : loadError!}
      />
    );
  }

  if (!project || !board) return <Loading skeleton={<BoardSkeleton />} />;

  const apply = (change: (current: Board) => Board) => changeBoard(projectId, change);
  const parts = sectionsIn(board, groupId);
  const hasActs = board.acts.length > 0;
  const boardPath = "/project/" + projectId + "/board";
  // a new card is a blank page at the end of its act, opened at once with the
  // caret in its title; it's shown before the write lands, which follows
  const create = (act?: string) => {
    const id = randomString(12);
    const change = (current: Board) => newCard(current, id, act, groupId ? [groupId] : undefined);
    rememberBoard(projectId, change(board));
    apply(change).catch(error => setSaveError("Couldn't add the card: " + toMessage(error)));
    navigate(boardPath + "/" + id, {state: {fresh: true}});
  };
  const meta = board.cards.length === 0
    ? "Plan the story on cards before you write it, or beside it"
    : [
      plural(board.cards.length, "card", "cards"),
      hasActs ? plural(board.acts.length, "act", "acts") : "",
      board.groups.length ? plural(board.groups.length, "group", "groups") : "",
    ].filter(Boolean).join(" · ");
  const drafts = Object.entries(project.documents ?? {}).map(([docId, summary]) => ({id: docId, name: summary?.name || "Untitled"}));

  // drop a card in an act at a place among its cards (the end if none):
  // shown at once, then written; the subscription confirms it, or the error says why not
  const dropInto = (act: string | undefined, at?: number) => {
    const moving = dragId;
    setDragId(undefined);
    setOverId(undefined);
    if (!moving) return;
    setBoard(placeCard(board, moving, act, at));
    setSaveError(undefined);
    apply(current => placeCard(current, moving, act && current.acts.some(existing => existing.id === act) ? act : undefined, at))
      .catch(error => setSaveError("Couldn't move the card: " + toMessage(error)));
  };

  const dragOver = (target: string) => (event: DragEvent) => {
    if (!dragId || dragId === target) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overId !== target) setOverId(target);
  };
  const dragLeave = (target: string) => () => setOverId(current => current === target ? undefined : current);

  // a dropped card takes the place of the card it lands on, in that card's act
  const dragFor = (card: BoardCard) => ({
    onDragStart: (event: DragEvent) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.title || card.text);
      setDragId(card.id);
    },
    onDragEnd: () => { setDragId(undefined); setOverId(undefined); },
    onDragOver: dragOver(card.id),
    onDragLeave: dragLeave(card.id),
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      if (dragId && dragId !== card.id) dropInto(card.act, placeInAct(board, card.id));
      else { setDragId(undefined); setOverId(undefined); }
    },
  });

  return <>
    {showGroups && <GroupsDialog board={board} apply={apply} onClose={() => setShowGroups(false)} />}
    {showProperties && <PropertiesDialog board={board} apply={apply} onClose={() => setShowProperties(false)} />}
    {showActs && <ActsDialog board={board} drafts={drafts} apply={apply} onClose={() => setShowActs(false)} />}

    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <Bar
        className="sm:pr-6"
        start={!props.isSidebarVisible && <ShowRail label="Show folders" onShow={props.toggleSidebarVisible} />}
        middle={<Breadcrumb trail={trail} current={<span className="truncate font-bold">Board</span>} />}
        end={<>
          {/* the board's setting up, in one menu, so the bar keeps to two buttons
              and the breadcrumb can sit at its centre; tabbing out closes it */}
          <div
            className="relative"
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setShowSetup(false); }}
            onKeyDown={event => { if (event.key === "Escape" && showSetup) { event.stopPropagation(); setShowSetup(false); } }}
          >
            <button type="button" className="sw-button" onClick={() => setShowSetup(!showSetup)} aria-label="Set up the board" aria-expanded={showSetup} aria-controls="board-setup-menu">
              <StrokeIcon name="sliders" size={15} />
              <span className="hidden sm:inline">Set up</span>
            </button>
            {showSetup && (
              <div id="board-setup-menu" className="sw-float absolute right-0 top-12 z-50 w-56 rounded-[10px] py-1.5">
                <button type="button" className="sw-menu-item" onClick={() => { setShowSetup(false); setShowActs(true); }}>Acts…</button>
                <button type="button" className="sw-menu-item" onClick={() => { setShowSetup(false); setShowProperties(true); }}>Properties…</button>
                <button type="button" className="sw-menu-item" onClick={() => { setShowSetup(false); setShowGroups(true); }}>Groups…</button>
              </div>
            )}
          </div>
          <button type="button" className="sw-button" onClick={() => create()} aria-label="New card">
            <StrokeIcon name="plus" size={15} />
            <span className="hidden sm:inline">New card</span>
          </button>
        </>}
      />

      <div className="px-4 pb-16 pt-2 sm:px-8">
        <PageHeading title="Board" meta={meta} />

        {saveError && <p role="alert" className="-mt-6 mb-6 text-sm text-[color:var(--signal)]">{saveError}</p>}

        {board.groups.length > 0 && (
          <div role="group" aria-label="Show cards in" className="mb-8 flex flex-wrap gap-2">
            <button type="button" className="sw-filter" aria-pressed={!groupId} onClick={() => setGroupId(undefined)}>
              All <span className="count">{board.cards.length}</span>
            </button>
            {board.groups.map(group => (
              <button key={group.id} type="button" className="sw-filter" aria-pressed={groupId === group.id} onClick={() => setGroupId(group.id)}>
                <span className="truncate">{group.name}</span> <span className="count">{countIn(board, group.id)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-10">
          {parts.map(({act, cards}) => {
            const key = act?.id ?? "none";
            // with no acts, the board is one unnamed run of cards, as before acts
            const named = hasActs;
            const label = act ? act.name : "No act";
            const target = "end:" + key;
            return (
              <section key={key} aria-label={named ? label : undefined}>
                {named && (
                  <h2 className="sw-section mb-4">
                    <span>{label} <span className="tabular-nums">{cards.length}</span></span>
                  </h2>
                )}
                <ol className={cardGrid} aria-label={(named ? label + ": " : "") + (groupId ? "cards in this group, in story order" : "cards, in story order")}>
                  {cards.map(({card, number}) => (
                    <BoardCardTile
                      key={card.id}
                      card={card}
                      number={number}
                      board={board}
                      dragging={dragId === card.id}
                      target={overId === card.id}
                      onOpen={() => navigate(boardPath + "/" + card.id)}
                      drag={dragFor(card)}
                    />
                  ))}
                  <li
                    className="flex"
                    onDragOver={dragOver(target)}
                    onDragLeave={dragLeave(target)}
                    onDrop={event => { event.preventDefault(); dropInto(act?.id); }}
                  >
                    <button
                      type="button"
                      onClick={() => create(act?.id)}
                      className={"sw-card-new flex-col gap-2 text-base " + (cards.length === 0 && named ? "min-h-[96px]" : "min-h-[156px]") + (overId === target ? " is-target" : "")}
                    >
                      <StrokeIcon name="plus" size={18} />
                      {board.cards.length === 0 ? "Add the first card"
                        : named && act ? "New card in " + act.name
                        : groupId ? "New card in this group" : "New card"}
                    </button>
                  </li>
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  </>;
};

export default BoardView;
