import { Link, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { onValue } from "firebase/database";

import { Folder, Project } from "../datatypes/Block";
import { User } from "../datatypes/User";
import { getFoldersQueryForOwner, getProjectsQueryForOwner, getUser } from "../firebase/database";

import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import Sidebar from "../components/Sidebar";
import PageHeading from "../components/PageHeading";
import ContinueWriting from "../components/ContinueWriting";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { FolderCard, NewCard, ProjectCard, cardGrid } from "../components/Cards";
import CreateFolder from "./create/CreateFolder";
import CreateProject from "./create/CreateProject";
import SettingsView from "./SettingsView";
import { Props } from "./create/CreateAccount";

import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import { byLatest } from "../misc/sortBlocks";
import "../screenplay/world.css";

export interface PropsWithSidebar extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void
  isSettingsVisible: boolean
  toggleSettings: () => void
}

interface HomeProps extends PropsWithSidebar {
  isDotMenuVisible: boolean,
  toggleDotMenu: () => void,
}

const plural = (count: number, one: string, many: string) => count + " " + (count === 1 ? one : many);

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

// the account menu: who is signed in, settings, log out, and the plan
const AccountMenu = ({user, onSettings, onClose}: {user?: User, onSettings: () => void, onClose: () => void}) => (
  <div id="account-menu" className="sw-float absolute right-0 top-11 z-50 w-72 rounded-[10px] py-1.5">
    {user && (
      <div className="border-b border-[color:var(--rule)] px-4 pb-3 pt-2">
        <p className="truncate text-base font-bold">{user.firstName + " " + user.lastName}</p>
        <p className="truncate text-sm text-[color:var(--muted)]">{user.email}</p>
      </div>
    )}
    <div className="py-1">
      <button type="button" className="sw-menu-item" onClick={() => { onSettings(); onClose(); }}>Settings</button>
      <Link to="/account/logout" className="sw-menu-item" onClick={onClose}>Log out</Link>
    </div>
    <div className="border-t border-[color:var(--rule)] px-4 pb-1 pt-2.5 text-sm text-[color:var(--muted)]">
      <p>Beta plan, lifetime availability</p>
      <p className="tabular-nums">Version 1.0.0</p>
    </div>
  </div>
);

const Home = (props: HomeProps) => {
  useTitle("Home");

  const authToken = sessionStorage.getItem("Auth Token");
  const userId = sessionStorage.getItem("User ID") ?? "";

  const [folders, setFolders] = useState<Folder[]>();
  const [projects, setProjects] = useState<Project[]>();
  const [user, setUser] = useState<User>();
  const [loadError, setLoadError] = useState<string>();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const toggleNewFolder = () => setShowNewFolder(!showNewFolder);
  const toggleNewProject = () => setShowNewProject(!showNewProject);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const {isDotMenuVisible, toggleDotMenu} = props;

  // subscribe to folders and projects; unsubscribe when leaving the page
  useEffect(() => {
    if (!userId) return;
    const onError = (error: Error) => setLoadError(toMessage(error));

    const foldersQuery = getFoldersQueryForOwner(userId);
    const projectsQuery = getProjectsQueryForOwner(userId);

    const unsubscribers = [
      foldersQuery && onValue(foldersQuery, (snapshot) => {
        const dataList: Folder[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        });
        setFolders(dataList);
      }, onError),
      projectsQuery && onValue(projectsQuery, (snapshot) => {
        const dataList: Project[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        });
        setProjects(dataList);
      }, onError),
    ];

    getUser(userId).then(found => { if (found) setUser(found); });

    return () => unsubscribers.forEach(unsubscribe => unsubscribe?.());
  }, [userId]);

  // the account menu closes on an outside click or Escape
  useEffect(() => {
    if (!isDotMenuVisible) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) toggleDotMenu();
    };
    // Escape hands focus back to the button that opened the menu
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      toggleDotMenu();
      menuButtonRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isDotMenuVisible, toggleDotMenu]);

  if (!authToken || !userId) {
    return <Navigate to="/" />
  }

  if (loadError) {
    return <div className="flex h-screen w-screen"><LoadError message={loadError} /></div>
  }

  const folderNames = new Map((folders ?? []).map(folder => [folder.id, folder.name]));
  const recentProjects = byLatest(projects ?? []);
  const sortedFolders = byLatest(folders ?? []);
  // the project last written in that has something to open
  const latestProject = recentProjects.find(project => Object.keys(project.documents ?? {}).length > 0);

  return (
    <div className="sw sw-rev flex h-screen w-screen">
      <Sidebar isSidebarVisible={props.isSidebarVisible} toggleSidebarVisible={props.toggleSidebarVisible} />
      {folders && projects ? <>
        {showNewFolder && (
          <CreateFolder toggleShow={toggleNewFolder} errorValue={props.errorValue} setError={props.setError} errorDisplay={props.errorDisplay} setErrorDisplay={props.setErrorDisplay} />
        )}
        {showNewProject && (
          <CreateProject toggleShow={toggleNewProject} errorValue={props.errorValue} setError={props.setError} errorDisplay={props.errorDisplay} setErrorDisplay={props.setErrorDisplay} />
        )}
        {props.isSettingsVisible && <SettingsView toggleSettings={props.toggleSettings} />}


        <main className="sw-enter flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="flex h-16 shrink-0 items-center gap-2 pl-4 pr-[14px] sm:pl-8 sm:pr-6">
            {!props.isSidebarVisible && (
              <button type="button" className="sw-icon" onClick={props.toggleSidebarVisible} aria-label="Show folders" title="Show folders">
                <StrokeIcon name="panelLeft" />
              </button>
            )}
            {/* with the rail hidden, as on phones, the bar carries the wordmark */}
            {!props.isSidebarVisible && <span className="logo ml-1 text-2xl leading-none">Storia</span>}
            <div className="flex-1" />
            {/* on phones the Folders section's own New folder card is enough */}
            <button type="button" className="sw-button max-sm:!hidden" onClick={toggleNewFolder}>
              <StrokeIcon name="plus" size={15} />
              New folder
            </button>
            <button type="button" className="sw-button sw-button-soft" onClick={toggleNewProject}>
              <span className="sm:hidden" aria-hidden="true"><StrokeIcon name="plus" size={15} /></span>
              <span className="hidden sm:inline">New project</span>
              <span className="sr-only sm:hidden">New project</span>
            </button>
            {/* tabbing out of the menu closes it */}
            <div
              ref={menuRef}
              className="relative"
              onBlur={event => { if (isDotMenuVisible && !event.currentTarget.contains(event.relatedTarget as Node | null)) toggleDotMenu(); }}
            >
              <button ref={menuButtonRef} type="button" className="sw-icon" onClick={toggleDotMenu} aria-label="Account" title="Account" aria-expanded={isDotMenuVisible} aria-controls="account-menu">
                <StrokeIcon name="dots" />
              </button>
              {isDotMenuVisible && <AccountMenu user={user} onSettings={props.toggleSettings} onClose={toggleDotMenu} />}
            </div>
          </header>

          <div className="px-4 pb-16 pt-2 sm:px-8">
            <PageHeading
              title={greeting() + (user?.firstName ? ", " + user.firstName : "")}
              meta={plural(folders.length, "folder", "folders") + " · " + plural(projects.length, "project", "projects")}
            />
            <div className="flex flex-col gap-10">

            {latestProject && (
              <ContinueWriting
                key={latestProject.id}
                project={latestProject}
                folderName={latestProject.folderId ? folderNames.get(latestProject.folderId) : null}
              />
            )}
            <section aria-labelledby="projects">
              <h2 id="projects" className="sw-section mb-5">
                <span>Projects <span className="ml-1 tabular-nums">{recentProjects.length}</span></span>
              </h2>
              <ul className={cardGrid} aria-label="Projects, most recently updated first">
                {recentProjects.map(project => (
                  <ProjectCard key={project.id} project={project} folderName={project.folderId ? folderNames.get(project.folderId) : null} />
                ))}
                <NewCard label={recentProjects.length === 0 ? "Start the first project" : "New project"} onClick={toggleNewProject} />
              </ul>
            </section>

            <section aria-labelledby="folders">
              <h2 id="folders" className="sw-section mb-5">
                <span>Folders <span className="ml-1 tabular-nums">{sortedFolders.length}</span></span>
              </h2>
              <ul className={cardGrid} aria-label="Folders, most recently updated first">
                {sortedFolders.map(folder => <FolderCard key={folder.id} folder={folder} />)}
                <NewCard label={sortedFolders.length === 0 ? "Create the first folder" : "New folder"} onClick={toggleNewFolder} />
              </ul>
            </section>
            </div>
          </div>
        </main>
      </> : <Loading />}
    </div>
  )
}

export default Home;
