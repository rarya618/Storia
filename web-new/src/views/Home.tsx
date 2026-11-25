import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onValue } from "firebase/database";

import { Folder, Project } from "../datatypes/Block";
import { User } from "../datatypes/User";
import { getFoldersQueryForOwner, getProjectsQueryForOwner, getUser } from "../firebase/database";

import Loading from "../components/Loading";
import { HomeSkeleton } from "../components/Skeletons";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import ContinueWriting from "../components/ContinueWriting";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { FolderCard, NewCard, ProjectCard, cardGrid } from "../components/Cards";
import CreateFolder from "./create/CreateFolder";
import CreateProject from "./create/CreateProject";
import EditProject from "./edit/EditProject";
import EditFolder from "./edit/EditFolder";
import { Props } from "./create/CreateAccount";

import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import { byLatest } from "../misc/sortBlocks";
import { rememberHome, rememberUser, seenHomeFolders, seenHomeProjects, seenUser } from "../misc/seen";
import "../screenplay/world.css";
import ShowRail from "../components/ShowRail";

export interface PropsWithSidebar extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void
}

type HomeProps = PropsWithSidebar;

const plural = (count: number, one: string, many: string) => count + " " + (count === 1 ? one : many);

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

const Home = (props: HomeProps) => {
  useTitle("Home");

  const authToken = sessionStorage.getItem("Auth Token");
  const userId = sessionStorage.getItem("User ID") ?? "";

  // start from what this tab last saw, so home draws at once on the way back
  const [folders, setFolders] = useState<Folder[] | undefined>(seenHomeFolders);
  const [projects, setProjects] = useState<Project[] | undefined>(seenHomeProjects);
  const [user, setUser] = useState<User | undefined>(seenUser);
  const [loadError, setLoadError] = useState<string>();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const toggleNewFolder = () => setShowNewFolder(!showNewFolder);
  const toggleNewProject = () => setShowNewProject(!showNewProject);
  const [editingProject, setEditingProject] = useState<Project>();
  const [editingFolder, setEditingFolder] = useState<Folder>();


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
        rememberHome(dataList, undefined);
        setFolders(dataList);
      }, onError),
      projectsQuery && onValue(projectsQuery, (snapshot) => {
        const dataList: Project[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        });
        rememberHome(undefined, dataList);
        setProjects(dataList);
      }, onError),
    ];

    getUser(userId).then(found => {
      if (!found) return;
      rememberUser(found);
      setUser(found);
    });

    return () => unsubscribers.forEach(unsubscribe => unsubscribe?.());
  }, [userId]);

  if (!authToken || !userId) {
    return <Navigate to="/account/login" />
  }

  if (loadError) {
    return <LoadError message={loadError} />
  }

  const folderNames = new Map((folders ?? []).map(folder => [folder.id, folder.name]));
  const recentProjects = byLatest(projects ?? []);
  const sortedFolders = byLatest(folders ?? []);
  // the project last written in that has something to open
  const latestProject = recentProjects.find(project => Object.keys(project.documents ?? {}).length > 0);

  return (
    folders && projects ? <>
      {showNewFolder && (
        <CreateFolder toggleShow={toggleNewFolder} errorValue={props.errorValue} setError={props.setError} errorDisplay={props.errorDisplay} setErrorDisplay={props.setErrorDisplay} />
      )}
      {showNewProject && (
        <CreateProject toggleShow={toggleNewProject} errorValue={props.errorValue} setError={props.setError} errorDisplay={props.errorDisplay} setErrorDisplay={props.setErrorDisplay} />
      )}


      {editingProject && <EditProject project={editingProject} onClose={() => setEditingProject(undefined)} />}
      {editingFolder && (
        <EditFolder
          folder={editingFolder}
          projects={projects.filter(project => project.folderId === editingFolder.id)}
          onClose={() => setEditingFolder(undefined)}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
          {!props.isSidebarVisible && (
            <ShowRail label="Show folders" onShow={props.toggleSidebarVisible} />
          )}
          <div className="flex-1" />
          {/* New folder lives in the rail, and in the Folders section's own card */}
          <button type="button" className="sw-button sw-button-soft" onClick={toggleNewProject}>
            <span className="sm:hidden" aria-hidden="true"><StrokeIcon name="plus" size={15} /></span>
            <span className="hidden sm:inline">New project</span>
            <span className="sr-only sm:hidden">New project</span>
          </button>
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
                <ProjectCard key={project.id} project={project} folderName={project.folderId ? folderNames.get(project.folderId) : null} onEdit={() => setEditingProject(project)} />
              ))}
              <NewCard label={recentProjects.length === 0 ? "Start the first project" : "New project"} onClick={toggleNewProject} />
            </ul>
          </section>

          <section aria-labelledby="folders">
            <h2 id="folders" className="sw-section mb-5">
              <span>Folders <span className="ml-1 tabular-nums">{sortedFolders.length}</span></span>
            </h2>
            <ul className={cardGrid} aria-label="Folders, most recently updated first">
              {sortedFolders.map(folder => <FolderCard key={folder.id} folder={folder} onEdit={() => setEditingFolder(folder)} />)}
              <NewCard label={sortedFolders.length === 0 ? "Create the first folder" : "New folder"} onClick={toggleNewFolder} />
            </ul>
          </section>
          </div>
        </div>
      </main>
    </> : <Loading skeleton={<HomeSkeleton />} />
  )
}

export default Home;
