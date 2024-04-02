import { Route, Routes, Outlet, Link } from "react-router-dom";

import SignIn from "./views/SignIn"

import './App.css'
import './colors/purple.css'
import SignUp from "./views/SignUp";

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
          element={<SignIn />}
        />
        <Route 
          path="sign-in" 
          element={<SignIn />}
					/>
        <Route 
          path="sign-up" 
          element={<SignUp />}
        />
        <Route path="*" element={<NoMatch />} />
      </Routes>
      
    </div>
  )
}

export default App
