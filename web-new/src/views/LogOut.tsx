import { Navigate } from "react-router-dom";
import { logOut } from "../misc/session";

function LogOut() {
    logOut();

    return (
        <Navigate to="/" />
    )
}

export default LogOut;