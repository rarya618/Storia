// external imports
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { faBars, faCaretLeft, faEllipsisVertical, } from "@fortawesome/free-solid-svg-icons";

// import data types
import { PropsWithSidebar } from "./Home";
import {Folder, Project} from "../datatypes/Block";

// firebase inports
import { getFolderRef, getProjectRef } from "../firebase/database";
import { onValue } from "firebase/database";

// component imports
import Loading from "../components/Loading";
import HeaderButton from "../components/HeaderButton";
import { PurpleButton } from "../components/Button";
import Sidebar from "../components/Sidebar";

// additional imports
import { shadowedWhiteColor } from "../styles/colors";
import { useTitle } from "../misc/title";
import { getRelativeDate } from "../misc/date";
import { createLink } from "./create/CreateAccount";

// get Folder view
const ProjectView = (props: PropsWithSidebar) => {
  // initialise Project state
  const [project, setProject] = useState<Project>();
  const [folder, setFolder] = useState<Folder>();

  // get id from parameters
  let { id } = useParams<string>();
  let projectId = id ? id : "";

  // Project getter
  async function getProject() {
    const projectRef = getProjectRef(projectId);

    if (projectRef) {
      onValue(projectRef, (snapshot) => {
        const data: Project = {id: projectId, ...snapshot.val()};
        setProject(data);

        if (data.folderId)
          getFolder(data.folderId)
      });
    }
  }

  // Folder getter
  async function getFolder(folderId: string) {
    const folderRef = getFolderRef(folderId);

    if (folderRef) {
      onValue(folderRef, (snapshot) => {
        const data = {id: folderId, ...snapshot.val()};
        setFolder(data);
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
            <div className={shadowedWhiteColor + " flex items-center h-11 px-4 select-none"}>
              {/* Sidebar icon */}
              {!props.isSidebarVisible && (
                <HeaderButton icon={faBars} onClick={props.toggleSidebarVisible} />
              )}

              {/* Back button */}
              <Link className="m-0 p-0" to="/">
                <HeaderButton icon={faCaretLeft} />
              </Link>

              {/* Breadcrumb */}
              <div className="ml-2">
                {folder ? (
                  <p className="text-purple text-sm">
                    {createLink({ text: folder.name, href: `/${folder.type}/${folder.id}` }, "text-sm")}
                    {" / "}
                    {createLink({ text: project.name, href: `/${project.type}/${project.id}` }, "text-sm")}
                  </p>
                ) : (
                  <p className="text-purple text-sm">
                    {createLink({ text: project.name, href: `/${project.type}/${project.id}` }, "text-sm")}
                  </p>
                )}
              </div>

              {/* View only tag */}
              <div className="mx-2.5 px-2 py-0.5 border border-dashed border-neutral-300 dark:border-neutral-500 rounded-md">
                <p className="text-neutral-400 dark:text-neutral-500 text-xs">View only</p>
              </div>

              <div className="flex-grow" />

              {/* Last updated */}
              <div className="mx-2">
                <p className="text-xs text-neutral-400">
                  {getRelativeDate(project.lastUpdated ?? project.createdOn)}
                </p>
              </div>

              {/* Dot menu */}
              <HeaderButton icon={faEllipsisVertical} />
            </div>

            <div className="flex flex-col px-10 py-6 flex-grow align-top"> {/* main view safe area */}
              <div className="flex"> {/* main view top */}
                <div className="flex-grow">
                  <h1 className="text-2xl text-purple font-light select-none">{project.name}</h1>
                  {folder ? 
                  <p className="text-neutral-600 leading-6 dark:text-neutral-400 text-xs">From {createLink({text: folder.name, href: "/" + folder.type + "/" + folder.id}, "text-xs")}</p> :
                  null
                  }
                  <p className="text-neutral-600 pt-1 leading-6 dark:text-neutral-400 text-sm">{project.description}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-5">{"Created " + getRelativeDate(project.createdOn)}</p>
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
                    <div className="flex border border-neutral-300 dark:border-neutral-600 border-dashed py-12 my-5 rounded-lg">
                      <p className="mx-auto text-neutral-400 dark:text-neutral-500">No content to show</p>
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