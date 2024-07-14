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

import { useTitle } from "../misc/title";

import CreateFolder from "./create/CreateFolder";
import CreateProject from "./create/CreateProject";
import { Props } from "./create/CreateAccount";
import { sortBlocksByCreatedOn } from "../misc/sortBlocks";
import Sidebar from "../components/Sidebar";

export interface PropsWithSidebar extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void
}

interface HomeProps extends PropsWithSidebar {
  isDotMenuVisible: boolean,
  toggleDotMenu: () => void,
  userData?: User,
}

// Home component
const Home = (props: HomeProps) => {
  useTitle("Home");
  // get user credentials
  let authToken = sessionStorage.getItem('Auth Token');
  let uid = sessionStorage.getItem('User ID');
  let userId = uid ? uid : "";

  // initialise data
  const [folders, setFolders] = useState<Folder[]>();
  const [projects, setProjects] = useState<Project[]>();
  const [userData, setUserData] = useState<User>();

  // initialise viewer toggles
  const [showNewFolderView, setNewFolderView] = useState(false);
  const [showNewProjectView, setNewProjectView] = useState(false);

  const toggleNewFolderView = () => {
    setNewFolderView(!showNewFolderView);
  }

  const toggleNewProjectView = () => {
    setNewProjectView(!showNewProjectView);
  }

  // folders getter
  async function getFolders() {
    const query = getFoldersQueryForOwner(userId);

    if (query) {
      onValue(query, (snapshot) => {
        const dataList: Folder[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        })

        setFolders(dataList);
      });
    }
  }

  // projects getter
  async function getProjects() {
    const query = getProjectsQueryForOwner(userId);

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

  // user data getter
  async function getUserData() {
    const tempDoc = await getUser(userId);
    
    if (tempDoc) {
      setUserData(tempDoc);
    }
  }

  // call getters
  useEffect(() => {
    getFolders();
    getProjects();
    getUserData();
  }, [])

  // if invalid token, return to home page
  if (!authToken) {
    return (<Navigate to="/" />)
  }

  // if everything goes right, display dashboard
  return (
    <div className="flex mb-20 overflow-scroll scroll-smooth h-screen w-screen"> {/* page */}
    { folders && projects ? <>
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
      <Sidebar 
        isSidebarVisible={props.isSidebarVisible} 
        toggleSidebarVisible={props.toggleSidebarVisible}
      />
      <div className="flex flex-col w-full pb-20"> {/* main view */}
        <HomeTopBar 
          isDotMenuVisible={props.isDotMenuVisible} 
          toggleDotMenu={props.toggleDotMenu} 
          userData={userData}
          isSidebarVisible={props.isSidebarVisible} 
          toggleSidebarVisible={props.toggleSidebarVisible}
        />
        <div className="flex flex-col p-10"> {/* main view safe area */}
          <div className="flex"> {/* main view top */}
            <h1 className="flex-grow text-3xl text-purple font-light select-none">View All</h1>
            <div className="flex m-auto">
              <WhiteButton text="New Folder" onClick={toggleNewFolderView} />
            </div>
            <div className="flex m-auto ml-4">
              <PurpleButton text="New Project" onClick={toggleNewProjectView} />
            </div>
          </div>
          <div className="flex flex-grow flex-col h-full"> {/* main view content */}
            { ([...folders, ...projects].length != 0) ? 
              <div className="flex flex-grow flex-wrap"> {/* all blocks */}
                {sortBlocksByCreatedOn([...folders, ...projects]).map(block => {
                  return <Block content={block} />
                })}
              </div> : 
              <div className="flex flex-grow">
                <NoObjectsFound icon={faFile} buttonOnClick={toggleNewProjectView} text="project"/>
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

export default Home;