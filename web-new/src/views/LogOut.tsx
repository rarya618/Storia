import { Navigate } from "react-router-dom";
import { logOut } from "./Login";

function LogOut() {
    logOut();

    return (
        <Navigate to="/" />
    )
}

export default LogOut;