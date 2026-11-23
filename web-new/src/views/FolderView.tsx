// external imports
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { onValue } from "firebase/database";

// data
import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "../datatypes/Block";
import { getFolderRef, getProjectsQueryForFolder } from "../firebase/database";

// components
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import Sidebar from "../components/Sidebar";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import CreateProject from "./create/CreateProject";

// additional imports
import { useTitle } from "../misc/title";
import { getActivityLabel } from "../misc/date";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";

// dates are stored as Date.toString() ("Mon Nov 23 2026 …"), so compare them as times, never as text
const touchedAt = (project: Project) => Date.parse(project.lastUpdated ?? project.createdOn ?? "") || 0;

const documentCount = (project: Project) => {
  const count = Object.keys(project.documents ?? {}).length;
  return count === 0 ? "No documents" : count + (count === 1 ? " document" : " documents");
};

// a project as a quiet document card: name, what it's about, how much is in it, when it last moved
const ProjectCard = ({project}: {project: Project}) => (
  <li>
    <Link
      to={"/project/" + project.id}
      className="flex h-full min-h-[132px] flex-col rounded-[8px] border border-[color:var(--hair)] bg-[color:var(--paper)] px-4 py-3.5 transition-[border-color,box-shadow,background-color] hover:border-[color:var(--hair-strong)] hover:shadow-[0_1px_2px_rgb(0_0_0/0.04)] focus-visible:!rounded-[8px] active:bg-[color:var(--tint)] active:shadow-none"
    >
      <h3 className="line-clamp-2 break-words text-[14px] font-semibold leading-5 tracking-tight">{project.name}</h3>
      {project.description && (
        <p className="mt-1 line-clamp-3 break-words text-[12.5px] leading-[19px] text-[color:var(--muted)]">{project.description}</p>
      )}
      <p className="mt-auto pt-4 text-[11px] leading-4 text-[color:var(--muted)]">
        <span className="tabular-nums">{documentCount(project)}</span>
        {" · "}
        {getActivityLabel(project)}
      </p>
    </Link>
  </li>
);

const FolderView = (props: PropsWithSidebar) => {
  const [folder, setFolder] = useState<Folder>();
  const [projects, setProjects] = useState<Project[]>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const toggleNewProject = () => setShowNewProject(!showNewProject);

  const { id } = useParams<string>();
  const folderId = id ?? "";

  // subscribe to the folder and its projects
  useEffect(() => {
    setFolder(undefined);
    setProjects(undefined);
    setNotFound(false);
    setLoadError(undefined);

    const onError = (error: Error) => setLoadError(toMessage(error));
    const folderRef = getFolderRef(folderId);
    const projectsQuery = getProjectsQueryForFolder(folderId);

    const unsubscribers = [
      folderRef && onValue(folderRef, (snapshot) => {
        if (!snapshot.exists()) return setNotFound(true);
        setFolder({id: folderId, ...snapshot.val()});
      }, onError),
      projectsQuery && onValue(projectsQuery, (snapshot) => {
        const dataList: Project[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        });
        setProjects(dataList);
      }, onError),
    ];

    return () => unsubscribers.forEach(unsubscribe => unsubscribe?.());
  }, [folderId]);

  useTitle(folder ? folder.name : "Folder");

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/" />
  }

  if (notFound || loadError) {
    return (
      <div className="flex h-screen w-screen">
        <LoadError
          notFound={notFound}
          title={notFound ? "Folder not found" : undefined}
          message={notFound ? "This folder doesn't exist, or it was deleted." : loadError!}
        />
      </div>
    )
  }

  // most recently updated first
  const sorted = projects ? [...projects].sort((a, b) => touchedAt(b) - touchedAt(a)) : [];

  return (
    <div className="sw flex h-screen w-screen">
      {folder && projects ? <>
        {showNewProject && (
          <CreateProject
            toggleShow={toggleNewProject}
            errorValue={props.errorValue}
            setError={props.setError}
            errorDisplay={props.errorDisplay}
            setErrorDisplay={props.setErrorDisplay}
            folderId={folderId}
          />
        )}
        <Sidebar current={folderId} isSidebarVisible={props.isSidebarVisible} toggleSidebarVisible={props.toggleSidebarVisible} />

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="flex h-11 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
            {!props.isSidebarVisible && (
              <button type="button" className="sw-icon" onClick={props.toggleSidebarVisible} aria-label="Show folders" title="Show folders">
                <StrokeIcon name="panelLeft" />
              </button>
            )}
            <Link to="/home" className="sw-icon !rounded-full bg-[color:var(--wash)]" aria-label="Back to Home" title="Back to Home">
              <StrokeIcon name="back" size={16} />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="truncate text-[14px] font-bold leading-[18px] tracking-tight">{folder.name}</h1>
              <p className="truncate text-[11.5px] leading-4 text-[color:var(--muted)]">{getActivityLabel(folder)}</p>
            </div>
            <button type="button" className="sw-button" onClick={toggleNewProject}>
              <StrokeIcon name="plus" size={15} />
              <span className="hidden sm:inline">New project</span>
              <span className="sr-only sm:hidden">New project</span>
            </button>
          </header>

          <div className="px-4 pb-16 pt-3 sm:px-8">
            {folder.description && (
              <p className="mb-6 max-w-[65ch] break-words text-[13px] leading-5 text-[color:var(--muted)]">{folder.description}</p>
            )}

            <h2 className="sw-ruled sw-label mb-4">
              <span>Projects <span className="ml-1 tabular-nums">{sorted.length}</span></span>
            </h2>

            <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3" aria-label="Projects, most recently updated first">
              {sorted.map(project => <ProjectCard key={project.id} project={project} />)}
              <li>
                <button
                  type="button"
                  onClick={toggleNewProject}
                  className="flex h-full min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-[color:var(--hair-strong)] text-[12.5px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--ui)] focus-visible:!rounded-[8px] active:bg-[color:var(--tint)]"
                >
                  <StrokeIcon name="plus" size={18} />
                  {sorted.length === 0 ? "Start the first project" : "New project"}
                </button>
              </li>
            </ul>
          </div>
        </main>
      </> : <Loading />}
    </div>
  )
}

export default FolderView
