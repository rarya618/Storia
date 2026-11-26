// external imports
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { onValue } from "firebase/database";

// data
import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "@storia/core/datatypes/Block";
import { getFolderRef, getProjectsQueryForFolder } from "../firebase/database";

// components
import Loading from "../components/Loading";
import { FolderSkeleton } from "../components/Skeletons";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import Breadcrumb from "../components/Breadcrumb";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { NewCard, ProjectCard, cardGrid } from "../components/Cards";
import { byLatest } from "../misc/sortBlocks";
import { rememberFolder, rememberProjectsIn, seenFolder, seenProjectsIn } from "../misc/seen";
import CreateProject from "./create/CreateProject";
import EditFolder from "./edit/EditFolder";
import EditProject from "./edit/EditProject";

// additional imports
import { useTitle } from "../misc/title";
import { getActivityLabel } from "../misc/date";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";
import ShowRail from "../components/ShowRail";
import Bar from "../components/Bar";

const FolderView = (props: PropsWithSidebar) => {
  const { id } = useParams<string>();
  const folderId = id ?? "";

  // start from what this tab last saw (often home's lists), so the folder
  // draws at once; the subscriptions below bring it up to date
  const [folder, setFolder] = useState(() => seenFolder(folderId));
  const [projects, setProjects] = useState(() => seenProjectsIn(folderId));
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const toggleNewProject = () => setShowNewProject(!showNewProject);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProject, setEditingProject] = useState<Project>();
  const navigate = useNavigate();
  // set while this page deletes its own folder, so the folder vanishing isn't
  // shown as "not found" on the way out
  const leaving = useRef(false);

  // subscribe to the folder and its projects
  useEffect(() => {
    setFolder(seenFolder(folderId));
    setProjects(seenProjectsIn(folderId));
    setNotFound(false);
    setLoadError(undefined);

    const onError = (error: Error) => setLoadError(toMessage(error));
    const folderRef = getFolderRef(folderId);
    const projectsQuery = getProjectsQueryForFolder(folderId);

    const unsubscribers = [
      folderRef && onValue(folderRef, (snapshot) => {
        if (!snapshot.exists()) return leaving.current || setNotFound(true);
        const found: Folder = {id: folderId, ...snapshot.val()};
        rememberFolder(found);
        setFolder(found);
      }, onError),
      projectsQuery && onValue(projectsQuery, (snapshot) => {
        const dataList: Project[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        });
        rememberProjectsIn(folderId, dataList);
        setProjects(dataList);
      }, onError),
    ];

    return () => unsubscribers.forEach(unsubscribe => unsubscribe?.());
  }, [folderId]);

  useTitle(folder ? folder.name : "Folder");

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/account/login" />
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

      {showEdit && (
        <EditFolder
          folder={folder}
          projects={projects}
          onClose={() => setShowEdit(false)}
          onDeleting={() => { leaving.current = true; }}
          onDeleteFailed={() => { leaving.current = false; }}
          onDeleted={() => navigate("/home", {replace: true})}
        />
      )}

      {editingProject && (
        <EditProject project={editingProject} onClose={() => setEditingProject(undefined)} />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Bar
            className="sm:pr-6"
            start={!props.isSidebarVisible && <ShowRail label="Show folders" onShow={props.toggleSidebarVisible} />}
            middle={<Breadcrumb trail={[{label: "Home", to: "/home"}]} current={<span className="truncate font-bold">{folder.name}</span>} />}
            end={<>
          <button type="button" className="sw-button" onClick={() => setShowEdit(true)}>
            <StrokeIcon name="pencil" size={15} />
            <span className="hidden sm:inline">Edit</span>
            <span className="sr-only sm:hidden">Edit folder</span>
          </button>
          <button type="button" className="sw-button" onClick={toggleNewProject}>
            <StrokeIcon name="plus" size={15} />
            <span className="hidden sm:inline">New project</span>
            <span className="sr-only sm:hidden">New project</span>
          </button>
            </>}
          />

        <div className="px-4 pb-16 pt-2 sm:px-8">
          <PageHeading title={folder.name} meta={getActivityLabel(folder)} description={folder.description} />

          <h2 className="sw-section mb-5">
            <span>Projects <span className="ml-1 tabular-nums">{sorted.length}</span></span>
          </h2>

          <ul className={cardGrid} aria-label="Projects, most recently updated first">
            {sorted.map(project => <ProjectCard key={project.id} project={project} onEdit={() => setEditingProject(project)} />)}
            <NewCard label={sorted.length === 0 ? "Start the first project" : "New project"} onClick={toggleNewProject} />
          </ul>
        </div>
      </main>
    </> : <Loading skeleton={<FolderSkeleton />} />
  )
}

export default FolderView
