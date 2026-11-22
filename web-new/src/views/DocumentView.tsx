// external imports
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { get } from "firebase/database";
import { faFileArrowDown, faKeyboard, faListUl, faPrint } from "@fortawesome/free-solid-svg-icons";

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
import HeaderButton from "../components/HeaderButton";
import ViewTopBar from "../components/ViewTopBar";
import ScriptEditor, { ScriptEditorHandle } from "../components/screenplay/ScriptEditor";
import SceneNavigator from "../components/screenplay/SceneNavigator";
import ShortcutHelp from "../components/screenplay/ShortcutHelp";
import PrintScript from "../components/screenplay/PrintScript";
import { useEscape } from "../components/CreatePage";

// additional imports
import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import { randomString } from "../misc/randomString";
import { createLink } from "./create/CreateAccount";
import "../screenplay/screenplay.css";

type SaveStatus = "saved" | "saving" | "error";

const SAVE_DELAY_MS = 800;

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
  const [showScenes, setShowScenes] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
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

  const statusText = saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Couldn't save" : "All changes saved";

  return (
    <div className="flex h-screen w-screen">
      <div className="no-print flex flex-col min-w-0 w-full h-full">
        <ViewTopBar
          isSidebarVisible={true}
          toggleSidebarVisible={() => {}}
          backTo={backTo}
          backLabel={projectName ? "Back to " + projectName : "Back"}
          breadcrumb={<>
            {projectName && doc.projectId && <>
              {createLink({text: projectName, href: backTo}, "text-sm")}
              <span className="mx-1.5 text-neutral-400" aria-hidden="true">/</span>
            </>}
            <span aria-current="page" className="font-semibold">{doc.name}</span>
          </>}
          activity=""
        >
          <p
            role="status"
            aria-live="polite"
            className={"hidden md:block mx-2 shrink-0 text-xs " + (saveStatus === "error" ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400")}
          >
            {statusText}
            {saveStatus === "error" && (
              <button type="button" className="ml-2 font-semibold text-purple hover:underline" onClick={() => save(blocks)}>Retry</button>
            )}
            {pages > 0 && <span className="ml-3">About {pages} {pages === 1 ? "page" : "pages"}</span>}
          </p>

          <label htmlFor="element-type" className="sr-only">Element type</label>
          <select
            id="element-type"
            value={activeBlock?.type ?? ""}
            disabled={!activeBlock}
            onChange={event => setActiveType(event.target.value as ElementType)}
            className="ml-2 h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm text-purple disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800"
          >
            {!activeBlock && <option value="">Element</option>}
            {ELEMENTS.map(element => (
              <option key={element.type} value={element.type}>{element.label}</option>
            ))}
          </select>

          <HeaderButton icon={faListUl} label={showScenes ? "Hide scenes" : "Show scenes"} onClick={() => setShowScenes(!showScenes)} expanded={showScenes} />
          <HeaderButton icon={faFileArrowDown} label="Export as Fountain" onClick={exportFountain} />
          <HeaderButton icon={faPrint} label="Print or save as PDF" onClick={() => window.print()} />
          <div ref={helpRef} className="relative">
            <HeaderButton icon={faKeyboard} label="Keyboard shortcuts" onClick={() => setShowHelp(!showHelp)} expanded={showHelp} />
            {showHelp && (
              <div className="absolute right-0 top-10 z-50 w-[22rem] max-w-[calc(100vw-2rem)] rounded-md border border-neutral-100 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                <ShortcutHelp />
              </div>
            )}
          </div>
        </ViewTopBar>

        <div className="relative flex min-h-0 flex-1">
          {showScenes && <>
            {/* on small screens the scene list overlays the page */}
            <div className="fixed inset-0 z-30 bg-neutral-900/30 lg:hidden" onClick={() => setShowScenes(false)} aria-hidden="true" />
            <aside className="absolute inset-y-0 left-0 z-40 w-64 shrink-0 bg-purple-tint shadow-xl dark:bg-purple lg:static lg:shadow-none">
              <SceneNavigator
                blocks={blocks}
                activeId={activeId}
                onSelect={sceneId => {
                  editor.current?.focusBlock(sceneId);
                  if (!window.matchMedia("(min-width: 1024px)").matches) setShowScenes(false);
                }}
              />
            </aside>
          </>}

          <main className="min-w-0 flex-1 overflow-y-auto bg-neutral-100 px-4 py-6 dark:bg-neutral-950 sm:py-10">
            <p className="mb-3 text-center text-xs text-neutral-500 dark:text-neutral-400 md:hidden" role="status">
              {statusText}{pages > 0 && " · About " + pages + (pages === 1 ? " page" : " pages")}
            </p>
            <div className="sp-page mx-auto rounded-sm bg-white text-neutral-900 shadow dark:bg-neutral-900 dark:text-neutral-100">
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
      </div>

      <PrintScript blocks={blocks} title={doc.name} author={author} />
    </div>
  );
};

export default DocumentView;
