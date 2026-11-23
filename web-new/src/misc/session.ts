import { auth } from "../firebase/main";
import { signOut } from "../firebase/auth";

// logs the user out of the current session
export const logOut = () => {
  signOut(auth);
  sessionStorage.clear();

  window.location.href = "/";
};
