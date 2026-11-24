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
import BoardView from "./views/BoardView";
import Shell from "./components/Shell";
import UpdatePrompt from "./components/UpdatePrompt";
import { PrivacyPolicy, TermsOfService } from "./views/Legal";

function App() {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

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
              errorValue={errorValue} 
              setError={setError} 
              errorDisplay={errorDisplay} 
              setErrorDisplay={setErrorDisplay} 
              isSidebarVisible={isSidebarVisible} 
              toggleSidebarVisible={toggleSidebarVisible} 
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
            />}
          />
          <Route 
            path="project/:id/board"
            element={<BoardView
              errorValue={errorValue} 
              setError={setError} 
              errorDisplay={errorDisplay} 
              setErrorDisplay={setErrorDisplay}
              isSidebarVisible={isSidebarVisible} 
              toggleSidebarVisible={toggleSidebarVisible} 
            />}
          />
        </Route>
        <Route path="document/:id" element={<DocumentView />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {/* every screen, signed in or out, hears about a newer deploy */}
      <UpdatePrompt />
    </div>
  )
}

export default App
