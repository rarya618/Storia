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
import PageHeading from "../components/PageHeading";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { NewCard, ProjectCard, cardGrid } from "../components/Cards";
import { byLatest } from "../misc/sortBlocks";
import CreateProject from "./create/CreateProject";

// additional imports
import { useTitle } from "../misc/title";
import { getActivityLabel } from "../misc/date";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";

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
      <LoadError
        notFound={notFound}
        title={notFound ? "Folder not found" : undefined}
        message={notFound ? "This folder doesn't exist, or it was deleted." : loadError!}
      />
    )
  }

  // most recently updated first
  const sorted = projects ? byLatest(projects) : [];

  return (
    folder && projects ? <>
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

      <main className="sw-enter flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
          {!props.isSidebarVisible && (
            <button type="button" className="sw-icon" onClick={props.toggleSidebarVisible} aria-label="Show folders" title="Show folders">
              <StrokeIcon name="panelLeft" />
            </button>
          )}
          <Link to="/home" className="sw-icon !rounded-full bg-[color:var(--wash)]" aria-label="Back to Home" title="Back to Home">
            <StrokeIcon name="back" size={16} />
          </Link>
          <div className="flex-1" />
          <button type="button" className="sw-button" onClick={toggleNewProject}>
            <StrokeIcon name="plus" size={15} />
            <span className="hidden sm:inline">New project</span>
            <span className="sr-only sm:hidden">New project</span>
          </button>
        </header>

        <div className="px-4 pb-16 pt-2 sm:px-8">
          <PageHeading title={folder.name} meta={getActivityLabel(folder)} description={folder.description} />

          <h2 className="sw-section mb-5">
            <span>Projects <span className="ml-1 tabular-nums">{sorted.length}</span></span>
          </h2>

          <ul className={cardGrid} aria-label="Projects, most recently updated first">
            {sorted.map(project => <ProjectCard key={project.id} project={project} />)}
            <NewCard label={sorted.length === 0 ? "Start the first project" : "New project"} onClick={toggleNewProject} />
          </ul>
        </div>
      </main>
    </> : <Loading />
  )
}

export default FolderView
