import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { auth } from './firebase/main'

// Database rules require a signed-in user, so wait for Firebase Auth to
// restore the session before any view starts reading data.
auth.authStateReady().then(() => {
  // the app tracks the session in sessionStorage; drop it if Firebase no
  // longer has a matching signed-in user, so views redirect to login
  // instead of showing permission errors
  const storedUserId = sessionStorage.getItem('User ID');
  if (storedUserId && auth.currentUser?.uid !== storedUserId) {
    sessionStorage.clear();
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
      <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
})
