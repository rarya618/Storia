import { User } from "firebase/auth";
import { markSignedIn } from "./session";

// The database rules let in only a verified email, so the app keeps its
// session (the sessionStorage keys views read) for a verified user alone; an
// unverified one is signed in to Firebase but sent to Check your email.
export const startSession = (user: User) => {
  sessionStorage.setItem("Auth Token", user.refreshToken);
  sessionStorage.setItem("User ID", user.uid);
  if (user.email) sessionStorage.setItem("User Email", user.email);
  markSignedIn(true);
};

// once the writer has opened the link: fetch the user again, and a fresh token,
// since the rules read email_verified from the token and the old one says false
export const checkVerified = async (user: User) => {
  await user.reload();
  if (!user.emailVerified) return false;
  await user.getIdToken(true);
  return true;
};
