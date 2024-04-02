import { Route, Routes, Link } from "react-router-dom";

import Login from "./views/Login"

import './App.css'
import './colors/purple.css'
import CreateAccount from "./views/CreateAccount";

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
        <Route path="*" element={<NoMatch />} />
      </Routes>
      
    </div>
  )
}

export default App
