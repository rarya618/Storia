import { DragEvent, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { onValue } from "firebase/database";

import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "../datatypes/Block";
import { changeBoard, getBoardRef, getFolderRef, getProjectRef } from "../firebase/database";
import { Board, BoardCard, countIn, placeCard, placeInAct, readBoard, sectionsIn } from "../board/board";

import Loading from "../components/Loading";
import { BoardSkeleton } from "../components/Skeletons";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import Breadcrumb from "../components/Breadcrumb";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { cardGrid } from "../components/Cards";
import CardDialog from "../components/board/CardDialog";
import GroupsDialog from "../components/board/GroupsDialog";
import ActsDialog from "../components/board/ActsDialog";
import { rememberBoard, rememberFolder, rememberProject, seenBoard, seenFolder, seenProject } from "../misc/seen";
import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";

const plural = (count: number, one: string, many: string) => count + " " + (count === 1 ? one : many);

// one card as the board shows it: its number in the story, its title and text,
// and the groups it's filed under. Dragging it onto another card moves it there
const BoardCardTile = ({card, number, board, dragging, target, onOpen, drag}: {
  card: BoardCard, number: number, board: Board, dragging: boolean, target: boolean,
  onOpen: () => void,
  drag: {onDragStart: (event: DragEvent) => void, onDragEnd: () => void, onDragOver: (event: DragEvent) => void, onDragLeave: () => void, onDrop: (event: DragEvent) => void},
}) => {
  const groups = (card.groups ?? []).flatMap(id => board.groups.filter(group => group.id === id));
  return (
    <li className="flex" draggable {...drag}>
      <button
        type="button"
        onClick={onOpen}
        className={"sw-card sw-board-card px-4 pb-3.5 pt-3.5" + (dragging ? " is-dragging" : "") + (target ? " is-target" : "")}
        aria-label={"Card " + number + (card.title ? ": " + card.title : "") + ". Edit"}
      >
        <span className="flex items-baseline justify-between gap-3">
          {card.title
            ? <span className="sw-card-name line-clamp-2 text-base">{card.title}</span>
            : <span className="sr-only">Untitled</span>}
          <span className="ml-auto shrink-0 text-sm tabular-nums text-[color:var(--muted)]">{number}</span>
        </span>
        {card.text && <span className="mt-1.5 line-clamp-6 whitespace-pre-wrap break-words text-sm">{card.text}</span>}
        <span className="min-h-3 flex-1" />
        {groups.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-1.5">
            {groups.map(group => <span key={group.id} className="sw-tag"><span>{group.name}</span></span>)}
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

  // start from what this tab last saw, then let the subscriptions bring it up to date
  const [project, setProject] = useState(() => seenProject(projectId));
  const [folder, setFolder] = useState(() => { const folderId = seenProject(projectId)?.folderId; return folderId ? seenFolder(folderId) : undefined; });
  const [board, setBoard] = useState(() => seenBoard(projectId));
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();

  const [groupId, setGroupId] = useState<string>();
  // the card being edited, or, for a new one, the act it starts in
  const [editing, setEditing] = useState<{card?: BoardCard, act?: string}>();
  const [showGroups, setShowGroups] = useState(false);
  const [showActs, setShowActs] = useState(false);
  const [dragId, setDragId] = useState<string>();
  const [overId, setOverId] = useState<string>();

  useEffect(() => {
    setProject(seenProject(projectId));
    setNotFound(false);
    setLoadError(undefined);
    const projectRef = getProjectRef(projectId);
    if (!projectRef) return;
    return onValue(projectRef, (snapshot) => {
      if (!snapshot.exists()) return setNotFound(true);
      const found: Project = {id: projectId, ...snapshot.val()};
      rememberProject(found);
      setProject(found);
    }, (error) => setLoadError(toMessage(error)));
  }, [projectId]);

  const folderId = project?.folderId;
  useEffect(() => {
    setFolder(folderId ? seenFolder(folderId) : undefined);
    if (!folderId) return;
    const folderRef = getFolderRef(folderId);
    if (!folderRef) return;
    return onValue(folderRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const found: Folder = {id: folderId, ...snapshot.val()};
      rememberFolder(found);
      setFolder(found);
    }, () => setFolder(undefined));
  }, [folderId]);

  // the board itself; a project that has never had one reads as an empty board
  useEffect(() => {
    setBoard(seenBoard(projectId));
    return onValue(getBoardRef(projectId), (snapshot) => {
      const found = readBoard(snapshot.val());
      rememberBoard(projectId, found);
      setBoard(found);
    }, (error) => setLoadError(toMessage(error)));
  }, [projectId]);

  // a group that's been removed (here or in another tab) stops being the filter
  useEffect(() => {
    if (groupId && board && !board.groups.some(group => group.id === groupId)) setGroupId(undefined);
  }, [board, groupId]);

  useTitle(project ? "Board · " + project.name : "Board");

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

  if (!project || !board) return <Loading skeleton={<BoardSkeleton />} />;

  const apply = (change: (current: Board) => Board) => changeBoard(projectId, change);
  const parts = sectionsIn(board, groupId);
  const hasActs = board.acts.length > 0;
  const trail = [
    {label: "Home", to: "/home"},
    ...(folder ? [{label: folder.name, to: "/folder/" + folder.id}] : []),
    {label: project.name, to: "/project/" + project.id},
  ];
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
    {editing && (
      <CardDialog
        board={board}
        card={editing.card}
        startGroup={groupId}
        startAct={editing.act}
        apply={apply}
        onClose={() => setEditing(undefined)}
      />
    )}
    {showGroups && <GroupsDialog board={board} apply={apply} onClose={() => setShowGroups(false)} />}
    {showActs && <ActsDialog board={board} drafts={drafts} apply={apply} onClose={() => setShowActs(false)} />}

    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <header className="flex h-16 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
        {!props.isSidebarVisible && (
          <button type="button" className="sw-icon" onClick={props.toggleSidebarVisible} aria-label="Show folders" title="Show folders">
            <StrokeIcon name="panelLeft" />
          </button>
        )}
        <Breadcrumb trail={trail} current={<span className="truncate font-bold">Board</span>} />
        <div className="flex-1" />
        <button type="button" className="sw-button" onClick={() => setShowActs(true)} aria-label="Edit acts">
          <StrokeIcon name="acts" size={15} />
          <span className="hidden sm:inline">Acts</span>
        </button>
        <button type="button" className="sw-button" onClick={() => setShowGroups(true)} aria-label="Edit groups">
          <StrokeIcon name="pencil" size={15} />
          <span className="hidden sm:inline">Groups</span>
        </button>
        <button type="button" className="sw-button" onClick={() => setEditing({})} aria-label="New card">
          <StrokeIcon name="plus" size={15} />
          <span className="hidden sm:inline">New card</span>
        </button>
      </header>

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
                      onOpen={() => setEditing({card})}
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
                      onClick={() => setEditing({act: act?.id})}
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
