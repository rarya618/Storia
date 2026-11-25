import { logOut } from "../misc/session";

// signs out, then loads the landing page
function LogOut() {
    logOut();
    return null;
}

export default LogOut;