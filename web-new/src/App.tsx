import { Route, Routes, Link } from "react-router-dom";

import Login from "./views/Login"

import './App.css'
import CreateAccount from "./views/CreateAccount";
import Dashboard from "./views/Dashboard";
import LogOut from "./views/LogOut";

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
  return (
    <div className="w-screen flex row">
      <Routes>
        <Route 
          index 
          element={<Login />}
        />
        <Route 
          path="log-in" 
          element={<Login />}
					/>
        <Route 
          path="create-account" 
          element={<CreateAccount />}
        />
        <Route 
          path="log-out" 
          element={<LogOut />}
					/>
        <Route 
          path="dashboard" 
          element={<Dashboard />}
        />
        <Route path="*" element={<NoMatch />} />
      </Routes>
      
    </div>
  )
}

export default App
