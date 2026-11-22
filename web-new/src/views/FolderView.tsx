// external imports
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { faEllipsisVertical, faFile, faPlus } from "@fortawesome/free-solid-svg-icons";

// standard imports
import CreateProject from "./create/CreateProject";

// import data types
import { PropsWithSidebar } from "./Home";
import { Folder, Project } from "../datatypes/Block";

// firebase imports
import { getFolderRef, getProjectsQueryForFolder } from "../firebase/database";
import { onValue } from "firebase/database";

// component imports
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import HeaderButton from "../components/HeaderButton";
import NoObjectsFound from "../components/NoObjectsFound";
import Sidebar from "../components/Sidebar";
import Block from "../components/Block";
import ViewTopBar from "../components/ViewTopBar";

// additional imports
import { useTitle } from "../misc/title";
import { getActivityLabel, getRelativeDate } from "../misc/date";
import { toMessage } from "../misc/errors";
import { createLink } from "./create/CreateAccount";

// get Folder view
const FolderView = (props: PropsWithSidebar) => {
  // initialise Folder state
  const [folder, setFolder] = useState<Folder>();
  const [projects, setProjects] = useState<Project[]>();
  const [loadError, setLoadError] = useState<string>();
  const [notFound, setNotFound] = useState(false);

  // initialise toggle
  const [showNewProjectView, setShowNewProjectView] = useState(false);
  const toggleShowNewProject = () => {
    setShowNewProjectView(!showNewProjectView);
  }

  // get id from parameters
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
  }, [folderId])

  // set page title
  useTitle(folder ? folder.name : "Folder")

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

  return (
    <div className="flex h-screen w-screen"> {/* page */}
      {
        folder && projects ?
        <>
          {
            showNewProjectView ?
            <CreateProject
              toggleShow={toggleShowNewProject}
              errorValue={props.errorValue}
              setError={props.setError}
              errorDisplay={props.errorDisplay}
              setErrorDisplay={props.setErrorDisplay}
              folderId={folderId}
            /> : null
          }
          <Sidebar current={folderId} isSidebarVisible={props.isSidebarVisible} toggleSidebarVisible={props.toggleSidebarVisible}/>
          <main className="flex flex-col min-w-0 w-full overflow-y-auto"> {/* main view */}
            <ViewTopBar
              isSidebarVisible={props.isSidebarVisible}
              toggleSidebarVisible={props.toggleSidebarVisible}
              backTo="/home"
              backLabel="Back to Home"
              breadcrumb={createLink({text: folder.name, href: "/" + folder.type + "/" + folder.id}, "text-sm")}
              activity={getActivityLabel(folder)}
            >
              <HeaderButton icon={faPlus} label="New project" onClick={toggleShowNewProject} />
              <HeaderButton icon={faEllipsisVertical} label="More options (coming soon)" disabled />
            </ViewTopBar>
            <div className="flex flex-col px-5 sm:px-10 py-6 flex-grow"> {/* main view safe area */}
              <div className="max-w-prose"> {/* main view top */}
                <h1 className="text-2xl text-purple font-light pb-1 break-words">{folder.name}</h1>
                <p className="leading-6 text-neutral-600 dark:text-neutral-400 text-sm break-words">{folder.description}</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-5">{"Created " + getRelativeDate(folder.createdOn)}</p>
              </div>
              <div className="flex flex-col flex-grow w-full"> {/* main view content */}
                {
                  projects.length != 0 ? // if projects exist
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                    { projects.map(projectDoc => <Block key={projectDoc.id} content={projectDoc} />) }
                  </div> : // if no projects exist
                  <NoObjectsFound icon={faFile} buttonOnClick={toggleShowNewProject} text="project"/>
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

export default FolderView
