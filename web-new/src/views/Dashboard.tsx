import { Navigate } from "react-router-dom";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

import { PurpleButton, WhiteButton } from "../components/Button";
import { useTitle } from "../misc/title";
import { shadowedWhiteColor } from "../styles/colors";
import { getProjectsForUser, getUser } from "../firebase/database";
import { Project } from "../datatypes/Project";
import HeaderButton from "../components/HeaderButton";
import Menu, { MenuItem } from "../components/Menu";
import { User } from "../datatypes/User";

// list of dot menu items
const dotMenuItems: MenuItem[][] = [
  [
    {text: "Sign out", link: "/log-out"}
  ]
]

// Dashboard component
const Dashboard = () => {
  useTitle("Dashboard");
  // get user credentials
  let authToken = sessionStorage.getItem('Auth Token');
  let uid = sessionStorage.getItem('User ID');
  let userId = uid ? uid : "";

  // initialise projects array
  const [projects, setProjects] = useState<Project[]>([]);
  const [userData, setUserData] = useState<User>();

  // initialise dot menu toggle
  const [isDotMenuVisible, setDotMenuVisible] = useState(false);

  // toggle dot menu visible
  const toggleDotMenu = () => {
    setDotMenuVisible(!isDotMenuVisible)
  }

  // project getter
  async function getProjects() {
    const tempDoc = await getProjectsForUser(userId);
    
    if (tempDoc) {
      setProjects(tempDoc);
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
      <div className="w-80 bg-purple-tint dark:bg-purple-deep-tint"> {/* sidebar */}

      </div>
      <div className="flex flex-col w-full"> {/* main view */}
        <div className={shadowedWhiteColor + " flex h-11 px-4"}> {/* main view top */}
          <div className="flex-grow"></div>
          <div className="my-auto"> {/* dot menu */}
            {HeaderButton(faEllipsis, toggleDotMenu)}
            { isDotMenuVisible ? Menu(dotMenuItems, true, userData) : null /* dot menu */}
          </div>
        </div>
        <div className="p-10"> {/* main view safe area */}
          <div className="flex"> {/* main view top */}
            <h1 className="flex-grow text-3xl text-purple font-light select-none">Recents</h1>
            <div className="flex m-auto">
              {WhiteButton("New Project", "/new-project", true)}
            </div>
            <div className="flex m-auto ml-4">
              {PurpleButton("Settings", "/settings", true)}
            </div>
          </div>
          <div> {/* main view content */}
            <div className="flex"> {/* all projects */}
              {projects.map(project => {
                return (
                  <div className="px-6 py-7 border border-purple w-1/3 my-5 mr-5 rounded-md">
                    <h2 className="text-xl text-purple font-light">{project.name}</h2>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;