// external imports
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { get } from "firebase/database";

// data
import Document from "../datatypes/Document";
import { getDocumentRef, getProjectRef, getUser, saveDocumentContent } from "../firebase/database";
import { ELEMENTS, ElementType, ScriptBlock, isElementType } from "../screenplay/types";
import { textForType } from "../screenplay/flow";
import { estimatePages } from "../screenplay/pages";
import { toFountain } from "../screenplay/fountain";

// components
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import ScriptEditor, { ScriptEditorHandle } from "../components/screenplay/ScriptEditor";
import ScriptShape from "../components/screenplay/ScriptShape";
import SceneMasthead, { CastCode } from "../components/screenplay/SceneMasthead";
import { castCodes, sceneOf, toScenes } from "../screenplay/structure";
import ShortcutHelp from "../components/screenplay/ShortcutHelp";
import PrintScript from "../components/screenplay/PrintScript";
import { useEscape } from "../components/CreatePage";

// additional imports
import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import { randomString } from "../misc/randomString";
import "../screenplay/screenplay.css";
import "../screenplay/world.css";

type SaveStatus = "saved" | "saving" | "error";

const SAVE_DELAY_MS = 800;
const WIDE = "(min-width: 1280px)";

// stored content may be an array or (from older writes) an object keyed by index
const readBlocks = (content: unknown): ScriptBlock[] => {
  const raw = Array.isArray(content) ? content : content && typeof content === "object" ? Object.values(content) : [];
  const blocks = raw
    .filter((block): block is ScriptBlock => Boolean(block) && isElementType(block.type))
    .map(block => ({id: block.id ?? randomString(8), type: block.type, text: block.text ?? ""}));
  return blocks.length > 0 ? blocks : [{id: randomString(8), type: "heading", text: ""}];
};

const fileName = (name: string) => (name.trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, " ") || "screenplay") + ".fountain";

const DocumentView = () => {
  const { id } = useParams<string>();
  const documentId = id ?? "";

  const [doc, setDoc] = useState<Document>();
  const [blocks, setBlocks] = useState<ScriptBlock[]>();
  const [projectName, setProjectName] = useState<string>();
  const [author, setAuthor] = useState<string>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);

  const [activeId, setActiveId] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isWide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  const [showHelp, setShowHelp] = useState(false);

  const editor = useRef<ScriptEditorHandle>(null);
  const helpRef = useRef<HTMLDivElement>(null);

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

      if (data.projectId) {
        get(getProjectRef(data.projectId)!).then(project => {
          if (!cancelled && project.exists()) setProjectName(project.val().name);
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

  // three columns (scene, page, shape) on wide screens; stacked otherwise
  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const onChange = () => setWide(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // close the shortcut help on outside click or Escape
  const closeHelp = useCallback(() => setShowHelp(false), []);
  useEscape(closeHelp);
  useEffect(() => {
    if (!showHelp) return;
    const onPointerDown = (event: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) setShowHelp(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showHelp]);

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
  const pages = estimatePages(blocks);
  const backTo = doc.projectId ? "/project/" + doc.projectId : "/home";

  const scenes = toScenes(blocks);
  const codes = castCodes(scenes);
  const currentScene = sceneOf(scenes, activeId) ?? scenes.find(scene => scene.number > 0) ?? scenes[0];
  const linesBefore = scenes.slice(0, Math.max(0, scenes.indexOf(currentScene!))).reduce((total, scene) => total + scene.lines, 0);
  const page = Math.floor(linesBefore / 55) + 1;
  const sceneCount = scenes.filter(scene => scene.number > 0).length;

  const setActiveType = (type: ElementType) => {
    if (!activeBlock) return;
    updateBlocks(current => current.map(block =>
      block.id === activeBlock.id ? {...block, type, text: textForType(block.text, block.type, type)} : block));
    editor.current?.focusBlock(activeBlock.id);
  };

  const exportFountain = () => {
    const file = new Blob([toFountain(blocks, doc.name, author)], {type: "text/plain"});
    const link = window.document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = fileName(doc.name);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const goToScene = (sceneId: string) => editor.current?.focusBlock(sceneId, "start");

  const statusText = saveStatus === "saving" ? "Saving" : saveStatus === "error" ? "Not saved" : "Saved";

  const exportButtons = <>
    <button type="button" className="sw-box sw-caps" onClick={exportFountain} title="Download a .fountain file other screenwriting apps can open">Export</button>
    <button type="button" className="sw-box sw-caps" onClick={() => window.print()} title="Print, or save as PDF from the print dialog">Print</button>
  </>;

  const page_ = (
    <div className="sp-page mx-auto">
      <ScriptEditor
        ref={editor}
        blocks={blocks}
        setBlocks={updateBlocks}
        activeId={activeId}
        setActiveId={setActiveId}
      />
    </div>
  );

  return (
    <div className="sw flex h-screen w-screen flex-col">
      <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b border-[color:var(--hair)] px-4 sm:gap-4 sm:px-8">
        <Link to={backTo} className="sw-box sw-caps px-3" aria-label={projectName ? "Back to " + projectName : "Back"} title={projectName ? "Back to " + projectName : "Back"}>←</Link>
        <Link to="/home" className="sw-caps sw-wordmark hidden sm:block">Storia</Link>
        <nav aria-label="Breadcrumb" className="sw-caps flex min-w-0 items-center gap-3">
          {projectName && <>
            <span aria-hidden="true" className="hidden md:inline text-[color:var(--muted)]">/</span>
            <Link to={backTo} className="hidden md:inline truncate text-[color:var(--muted)] hover:text-[color:var(--ink)]">{projectName}</Link>
          </>}
          <span aria-hidden="true" className="hidden sm:inline text-[color:var(--muted)]">/</span>
          <span aria-current="page" className="truncate">{doc.name}</span>
        </nav>
        <div className="flex-1" />

        <p role="status" aria-live="polite" className="sw-caps hidden shrink-0 sm:block" style={{color: saveStatus === "error" ? "var(--signal)" : "var(--muted)"}}>
          {statusText}
          {saveStatus === "error" && (
            <button type="button" className="ml-3 underline underline-offset-4" onClick={() => save(blocks)}>Retry</button>
          )}
        </p>

        <label htmlFor="element-type" className="sr-only">Element type</label>
        <select
          id="element-type"
          value={activeBlock?.type ?? ""}
          disabled={!activeBlock}
          onChange={event => setActiveType(event.target.value as ElementType)}
          className="sw-select sw-caps max-w-[8.5rem] sm:max-w-[13.5rem]"
        >
          {!activeBlock && <option value="">Element</option>}
          {ELEMENTS.map(element => (
            <option key={element.type} value={element.type}>{element.label}</option>
          ))}
        </select>

        <div className="hidden gap-3 md:flex">{exportButtons}</div>

        <div ref={helpRef} className="relative">
          <button
            type="button"
            className="sw-box sw-caps px-3"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
            aria-expanded={showHelp}
            onClick={() => setShowHelp(!showHelp)}
          >
            ?
          </button>
          {showHelp && (
            <div className="absolute right-0 top-11 z-50 w-[25rem] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto border border-[color:var(--hair)] bg-white">
              <ShortcutHelp />
            </div>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isWide ? (
          <div className="mx-auto grid max-w-[1720px] grid-cols-[280px_minmax(0,1fr)_266px] gap-10 px-10">
            <aside className="no-print sticky top-0 self-start max-h-[calc(100vh-56px)] overflow-y-auto py-10">
              <SceneMasthead scene={currentScene} codes={codes} sceneCount={sceneCount} pages={pages} page={page} />
            </aside>
            <main className="min-w-0 pb-32 pt-8">{page_}</main>
            <aside className="no-print sticky top-0 self-start max-h-[calc(100vh-56px)] overflow-y-auto py-10">
              <p className="sw-caps sw-ruled">Shape</p>
              <p className="mt-3 mb-6 text-[13px] leading-5 text-[color:var(--muted)]">One line per scene. Its length follows the scene; its peaks are dialogue.</p>
              <ScriptShape scenes={scenes} currentId={currentScene?.id} onSelect={goToScene} />
            </aside>
          </div>
        ) : (
          <div className="px-4 sm:px-6">
            <div className="no-print sticky top-0 z-10 border-b border-[color:var(--rule)] bg-white pb-3 pt-3 sm:pt-4">
              <div className="flex items-end justify-between gap-4">
                <SceneMasthead scene={currentScene} codes={codes} sceneCount={sceneCount} pages={pages} page={page} compact />
                <div className="hidden shrink-0 gap-2 sm:flex md:hidden">{exportButtons}</div>
              </div>
              {currentScene && currentScene.cast.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2" aria-label="In this scene">
                  {currentScene.cast.map(name => (
                    <li key={name} className="flex items-center gap-2"><CastCode code={codes.get(name)} /><span className="sw-caps">{name}</span></li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <ScriptShape scenes={scenes} currentId={currentScene?.id} onSelect={goToScene} compact />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                <p role="status" className="sw-caps truncate" style={{color: saveStatus === "error" ? "var(--signal)" : "var(--muted)"}}>
                  {statusText} · p. {page}/{Math.max(pages, 1)}
                </p>
                <div className="flex shrink-0 gap-2 [&>button]:h-8 [&>button]:px-3">{exportButtons}</div>
              </div>
            </div>
            <main className="pb-32 pt-4">{page_}</main>
          </div>
        )}
      </div>

      <PrintScript blocks={blocks} title={doc.name} author={author} />
    </div>
  );
};

export default DocumentView;
