import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { PurpleButton, WhiteButton } from "../components/Button";
import { useTitle } from "../misc/title";
import { getProjectsRefForOwner, getUser } from "../firebase/database";
import { Project } from "../datatypes/Project";
import { User } from "../datatypes/User";
import { onValue } from "firebase/database";
import ProjectBlock from "../components/ProjectBlock";
import HomeTopBar from "../components/HomeTopBar";
import CreateProject from "./CreateProject";
import { CreateProps } from "./CreateAccount";

interface HomeProps extends CreateProps {
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

  // initialise projects array
  const [projects, setProjects] = useState<Project[]>([]);
  const [userData, setUserData] = useState<User>();
  const [showNewProject, setShowNewProject] = useState(false);

  const toggleShowNewProject = () => {
    setShowNewProject(!showNewProject);
  }

  // project getter
  async function getProjects() {
    const projectRef = getProjectsRefForOwner(userId);

    if (projectRef) {
      onValue(projectRef, (snapshot) => {
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

  // call project getter
  useEffect(() => {
    getProjects();
    getUserData();
  }, [])

  // if invalid token, return to home page
  if (!authToken) {
    return (<Navigate to="/" />)
  }

  // if everything goes right, display dashboard
  return (
    <div className="flex h-screen w-screen"> {/* page */}
      {
        showNewProject ?
        <CreateProject 
          toggleShow={toggleShowNewProject} 
          errorValue={props.errorValue} 
          setError={props.setError} 
          errorDisplay={props.errorDisplay} 
          setErrorDisplay={props.setErrorDisplay} 
        /> : null
      }
      <div className="w-80 bg-purple-tint dark:bg-purple-deep-tint"> {/* sidebar */}

      </div>
      <div className="flex flex-col w-full"> {/* main view */}
        <HomeTopBar 
          isDotMenuVisible={props.isDotMenuVisible} 
          toggleDotMenu={props.toggleDotMenu} 
          userData={userData}
        />
        <div className="p-10"> {/* main view safe area */}
          <div className="flex"> {/* main view top */}
            <h1 className="flex-grow text-3xl text-purple font-light select-none">Recents</h1>
            <div className="flex m-auto">
              <WhiteButton text="Settings" link="/settings" />
            </div>
            <div className="flex m-auto ml-4">
              <PurpleButton text="New Project" onClick={toggleShowNewProject} />
            </div>
          </div>
          <div> {/* main view content */}
            <div className="flex"> {/* all projects */}
              {projects.map(project => {
                return <ProjectBlock project={project} />
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;