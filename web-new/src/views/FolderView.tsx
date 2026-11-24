// external imports
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { onValue } from "firebase/database";

// data
import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "../datatypes/Block";
import { deleteFolder, getFolderRef, getProjectsQueryForFolder, updateFolderDetails } from "../firebase/database";

// components
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import Breadcrumb from "../components/Breadcrumb";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import { NewCard, ProjectCard, cardGrid } from "../components/Cards";
import { byLatest } from "../misc/sortBlocks";
import { rememberFolder, rememberProjectsIn, seenFolder, seenProjectsIn } from "../misc/seen";
import CreateProject from "./create/CreateProject";
import EditDetails from "./edit/EditDetails";
import EditProject from "./edit/EditProject";

// additional imports
import { useTitle } from "../misc/title";
import { getActivityLabel } from "../misc/date";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";

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

      {showEdit && (
        <EditDetails
          kind="folder"
          details={{name: folder.name, description: folder.description ?? ""}}
          onSave={details => updateFolderDetails(folderId, details)}
          onClose={() => setShowEdit(false)}
          onDelete={async () => {
            leaving.current = true;
            try {
              await deleteFolder(folderId, projects.map(project => project.id));
            } catch (error) {
              leaving.current = false;
              throw error;
            }
            navigate("/home", {replace: true});
          }}
          deleteMessage={(projects.length === 0 ? "The folder goes" : projects.length === 1 ? "The folder goes. Its project stays, under Projects with no folder" : "The folder goes. Its " + projects.length + " projects stay, under Projects with no folder") + ". This can't be undone."}
        />
      )}

      {editingProject && (
        <EditProject project={editingProject} onClose={() => setEditingProject(undefined)} />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 px-[14px] sm:pr-6">
          {!props.isSidebarVisible && (
            <button type="button" className="sw-icon" onClick={props.toggleSidebarVisible} aria-label="Show folders" title="Show folders">
              <StrokeIcon name="panelLeft" />
            </button>
          )}
          <Breadcrumb trail={[{label: "Home", to: "/home"}]} current={<span className="truncate font-bold">{folder.name}</span>} />
          <div className="flex-1" />
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
        </header>

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
    </> : <Loading />
  )
}

export default FolderView
