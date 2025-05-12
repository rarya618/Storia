// external imports
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { faBars, faCaretLeft, faEllipsisVertical, faFile } from "@fortawesome/free-solid-svg-icons";

// import data types
import { PropsWithSidebar } from "./Home";
import {Folder, Project} from "../datatypes/Block";

// firebase inports
import { getProjectRef, getProjectsQueryForFolder } from "../firebase/database";
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
const ProjectView = (props: PropsWithSidebar) => {
  // initialise Project state
  const [project, setProject] = useState<Project>();

  // initialise toggle
  const [showNewProjectView, setShowNewProjectView] = useState(false);
  const toggleShowNewProject = () => {
    setShowNewProjectView(!showNewProjectView);
  }

  // get id from parameters
  let { id } = useParams<string>();
  let projectId = id ? id : "";

  // Folder getter
  async function getProject() {
    const projectRef = getProjectRef(projectId);

    if (projectRef) {
      onValue(projectRef, (snapshot) => {
        const data = {id: projectId, ...snapshot.val()};
        setProject(data);
      });
    }
  }

  // call Folder getter
  useEffect(() => {
    getProject();
  }, [projectId])

  // set page title
  useTitle(project ? project.name : "")

  return (
    <div className="flex h-screen w-screen"> {/* page */}
      {
        project ?
        <>
          <Sidebar current={projectId} isSidebarVisible={props.isSidebarVisible} toggleSidebarVisible={props.toggleSidebarVisible}/>
          <div className="flex flex-col w-full"> {/* main view */}
            <div className={shadowedWhiteColor + " flex h-11 px-4 select-none"}> {/* main view top */}
              <div className="my-auto"> {/* sidebar icon */}
                {!props.isSidebarVisible ? <HeaderButton icon={faBars} onClick={props.toggleSidebarVisible} /> : null}
              </div>
              <Link to="/">
                <HeaderButton icon={faCaretLeft} />
              </Link>
              <div className="my-auto ml-2 flex">
                <p className="text-purple">{project.name}</p>
                <div className="mx-5 px-3 py-0.5 border border-neutral-300 rounded-md">
                  <p className="text-neutral-400 text-sm my-auto">View only</p>
                </div>
              </div>
              <div className="flex-grow"></div>
              <div className="mx-2 my-auto"> {/* dot menu */}
                <p className="my-auto text-sm text-purple">{getRelativeDate(project.lastUpdated ? project.lastUpdated : project.createdOn)}</p>
              </div>
              {/* dot menu */}
              {/* <div className="my-auto">
                <HeaderButton icon={faEllipsisVertical} />
              </div> */}
            </div>
            <div className="flex flex-col p-10 flex-grow align-top"> {/* main view safe area */}
              <div className="flex"> {/* main view top */}
                <div className="flex-grow">
                  <h1 className="text-3xl text-purple font-light select-none pb-1">{project.name}</h1>
                  <p>{project.description}</p>
                </div>
                {/* <div className="flex mt-0.5">
                  <WhiteButton text="Settings" link="settings" />
                </div> */}
              </div>
              <div className="flex flex-col flex-grow w-full"> {/* main view content */}
                { 
                  project.documents && project.documents.length != 0 ? // if documents exist
                  <>
                    <div className="mx-auto py-5">
                      { project.documents.map(doc => {
                        return (
                          <div>
                            <h1>{doc.name}</h1>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mx-auto">
                      <PurpleButton text="Add more" link="create" />
                    </div>
                  </> : // if no projects exist
                    <div className="flex border border-dashed py-12 my-5 rounded-lg">
                      <p className="mx-auto text-neutral-400">No content to show</p>
                    </div>
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

export default ProjectView