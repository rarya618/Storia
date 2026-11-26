// external imports
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { onValue } from "firebase/database";

// data
import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "@storia/core/datatypes/Block";
import Document from "@storia/core/datatypes/Document";
import { deleteDocument, getBoardRef, getDocumentRef, getFolderRef, getProjectRef, updateDocumentDetails } from "../firebase/database";
import { Board, readBoard } from "@storia/core/board/board";
import { readBlocks } from "@storia/core/screenplay/content";
import { ScriptBlock } from "@storia/core/screenplay/types";

// components
import Loading from "../components/Loading";
import { ProjectSkeleton } from "../components/Skeletons";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import Breadcrumb from "../components/Breadcrumb";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { CastLine, Sheet, Stats } from "../components/Sheet";
import { describe, documentWhen } from "../screenplay/describe";
import { inDraftOrder, revisionAt } from "../screenplay/revisions";
import RevisionChip from "../components/RevisionChip";
import CreateDocument from "./create/CreateDocument";
import EditDetails from "./edit/EditDetails";
import { DeleteProject, EditProject } from "./edit/EditProject";
import DeleteDocument from "./edit/DeleteDocument";
import ActionMenu from "../components/ActionMenu";
import { ItemActions, itemActions } from "../components/itemActions";
import ProjectField from "./edit/ProjectField";
import { rememberBoard, rememberDocument, rememberFolder, rememberProject, seenBoard, seenDocument, seenFolder, seenProject } from "../misc/seen";

// additional imports
import { useTitle } from "../misc/title";
import { touchedAt } from "../misc/sortBlocks";
import { getActivityLabel } from "../misc/date";
import { toMessage } from "@storia/core/misc/errors";
import "../screenplay/world.css";
import ShowRail from "../components/ShowRail";
import Bar from "../components/Bar";

// a document as the shelf shows it: loaded, still loading, or unreadable
type Shelved =
  | {id: string, state: "loading", name: string}
  | {id: string, state: "error", name: string}
  | {id: string, state: "ready", doc: Document, blocks: ScriptBlock[]};

// position: which draft it is, oldest first; numbered only when the project has more than one
const DocumentOnShelf = ({item, latest, position, numbered, actions}: {item: Shelved, latest: boolean, position?: number, numbered: boolean, actions: (doc: Document) => ItemActions}) => {
  const revision = position === undefined ? undefined : revisionAt(position);
  const width = latest ? "w-full sm:w-[340px]" : "w-[calc(50%-8px)] sm:w-[236px]";

  if (item.state !== "ready") {
    return (
      <li className={width}>
        <Link to={"/document/" + item.id} className="block rounded-[8px]">
          <div className="aspect-[17/22] rounded-[8px] border sm:aspect-auto sm:h-[300px] border-[color:var(--hair)] bg-[color:var(--tint)]" aria-hidden="true" />
          <p className="mt-3 truncate text-lg font-bold">{item.name}</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{item.state === "loading" ? "Loading…" : "Couldn't load this document. Open it to try again."}</p>
        </Link>
      </li>
    );
  }

  const {doc, blocks} = item;
  const {pages, scenes, runtime, cast} = describe(blocks);

  return (
    <li className={width + " sw-editable relative"}>
      {/* beside the link rather than in it, since a button can't sit inside one.
          With a mouse it shows while the sheet is hovered, it has focus or its menu is open */}
      <ActionMenu
        label={"More for " + doc.name}
        actions={itemActions(actions(doc))}
        className="absolute right-2 top-2 z-10"
        buttonClassName="sw-icon sw-edit"
        iconSize={16}
        menuClassName="right-0 top-full mt-1 w-48"
      />
      <Link
        to={"/document/" + doc.id}
        className="group block rounded-[8px] focus-visible:!rounded-[8px]"
      >
        <Sheet blocks={blocks} large={latest} revision={revision} frame={"aspect-[17/22] sm:aspect-auto " + (latest ? "sm:h-[360px] !border-2 !border-[color:var(--ui)]" : "sm:h-[300px]")} />
        <p className={"mt-4 line-clamp-2 break-words font-bold" + (latest ? " text-xl" : " text-lg")}>{doc.name}</p>
        {doc.description && <p className="mt-1 line-clamp-2 break-words text-sm text-[color:var(--muted)]">{doc.description}</p>}
        <div className="mt-3"><Stats pages={pages} scenes={scenes} runtime={runtime} /></div>
        <CastLine cast={cast} className="mt-1.5 text-sm" />
        <p className="mt-1.5 text-sm text-[color:var(--muted)]">{documentWhen(doc)}</p>
        {numbered && position !== undefined && <RevisionChip position={position} className="mt-3 text-sm" />}
        {latest && <span className="sw-button sw-button-soft mt-4 flex w-fit">Continue writing</span>}
      </Link>
    </li>
  );
};

// how many of the board's cards its sheet sketches
const BOARD_CARDS_SHOWN = 8;

// the project's board beside its drafts: a sheet of its first cards in
// miniature, on no revision paper, since it isn't a draft
const BoardOnShelf = ({projectId, board}: {projectId: string, board?: Board}) => {
  const cards = board?.cards ?? [];
  const groups = board?.groups ?? [];
  const meta = !board
    ? "Plan the story on cards"
    : cards.length === 0
    ? "Plan the story on cards before you write it"
    : cards.length + (cards.length === 1 ? " card" : " cards") + (groups.length ? " · " + groups.length + (groups.length === 1 ? " group" : " groups") : "");
  return (
    <li className="w-[calc(50%-8px)] sm:w-[236px]">
      <Link to={"/project/" + projectId + "/board"} className="group block rounded-[8px] focus-visible:!rounded-[8px]">
        <div className="sw-board-sheet aspect-[17/22] sm:aspect-auto sm:h-[300px]" aria-hidden="true">
          {cards.length > 0
            ? cards.slice(0, BOARD_CARDS_SHOWN).map(card => <span key={card.id}>{card.title || card.text}</span>)
            : <p className="empty">No cards yet</p>}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-lg font-bold">
          <StrokeIcon name="board" size={16} />Board
        </p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{meta}</p>
      </Link>
    </li>
  );
};

// the project stores only summaries of its documents
const summariesOf = (project?: Project): {id: string, name: string}[] => project?.documents
  ? Object.entries(project.documents).map(([docId, summary]) => ({id: docId, name: summary?.name || "Untitled"}))
  : [];

// each document as last seen, or still loading
const shelfFor = (summaries: {id: string, name: string}[]) => Object.fromEntries(summaries.map(summary => {
  const doc = seenDocument(summary.id);
  const item: Shelved = doc
    ? {id: summary.id, state: "ready", doc, blocks: readBlocks(doc.content)}
    : {id: summary.id, state: "loading", name: summary.name};
  return [summary.id, item];
}));

const ProjectView = (props: PropsWithSidebar) => {
  const { id } = useParams<string>();
  const projectId = id ?? "";

  // start from what this tab last saw, so the project draws at once; the
  // subscriptions below bring it up to date
  const [project, setProject] = useState(() => seenProject(projectId));
  const [folder, setFolder] = useState(() => { const folderId = seenProject(projectId)?.folderId; return folderId ? seenFolder(folderId) : undefined; });
  const [shelf, setShelf] = useState<Record<string, Shelved>>(() => shelfFor(summariesOf(seenProject(projectId))));
  const [loadError, setLoadError] = useState<string>();
  const [showEdit, setShowEdit] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document>();
  const [deleting, setDeleting] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<Document>();
  const navigate = useNavigate();
  // set while this page deletes its own project, so the project vanishing
  // isn't shown as "not found" on the way out
  const leaving = useRef(false);
  const [notFound, setNotFound] = useState(false);
  const [showNewDocument, setShowNewDocument] = useState(false);
  const [board, setBoard] = useState(() => seenBoard(projectId));
  const toggleNewDocument = () => setShowNewDocument(!showNewDocument);

  // subscribe to the project
  useEffect(() => {
    setProject(seenProject(projectId));
    setNotFound(false);
    setLoadError(undefined);

    const projectRef = getProjectRef(projectId);
    if (!projectRef) return;

    return onValue(projectRef, (snapshot) => {
      if (!snapshot.exists()) return leaving.current || setNotFound(true);
      const found: Project = {id: projectId, ...snapshot.val()};
      rememberProject(found);
      setProject(found);
    }, (error) => setLoadError(toMessage(error)));
  }, [projectId]);

  // the project's board, for its place on the shelf; a project that has never
  // had one reads as an empty board
  useEffect(() => {
    setBoard(seenBoard(projectId));
    return onValue(getBoardRef(projectId), (snapshot) => {
      const found = readBoard(snapshot.val());
      rememberBoard(projectId, found);
      setBoard(found);
    }, () => setBoard(undefined));
  }, [projectId]);

  // subscribe to the folder the project lives in, for the header
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

  // the project stores only summaries, so each document is read in full for its sheet
  const summaries = summariesOf(project);
  const summaryKey = summaries.map(summary => summary.id + "\u0000" + summary.name).join("\u0001");

  useEffect(() => {
    setShelf(shelfFor(summaries));

    const unsubscribes = summaries.map(summary => onValue(getDocumentRef(summary.id), (snapshot) => {
      let item: Shelved = {id: summary.id, state: "error", name: summary.name};
      if (snapshot.exists()) {
        const doc: Document = {id: summary.id, ...snapshot.val()};
        rememberDocument(doc);
        item = {id: summary.id, state: "ready", doc, blocks: readBlocks(doc.content)};
      }
      setShelf(current => ({...current, [summary.id]: item}));
    }, () => setShelf(current => ({...current, [summary.id]: {id: summary.id, state: "error", name: summary.name}}))));

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    // summaryKey stands in for the summaries array, which is rebuilt every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryKey]);

  useTitle(project ? project.name : "Project");

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/account/login" />
  }

  if (notFound || loadError) {
    return (
      <LoadError
        notFound={notFound}
        title={notFound ? "Project not found" : undefined}
        message={notFound ? "This project doesn't exist, or it was deleted." : loadError!}
      />
    )
  }

  // latest first; documents still loading keep their place at the end
  const items = Object.values(shelf).sort((a, b) =>
    (b.state === "ready" ? touchedAt(b.doc) : -1) - (a.state === "ready" ? touchedAt(a.doc) : -1));
  // crown the latest only once every document has arrived, so the shelf never reshuffles under a click
  const settled = items.every(item => item.state !== "loading");
  const latestId = settled && items[0]?.state === "ready" ? items[0].id : undefined;
  // each readable document's place among the drafts, by when it was made
  const drafts = inDraftOrder(items.flatMap(item => item.state === "ready" ? [item.doc] : []));
  const positionOf = new Map(drafts.map((doc, index) => [doc.id, index]));
  const trail = [{label: "Home", to: "/home"}, ...(folder ? [{label: folder.name, to: "/folder/" + folder.id}] : [])];

  return (
    project ? <>
      {showNewDocument && (
        <CreateDocument
          projectId={projectId}
          toggleShow={toggleNewDocument}
          errorValue={props.errorValue}
          setError={props.setError}
          errorDisplay={props.errorDisplay}
          setErrorDisplay={props.setErrorDisplay}
        />
      )}

      {showEdit && <EditProject project={project} onClose={() => setShowEdit(false)} />}
      {deleting && (
        <DeleteProject
          project={project}
          onClose={() => setDeleting(false)}
          onDeleting={() => { leaving.current = true; }}
          onDeleteFailed={() => { leaving.current = false; }}
          onDeleted={() => navigate(project.folderId ? "/folder/" + project.folderId : "/home", {replace: true})}
        />
      )}

      {editingDoc && (
        <EditDetails
          kind="document"
          details={{name: editingDoc.name, description: editingDoc.description ?? ""}}
          onSave={(details, form) => updateDocumentDetails({id: editingDoc.id, projectId}, {...details, projectId: form.projectId || projectId})}
          onClose={() => setEditingDoc(undefined)}
        >
          <ProjectField current={projectId} />
        </EditDetails>
      )}
      {deletingDoc && (
        <DeleteDocument
          name={deletingDoc.name}
          onConfirm={async () => {
            await deleteDocument({id: deletingDoc.id, projectId});
            setDeletingDoc(undefined);
          }}
          onClose={() => setDeletingDoc(undefined)}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Bar
            className="sm:pr-6"
            start={!props.isSidebarVisible && <ShowRail label="Show folders" onShow={props.toggleSidebarVisible} />}
            middle={<Breadcrumb trail={trail} current={<span className="truncate font-bold">{project.name}</span>} />}
            end={<>
          <button type="button" className="sw-button" onClick={toggleNewDocument}>
            <StrokeIcon name="plus" size={15} />
            <span className="hidden sm:inline">New document</span>
            <span className="sr-only sm:hidden">New document</span>
          </button>
          <ActionMenu label={"More for " + project.name} actions={itemActions({onEdit: () => setShowEdit(true), onDelete: () => setDeleting(true)})} />
            </>}
          />

        <div className="px-4 pb-16 pt-2 sm:px-8">
          <PageHeading
            title={project.name}
            meta={getActivityLabel(project)}
            description={project.description}
          />

          <h2 className="sw-section mb-5">
            <span>Documents <span className="ml-1 tabular-nums">{summaries.length}</span></span>
          </h2>

          <ul className="flex flex-wrap items-start gap-x-4 gap-y-10 sm:gap-x-8" aria-label="Documents, most recently edited first">
            {items.map(item => <DocumentOnShelf key={item.id} item={item} latest={item.id === latestId} position={positionOf.get(item.id)} numbered={drafts.length > 1} actions={doc => ({onEdit: () => setEditingDoc(doc), onDelete: () => setDeletingDoc(doc)})} />)}
            <BoardOnShelf projectId={projectId} board={board} />
            <li className={items.length === 0 ? "w-full sm:w-[340px]" : "w-[calc(50%-8px)] sm:w-[236px]"}>
              <button
                type="button"
                onClick={toggleNewDocument}
                className={"sw-card-new flex-col gap-2 text-base" + (items.length === 0 ? " aspect-[17/22] sm:aspect-auto sm:h-[360px]" : " aspect-[17/22] sm:aspect-auto sm:h-[300px]")}
              >
                <StrokeIcon name="plus" size={18} />
                {items.length === 0 ? "Start the first draft" : "New document"}
              </button>
            </li>
          </ul>
        </div>
      </main>
    </> : <Loading skeleton={<ProjectSkeleton />} />
  )
}

export default ProjectView
