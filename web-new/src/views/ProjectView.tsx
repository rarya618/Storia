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
import { ScriptBlock } from "../screenplay/types";

// components
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import Sidebar from "../components/Sidebar";
import PageHeading from "../components/PageHeading";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { CastLine, Sheet, Stats } from "../components/Sheet";
import { describe, documentWhen } from "../screenplay/describe";
import { Revision, inDraftOrder, revisionAt, revisionStyle } from "../screenplay/revisions";
import CreateDocument from "./create/CreateDocument";

// additional imports
import { useTitle } from "../misc/title";
import { touchedAt } from "../misc/sortBlocks";
import { getActivityLabel } from "../misc/date";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";

// a document as the shelf shows it: loaded, still loading, or unreadable
type Shelved =
  | {id: string, state: "loading", name: string}
  | {id: string, state: "error", name: string}
  | {id: string, state: "ready", doc: Document, blocks: ScriptBlock[]};

const DocumentOnShelf = ({item, latest, revision}: {item: Shelved, latest: boolean, revision?: Revision}) => {
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
    <li className={width}>
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
        {revision && <span className="sw-rev-chip mt-3 text-sm" style={revisionStyle(revision)}>{revision.name} pages</span>}
        {latest && <span className="sw-button sw-button-soft mt-4 flex w-fit">Continue writing</span>}
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
  // each readable document's revision colour, by when it was made
  const drafts = inDraftOrder(items.flatMap(item => item.state === "ready" ? [item.doc] : []));
  const revisionOf = new Map(drafts.map((doc, index) => [doc.id, revisionAt(index)]));
  const backTo = folder ? "/folder/" + folder.id : "/home";

  return (
    <div className="sw sw-rev flex h-screen w-screen">
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
          <header className="flex h-16 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
            {!props.isSidebarVisible && (
              <button type="button" className="sw-icon" onClick={props.toggleSidebarVisible} aria-label="Show folders" title="Show folders">
                <StrokeIcon name="panelLeft" />
              </button>
            )}
            <Link to={backTo} className="sw-icon !rounded-full bg-[color:var(--wash)]" aria-label={folder ? "Back to " + folder.name : "Back to Home"} title={folder ? "Back to " + folder.name : "Back to Home"}>
              <StrokeIcon name="back" size={16} />
            </Link>
            <div className="flex-1" />
            <button type="button" className="sw-button" onClick={toggleNewDocument}>
              <StrokeIcon name="plus" size={15} />
              <span className="hidden sm:inline">New document</span>
              <span className="sr-only sm:hidden">New document</span>
            </button>
          </header>

          <div className="px-4 pb-16 pt-2 sm:px-8">
            <PageHeading
              title={project.name}
              meta={<>
                {folder && <><Link to={"/folder/" + folder.id} className="hover:text-[color:var(--ui)] hover:underline hover:underline-offset-2">{folder.name}</Link>{" · "}</>}
                {getActivityLabel(project)}
              </>}
              description={project.description}
            />

            <h2 className="sw-section mb-5">
              <span>Documents <span className="ml-1 tabular-nums">{summaries.length}</span></span>
            </h2>

            <ul className="flex flex-wrap items-start gap-x-4 gap-y-10 sm:gap-x-8" aria-label="Documents, most recently edited first">
              {items.map(item => <DocumentOnShelf key={item.id} item={item} latest={item.id === latestId} revision={revisionOf.get(item.id)} />)}
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
      </> : <Loading />}
    </div>
  )
}

export default ProjectView
