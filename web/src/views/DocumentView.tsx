// external imports
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { get, onValue } from "firebase/database";

// data
import Document from "@storia/core/datatypes/Document";
import { BasicBlock } from "@storia/core/datatypes/Block";
import { Details, deleteDocument, writeDocumentData, getBoardRef, getDocumentRef, getFolderRef, getProjectRef, getUser, saveDocumentContent, touchParents, updateDocumentDetails } from "../firebase/database";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";
import { readBlocks } from "@storia/core/screenplay/content";
import { toFountain } from "@storia/core/screenplay/fountain";
import { headingParts, sceneOf, toScenes, totalRuntime, wordCount } from "@storia/core/screenplay/structure";
import { paginate } from "@storia/core/screenplay/pages";

// components
import Loading from "../components/Loading";
import Rail from "../components/Rail";
import { EditorSkeleton } from "../components/Skeletons";
import Breadcrumb, { Crumb } from "../components/Breadcrumb";
import { rememberBoard, rememberContent, rememberDocument, rememberProject, seenBoard, seenDocument, seenFolder, seenProject } from "../misc/seen";
import { Board, cardsByScene, readBoard } from "@storia/core/board/board";
import { useProjectScripts } from "../board/scripts";
import LoadError from "../components/LoadError";
import ScriptEditor, { Found, ScriptEditorHandle } from "../components/screenplay/ScriptEditor";
import FindBar from "../components/screenplay/FindBar";
import { Search } from "../screenplay/editor/find";
import { isMac } from "../misc/keys";
import EditDetails from "./edit/EditDetails";
import NewDraft from "./create/NewDraft";
import DeleteDocument from "./edit/DeleteDocument";
import { generateDate } from "../misc/forms";
import { randomString } from "@storia/core/misc/randomString";
import ExportDialog from "../components/screenplay/ExportDialog";
import HistoryDialog from "../components/screenplay/HistoryDialog";
import { keepVersion } from "../firebase/history";
import { VERSION_EVERY_MS } from "@storia/core/screenplay/history";
import { logError } from "../misc/monitoring";
import { download, fileName } from "../misc/download";
import { makePdf } from "../screenplay/pdfFile";
import ProjectField from "./edit/ProjectField";
import { placeLabel, titleCase } from "@storia/core/screenplay/cast";
import SceneSidebar from "../components/screenplay/SceneSidebar";
import ProjectSidebar, { ProjectDocument } from "../components/screenplay/ProjectSidebar";
import BottomBar from "../components/screenplay/BottomBar";
import ShortcutHelp from "../components/screenplay/ShortcutHelp";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { useEscape } from "../misc/forms";
import { useMedia } from "../misc/media";
import { readPanel, writePanel } from "../misc/panels";

// additional imports
import { useTitle } from "../misc/title";
import { toMessage } from "@storia/core/misc/errors";
import "../screenplay/screenplay.css";
import { inDraftOrder, ordinal, revisionAt } from "../screenplay/revisions";
import "../screenplay/world.css";
import ShowRail from "../components/ShowRail";
import Bar from "../components/Bar";

type SaveStatus = "saved" | "saving" | "error";

const SAVE_DELAY_MS = 800;
// every arrival in the editor, and every switch to another document, opens on
// the skeleton for at least this long before the page settles in over it, even
// when the script is already to hand
const SKELETON_MS = 150;
// below this the sidebars overlay the page instead of sitting beside it
const DOCKED = "(min-width: 900px)";
// below this, the rails rise from the bottom as sheets rather than sliding in from the sides
const PHONE = "(max-width: 639px)";


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
  const [board, setBoard] = useState<Board | undefined>(() => { const projectId = seenDocument(documentId)?.projectId; return projectId ? seenBoard(projectId) : undefined; });
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
  const [showExport, setShowExport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNewDraft, setShowNewDraft] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  // the find bar, open with what it was opened to look for, and what it found
  const [findSeed, setFindSeed] = useState<{text: string, at: number}>();
  const [found, setFound] = useState<Found>({count: 0, current: -1});
  // whether the card shows the replacing under the find field
  const [findExpanded, setFindExpanded] = useState(false);
  const lastSearch = useRef<Search>({query: ""});
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
  const phone = useMedia(PHONE);

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
  // when this visit last kept a version of the stored script (firebase/history);
  // unset until the first save, which always keeps one
  const versionedAt = useRef<number>();

  useTitle(doc ? doc.name : "Document");

  // load the document once; the editor owns the content after that
  useEffect(() => {
    let cancelled = false;
    fresh.current = false;
    dirty.current = false;
    versionedAt.current = undefined;
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

  // the project's board, live, since the project rail can show and edit it
  useEffect(() => {
    setBoard(parentId ? seenBoard(parentId) : undefined);
    if (!parentId) return;
    return onValue(getBoardRef(parentId), (snapshot) => {
      const found = readBoard(snapshot.val());
      rememberBoard(parentId, found);
      setBoard(found);
    }, () => {});
  }, [parentId]);

  const updateBlocks = useCallback((update: (blocks: ScriptBlock[]) => ScriptBlock[]) => {
    dirty.current = true;
    setBlocks(current => current && update(current));
  }, []);

  const save = useCallback(async (content: ScriptBlock[]) => {
    setSaveStatus("saving");
    try {
      // before the stored script is replaced, keep it in the history: on this
      // visit's first save, then every ten minutes. A history that fails to
      // keep one is reported, and never holds up the save
      if (!versionedAt.current || Date.now() - versionedAt.current >= VERSION_EVERY_MS) {
        versionedAt.current = Date.now();
        await keepVersion(documentId).catch(error => logError("keep version", error));
      }
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

  // ⌘F opens the find card as find alone (or takes the focus back to it) over the
  // browser's own find, which can't see past the page drawn so far or replace;
  // its chevron shows the replacing. ⌘G and Shift+⌘G step through the matches
  // while it's open. Not while a dialog is up
  const findOpen = findSeed !== undefined;
  // the find card's height and its gap from the desk's top, with a line to spare,
  // so a match is never scrolled in under it: one row for find alone, three
  // with the replacing (touch's 40px controls make each the taller)
  const findClearance = findExpanded ? 200 : 100;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = isMac ? event.metaKey : event.ctrlKey;
      if (!mod || event.altKey || !editor.current || document.querySelector("dialog[open]")) return;
      // by the key's place, since ⌥ changes the letter it types on a Mac
      // the script's own PDF in place of printing the screen
      if (event.code === "KeyP" && !event.shiftKey) {
        event.preventDefault();
        setShowExport(true);
      } else if (event.code === "KeyF" && !event.shiftKey) {
        event.preventDefault();
        setFindSeed({text: editor.current.selectedText() || lastSearch.current.query, at: Date.now()});
      } else if (event.code === "KeyG" && findOpen) {
        event.preventDefault();
        if (event.shiftKey) editor.current.findPrevious();
        else editor.current.findNext();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [findOpen]);
  const closeFind = useCallback((search: Search) => {
    lastSearch.current = search;
    setFindSeed(undefined);
    // ⌘F opens find alone again next time
    setFindExpanded(false);
  }, []);

  // what's worked out from the whole script (scenes, word count, the page
  // count) follows a step behind the typing, so a keystroke paints first
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

  // "New scene": the editor adds it (or uses an empty one waiting at the end), as an edit it can undo
  const addScene = useCallback(() => {
    editor.current?.insertScene();
    if (!docked) setLeftOpen(false);
  }, [docked]);

  // the project's drafts for the board's scene and character links, this one live
  const draftNames = useMemo(() => Object.fromEntries(projectDocs.map(other => [other.id, {name: other.name}])), [projectDocs]);
  const live = useMemo(() => doc && settled ? {id: doc.id, blocks: settled} : undefined, [doc, settled]);
  const scripts = useProjectScripts(doc?.projectId ? draftNames : undefined, live);
  // which of this draft's scenes have a card, for the scene list
  const sceneCards = useMemo(() => {
    const found = new Map<string, string[]>();
    if (board && doc) cardsByScene(board, doc.id).forEach((cards, sceneId) => found.set(sceneId, cards.map(card => card.title || "Untitled card")));
    return found;
  }, [board, doc]);

  // a scene link from a card opens its draft here, at that scene: once the
  // script is on the page, go to it, then forget it so a reload doesn't
  const location = useLocation();
  const askedScene = (location.state as {scene?: string} | null)?.scene;
  useEffect(() => {
    if (!askedScene || !blocks || !skeletonShown) return;
    let tries = 0;
    let frame = 0;
    const attempt = () => {
      if (editor.current) {
        editor.current.focusBlock(askedScene, "start");
        navigate(location.pathname, {replace: true, state: null});
      } else if (tries++ < 60) frame = requestAnimationFrame(attempt);
    };
    attempt();
    return () => cancelAnimationFrame(frame);
  }, [askedScene, blocks, skeletonShown, navigate, location.pathname]);

  // a scene link in the side peek: in this draft, go straight to it; in another, open that one there
  const openScene = useCallback((docId: string, sceneId: string) => {
    if (doc && docId === doc.id) goToScene(sceneId);
    else navigate("/document/" + docId, {state: {scene: sceneId}});
  }, [doc, goToScene, navigate]);

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/account/login" />
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

  // the status bar's element menu: the editor changes the element, as an edit it can undo
  const setActiveType = (type: ElementType) => editor.current?.setType(type);

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

  // restoring a version: the script as it is now is saved and kept in the
  // history first, so the restore can itself be undone from there; if that
  // fails, the page stays as it is. The version then replaces the page and
  // autosaves like any change
  const restoreVersion = async (restored: ScriptBlock[]) => {
    if (dirty.current && latest.current) await saveDocumentContent(documentId, latest.current);
    versionedAt.current = Date.now();
    await keepVersion(documentId);
    dirty.current = true;
    setBlocks(restored);
    setShowHistory(false);
  };

  // a new draft in the same project, blank or as a copy of the page as it is
  // now, unsaved words and all; this one's pending save still goes on leaving it
  const createDraft = async (details: Details, copy: boolean) => {
    const draft: Document = {
      id: randomString(10),
      ...details,
      isPublic: false,
      projectId: doc.projectId,
      owner: doc.owner,
      createdOn: generateDate(),
      content: copy ? latest.current ?? blocks : [{id: randomString(8), type: "heading", text: ""}],
    };
    await writeDocumentData(draft, doc.projectId);
    rememberDocument(draft);
    // and listed in the remembered project, so the rail and the chip count it from the first frame
    const project = doc.projectId ? seenProject(doc.projectId) : undefined;
    if (project) rememberProject({...project, documents: {...project.documents, [draft.id]: {id: draft.id, name: draft.name} as BasicBlock}});
    setShowNewDraft(false);
    navigate("/document/" + draft.id);
  };

  const exportFountain = () => {
    download(new Blob([toFountain(blocks, doc.name, author)], {type: "text/plain"}), fileName(doc.name, "fountain"));
    setShowExport(false);
  };

  // the dialog stays up while the PDF is made, and shows it if that fails
  const exportPdf = async () => {
    try {
      download(await makePdf({blocks, title: doc.name, author}), fileName(doc.name, "pdf"));
    } catch (error) {
      logError("export pdf", error);
      throw error;
    }
    setShowExport(false);
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
      sceneCards={sceneCards}
      onCollapse={toggleLeft}
      asSheet={phone}
    />
  );
  const projectSidebar = (
    <ProjectSidebar
      projectId={doc.projectId}
      projectName={projectName}
      documents={projectDocs.length > 0 ? projectDocs : [{id: doc.id, name: doc.name, description: doc.description, lastUpdated: doc.lastUpdated, createdOn: doc.createdOn}]}
      currentId={doc.id}
      board={board}
      scripts={scripts}
      onOpenScene={openScene}
      onCollapse={toggleRight}
      asSheet={phone}
    />
  );

  return (
    <div className="sw sw-rev sw-screen-in flex h-screen w-screen">
      {showExport && (
        <ExportDialog name={doc.name} onPdf={exportPdf} onFountain={exportFountain} onClose={() => setShowExport(false)} />
      )}
      {showHistory && (
        <HistoryDialog documentId={doc.id} name={doc.name} current={latest.current ?? blocks} onRestore={restoreVersion} onClose={() => setShowHistory(false)} />
      )}
      {showNewDraft && (
        <NewDraft name={doc.name} position={Math.max(projectDocs.length, draftPosition + 1)} onCreate={createDraft} onClose={() => setShowNewDraft(false)} />
      )}
      {showEdit && (
        <EditDetails
          kind="document"
          details={{name: doc.name, description: doc.description ?? ""}}
          onSave={saveDetails}
          onClose={() => setShowEdit(false)}
        >
          <ProjectField current={doc.projectId} />
        </EditDetails>
      )}
      {showDelete && <DeleteDocument name={doc.name} onConfirm={removeDocument} onClose={() => setShowDelete(false)} />}

      {/* left: scenes */}
      <Rail side="left" open={leftOpen} docked={docked} sheet={phone} width={280} label="Scenes" onClose={toggleLeft}>{sceneSidebar}</Rail>

      {/* middle: the writing */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Bar
          // phones open the scenes from the tab bar, so the bar starts with the wordmark alone, kept beside the trail
          start={phone
            ? <Link to="/home" className="logo sw-logo-kept shrink-0 text-xl leading-none hover:opacity-80">Storia</Link>
            : !leftOpen && <ShowRail label="Show scenes" onShow={toggleLeft} />}
          className="sw-bar-centred"
          // where the document sits, ending in its name and which draft it is
          middle={<>
            <Breadcrumb trail={trail} current={<h1 className="truncate text-base font-bold">{doc.name}</h1>} />
            {/* in words, not a chip: no pills in a bar. A project's only document needs no number */}
            {projectDocs.length > 1 && (
              <span className="shrink-0 whitespace-nowrap text-sm text-[color:var(--muted)] max-sm:hidden" title={revisionAt(draftPosition).name + " pages"}>
                <span aria-hidden="true">· </span>{ordinal(draftPosition + 1)} draft
              </span>
            )}
          </>}
          end={<>
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
                  {/* the way in without a keyboard; with one, it's ⌘F */}
                  <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); setFindSeed({text: editor.current?.selectedText() || lastSearch.current.query, at: Date.now()}); }}>Find</button>
                  <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); setShowEdit(true); }}>Edit details</button>
                  {doc.projectId && (
                    <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); setShowNewDraft(true); }}>New draft</button>
                  )}
                  <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); setShowHistory(true); }}>History</button>
                  <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); setShowExport(true); }}>Export</button>
                  <div role="separator" className="my-1.5 border-t border-[color:var(--rule)]" />
                  <button type="button" className="sw-menu-item" onClick={() => { setShowMenu(false); setShowDelete(true); }}>Delete</button>
                </div>
              )}
            </div>
            {!rightOpen && !phone && (
              <button type="button" className="sw-icon" onClick={toggleRight} aria-label="Show project" title="Show project">
                <StrokeIcon name="panelRight" />
              </button>
            )}
          </>}
        />

        {/* narrow screens: where you are, and the way into the scene list (on phones, the tab bar says it) */}
        {!docked && !phone && currentScene && (
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

        {/* the desk, with the status bar and help floating at its foot */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="sw-desk min-h-0 flex-1 overflow-y-auto px-4">
            <main className="pb-36 pt-4">
              {/* keyed, so switching documents settles the new page in */}
              <div key={documentId} className="sp-page mx-auto">
                <ScriptEditor ref={editor} blocks={blocks} setBlocks={updateBlocks} activeId={activeId} setActiveId={setActiveId} onFound={setFound} clearTop={findOpen ? findClearance : undefined} />
              </div>
            </main>
          </div>

          {/* keyed, so another document's editor takes up the same query */}
          {findSeed && <FindBar key={documentId} editor={editor} found={found} seed={findSeed} wholeWord={lastSearch.current.wholeWord ?? false} expanded={findExpanded} onExpand={setFindExpanded} onClose={closeFind} />}

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

        {/* phones: the way into the two sheets, at the thumb */}
        {phone && (
          <nav className="sw-tabbar" aria-label="Editor">
            <button
              type="button"
              className="sw-tab min-w-0 flex-1"
              onClick={toggleLeft}
              aria-expanded={leftOpen}
              aria-label={currentScene && currentScene.number > 0 ? "Scene " + currentScene.number + ", show all scenes" : "Show scenes"}
            >
              {currentScene && currentScene.number > 0 ? <>
                <span className="sw-fig shrink-0 text-[color:var(--muted)]">{currentScene.number}</span>
                <span className="min-w-0 truncate font-bold">{titleCase(headingParts(currentScene.heading).location) || "Untitled scene"}</span>
              </> : <span className="font-bold">Scenes</span>}
              <span className="ml-auto shrink-0 text-[color:var(--muted)]"><StrokeIcon name="chevronUp" size={16} /></span>
            </button>
            <button type="button" className="sw-tab shrink-0" onClick={toggleRight} aria-expanded={rightOpen}>
              <StrokeIcon name="pages" />
              <span className="font-bold">Project</span>
            </button>
          </nav>
        )}
      </div>

      {/* right: the project's documents */}
      <Rail side="right" open={rightOpen} docked={docked} sheet={phone} width={300} label="Project" onClose={toggleRight}>{projectSidebar}</Rail>

    </div>
  );
};

export default DocumentView;
