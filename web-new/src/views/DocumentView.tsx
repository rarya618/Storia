// external imports
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { get } from "firebase/database";

// data
import Document from "../datatypes/Document";
import { Details, deleteDocument, getDocumentRef, getFolderRef, getProjectRef, getUser, saveDocumentContent, touchParents, updateDocumentDetails } from "../firebase/database";
import { ElementType, ScriptBlock } from "../screenplay/types";
import { readBlocks } from "../screenplay/content";
import { textForType } from "../screenplay/flow";
import { toFountain } from "../screenplay/fountain";
import { headingParts, sceneOf, toScenes, totalRuntime, wordCount } from "../screenplay/structure";
import { paginate } from "../screenplay/pages";

// components
import Loading from "../components/Loading";
import Rail from "../components/Rail";
import { EditorSkeleton } from "../components/Skeletons";
import Breadcrumb, { Crumb } from "../components/Breadcrumb";
import { rememberContent, rememberDocument, seenDocument, seenFolder, seenProject } from "../misc/seen";
import LoadError from "../components/LoadError";
import ScriptEditor, { ScriptEditorHandle } from "../components/screenplay/ScriptEditor";
import EditDetails from "./edit/EditDetails";
import ProjectField from "./edit/ProjectField";
import { placeLabel, titleCase } from "../components/screenplay/cast";
import SceneSidebar from "../components/screenplay/SceneSidebar";
import ProjectSidebar, { ProjectDocument } from "../components/screenplay/ProjectSidebar";
import BottomBar from "../components/screenplay/BottomBar";
import ShortcutHelp from "../components/screenplay/ShortcutHelp";
import PrintScript from "../components/screenplay/PrintScript";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { useEscape } from "../misc/forms";
import { readPanel, writePanel } from "../misc/panels";

// additional imports
import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import { randomString } from "../misc/randomString";
import "../screenplay/screenplay.css";
import { inDraftOrder } from "../screenplay/revisions";
import RevisionChip from "../components/RevisionChip";
import "../screenplay/world.css";

type SaveStatus = "saved" | "saving" | "error";

const SAVE_DELAY_MS = 800;
// every arrival in the editor, and every switch to another document, opens on
// the skeleton for at least this long before the page settles in over it, even
// when the script is already to hand
const SKELETON_MS = 150;
// below this the sidebars overlay the page instead of sitting beside it
const DOCKED = "(min-width: 900px)";

const fileName = (name: string) => (name.trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, " ") || "screenplay") + ".fountain";

const clock = (date: Date) => date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});


// the remembered copy of a document's script, if the tab has seen it
const seedBlocks = (id: string) => {
  const doc = seenDocument(id);
  return doc ? readBlocks(doc.content) : undefined;
};

// the remembered project, folder and sibling documents around a document
const seenParents = (id: string) => {
  const project = seenProject(seenDocument(id)?.projectId ?? "");
  const folder = project?.folderId ? seenFolder(project.folderId) : undefined;
  const docs = Object.keys(project?.documents ?? {}).flatMap(docId => {
    const other = seenDocument(docId);
    return other ? [other as ProjectDocument] : [];
  });
  return {
    projectName: project?.name,
    folder: folder && {id: folder.id, name: folder.name},
    docs,
  };
};

// two scripts match when every element has the same type and text
const sameScript = (a: ScriptBlock[], b: ScriptBlock[]) =>
  a.length === b.length && a.every((block, index) => block.type === b[index].type && block.text === b[index].text);

const DocumentView = () => {
  const { id } = useParams<string>();
  const documentId = id ?? "";

  // start from what the tab last saw (the project's shelf reads every document),
  // so the page draws at once; the fresh copy loaded below then takes over
  const [doc, setDoc] = useState(() => seenDocument(documentId));
  const [blocks, setBlocks] = useState(() => seedBlocks(documentId));
  const [projectName, setProjectName] = useState(() => seenParents(documentId).projectName);
  const [folder, setFolder] = useState(() => seenParents(documentId).folder);
  const [projectDocs, setProjectDocs] = useState<ProjectDocument[]>(() => seenParents(documentId).docs);
  const [author, setAuthor] = useState<string>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);

  const [activeId, setActiveId] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [savedAt, setSavedAt] = useState<Date | undefined>(() => {
    const updated = seenDocument(documentId)?.lastUpdated;
    return updated ? new Date(updated) : undefined;
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  // the skeleton's moment on arrival: which document it has had its moment for,
  // so a switch to another one is on the skeleton from its very first render
  const [skeletonDoneFor, setSkeletonDoneFor] = useState<string>();
  useEffect(() => {
    const timer = setTimeout(() => setSkeletonDoneFor(documentId), SKELETON_MS);
    return () => clearTimeout(timer);
  }, [documentId]);
  const skeletonShown = skeletonDoneFor === documentId;
  const navigate = useNavigate();

  // sidebars: docked beside the page on wide screens, overlays on narrow ones
  const [docked, setDocked] = useState(() => window.matchMedia(DOCKED).matches);
  const [leftOpen, setLeftOpen] = useState(() => docked && readPanel("editorScenes", window.innerWidth >= 1100));
  const [rightOpen, setRightOpen] = useState(() => docked && readPanel("editorProject", window.innerWidth >= 1360));

  const editor = useRef<ScriptEditorHandle>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // unsaved edits, so they can be flushed when leaving the page
  const dirty = useRef(false);
  // whether the fresh copy has arrived; until it has, the page may be showing
  // a remembered one, and nothing is saved over the stored script
  const fresh = useRef(false);
  const latest = useRef<ScriptBlock[]>();
  latest.current = blocks;
  // the project and folder that hold this document, once they're known to exist
  const parents = useRef<{projectId?: string, folderId?: string}>({});

  useTitle(doc ? doc.name : "Document");

  // load the document once; the editor owns the content after that
  useEffect(() => {
    let cancelled = false;
    fresh.current = false;
    dirty.current = false;
    // switching documents in place starts from the remembered copy too
    const seed = seenDocument(documentId);
    const seeded = seed ? readBlocks(seed.content) : undefined;
    setDoc(seed);
    setBlocks(seeded);

    get(getDocumentRef(documentId)).then(async snapshot => {
      if (cancelled) return;
      if (!snapshot.exists()) return setNotFound(true);

      const data: Document = {id: documentId, ...snapshot.val()};
      rememberDocument(data);
      setDoc(data);
      // the stored script wins over the remembered one. If they match, as they
      // nearly always do, the page is left alone and anything typed meanwhile
      // is saved now; if not, the stored one replaces the page, along with
      // anything typed in the moment before it came
      const stored = readBlocks(data.content);
      fresh.current = true;
      if (seeded && sameScript(seeded, stored)) {
        if (dirty.current) setBlocks(current => current && [...current]);
      } else {
        setBlocks(stored);
        dirty.current = false;
      }
      if (data.lastUpdated) setSavedAt(new Date(data.lastUpdated));

      getUser(data.owner).then(user => {
        if (!cancelled && user) setAuthor(user.firstName + " " + user.lastName);
      });
    }).catch(error => !cancelled && setLoadError(toMessage(error)));

    return () => { cancelled = true; };
  }, [documentId]);

  // the project that holds the document, its folder, and its other documents,
  // for the breadcrumb, the project rail and the revision colour. Keyed on the
  // project rather than the document, so moving the document reloads them
  const parentId = doc?.projectId;
  useEffect(() => {
    let cancelled = false;
    parents.current = {};
    const seeded = seenParents(documentId);
    setProjectName(seeded.projectName);
    setFolder(seeded.folder);
    setProjectDocs(seeded.docs);
    if (!parentId) return;

    get(getProjectRef(parentId)!).then(async project => {
      if (cancelled || !project.exists()) return;
      parents.current = {projectId: parentId, folderId: project.val().folderId};
      setProjectName(project.val().name);
      // the folder's name, for the breadcrumb
      const folderId = project.val().folderId;
      if (folderId) get(getFolderRef(folderId)!).then(found => {
        if (!cancelled && found.exists()) setFolder({id: folderId, name: found.val().name});
      }).catch(() => {});
      else setFolder(undefined);
      const ids = Object.keys(project.val().documents ?? {});
      const docs = await Promise.all(ids.map(docId =>
        get(getDocumentRef(docId))
          .then(other => {
            if (!other.exists()) return undefined;
            // remembered, so moving to it from the project rail draws at once
            rememberDocument({id: docId, ...other.val()});
            return {id: docId, ...other.val()} as ProjectDocument;
          })
          .catch(() => undefined)
      ));
      if (!cancelled) setProjectDocs(docs.filter((other): other is ProjectDocument => Boolean(other)));
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [documentId, parentId]);

  const updateBlocks = useCallback((update: (blocks: ScriptBlock[]) => ScriptBlock[]) => {
    dirty.current = true;
    setBlocks(current => current && update(current));
  }, []);

  const save = useCallback(async (content: ScriptBlock[]) => {
    setSaveStatus("saving");
    try {
      await saveDocumentContent(documentId, content);
      // the project's shelf should open on this version, not the one before it
      rememberContent(documentId, content);
      touchParents(parents.current);
      // only mark saved if nothing changed while this save was in flight
      if (latest.current === content) {
        dirty.current = false;
        setSaveStatus("saved");
        setSavedAt(new Date());
      }
    } catch {
      setSaveStatus("error");
    }
  }, [documentId]);

  // autosave shortly after typing stops
  useEffect(() => {
    if (!blocks || !dirty.current || !fresh.current) return;
    setSaveStatus("saving");
    const timer = setTimeout(() => save(blocks), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [blocks, save]);

  // flush pending edits when leaving, and warn before closing the tab with unsaved work
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (dirty.current && fresh.current && latest.current) {
        saveDocumentContent(documentId, latest.current).then(() => touchParents(parents.current)).catch(() => {});
      }
    };
  }, [documentId]);

  // switching between docked and overlay sidebars as the window changes
  useEffect(() => {
    const query = window.matchMedia(DOCKED);
    const onChange = () => {
      setDocked(query.matches);
      if (!query.matches) { setLeftOpen(false); setRightOpen(false); }
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // popovers (and overlay sidebars) close on Escape or an outside click
  const closePopovers = useCallback(() => {
    // focus inside the menu goes back to the button that opened it
    if (menuRef.current?.contains(document.activeElement)) menuButtonRef.current?.focus();
    setShowHelp(false);
    setShowMenu(false);
    if (!window.matchMedia(DOCKED).matches) { setLeftOpen(false); setRightOpen(false); }
  }, []);
  useEscape(closePopovers);
  useEffect(() => {
    if (!showHelp && !showMenu) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (helpRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setShowHelp(false);
      setShowMenu(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showHelp, showMenu]);

  // what's worked out from the whole script (scenes, word count, the print
  // copy) follows a step behind the typing, so a keystroke paints first
  const settled = useDeferredValue(blocks);
  const scenes = useMemo(() => settled ? toScenes(settled) : [], [settled]);
  const words = useMemo(() => settled ? wordCount(settled) : 0, [settled]);
  const layout = useMemo(() => paginate(settled ?? []), [settled]);

  // stable, so the scene list (memoised) doesn't redraw on every keystroke
  const toggleLeft = useCallback(() => {
    const next = !leftOpen;
    setLeftOpen(next);
    if (docked) writePanel("editorScenes", next); else setRightOpen(false);
  }, [leftOpen, docked]);

  const goToScene = useCallback((sceneId: string) => {
    editor.current?.focusBlock(sceneId, "start");
    if (!docked) setLeftOpen(false);
  }, [docked]);

  // "Add more": a new scene heading at the end of the script
  const addScene = useCallback(() => {
    const current = latest.current ?? [];
    const last = current[current.length - 1];
    if (last && last.type === "heading" && last.text.trim() === "") return goToScene(last.id);
    const heading: ScriptBlock = {id: randomString(8), type: "heading", text: ""};
    updateBlocks(blocks => [...blocks, heading]);
    goToScene(heading.id);
  }, [goToScene, updateBlocks]);

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/" />
  }

  if (notFound || loadError) {
    return (
      <div className="flex h-screen w-screen">
        <LoadError
          notFound={notFound}
          title={notFound ? "Document not found" : undefined}
          message={notFound ? "This document doesn't exist, or it was deleted." : loadError!}
        />
      </div>
    )
  }

  if (!doc || !blocks || !skeletonShown) {
    // the editor's own frame, rails as they'll open: first on every arrival, and
    // for as long as the script takes to load
    return <div className="flex h-screen w-screen"><Loading skeleton={<EditorSkeleton left={leftOpen} right={rightOpen} />} /></div>
  }

  const activeBlock = blocks.find(block => block.id === activeId);
  // the editor's own rail carries the wordmark home, so the trail starts at the folder
  const trail: Crumb[] = [
    ...(folder ? [{label: folder.name, to: "/folder/" + folder.id}] : []),
    ...(doc.projectId && projectName ? [{label: projectName, to: "/project/" + doc.projectId}] : []),
  ];
  // a document outside any project leads straight home
  if (!doc.projectId) trail.push({label: "Home", to: "/home"});

  const currentScene = sceneOf(scenes, activeId) ?? scenes.find(scene => scene.number > 0) ?? scenes[0];

  const toggleRight = () => {
    const next = !rightOpen;
    setRightOpen(next);
    if (docked) writePanel("editorProject", next); else setLeftOpen(false);
  };

  const setActiveType = (type: ElementType) => {
    if (!activeBlock) return;
    updateBlocks(current => current.map(block =>
      block.id === activeBlock.id ? {...block, type, text: textForType(block.text, block.type, type)} : block));
    editor.current?.focusBlock(activeBlock.id);
  };

  // the editor read the document once, so it takes the new details itself, as
  // does the project rail beside it; screens that subscribe see them arrive
  const saveDetails = async (details: Details, form: Record<string, string>) => {
    const projectId = form.projectId || doc.projectId;
    await updateDocumentDetails({id: doc.id, projectId: doc.projectId}, {...details, projectId});
    const updated = {...doc, ...details, ...(projectId ? {projectId} : {})};
    // remembered first, so a move's reload of the project rail starts from it
    rememberDocument({...updated, content: latest.current ?? updated.content});
    setDoc(updated);
    if (projectId === doc.projectId) setProjectDocs(docs => docs.map(other => other.id === doc.id ? {...other, ...details} : other));
  };

  // deleting: nothing may be saved after the document goes, so autosave and the
  // flush on leaving stand down first, and come back if the delete fails
  const removeDocument = async () => {
    const wasFresh = fresh.current;
    fresh.current = false;
    dirty.current = false;
    try {
      await deleteDocument({id: doc.id, projectId: doc.projectId});
    } catch (error) {
      fresh.current = wasFresh;
      throw error;
    }
    navigate(doc.projectId ? "/project/" + doc.projectId : "/home", {replace: true});
  };

  const exportFountain = () => {
    const file = new Blob([toFountain(blocks, doc.name, author)], {type: "text/plain"});
    const link = window.document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = fileName(doc.name);
    link.click();
    URL.revokeObjectURL(link.href);
    setShowMenu(false);
  };

  // which draft this is, by when it was made among the project's documents
  const draftPosition = Math.max(0, inDraftOrder(projectDocs).findIndex(other => other.id === doc.id));

  const statusText = saveStatus === "saving" ? "Saving…"
    : saveStatus === "error" ? "Not saved"
    : savedAt ? "Updated at " + clock(savedAt) : "All changes saved";

  const sceneSidebar = (
    <SceneSidebar
      scenes={scenes}
      currentId={currentScene?.id}
      onSelect={goToScene}
      onAddScene={addScene}
      onCollapse={toggleLeft}
    />
  );
  const projectSidebar = (
    <ProjectSidebar
      projectId={doc.projectId}
      projectName={projectName}
      documents={projectDocs.length > 0 ? projectDocs : [{id: doc.id, name: doc.name, description: doc.description, lastUpdated: doc.lastUpdated, createdOn: doc.createdOn}]}
      currentId={doc.id}
      onCollapse={toggleRight}
    />
  );

  return (
    <div className="sw sw-rev sw-screen-in flex h-screen w-screen">
      {showEdit && (
        <EditDetails
          kind="document"
          details={{name: doc.name, description: doc.description ?? ""}}
          onSave={saveDetails}
          onClose={() => setShowEdit(false)}
          onDelete={removeDocument}
          deleteMessage="The document and everything written in it go for good. This can't be undone. Later drafts move up a colour."
        >
          <ProjectField current={doc.projectId} />
        </EditDetails>
      )}

      {/* left: scenes */}
      <Rail side="left" open={leftOpen} docked={docked} width={280} label="Scenes" onClose={toggleLeft}>{sceneSidebar}</Rail>

      {/* middle: the writing */}
      <div className="no-print relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 px-[14px]">
          {!leftOpen && (
            <button type="button" className="sw-icon" onClick={toggleLeft} aria-label="Show scenes" title="Show scenes">
              <StrokeIcon name="panelLeft" />
            </button>
          )}
          {/* where the document sits, ending in its name, then when it was saved */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Breadcrumb trail={trail} current={<h1 className="truncate text-base font-bold">{doc.name}</h1>} />
            {/* a project's only document needs no number */}
            {projectDocs.length > 1 && <RevisionChip position={draftPosition} className="!h-6 shrink-0 !px-2.5 text-sm max-sm:!hidden" />}
          </div>
          {/* phones keep only the news that needs seeing: saving, or a failure */}
          <p
            role="status"
            aria-live="polite"
            className={"shrink-0 whitespace-nowrap px-1.5 text-sm" + (saveStatus === "saved" ? " max-sm:sr-only" : "")}
            style={{color: saveStatus === "error" ? "var(--signal)" : "var(--muted)"}}
          >
            {statusText}
            {saveStatus === "error" && (
              <button type="button" className="ml-2 underline underline-offset-2" onClick={() => save(blocks)}>Retry</button>
            )}
          </p>

          {/* tabbing out of the menu closes it */}
          <div ref={menuRef} className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setShowMenu(false); }}>
            <button ref={menuButtonRef} type="button" className="sw-icon" onClick={() => setShowMenu(!showMenu)} aria-label="More" title="More" aria-expanded={showMenu} aria-controls="document-menu">
              <StrokeIcon name="dots" />
            </button>
            {showMenu && (
              <div id="document-menu" className="sw-float absolute right-0 top-11 z-50 w-60 rounded-[10px] py-1.5">
                <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); setShowEdit(true); }}>Edit details</button>
                <button type="button" className="sw-menu-item" onClick={exportFountain}>Export as Fountain</button>
                <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); window.print(); }}>Print or save as PDF</button>
              </div>
            )}
          </div>
          {!rightOpen && (
            <button type="button" className="sw-icon" onClick={toggleRight} aria-label="Show project" title="Show project">
              <StrokeIcon name="panelRight" />
            </button>
          )}
        </header>

        {/* narrow screens: where you are, and the way into the scene list */}
        {!docked && currentScene && (
          <button
            type="button"
            onClick={toggleLeft}
            className="sw-row mx-2 mb-1 flex shrink-0 items-center gap-2 px-3 py-2 text-left text-sm"
            aria-label={"Scene " + currentScene.number + ", show all scenes"}
          >
            <span className="sw-row-meta text-sm">{currentScene.number}</span>
            <span className="min-w-0 truncate font-bold">{titleCase(headingParts(currentScene.heading).location) || "Untitled scene"}</span>
            <span className="sw-row-meta shrink-0 text-xs">{[placeLabel(headingParts(currentScene.heading).place), titleCase(headingParts(currentScene.heading).time)].filter(Boolean).join(" · ")}</span>
            <span className="ml-auto text-[color:var(--muted)]"><StrokeIcon name="chevronDown" size={16} /></span>
          </button>
        )}

        <div className="sw-desk min-h-0 flex-1 overflow-y-auto px-4">
          <main className="pb-36 pt-4">
            {/* keyed, so switching documents settles the new page in */}
            <div key={documentId} className="sp-page mx-auto">
              <ScriptEditor
                ref={editor}
                blocks={blocks}
                setBlocks={updateBlocks}
                activeId={activeId}
                setActiveId={setActiveId}
              />
            </div>
          </main>
        </div>

        {/* floating status bar and help */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between gap-2 px-4 sm:bottom-5 sm:gap-3 sm:px-5">
          <div className="pointer-events-auto">
            <BottomBar
              page={activeId ? layout.pageOf.get(activeId) : undefined}
              pages={layout.pages}
              words={words}
              element={activeBlock?.type}
              onElementChange={setActiveType}
              scene={currentScene?.number ?? 0}
              scenes={scenes.filter(scene => scene.number > 0).length}
              time={totalRuntime(scenes)}
            />
          </div>
          <div ref={helpRef} className="pointer-events-auto relative">
            <button
              type="button"
              className="sw-float flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-[color:var(--ui)] hover:bg-[color:var(--wash)]"
              onClick={() => setShowHelp(!showHelp)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
              aria-expanded={showHelp}
            >
              ?
            </button>
            {showHelp && (
              <div className="sw-float absolute bottom-12 right-0 z-50 max-h-[calc(100vh-8rem)] w-[25rem] max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-lg">
                <ShortcutHelp />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* right: the project's documents */}
      <Rail side="right" open={rightOpen} docked={docked} width={300} label="Project" onClose={toggleRight}>{projectSidebar}</Rail>

      <PrintScript blocks={settled ?? blocks} title={doc.name} author={author} />
    </div>
  );
};

export default DocumentView;
