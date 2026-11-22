// external imports
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { faBars, faCaretLeft, faEllipsisVertical, faFile, faPlus } from "@fortawesome/free-solid-svg-icons";

// standard imports
import CreateProject from "./create/CreateProject";

// import data types
import { PropsWithSidebar } from "./Home";
import {Folder, Project} from "../datatypes/Block";

// firebase inports
import { getFolderRef, getProjectsQueryForFolder } from "../firebase/database";
import { onValue } from "firebase/database";

// component imports
import Loading from "../components/Loading";
import HeaderButton from "../components/HeaderButton";
import NoObjectsFound from "../components/NoObjectsFound";
import Sidebar from "../components/Sidebar";
import Block from "../components/Block";

// additional imports
import { shadowedWhiteColor } from "../styles/colors";
import { useTitle } from "../misc/title";
import { getRelativeDate } from "../misc/date";
import { createLink } from "./create/CreateAccount";

// get Folder view
const FolderView = (props: PropsWithSidebar) => {
  // initialise Folder state
  const [folder, setFolder] = useState<Folder>();
  const [projects, setProjects] = useState<Project[]>();

  // initialise toggle
  const [showNewProjectView, setShowNewProjectView] = useState(false);
  const toggleShowNewProject = () => {
    setShowNewProjectView(!showNewProjectView);
  }

  // get id from parameters
  let { id } = useParams<string>();
  let folderId = id ? id : "";

  // Folder getter
  async function getFolder() {
    const folderRef = getFolderRef(folderId);

    if (folderRef) {
      onValue(folderRef, (snapshot) => {
        const data = {id: folderId, ...snapshot.val()};
        setFolder(data);
      });
    }
  }

  // projects getter
  async function getProjects() {
    const query = getProjectsQueryForFolder(folderId);

    if (query) {
      onValue(query, (snapshot) => {
        const dataList: Project[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        })

        setProjects(dataList);
      });
    }
  }

  // call Folder getter
  useEffect(() => {
    getFolder();
    getProjects();
  }, [folderId])

  // set page title
  useTitle(folder ? folder.name : "")

  return (
    <div className="flex h-screen w-screen"> {/* page */}
      {
        folder ?
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
          <div className="flex flex-col w-full"> {/* main view */}
            <div className={shadowedWhiteColor + " flex items-center h-11 px-4 select-none"}> {/* main view top */}
              <div className="my-auto"> {/* sidebar icon */}
                {!props.isSidebarVisible ? <HeaderButton icon={faBars} onClick={props.toggleSidebarVisible} /> : null}
              </div>
              <Link className="m-0 p-0" to="/">
                <HeaderButton icon={faCaretLeft} />
              </Link>
              <div className="my-auto ml-2">
                <p className="text-purple text-sm">{createLink({text: folder.name, href: "/" + folder.type + "/" + folder.id}, "text-sm")}</p>
              </div>
              <div className="flex-grow"></div>
              
              <div className="mx-2 my-auto"> {/* dot menu */}
                <p className="my-auto text-xs text-neutral-400">{getRelativeDate(folder.lastUpdated ? folder.lastUpdated : folder.createdOn)}</p>
              </div>

              {/* New project */}
              <div className="m-0">
                <HeaderButton icon={faPlus} onClick={toggleShowNewProject} />
              </div>
              
              {/* dot menu */}
              <div className="my-auto"> 
                <HeaderButton icon={faEllipsisVertical} />
              </div>
            </div>
            <div className="flex flex-col px-10 py-6 flex-grow"> {/* main view safe area */}
              <div className="flex"> {/* main view top */}
                <div className="flex-grow">
                  <h1 className="text-2xl text-purple font-light select-none pb-1">{folder.name}</h1>
                  <p className="leading-6 text-neutral-600 dark:text-neutral-400 text-sm">{folder.description}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-5">{"Created " + getRelativeDate(folder.createdOn)}</p>
                </div>
                {/* <div className="flex m-auto">
                  <WhiteButton text="Settings" link="settings" />
                </div> */}
              </div>
              <div className="flex flex-col flex-grow w-full"> {/* main view content */}
                { 
                  projects && projects.length != 0 ? // if projects exist
                  <>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-6">
                      { projects.map(projectDoc => {
                        return (
                          <Block key={projectDoc.id} content={projectDoc} />
                        )
                      })}
                    </div>
                  </> : // if no projects exist
                    <NoObjectsFound icon={faFile} buttonOnClick={toggleShowNewProject} text="project"/>
                }
              </div>
            </div>
          </div>
        </> :
        <Loading />
      }
      
    </div>
  )
}

export default FolderView