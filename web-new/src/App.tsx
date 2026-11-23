import { Route, Routes } from "react-router-dom";

import Login from "./views/Login"

import './App.css'
import CreateAccount from "./views/create/CreateAccount";
import Home from "./views/Home";
import LogOut from "./views/LogOut";
import { useState } from "react";
import FolderView from "./views/FolderView";
import PageNotFound from "./views/PageNotFound";
import ProjectView from "./views/ProjectView";
import DocumentView from "./views/DocumentView";
import Shell from "./components/Shell";

function App() {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

  // initialise dot menu toggle
  const [isDotMenuVisible, setDotMenuVisible] = useState(false);

  // toggle dot menu visibility
  const toggleDotMenu = () => {
    setDotMenuVisible(!isDotMenuVisible)
  }

  // initialise settings window toggle
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  // toggle dot menu visibility
  const toggleSettings = () => {
    setSettingsVisible(!isSettingsVisible)
  }

  // initialise sidebar toggle
  const [isSidebarVisible, setSidebarVisible] = useState(() => {
    // remember the writer's choice; with none saved, show it on desktop but
    // not on phones, where it covers the page
    const saved = localStorage.getItem("sidebarVisible");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(min-width: 768px)").matches;
  });
  
  // toggle sidebar visibility
  const toggleSidebarVisible = () => {
    setSidebarVisible((prev) => {
      localStorage.setItem("sidebarVisible", String(!prev));
      return !prev;
    });
  };
  
  return (
    <div className="app-shell w-screen h-screen overflow-hidden fixed top-0 flex row">
      <Routes>
        <Route 
          index 
          element={<Login />}
        />
        <Route 
          path="account/login" 
          element={<Login />}
					/>
        <Route 
          path="account/create" 
          element={<CreateAccount />}
        />
        <Route 
          path="account/logout" 
          element={<LogOut />}
        />
        
        {/* home, folders and projects share one frame, so the rail stays put between them */}
        <Route element={<Shell
          isSidebarVisible={isSidebarVisible}
          toggleSidebarVisible={toggleSidebarVisible}
          errorValue={errorValue}
          setError={setError}
          errorDisplay={errorDisplay}
          setErrorDisplay={setErrorDisplay}
        />}>
          <Route 
            path="home" 
            element={<Home 
              isDotMenuVisible={isDotMenuVisible} 
              toggleDotMenu={toggleDotMenu}
              errorValue={errorValue} 
              setError={setError} 
              errorDisplay={errorDisplay} 
              setErrorDisplay={setErrorDisplay} 
              isSidebarVisible={isSidebarVisible} 
              toggleSidebarVisible={toggleSidebarVisible} 
              isSettingsVisible={isSettingsVisible} 
              toggleSettings={toggleSettings} 
            />}
          />
          <Route 
            path="folder/:id"
            element={<FolderView
              errorValue={errorValue} 
              setError={setError} 
              errorDisplay={errorDisplay} 
              setErrorDisplay={setErrorDisplay}
              isSidebarVisible={isSidebarVisible} 
              toggleSidebarVisible={toggleSidebarVisible} 
              isSettingsVisible={isSettingsVisible} 
              toggleSettings={toggleSettings} 
            />}
          />
          <Route 
            path="project/:id"
            element={<ProjectView
              errorValue={errorValue} 
              setError={setError} 
              errorDisplay={errorDisplay} 
              setErrorDisplay={setErrorDisplay}
              isSidebarVisible={isSidebarVisible} 
              toggleSidebarVisible={toggleSidebarVisible} 
              isSettingsVisible={isSettingsVisible} 
              toggleSettings={toggleSettings} 
            />}
          />
        </Route>
        <Route path="document/:id" element={<DocumentView />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      
    </div>
  )
}

export default App
