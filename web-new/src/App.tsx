import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./views/Login"

import CreateAccount from "./views/create/CreateAccount";
import Home from "./views/Home";
import LogOut from "./views/LogOut";
import { useState } from "react";
import FolderView from "./views/FolderView";
import PageNotFound from "./views/PageNotFound";
import ProjectView from "./views/ProjectView";
import DocumentView from "./views/DocumentView";
import BoardView from "./views/BoardView";
import CardView from "./views/CardView";
import Shell from "./components/Shell";
import UpdatePrompt from "./components/UpdatePrompt";
import { PrivacyPolicy, TermsOfService } from "./views/Legal";

const RAIL_DOCKS = "(min-width: 768px)";

function App() {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

  // initialise sidebar toggle
  // the rail docks from 768px. Below that it's a drawer over the page, so it
  // always starts shut there, and opening it isn't remembered: a phone never
  // loads a screen with the page covered
  const [isSidebarVisible, setSidebarVisible] = useState(() => {
    if (!window.matchMedia(RAIL_DOCKS).matches) return false;
    let saved: string | null = null;
    try { saved = localStorage.getItem("sidebarVisible"); } catch { /* remembering is a nicety */ }
    return saved === null || saved === "true";
  });

  // toggle sidebar visibility, remembering the choice only where the rail docks
  const toggleSidebarVisible = () => {
    setSidebarVisible((prev) => {
      if (window.matchMedia(RAIL_DOCKS).matches) {
        try { localStorage.setItem("sidebarVisible", String(!prev)); } catch { /* remembering is a nicety */ }
      }
      return !prev;
    });
  };
  
  return (
    <div className="app-shell w-screen h-screen overflow-hidden fixed top-0 flex row">
      <Routes>
        {/* "/" is the landing page, its own HTML file (index.html); the app only
            reaches its index route by navigating there itself, and sends it to Log in */}
        <Route index element={<Navigate to="/account/login" replace />} />
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
          <Route 
            path="project/:id/board/:cardId"
            element={<CardView
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
