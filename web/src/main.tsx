import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { auth } from './firebase/main'
import { markSignedIn } from './misc/session'
import { startSession } from './misc/verified'
import { onAuthStateChanged } from 'firebase/auth'
import { ErrorBoundary, monitorUser, startMonitoring } from './misc/monitoring'
import CrashScreen from './components/CrashScreen'

startMonitoring()
onAuthStateChanged(auth, (user) => monitorUser(user?.uid))

// Database rules require a signed-in user, so wait for Firebase Auth to
// restore the session before any view starts reading data.
auth.authStateReady().then(() => {
  // the app tracks the session in sessionStorage; keep it in step with
  // Firebase Auth so views neither show permission errors nor ask a
  // signed-in user to log in again
  // signed-in user. Only a verified email has a session, since the rules
  // refuse the rest (misc/verified.ts); Log in sends an unverified one on to
  // Check your email.
  const storedUserId = sessionStorage.getItem('User ID');
  const user = auth.currentUser;
  const verified = user?.emailVerified ? user : null;
  if (storedUserId && verified?.uid !== storedUserId) {
    sessionStorage.clear();
  }

  // Firebase keeps the user signed in across tabs and restarts; restore the
  // app's session from it so a new tab doesn't ask them to log in again
  if (verified && !sessionStorage.getItem('User ID')) startSession(verified);

  markSignedIn(verified !== null)

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        {/* a screen that throws while drawing shows CrashScreen, not a blank page */}
        <ErrorBoundary fallback={<CrashScreen />}>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>,
  )
})
