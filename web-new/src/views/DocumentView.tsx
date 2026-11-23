// external imports
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { get } from "firebase/database";

// data
import Document from "../datatypes/Document";
import { getDocumentRef, getProjectRef, getUser, saveDocumentContent } from "../firebase/database";
import { ElementType, ScriptBlock, isElementType } from "../screenplay/types";
import { textForType } from "../screenplay/flow";
import { toFountain } from "../screenplay/fountain";
import { headingParts, sceneOf, toScenes, totalRuntime, wordCount } from "../screenplay/structure";

// components
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import ScriptEditor, { ScriptEditorHandle } from "../components/screenplay/ScriptEditor";
import { titleCase } from "../components/screenplay/cast";
import SceneSidebar from "../components/screenplay/SceneSidebar";
import ProjectSidebar, { ProjectDocument } from "../components/screenplay/ProjectSidebar";
import BottomBar from "../components/screenplay/BottomBar";
import ShortcutHelp from "../components/screenplay/ShortcutHelp";
import PrintScript from "../components/screenplay/PrintScript";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { useEscape } from "../components/CreatePage";

// additional imports
import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import { randomString } from "../misc/randomString";
import "../screenplay/screenplay.css";
import "../screenplay/world.css";

type SaveStatus = "saved" | "saving" | "error";

const SAVE_DELAY_MS = 800;
// below this the sidebars overlay the page instead of sitting beside it
const DOCKED = "(min-width: 900px)";

// stored content may be an array or (from older writes) an object keyed by index
const readBlocks = (content: unknown): ScriptBlock[] => {
  const raw = Array.isArray(content) ? content : content && typeof content === "object" ? Object.values(content) : [];
  const blocks = raw
    .filter((block): block is ScriptBlock => Boolean(block) && isElementType(block.type))
    .map(block => ({id: block.id ?? randomString(8), type: block.type, text: block.text ?? ""}));
  return blocks.length > 0 ? blocks : [{id: randomString(8), type: "heading", text: ""}];
};

const fileName = (name: string) => (name.trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, " ") || "screenplay") + ".fountain";

const clock = (date: Date) => date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

// remembered per viewer; storage can be unavailable, so every access is guarded
const readPanel = (key: string, fallback: boolean) => {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : saved === "true";
  } catch { return fallback; }
};
const writePanel = (key: string, open: boolean) => {
  try { localStorage.setItem(key, String(open)); } catch { /* not persisted */ }
};

const DocumentView = () => {
  const { id } = useParams<string>();
  const documentId = id ?? "";

  const [doc, setDoc] = useState<Document>();
  const [blocks, setBlocks] = useState<ScriptBlock[]>();
  const [projectName, setProjectName] = useState<string>();
  const [projectDocs, setProjectDocs] = useState<ProjectDocument[]>([]);
  const [author, setAuthor] = useState<string>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);

  const [activeId, setActiveId] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [savedAt, setSavedAt] = useState<Date>();
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // sidebars: docked beside the page on wide screens, overlays on narrow ones
  const [docked, setDocked] = useState(() => window.matchMedia(DOCKED).matches);
  const [leftOpen, setLeftOpen] = useState(() => docked && readPanel("editorScenes", window.innerWidth >= 1100));
  const [rightOpen, setRightOpen] = useState(() => docked && readPanel("editorProject", window.innerWidth >= 1360));

  const editor = useRef<ScriptEditorHandle>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // unsaved edits, so they can be flushed when leaving the page
  const dirty = useRef(false);
  const latest = useRef<ScriptBlock[]>();
  latest.current = blocks;

  useTitle(doc ? doc.name : "Document");

  // load the document once; the editor owns the content after that
  useEffect(() => {
    let cancelled = false;

    get(getDocumentRef(documentId)).then(async snapshot => {
      if (cancelled) return;
      if (!snapshot.exists()) return setNotFound(true);

      const data: Document = {id: documentId, ...snapshot.val()};
      setDoc(data);
      setBlocks(readBlocks(data.content));
      if (data.lastUpdated) setSavedAt(new Date(data.lastUpdated));

      // the project's name and its other documents, for the right sidebar
      if (data.projectId) {
        get(getProjectRef(data.projectId)!).then(async project => {
          if (cancelled || !project.exists()) return;
          setProjectName(project.val().name);
          const ids = Object.keys(project.val().documents ?? {});
          const docs = await Promise.all(ids.map(docId =>
            get(getDocumentRef(docId))
              .then(other => other.exists() ? {id: docId, ...other.val()} as ProjectDocument : undefined)
              .catch(() => undefined)
          ));
          if (!cancelled) setProjectDocs(docs.filter((other): other is ProjectDocument => Boolean(other)));
        }).catch(() => {});
      }
      getUser(data.owner).then(user => {
        if (!cancelled && user) setAuthor(user.firstName + " " + user.lastName);
      });
    }).catch(error => !cancelled && setLoadError(toMessage(error)));

    return () => { cancelled = true; };
  }, [documentId]);

  const updateBlocks = useCallback((update: (blocks: ScriptBlock[]) => ScriptBlock[]) => {
    dirty.current = true;
    setBlocks(current => current && update(current));
  }, []);

  const save = useCallback(async (content: ScriptBlock[]) => {
    setSaveStatus("saving");
    try {
      await saveDocumentContent(documentId, content);
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
    if (!blocks || !dirty.current) return;
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
      if (dirty.current && latest.current) saveDocumentContent(documentId, latest.current).catch(() => {});
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

  if (!doc || !blocks) {
    return <div className="flex h-screen w-screen"><Loading /></div>
  }

  const activeBlock = blocks.find(block => block.id === activeId);
  const backTo = doc.projectId ? "/project/" + doc.projectId : "/home";

  const scenes = toScenes(blocks);
  const currentScene = sceneOf(scenes, activeId) ?? scenes.find(scene => scene.number > 0) ?? scenes[0];

  const toggleLeft = () => {
    const next = !leftOpen;
    setLeftOpen(next);
    if (docked) writePanel("editorScenes", next); else setRightOpen(false);
  };
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

  const goToScene = (sceneId: string) => {
    editor.current?.focusBlock(sceneId, "start");
    if (!docked) setLeftOpen(false);
  };

  // "Add more": a new scene heading at the end of the script
  const addScene = () => {
    const last = blocks[blocks.length - 1];
    if (last && last.type === "heading" && last.text.trim() === "") return goToScene(last.id);
    const heading: ScriptBlock = {id: randomString(8), type: "heading", text: ""};
    updateBlocks(current => [...current, heading]);
    goToScene(heading.id);
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
    <div className="sw flex h-screen w-screen">
      {/* left: scenes */}
      {docked ? (
        leftOpen && <aside className="no-print h-full shrink-0" aria-label="Scenes">{sceneSidebar}</aside>
      ) : leftOpen && <>
        <div className="no-print fixed inset-0 z-40 bg-black/20" onClick={toggleLeft} aria-hidden="true" />
        <aside className="no-print fixed inset-y-0 left-0 z-50 shadow-xl" aria-label="Scenes">{sceneSidebar}</aside>
      </>}

      {/* middle: the writing */}
      <div className="no-print relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center gap-2 px-[14px]">
          {!leftOpen && (
            <button type="button" className="sw-icon" onClick={toggleLeft} aria-label="Show scenes" title="Show scenes">
              <StrokeIcon name="panelLeft" />
            </button>
          )}
          <Link to={backTo} className="sw-icon rounded-full bg-[color:var(--wash)]" aria-label={projectName ? "Back to " + projectName : "Back"} title={projectName ? "Back to " + projectName : "Back"}>
            <StrokeIcon name="back" size={16} />
          </Link>
          {/* the document's name with when it was saved beneath, as in the mobile app */}
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="truncate text-[14px] font-bold leading-[18px]" aria-current="page">{doc.name}</h1>
            <p role="status" aria-live="polite" className="truncate text-[11.5px] leading-4" style={{color: saveStatus === "error" ? "var(--signal)" : "var(--muted)"}}>
              {statusText}
              {saveStatus === "error" && (
                <button type="button" className="ml-2 underline underline-offset-2" onClick={() => save(blocks)}>Retry</button>
              )}
            </p>
          </div>

          <div ref={menuRef} className="relative">
            <button type="button" className="sw-icon" onClick={() => setShowMenu(!showMenu)} aria-label="More" title="More" aria-expanded={showMenu}>
              <StrokeIcon name="dots" />
            </button>
            {showMenu && (
              <div role="menu" className="sw-float absolute right-0 top-9 z-50 w-48 rounded-lg py-1.5 text-[13px]">
                <button role="menuitem" type="button" className="block w-full px-3.5 py-2 text-left hover:bg-[color:var(--wash)]" onClick={exportFountain}>Export as Fountain</button>
                <button role="menuitem" type="button" className="block w-full px-3.5 py-2 text-left hover:bg-[color:var(--wash)]" onClick={() => { setShowMenu(false); window.print(); }}>Print or save as PDF</button>
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
            className="sw-row mx-2 mb-1 flex shrink-0 items-center gap-2 px-2 py-1.5 text-left text-[13px]"
            aria-label={"Scene " + currentScene.number + ", show all scenes"}
          >
            <span className="sw-row-meta text-[12px]">{currentScene.number}</span>
            <span className="min-w-0 truncate font-semibold">{titleCase(headingParts(currentScene.heading).location) || "Untitled scene"}</span>
            <span className="sw-row-meta shrink-0 text-[11px]">{[headingParts(currentScene.heading).place, headingParts(currentScene.heading).time].filter(Boolean).map(titleCase).join(" · ")}</span>
            <span className="ml-auto text-[color:var(--muted)]"><StrokeIcon name="chevronDown" size={14} /></span>
          </button>
        )}

        <div className="sw-desk min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
          <main className="pb-36 pt-4">
            <div className="sp-page mx-auto">
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
              words={wordCount(blocks)}
              element={activeBlock?.type}
              onElementChange={setActiveType}
              scene={currentScene?.number ?? 0}
              time={totalRuntime(scenes)}
            />
          </div>
          <div ref={helpRef} className="pointer-events-auto relative">
            <button
              type="button"
              className="sw-float flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] text-[color:var(--accent)] hover:bg-[color:var(--wash)]"
              onClick={() => setShowHelp(!showHelp)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
              aria-expanded={showHelp}
            >
              ?
            </button>
            {showHelp && (
              <div className="sw-float absolute bottom-10 right-0 z-50 max-h-[calc(100vh-8rem)] w-[25rem] max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-lg">
                <ShortcutHelp />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* right: the project's documents */}
      {docked ? (
        rightOpen && <aside className="no-print h-full shrink-0" aria-label="Project">{projectSidebar}</aside>
      ) : rightOpen && <>
        <div className="no-print fixed inset-0 z-40 bg-black/20" onClick={toggleRight} aria-hidden="true" />
        <aside className="no-print fixed inset-y-0 right-0 z-50 shadow-xl" aria-label="Project">{projectSidebar}</aside>
      </>}

      <PrintScript blocks={blocks} title={doc.name} author={author} />
    </div>
  );
};

export default DocumentView;
