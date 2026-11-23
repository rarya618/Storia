// external imports
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { onValue } from "firebase/database";

// data
import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "../datatypes/Block";
import Document from "../datatypes/Document";
import { getDocumentRef, getFolderRef, getProjectRef } from "../firebase/database";
import { readBlocks } from "../screenplay/content";
import { estimatePages } from "../screenplay/pages";
import { characterIndex, toScenes, totalRuntime } from "../screenplay/structure";
import { ScriptBlock } from "../screenplay/types";

// components
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import Sidebar from "../components/Sidebar";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { titleCase } from "../components/screenplay/cast";
import CreateDocument from "./create/CreateDocument";
import { Counted } from "../components/Cards";

// additional imports
import { useTitle } from "../misc/title";
import { touchedAt } from "../misc/sortBlocks";
import { getActivityLabel, getRelativeDate } from "../misc/date";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";

// a document as the shelf shows it: loaded, still loading, or unreadable
type Shelved =
  | {id: string, state: "loading", name: string}
  | {id: string, state: "error", name: string}
  | {id: string, state: "ready", doc: Document, blocks: ScriptBlock[]};

// how many of the script's first blocks a sheet shows before it fades out
const SHEET_BLOCKS = 14;
// how many characters a document names before "+n"
const CAST_SHOWN = 4;


const when = (doc: Document) =>
  doc.lastUpdated ? "Updated " + getRelativeDate(doc.lastUpdated) : doc.createdOn ? "Created " + getRelativeDate(doc.createdOn) : "";

// what the sheet's stats and cast line say about a script
const describe = (blocks: ScriptBlock[]) => {
  // only what's written counts, so an untouched draft reads as empty, not one scene
  const scenes = toScenes(blocks.filter(block => block.text.trim() !== ""));
  const cast = [...characterIndex(scenes).entries()]
    .sort(([nameA, a], [nameB, b]) => b.cues - a.cues || nameA.localeCompare(nameB))
    .map(([name]) => titleCase(name));
  return {
    pages: estimatePages(blocks),
    scenes: scenes.filter(scene => scene.number > 0).length,
    runtime: totalRuntime(scenes),
    cast,
  };
};

// the document's own first page, in miniature
const Sheet = ({blocks, large}: {blocks: ScriptBlock[], large?: boolean}) => {
  const written = blocks.filter(block => block.text.trim() !== "").slice(0, SHEET_BLOCKS);
  return (
    <div className={"sw-sheet group-hover:border-[color:var(--hair-strong)] group-hover:shadow-[0_1px_3px_rgb(0_0_0/0.07)]" + (large ? " aspect-[17/22] sm:aspect-auto sm:h-[360px] !text-[11.5px] !pl-[34px] !pt-[28px] !border-[color:var(--select-border)]" : " aspect-[17/22] sm:aspect-auto sm:h-[300px]")} aria-hidden="true">
      {written.length > 0
        ? written.map(block => <p key={block.id} className={block.type}>{block.text}</p>)
        : <p className="empty">Nothing written yet</p>}
    </div>
  );
};

// pages, scenes and runtime as one line of figures, the numbers leading
const Stats = ({pages, scenes, runtime}: {pages: number, scenes: number, runtime: string}) => (
  <p className="text-xs text-[color:var(--muted)]">
    <span className="whitespace-nowrap"><Counted count={pages} one="page" many="pages" /></span>
    {" · "}
    <span className="whitespace-nowrap"><Counted count={scenes} one="scene" many="scenes" /></span>
    {" · "}
    <span className="whitespace-nowrap"><span className="sw-fig">{runtime}</span> runtime</span>
  </p>
);

const DocumentOnShelf = ({item, latest}: {item: Shelved, latest: boolean}) => {
  const width = latest ? "w-full sm:w-[340px]" : "w-[calc(50%-8px)] sm:w-[236px]";

  if (item.state !== "ready") {
    return (
      <li className={width}>
        <Link to={"/document/" + item.id} className="block rounded-[8px]">
          <div className="aspect-[17/22] rounded-[8px] border sm:aspect-auto sm:h-[300px] border-[color:var(--hair)] bg-[color:var(--tint)]" aria-hidden="true" />
          <p className="mt-3 truncate text-sm font-semibold tracking-tight">{item.name}</p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">{item.state === "loading" ? "Loading…" : "Couldn't load this document. Open it to try again."}</p>
        </Link>
      </li>
    );
  }

  const {doc, blocks} = item;
  const {pages, scenes, runtime, cast} = describe(blocks);
  const shownCast = cast.slice(0, CAST_SHOWN).join(", ") + (cast.length > CAST_SHOWN ? " +" + (cast.length - CAST_SHOWN) : "");

  return (
    <li className={width}>
      <Link
        to={"/document/" + doc.id}
        className="group block rounded-[8px] focus-visible:!rounded-[8px]"
      >
        <Sheet blocks={blocks} large={latest} />
        <p className={"mt-3 line-clamp-2 break-words font-semibold tracking-tight" + (latest ? " text-base text-[color:var(--on-select)]" : " text-sm")}>{doc.name}</p>
        {doc.description && <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[color:var(--muted)]">{doc.description}</p>}
        <div className="mt-2"><Stats pages={pages} scenes={scenes} runtime={runtime} /></div>
        {cast.length > 0 && (
          <p className="mt-2 flex min-w-0 items-center gap-1 text-xs text-[color:var(--muted)]">
            <span className="shrink-0"><StrokeIcon name="cast" size={13} /></span>
            <span className="truncate">{shownCast}</span>
          </p>
        )}
        <p className="mt-1 text-xs text-[color:var(--muted)]">{when(doc)}</p>
        {latest && <span className="sw-button sw-button-soft mt-3">Continue writing</span>}
      </Link>
    </li>
  );
};

const ProjectView = (props: PropsWithSidebar) => {
  const [project, setProject] = useState<Project>();
  const [folder, setFolder] = useState<Folder>();
  const [shelf, setShelf] = useState<Record<string, Shelved>>({});
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [showNewDocument, setShowNewDocument] = useState(false);
  const toggleNewDocument = () => setShowNewDocument(!showNewDocument);

  const { id } = useParams<string>();
  const projectId = id ?? "";

  // subscribe to the project
  useEffect(() => {
    setProject(undefined);
    setNotFound(false);
    setLoadError(undefined);

    const projectRef = getProjectRef(projectId);
    if (!projectRef) return;

    return onValue(projectRef, (snapshot) => {
      if (!snapshot.exists()) return setNotFound(true);
      setProject({id: projectId, ...snapshot.val()});
    }, (error) => setLoadError(toMessage(error)));
  }, [projectId]);

  // subscribe to the folder the project lives in, for the header
  const folderId = project?.folderId;
  useEffect(() => {
    setFolder(undefined);
    if (!folderId) return;

    const folderRef = getFolderRef(folderId);
    if (!folderRef) return;

    return onValue(folderRef, (snapshot) => {
      if (snapshot.exists()) setFolder({id: folderId, ...snapshot.val()});
    }, () => setFolder(undefined));
  }, [folderId]);

  // the project stores only summaries, so each document is read in full for its sheet
  const summaries: {id: string, name: string}[] = project?.documents
    ? Object.entries(project.documents).map(([docId, summary]) => ({id: docId, name: summary?.name || "Untitled"}))
    : [];
  const summaryKey = summaries.map(summary => summary.id + "\u0000" + summary.name).join("\u0001");

  useEffect(() => {
    setShelf(Object.fromEntries(summaries.map(summary => [summary.id, {id: summary.id, state: "loading", name: summary.name} as Shelved])));

    const unsubscribes = summaries.map(summary => onValue(getDocumentRef(summary.id), (snapshot) => {
      setShelf(current => ({
        ...current,
        [summary.id]: snapshot.exists()
          ? {id: summary.id, state: "ready", doc: {id: summary.id, ...snapshot.val()}, blocks: readBlocks(snapshot.val().content)}
          : {id: summary.id, state: "error", name: summary.name},
      }));
    }, () => setShelf(current => ({...current, [summary.id]: {id: summary.id, state: "error", name: summary.name}}))));

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    // summaryKey stands in for the summaries array, which is rebuilt every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryKey]);

  useTitle(project ? project.name : "Project");

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/" />
  }

  if (notFound || loadError) {
    return (
      <div className="flex h-screen w-screen">
        <LoadError
          notFound={notFound}
          title={notFound ? "Project not found" : undefined}
          message={notFound ? "This project doesn't exist, or it was deleted." : loadError!}
        />
      </div>
    )
  }

  // latest first; documents still loading keep their place at the end
  const items = Object.values(shelf).sort((a, b) =>
    (b.state === "ready" ? touchedAt(b.doc) : -1) - (a.state === "ready" ? touchedAt(a.doc) : -1));
  // crown the latest only once every document has arrived, so the shelf never reshuffles under a click
  const settled = items.every(item => item.state !== "loading");
  const latestId = settled && items[0]?.state === "ready" ? items[0].id : undefined;
  const backTo = folder ? "/folder/" + folder.id : "/home";

  return (
    <div className="sw flex h-screen w-screen">
      {project ? <>
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
        <Sidebar current={projectId} isSidebarVisible={props.isSidebarVisible} toggleSidebarVisible={props.toggleSidebarVisible} />

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="flex h-11 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
            {!props.isSidebarVisible && (
              <button type="button" className="sw-icon" onClick={props.toggleSidebarVisible} aria-label="Show folders" title="Show folders">
                <StrokeIcon name="panelLeft" />
              </button>
            )}
            <Link to={backTo} className="sw-icon !rounded-full bg-[color:var(--wash)]" aria-label={folder ? "Back to " + folder.name : "Back to Home"} title={folder ? "Back to " + folder.name : "Back to Home"}>
              <StrokeIcon name="back" size={16} />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="truncate text-[14px] font-bold leading-[18px] tracking-tight">{project.name}</h1>
              <p className="truncate text-[11.5px] leading-4 text-[color:var(--muted)]">
                {folder && <><Link to={"/folder/" + folder.id} className="hover:text-[color:var(--ui)] hover:underline hover:underline-offset-2">{folder.name}</Link>{" · "}</>}
                {getActivityLabel(project)}
              </p>
            </div>
            <button type="button" className="sw-button" onClick={toggleNewDocument}>
              <StrokeIcon name="plus" size={15} />
              <span className="hidden sm:inline">New document</span>
              <span className="sr-only sm:hidden">New document</span>
            </button>
          </header>

          <div className="px-4 pb-16 pt-3 sm:px-8">
            {project.description && (
              <p className="mb-6 max-w-[65ch] break-words text-[13px] leading-5 text-[color:var(--muted)]">{project.description}</p>
            )}

            <h2 className="sw-ruled sw-label mb-4">
              <span>Documents <span className="ml-1 tabular-nums">{summaries.length}</span></span>
            </h2>

            <ul className="flex flex-wrap items-start gap-x-4 gap-y-8 sm:gap-x-6" aria-label="Documents, most recently edited first">
              {items.map(item => <DocumentOnShelf key={item.id} item={item} latest={item.id === latestId} />)}
              <li className={items.length === 0 ? "w-full sm:w-[340px]" : "w-[calc(50%-8px)] sm:w-[236px]"}>
                <button
                  type="button"
                  onClick={toggleNewDocument}
                  className={"sw-card-new flex-col gap-2 text-xs" + (items.length === 0 ? " aspect-[17/22] sm:aspect-auto sm:h-[360px]" : " aspect-[17/22] sm:aspect-auto sm:h-[300px]")}
                >
                  <StrokeIcon name="plus" size={18} />
                  {items.length === 0 ? "Start the first draft" : "New document"}
                </button>
              </li>
            </ul>
          </div>
        </main>
      </> : <Loading />}
    </div>
  )
}

export default ProjectView
