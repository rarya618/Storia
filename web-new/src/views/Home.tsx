import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onValue } from "firebase/database";
import { faFile } from "@fortawesome/free-solid-svg-icons";

import { Folder, Project } from "../datatypes/Block";
import { User } from "../datatypes/User";

import { getFoldersQueryForOwner, getProjectsQueryForOwner, getUser } from "../firebase/database";

import { PurpleButton, WhiteButton } from "../components/Button";
import Block from "../components/Block";
import HomeTopBar from "../components/HomeTopBar";
import NoObjectsFound from "../components/NoObjectsFound";
import Loading from "../components/Loading";
import LoadError from "../components/LoadError";
import { toMessage } from "../misc/errors";

import { useTitle } from "../misc/title";

import CreateFolder from "./create/CreateFolder";
import CreateProject from "./create/CreateProject";
import { Props } from "./create/CreateAccount";
import { sortBlocksByCreatedOn } from "../misc/sortBlocks";
import Sidebar from "../components/Sidebar";
import SettingsView from "./SettingsView";

export interface PropsWithSidebar extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void
  isSettingsVisible: boolean
  toggleSettings: () => void
}

interface HomeProps extends PropsWithSidebar {
  isDotMenuVisible: boolean,
  toggleDotMenu: () => void,
}

// Home component
const Home = (props: HomeProps) => {
  useTitle("Home");

  const authToken = sessionStorage.getItem("Auth Token");
  const uid = sessionStorage.getItem("User ID");
  const userId = uid ?? "";

  const [folders, setFolders] = useState<Folder[]>();
  const [projects, setProjects] = useState<Project[]>();
  const [userData, setUserData] = useState<User>();

  const [showNewFolderView, setNewFolderView] = useState(false);
  const [showNewProjectView, setNewProjectView] = useState(false);

  const toggleNewFolderView = () => {
    setNewFolderView(!showNewFolderView);
  }

  const toggleNewProjectView = () => {
    setNewProjectView(!showNewProjectView);
  }

  const [loadError, setLoadError] = useState<string>();

  // subscribe to folders and projects; unsubscribe when leaving the page
  useEffect(() => {
    if (!userId) return;
    const onError = (error: Error) => setLoadError(toMessage(error));

    const foldersQuery = getFoldersQueryForOwner(userId);
    const projectsQuery = getProjectsQueryForOwner(userId);

    const unsubscribers = [
      foldersQuery && onValue(foldersQuery, (snapshot) => {
        const dataList: Folder[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        });
        setFolders(dataList);
      }, onError),
      projectsQuery && onValue(projectsQuery, (snapshot) => {
        const dataList: Project[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        });
        setProjects(dataList);
      }, onError),
    ];

    getUser(userId).then(user => { if (user) setUserData(user); });

    return () => unsubscribers.forEach(unsubscribe => unsubscribe?.());
  }, [userId])

  // if invalid token, return to home page
  if (!authToken || !userId) {
    return (<Navigate to="/" />)
  }

  // if everything goes right, display dashboard
  return (
    <div className="flex overflow-y-auto scroll-smooth h-screen w-screen"> {/* page */}
    { loadError ? <LoadError message={loadError} /> :
      folders && projects ? <>
      { showNewFolderView ?
        <CreateFolder
          toggleShow={toggleNewFolderView} 
          errorValue={props.errorValue} 
          setError={props.setError} 
          errorDisplay={props.errorDisplay} 
          setErrorDisplay={props.setErrorDisplay} 
        /> : null
      }
      { showNewProjectView ?
        <CreateProject 
          toggleShow={toggleNewProjectView} 
          errorValue={props.errorValue} 
          setError={props.setError} 
          errorDisplay={props.errorDisplay} 
          setErrorDisplay={props.setErrorDisplay} 
        /> : null
      }
      { props.isSettingsVisible ?
      <SettingsView toggleSettings={props.toggleSettings} /> : null
      }
      <Sidebar 
        isSidebarVisible={props.isSidebarVisible} 
        toggleSidebarVisible={props.toggleSidebarVisible}
      />
      <main className="flex flex-col min-w-0 w-full pb-20"> {/* main view */}
        <HomeTopBar 
          isDotMenuVisible={props.isDotMenuVisible} 
          toggleDotMenu={props.toggleDotMenu} 
          userData={userData}
          isSidebarVisible={props.isSidebarVisible} 
          toggleSidebarVisible={props.toggleSidebarVisible}
          toggleSettings={props.toggleSettings}
        />
        <div className="flex flex-col px-5 sm:px-10 py-6"> {/* main view safe area */}
          <div className="flex flex-wrap items-center gap-3"> {/* main view top */}
            <h1 className="display flex-grow text-2xl text-purple select-none">View All</h1>
            <div className="flex gap-3">
              <WhiteButton text="New Folder" onClick={toggleNewFolderView} />
              <PurpleButton text="New Project" onClick={toggleNewProjectView} />
            </div>
          </div>
          <div className="flex flex-grow flex-col h-full"> {/* main view content */}
            { (folders?.length || 0) + (projects?.length || 0) > 0 ?
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5"> {/* all blocks */}
                {sortBlocksByCreatedOn([...folders, ...projects]).map(block => {
                  return <Block key={block.id} content={block} />
                })}
              </div> : 
              <div className="flex flex-grow">
                <NoObjectsFound icon={faFile} buttonOnClick={toggleNewProjectView} text="project"/>
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

export default Home;