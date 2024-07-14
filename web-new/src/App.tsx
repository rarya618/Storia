import { Route, Routes } from "react-router-dom";

import Login from "./views/Login"

import './App.css'
import CreateAccount from "./views/create/CreateAccount";
import Home from "./views/Home";
import LogOut from "./views/LogOut";
import { useState } from "react";
import FolderView from "./views/FolderView";
import PageNotFound from "./views/PageNotFound";

function App() {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

  // initialise dot menu toggle
  const [isDotMenuVisible, setDotMenuVisible] = useState(false);

  // initialise sidebar toggle
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // toggle dot menu visible
  const toggleDotMenu = () => {
    setDotMenuVisible(!isDotMenuVisible)
  }

  // toggle dot menu visible
  const toggleSidebarVisible = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }
  
  return (
    <div className="w-screen h-screen overflow-hidden fixed top-0 flex row">
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
          element={<CreateAccount 
            errorValue={errorValue} 
            setError={setError} 
            errorDisplay={errorDisplay} 
            setErrorDisplay={setErrorDisplay} 
          />}
        />
        <Route 
          path="account/logout" 
          element={<LogOut />}
					/>
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
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      
    </div>
  )
}

export default App
