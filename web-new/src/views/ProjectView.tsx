// external imports
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

// import data types
import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "../datatypes/Block";
import Document from "../datatypes/Document";

// firebase imports
import { getFolderRef, getProjectRef } from "../firebase/database";
import { onValue } from "firebase/database";

// component imports
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import HeaderButton from "../components/HeaderButton";
import Sidebar from "../components/Sidebar";
import ViewTopBar from "../components/ViewTopBar";

// additional imports
import { useTitle } from "../misc/title";
import { getActivityLabel, getRelativeDate } from "../misc/date";
import { toMessage } from "../misc/errors";
import { createLink } from "./create/CreateAccount";

// get Project view
const ProjectView = (props: PropsWithSidebar) => {
  // initialise Project state
  const [project, setProject] = useState<Project>();
  const [folder, setFolder] = useState<Folder>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);

  // get id from parameters
  const { id } = useParams<string>();
  const projectId = id ?? "";

  // subscribe to the project
  useEffect(() => {
    setProject(undefined);
    setNotFound(false);
    setLoadError(undefined);

    const projectRef = getProjectRef(projectId);
    if (!projectRef) return;

    return onValue(projectRef, (snapshot) => {
      if (!snapshot.exists()) return setNotFound(true);
      setProject({id: projectId, ...snapshot.val()});
    }, (error) => setLoadError(toMessage(error)));
  }, [projectId])

  // subscribe to the folder the project lives in, for the breadcrumb
  const folderId = project?.folderId;
  useEffect(() => {
    setFolder(undefined);
    if (!folderId) return;

    const folderRef = getFolderRef(folderId);
    if (!folderRef) return;

    return onValue(folderRef, (snapshot) => {
      if (snapshot.exists()) setFolder({id: folderId, ...snapshot.val()});
    }, () => setFolder(undefined));
  }, [folderId])

  // set page title
  useTitle(project ? project.name : "Project")

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/" />
  }

  if (notFound || loadError) {
    return (
      <div className="flex h-screen w-screen">
        <LoadError
          notFound={notFound}
          title={notFound ? "Project not found" : undefined}
          message={notFound ? "This project doesn't exist, or it was deleted." : loadError!}
        />
      </div>
    )
  }

  // documents are stored keyed by id
  const documents: Document[] = project?.documents ? Object.values(project.documents) : [];
  const folderLink = folder && createLink({text: folder.name, href: "/" + folder.type + "/" + folder.id}, "text-sm");

  return (
    <div className="flex h-screen w-screen"> {/* page */}
      {
        project ?
        <>
          <Sidebar current={projectId} isSidebarVisible={props.isSidebarVisible} toggleSidebarVisible={props.toggleSidebarVisible}/>
          <main className="flex flex-col min-w-0 w-full overflow-y-auto"> {/* main view */}
            <ViewTopBar
              isSidebarVisible={props.isSidebarVisible}
              toggleSidebarVisible={props.toggleSidebarVisible}
              backTo={folder ? "/folder/" + folder.id : "/home"}
              backLabel={folder ? "Back to " + folder.name : "Back to Home"}
              breadcrumb={<>
                {folderLink && <>{folderLink}<span className="mx-1.5 text-neutral-400" aria-hidden="true">/</span></>}
                <span aria-current="page" className="font-semibold">{project.name}</span>
              </>}
              activity={getActivityLabel(project)}
            >
              <span className="hidden sm:inline-block mx-1.5 px-2 py-0.5 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-500 dark:text-neutral-400 text-xs">View only</span>
              <HeaderButton icon={faEllipsisVertical} label="More options (coming soon)" disabled />
            </ViewTopBar>

            <div className="flex flex-col px-5 sm:px-10 py-6 flex-grow"> {/* main view safe area */}
              <div className="max-w-prose"> {/* main view top */}
                <h1 className="text-2xl text-purple font-light break-words">{project.name}</h1>
                {folderLink && (
                  <p className="text-neutral-600 leading-6 dark:text-neutral-400 text-xs">From {createLink({text: folder!.name, href: "/folder/" + folder!.id}, "text-xs")}</p>
                )}
                <p className="text-neutral-600 pt-1 leading-6 dark:text-neutral-400 text-sm break-words">{project.description}</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-5">{"Created " + getRelativeDate(project.createdOn)}</p>
              </div>
              <div className="flex flex-col flex-grow w-full"> {/* main view content */}
                {
                  documents.length != 0 ? // if documents exist
                  <ul className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-700 border-y border-neutral-200 dark:border-neutral-700">
                    { documents.map(doc => (
                      <li key={doc.id} className="py-3 text-sm text-neutral-800 dark:text-neutral-200">{doc.name}</li>
                    ))}
                  </ul> : // if no documents exist
                  <div className="flex border border-neutral-300 dark:border-neutral-600 border-dashed py-12 my-6 rounded-lg">
                    <p className="mx-auto text-sm text-neutral-500 dark:text-neutral-400">No documents in this project yet</p>
                  </div>
                }
              </div>
            </div>
          </main>
        </> :
        <Loading />
      }
    </div>
  )
}

export default ProjectView
