import { auth } from "../firebase/main";
import { signOut } from "../firebase/auth";

// the landing page (index.html, which loads none of the app) reads this to send a
// writer who is signed in on this browser straight to /home; it's only a hint,
// since /home sends a signed-out visitor on to log in
const SIGNED_IN = "signedIn";
export const markSignedIn = (signedIn: boolean) => {
  try {
    if (signedIn) localStorage.setItem(SIGNED_IN, "true");
    else localStorage.removeItem(SIGNED_IN);
  } catch {
    // storage can be unavailable; the landing page then just shows itself
  }
};

// logs the user out of the current session
export const logOut = () => {
  signOut(auth);
  sessionStorage.clear();
  markSignedIn(false);

  window.location.href = "/";
};
