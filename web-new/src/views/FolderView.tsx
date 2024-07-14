// external imports
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { faBars, faCaretLeft, faEllipsisVertical, faFile } from "@fortawesome/free-solid-svg-icons";

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
import { PurpleButton, WhiteButton } from "../components/Button";
import Sidebar from "../components/Sidebar";
import Block from "../components/Block";

// additional imports
import { shadowedWhiteColor } from "../styles/colors";
import { useTitle } from "../misc/title";
import { getRelativeDate } from "../misc/date";

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
            <div className={shadowedWhiteColor + " flex h-11 px-4 select-none"}> {/* main view top */}
              <div className="my-auto"> {/* sidebar icon */}
                {!props.isSidebarVisible ? <HeaderButton icon={faBars} onClick={props.toggleSidebarVisible} /> : null}
              </div>
              <Link to="/">
                <HeaderButton icon={faCaretLeft} />
              </Link>
              <div className="my-auto ml-2">
                <p className="text-purple">{folder.name}</p>
              </div>
              <div className="flex-grow"></div>
              <div className="mx-2 my-auto"> {/* dot menu */}
                <p className="my-auto text-sm text-purple">{getRelativeDate(folder.lastUpdated ? folder.lastUpdated : folder.createdOn)}</p>
              </div>
              <div className="my-auto"> {/* dot menu */}
                <HeaderButton icon={faEllipsisVertical} />
              </div>
            </div>
            <div className="flex flex-col p-10 flex-grow"> {/* main view safe area */}
              <div className="flex"> {/* main view top */}
                <h1 className="flex-grow text-3xl text-purple font-light select-none">{folder.name}</h1>
                <div className="flex m-auto">
                  <WhiteButton text="Settings" link="settings" />
                </div>
                <div className="flex m-auto ml-4">
                  <PurpleButton text="New Project" onClick={toggleShowNewProject} />
                </div>
              </div>
              <div className="flex flex-col flex-grow w-full"> {/* main view content */}
                { 
                  projects && projects.length != 0 ? // if projects exist
                  <>
                    <div className="mx-auto py-5">
                      { projects.map(projectDoc => {
                        return (
                          <Block content={projectDoc} />
                        )
                      })}
                    </div>
                    <div className="mx-auto">
                      <PurpleButton text="Add more" link="create" />
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