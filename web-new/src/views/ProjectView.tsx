// external imports
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { faEllipsisVertical, faFileLines, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
import NoObjectsFound from "../components/NoObjectsFound";
import CreateDocument from "./create/CreateDocument";

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
  const [showNewDocument, setShowNewDocument] = useState(false);
  const toggleNewDocument = () => setShowNewDocument(!showNewDocument);

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
          {showNewDocument && (
            <CreateDocument
              projectId={projectId}
              toggleShow={toggleNewDocument}
              errorValue={props.errorValue}
              setError={props.setError}
              errorDisplay={props.errorDisplay}
              setErrorDisplay={props.setErrorDisplay}
            />
          )}
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
              <HeaderButton icon={faPlus} label="New document" onClick={toggleNewDocument} />
              <HeaderButton icon={faEllipsisVertical} label="More options (coming soon)" disabled />
            </ViewTopBar>

            <div className="flex flex-col px-5 sm:px-10 py-6 flex-grow"> {/* main view safe area */}
              <div className="max-w-prose"> {/* main view top */}
                <h1 className="display text-2xl text-purple break-words">{project.name}</h1>
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
                      <li key={doc.id}>
                        <Link
                          to={"/document/" + doc.id}
                          className="flex items-center gap-3 px-2 py-3 text-sm text-neutral-800 dark:text-neutral-200 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          <FontAwesomeIcon icon={faFileLines} className="w-4 text-purple" aria-hidden="true" />
                          <span className="min-w-0 truncate">{doc.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul> : // if no documents exist
                  <NoObjectsFound icon={faFileLines} buttonOnClick={toggleNewDocument} text="document" />
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
