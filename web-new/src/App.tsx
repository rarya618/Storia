import { Route, Routes, Link } from "react-router-dom";

import Login from "./views/Login"

import './App.css'
import CreateAccount from "./views/CreateAccount";
import Home from "./views/Home";
import LogOut from "./views/LogOut";
import { useState } from "react";
import ProjectView from "./views/ProjectView";

// generate random string of specified length
export function randomString(length: number) {
  var result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

// if there is no existing page
function NoMatch() {
  return (
    <div className="mx-auto inline-block">
      <h2 className="text-xl">Error 404: Page not found!</h2>
      <p>
        <Link className="text-sm" to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

function App() {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

  // initialise dot menu toggle
  const [isDotMenuVisible, setDotMenuVisible] = useState(false);

  // toggle dot menu visible
  const toggleDotMenu = () => {
    setDotMenuVisible(!isDotMenuVisible)
  }
  
  return (
    <div className="w-screen flex row">
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
          />}
        />
        <Route 
          path="project/:id"
          element={<ProjectView />}
        />
        <Route path="*" element={<NoMatch />} />
      </Routes>
      
    </div>
  )
}

export default App
