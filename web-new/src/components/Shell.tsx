import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, useLocation, useMatch, useOutlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import CreateFolder from "../views/create/CreateFolder";
import CreateProject from "../views/create/CreateProject";
import SettingsView from "../views/SettingsView";
import { Props } from "../views/create/CreateAccount";
import { ScreenHold } from "../misc/screenHold";
import "../screenplay/world.css";

// most screens draw at once from what the tab has already seen (misc/seen.ts).
// When one has to load, the previous screen stays up for at most this long;
// after it the next screen shows anyway, with its own spinner
const WAIT_MS = 300;

type Screen = { key: string, element: ReactNode };

type SlotProps = {
  onReady?: () => void,
  className: string,
  hidden?: boolean,
  children: ReactNode,
};

// one screen in the stack. It counts the Loading spinners inside it and
// reports ready on mount, or once the last of them goes.
const Slot = ({onReady, className, hidden, children}: SlotProps) => {
  const holds = useRef(0);
  const ready = useRef(onReady);
  ready.current = onReady;

  // checked a microtask later: StrictMode releases and re-takes a hold in one
  // go, and a spinner swapped for content can hand over to another
  const check = useCallback(() => {
    queueMicrotask(() => { if (holds.current === 0) ready.current?.(); });
  }, []);

  const hold = useCallback(() => {
    holds.current++;
    return () => {
      holds.current--;
      check();
    };
  }, [check]);

  // children's layout effects run first, so any hold is already counted here
  useLayoutEffect(check, [check]);

  return (
    <ScreenHold.Provider value={hold}>
      <div className={className} aria-hidden={hidden || undefined}>{children}</div>
    </ScreenHold.Provider>
  );
};

// the create dialogs' shared error state, for the rail's New folder
interface ShellProps extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void,
}

// the signed-in frame for home, folders and projects. The rail stays mounted
// across them, and a screen change never passes through an empty frame: if the
// next screen has to load, the previous one stays up, untouchable, until it's
// ready. The swap itself is immediate; only the content under the bar settles.
const Shell = ({isSidebarVisible, toggleSidebarVisible, ...formProps}: ShellProps) => {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const toggleNewFolder = () => setShowNewFolder(!showNewFolder);
  // undefined when closed; otherwise the folder to make it in, if any
  const [newProject, setNewProject] = useState<{folderId?: string}>();
  const openNewProject = (folderId?: string) => setNewProject({folderId});
  const closeNewProject = () => setNewProject(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => setShowSettings(!showSettings);

  const outlet = useOutlet();
  const { pathname } = useLocation();
  const folderMatch = useMatch("/folder/:id");
  const projectMatch = useMatch("/project/:id");
  // a project's board is still that project, as far as the rail is concerned
  const boardMatch = useMatch("/project/:id/board");
  const cardMatch = useMatch("/project/:id/board/:cardId");
  // the rail marks where the writer is going straight away
  const current = folderMatch?.params.id ?? projectMatch?.params.id ?? boardMatch?.params.id ?? cardMatch?.params.id;

  // front: the screen for the current path. back: the one it is replacing.
  // shown: whether front is visible yet. Neither is "entering" on first mount,
  // so arriving from the editor or a sign-in still settles in.
  const [nav, setNav] = useState<{key: string, back?: Screen, shown: boolean}>({key: pathname, shown: true});
  // the front screen's element as last rendered, to hold still once it's the back
  const frontElement = useRef<ReactNode>(outlet);

  if (nav.key !== pathname) {
    // whatever the writer can see now stays beneath: the front if it was
    // showing, otherwise the screen that was still waiting under it
    const visible = nav.shown || !nav.back ? {key: nav.key, element: frontElement.current} : nav.back;
    setNav(visible.key === pathname
      ? {key: pathname, shown: true}
      : {key: pathname, back: visible, shown: false});
  } else {
    frontElement.current = outlet;
  }

  // the next screen replaces the previous one outright: no dissolve, so two
  // screens never show through each other
  const reveal = useCallback((key: string) => {
    setNav(now => now.key === key && !now.shown ? {key: now.key, shown: true} : now);
  }, []);

  // don't hold the previous screen forever on a slow load
  useEffect(() => {
    if (nav.shown) return;
    const timer = setTimeout(() => reveal(nav.key), WAIT_MS);
    return () => clearTimeout(timer);
  }, [nav.shown, nav.key, reveal]);

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/" />
  }

  const slot = "col-start-1 row-start-1 flex min-h-0 min-w-0 bg-[color:var(--paper)]";

  return (
    <div className="sw sw-rev flex h-screen w-screen">
      {showNewFolder && <CreateFolder toggleShow={toggleNewFolder} {...formProps} />}
      {/* the rail's New project: in no folder from the Projects label, in a
          folder from that folder's row */}
      {newProject && <CreateProject toggleShow={closeNewProject} folderId={newProject.folderId} {...formProps} />}
      {showSettings && <SettingsView toggleSettings={toggleSettings} />}
      <Sidebar current={current} isSidebarVisible={isSidebarVisible} toggleSidebarVisible={toggleSidebarVisible} onNewFolder={toggleNewFolder} onNewProject={openNewProject} onSettings={toggleSettings} />
      <div className="grid h-screen min-w-0 flex-1 grid-cols-1 grid-rows-1">
        {nav.back && (
          <Slot key={nav.back.key} className={slot + " pointer-events-none"} hidden>
            {nav.back.element}
          </Slot>
        )}
        <Slot
          key={nav.key}
          onReady={() => reveal(nav.key)}
          className={slot + (nav.shown ? " sw-screen-in" : " invisible")}
        >
          {outlet}
        </Slot>
      </div>
    </div>
  );
};

export default Shell;
